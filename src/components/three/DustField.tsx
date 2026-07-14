"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { themeState } from "@/lib/theme";

/**
 * Floating 3D particle dust (Step 5a): thousands of tiny glowing motes at
 * varying depths. They drift and twinkle ambiently; when the page scrolls, the
 * drift-time accelerates with scroll velocity (sign included), so the field
 * rushes past the camera — combined with the orbiting camera's own travel it
 * reads as flying through a physical volume.
 *
 * One draw call. All motion computed in the vertex shader (CPU touches only
 * two uniforms per frame). Size attenuation + soft discs + additive-feeling
 * alpha, graded day→night on the shared theme value.
 */

const COUNT = 2400;
const BOX_XZ = 34; // world extent (camera orbit stays well inside)
const BOX_Y = 22;  // must match H in the vertex shader wrap

const VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  attribute float aSpeed;
  uniform float uAmb;    // ambient clock (sway + twinkle)
  uniform float uDrift;  // scroll-accelerated drift distance
  uniform float uPixel;
  varying float vSeed;
  varying float vDepth;
  void main() {
    vSeed = aSeed;
    vec3 p = position;
    float H = ${BOX_Y.toFixed(1)};
    p.y = mod(p.y + uDrift * aSpeed + H * 0.5, H) - H * 0.5;
    p.x += sin(uAmb * 0.4 + aSeed * 6.2831) * 0.5;
    p.z += cos(uAmb * 0.3 + aSeed * 9.4247) * 0.5;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = max(0.001, -mv.z);
    gl_PointSize = aSize * uPixel * clamp(120.0 / dist, 0.4, 9.0);
    vDepth = clamp(dist / 26.0, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uNight;
  uniform float uAmb;
  varying float vSeed;
  varying float vDepth;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float disc = smoothstep(0.5, 0.08, d);            // soft glowing dot
    float tw = 0.55 + 0.45 * sin(uAmb * (1.5 + vSeed) + vSeed * 40.0); // twinkle
    vec3 day = vec3(0.55, 0.51, 0.42);
    vec3 night = vec3(0.95, 0.88, 0.70);
    vec3 col = mix(day, night, uNight);
    // near-fade kills the giant close-up blobs; far-fade recedes into the fog
    float nearFade = smoothstep(0.02, 0.14, vDepth);
    float a = disc * tw * mix(0.14, 0.8, uNight) * (1.0 - vDepth * 0.6) * nearFade;
    if (a < 0.003) discard;
    gl_FragColor = vec4(col, a);
  }
`;

export function DustField({ reduced }: { reduced: boolean }) {
  const points = useRef<THREE.Points>(null);
  const drift = useRef({ t: 0, lastY: 0, vel: 0 });

  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);
    const speed = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * BOX_XZ;
      pos[i * 3 + 1] = (Math.random() - 0.5) * BOX_Y;
      pos[i * 3 + 2] = (Math.random() - 0.5) * BOX_XZ;
      seed[i] = Math.random();
      size[i] = 0.5 + Math.random() * 1.3;
      speed[i] = 0.5 + Math.random(); // per-particle rush multiplier
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uAmb: { value: 0 },
        uDrift: { value: 0 },
        uNight: { value: 0 },
        uPixel: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
    });
    return { geometry, material };
  }, []);

  // GC
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((state, delta) => {
    const d = drift.current;
    const y = document.documentElement.scrollTop;
    const instVel = delta > 0 ? (y - d.lastY) / (delta * 1000) : 0; // px/ms
    d.lastY = y;
    d.vel += (instVel - d.vel) * 0.08; // smooth the velocity

    if (!reduced) {
      // ambient drift + scroll rush (sign gives direction; clamp keeps it sane)
      const rush = Math.max(-6, Math.min(6, d.vel * 2.2));
      d.t += delta * (0.22 + rush);
      material.uniforms.uAmb.value = state.clock.elapsedTime;
      material.uniforms.uDrift.value = d.t;
    }
    material.uniforms.uNight.value = themeState.value;
    material.uniforms.uPixel.value = state.gl.getPixelRatio();
  });

  return <points ref={points} renderOrder={-5} frustumCulled={false} geometry={geometry} material={material} />;
}
