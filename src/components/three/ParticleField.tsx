"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneHex } from "@/lib/scene";
import { NOISE_GLSL } from "./noise";

/**
 * FBO curl-noise particle field — the /book panel's background.
 *
 * In the idiom of Pavel Mazhuga's "fbo-particles" lab piece (an unlicensed
 * personal experiment, so this is a from-scratch implementation of the same
 * public technique, not his code): particle POSITIONS live in a float
 * texture, a simulation shader advects them and writes the next frame into a
 * second render target (ping-pong), and the draw pass is one Points mesh
 * whose vertex shader reads its position from the current texture by texel
 * reference. CPU work per frame is two draw calls, regardless of count.
 *
 * Motion: each particle rides a curl-noise flow field (divergence-free, so
 * the cloud swirls rather than scatters) plus a soft spring back to its seed
 * position — drift forever, disperse never. The simplex noise inside the
 * shader is the standard Ashima Arts / Stefan Gustavson implementation
 * (MIT, github.com/ashima/webgl-noise); the curl construction is Bridson's.
 *
 * Tiers: 192² ≈ 37k particles, 112² ≈ 12.5k on `lite`. `reduced` renders the
 * seed cloud with the simulation parked — frozen, not hidden.
 */

const SIM_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const SIM_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPositions; // xyz = position, w = per-particle seed
  uniform sampler2D uSeeds;     // xyz = home position
  uniform float uTime;
  uniform float uDelta;
  uniform float uNoiseFreq;
  uniform float uNoiseSpeed;
  uniform float uCurlAmp;
  uniform float uReturn;

  __NOISE__

  void main() {
    vec4 data = texture2D(uPositions, vUv);
    vec3 pos = data.xyz;
    float seed = data.w;
    vec3 home = texture2D(uSeeds, vUv).xyz;

    vec3 flow = curlNoise(pos * uNoiseFreq + uTime * uNoiseSpeed);
    // Fast and slow particles (by seed) read as depth inside the cloud.
    vec3 vel = flow * uCurlAmp * (0.55 + 0.9 * seed) + (home - pos) * uReturn;
    pos += vel * uDelta;

    gl_FragColor = vec4(pos, seed);
  }
`.replace("__NOISE__", NOISE_GLSL);

const DRAW_VERT = /* glsl */ `
  uniform sampler2D uPositions;
  uniform float uSize; // px, pre-multiplied by dpr
  attribute vec2 aRef; // this particle's texel in the position texture
  varying float vSeed;
  void main() {
    vec4 data = texture2D(uPositions, aRef);
    vSeed = data.w;
    vec4 mv = modelViewMatrix * vec4(data.xyz, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.5 + vSeed) * (4.6 / -mv.z);
  }
`;

const DRAW_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.06, d);
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a * (0.22 + 0.4 * vSeed));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const CLOUD_R = 1.7;

export function ParticleField({ reduced, lite }: { reduced: boolean; lite: boolean }) {
  const points = useRef<THREE.Points>(null);
  const size = lite ? 112 : 192; // sim texture edge → size² particles

  const sim = useMemo(() => {
    const count = size * size;

    // Seed cloud: uniform in a ball (cbrt for density), seed scalar in w.
    const data = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const r = CLOUD_R * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const z = Math.random() * 2 - 1;
      const s = Math.sqrt(1 - z * z);
      data[i * 4 + 0] = r * s * Math.cos(theta);
      data[i * 4 + 1] = r * s * Math.sin(theta);
      data[i * 4 + 2] = r * z;
      data[i * 4 + 3] = Math.random();
    }
    const seeds = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
    seeds.minFilter = seeds.magFilter = THREE.NearestFilter;
    seeds.needsUpdate = true;

    const targetOpts: THREE.RenderTargetOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
    const targets = [
      new THREE.WebGLRenderTarget(size, size, targetOpts),
      new THREE.WebGLRenderTarget(size, size, targetOpts),
    ];

    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: SIM_VERT,
      fragmentShader: SIM_FRAG,
      uniforms: {
        uPositions: { value: seeds },
        uSeeds: { value: seeds },
        uTime: { value: 0 },
        uDelta: { value: 0 },
        uNoiseFreq: { value: 0.55 },
        uNoiseSpeed: { value: 0.1 },
        uCurlAmp: { value: 0.42 },
        uReturn: { value: 0.14 },
      },
    });
    const simScene = new THREE.Scene();
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial));

    // Draw side: one vertex per texel; `position` only exists because Points
    // requires the attribute, every real position comes from the texture.
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const refs = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      refs[i * 2 + 0] = ((i % size) + 0.5) / size;
      refs[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size;
    }
    geometry.setAttribute("aRef", new THREE.BufferAttribute(refs, 2));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), CLOUD_R * 2);

    const drawMaterial = new THREE.ShaderMaterial({
      vertexShader: DRAW_VERT,
      fragmentShader: DRAW_FRAG,
      uniforms: {
        uPositions: { value: seeds },
        uSize: { value: 3.2 },
        // The accent lifted well past the (hand-darkened) token: additive
        // specks need luminance headroom over the charcoal or they vanish.
        uColor: { value: new THREE.Color(sceneHex("--color-accent")).multiplyScalar(2.6) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    return { seeds, targets, simMaterial, simScene, simCamera, geometry, drawMaterial, read: 0, primed: false };
  }, [size]);

  useEffect(
    () => () => {
      sim.targets.forEach((t) => t.dispose());
      sim.seeds.dispose();
      sim.simMaterial.dispose();
      sim.geometry.dispose();
      sim.drawMaterial.dispose();
    },
    [sim],
  );

  useFrame((state, delta) => {
    const p = points.current;
    if (!p) return;

    // The cloud turns as one body; the swirl happens inside the texture.
    if (!reduced) p.rotation.y += delta * 0.045;

    if (reduced && sim.primed) return;

    const u = sim.simMaterial.uniforms;
    u.uTime.value += Math.min(delta, 1 / 30);
    u.uDelta.value = reduced ? 0 : Math.min(delta, 1 / 30);
    u.uPositions.value = sim.primed ? sim.targets[sim.read].texture : sim.seeds;

    const write = sim.targets[1 - sim.read];
    state.gl.setRenderTarget(write);
    state.gl.render(sim.simScene, sim.simCamera);
    state.gl.setRenderTarget(null);

    sim.read = 1 - sim.read;
    sim.primed = true;
    sim.drawMaterial.uniforms.uPositions.value = write.texture;
    sim.drawMaterial.uniforms.uSize.value = 3.2 * state.gl.getPixelRatio();
  });

  return (
    <points
      ref={points}
      position={[0, 0.15, 0]}
      frustumCulled={false}
      geometry={sim.geometry}
      material={sim.drawMaterial}
    />
  );
}
