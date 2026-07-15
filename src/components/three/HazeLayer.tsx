"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { themeState } from "@/lib/theme";

/**
 * Interactive haze (Step 2): a camera-glued quad running a domain-warped fbm
 * noise shader — flowing, organic clouds. The pointer acts as a force field:
 * each movement drops a vortex (position + velocity) into a 12-slot ring
 * buffer uniform; the fragment shader swirls the noise-field UVs around every
 * live vortex (perpendicular curl + directional push), and each vortex ages
 * out over ~1.8s, so the swirls slowly dissipate.
 *
 * Colours blend golden-hour → cosmic indigo on the shared theme value, so the
 * day/night toggle re-grades the haze on the same frames as the CSS.
 *
 * Perf: mousemove just writes a ref (uniform upload happens once per frame in
 * useFrame — effectively frame-throttled); noise is 4-octave value noise
 * (cheap ALU, no textures); one draw call, no post targets.
 */

const TRAIL = 8; // mouse-vortex ring buffer + shader loop count (fewer = cheaper)

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uNight;
  uniform float uAspect;
  uniform float uReduced;
  uniform vec4 uTrail[${TRAIL}]; // xy = uv pos (x aspect-scaled), zw = velocity
  uniform float uAge[${TRAIL}];  // 0 fresh → 1 dead

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec2(17.3, 9.1);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vec2(vUv.x * uAspect, vUv.y);

    // ── mouse force field: swirling vortices that dissipate ──
    vec2 flow = vec2(0.0);
    float energy = 0.0;
    for (int i = 0; i < ${TRAIL}; i++) {
      float life = 1.0 - uAge[i];
      if (life > 0.001) {
        vec2 p = vec2(uTrail[i].x * uAspect, uTrail[i].y);
        vec2 d = uv - p;
        float r = length(d);
        float fall = exp(-r * r * 38.0) * life;
        vec2 perp = vec2(-d.y, d.x) / max(r, 0.02);
        flow += (perp * 0.55 + uTrail[i].zw * 0.8) * fall;
        energy += fall;
      }
    }

    // ── domain-warped drifting clouds ──
    float t = uTime * (1.0 - uReduced); // frozen under reduced-motion
    vec2 q = uv * 1.7 + vec2(t * 0.016, -t * 0.010) + flow * 0.9;
    float w = fbm(q);
    float n = fbm(q + w * 1.35 + vec2(t * 0.008, 0.0));
    n = smoothstep(0.28, 0.85, n);

    vec3 day = mix(vec3(0.937, 0.906, 0.830), vec3(0.985, 0.945, 0.850), n); // golden-hour
    vec3 night = mix(vec3(0.055, 0.060, 0.100), vec3(0.130, 0.150, 0.260), n); // cosmic indigo
    vec3 col = mix(day, night, uNight);
    col += mix(vec3(0.72, 0.62, 0.42), vec3(0.78, 0.68, 0.49), uNight) * energy * 0.22;

    float alpha = n * mix(0.32, 0.50, uNight) + energy * 0.18;
    gl_FragColor = vec4(col, alpha);
  }
`;

export function HazeLayer({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const { material, geometry, trail } = useMemo(() => {
    const trail = {
      vecs: Array.from({ length: TRAIL }, () => new THREE.Vector4(-10, -10, 0, 0)),
      ages: new Float32Array(TRAIL).fill(1),
      idx: 0,
      last: new THREE.Vector2(-1, -1),
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uNight: { value: 0 },
        uAspect: { value: 1 },
        uReduced: { value: reduced ? 1 : 0 },
        uTrail: { value: trail.vecs },
        uAge: { value: trail.ages },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const geometry = new THREE.PlaneGeometry(1, 1);
    return { material, geometry, trail };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pointer → trail ring buffer (cheap ref writes; uniforms upload per frame)
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      const lx = trail.last.x, ly = trail.last.y;
      trail.last.set(x, y);
      if (lx < 0) return;
      const dx = x - lx, dy = y - ly;
      if (dx * dx + dy * dy < 0.000016) return; // ignore sub-pixel jitter
      const v = trail.vecs[trail.idx % TRAIL];
      const s = 9.0; // velocity gain
      v.set(x, y, Math.max(-1.4, Math.min(1.4, dx * s)), Math.max(-1.4, Math.min(1.4, dy * s)));
      trail.ages[trail.idx % TRAIL] = 0;
      trail.idx++;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [trail, reduced]);

  // GC
  useEffect(() => () => { material.dispose(); geometry.dispose(); }, [material, geometry]);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    // glue the quad to the camera's far view (works while the camera orbits)
    const cam = camera as THREE.PerspectiveCamera;
    const dist = 19.5;
    m.quaternion.copy(cam.quaternion);
    m.position.copy(cam.position).add(new THREE.Vector3(0, 0, -dist).applyQuaternion(cam.quaternion));
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * dist * 1.3;
    m.scale.set(h * cam.aspect, h, 1);

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uNight.value = themeState.value;
    material.uniforms.uAspect.value = cam.aspect;
    for (let i = 0; i < TRAIL; i++) {
      trail.ages[i] = Math.min(1, trail.ages[i] + delta / 1.8); // dissipate
    }
  });

  return <mesh ref={mesh} renderOrder={-10} frustumCulled={false} geometry={geometry} material={material} />;
}
