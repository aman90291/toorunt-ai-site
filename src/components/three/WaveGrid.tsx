"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sceneHex } from "@/lib/scene";

/**
 * The wave-propagation cube grid — a port of Codrops' "Interactive Wave
 * Propagation Cube Grid" (tympanus.net, 2026-07-09; github.com/franky-adl/
 * 3d-wave-grid) into the hero, replacing the cloud-field quad.
 *
 * The mechanic, unchanged from the original: a 40×40 InstancedMesh of tall
 * boxes (one draw call), a mouse trail kept as a 128×1 float DataTexture
 * (x, z, age, distDelta per texel), and a vertex shader injected into
 * MeshPhongMaterial via onBeforeCompile that, per cube, sums a Gaussian
 * window travelling outward from every trail point (wavefront = speed × age)
 * times a cosine oscillation, with time-fade, distance attenuation and
 * WEIGHTED AVERAGING — overlapping waves average rather than stack, which is
 * what keeps superpositions smooth. A depth material carries the same
 * displacement so shadows deform with the cubes.
 *
 * Adaptations to this site, and why:
 *   • Pointer events arrive from `window`, not the canvas: the hero mounts
 *     the canvas under `pointer-events-none` so the headline and CTAs above
 *     it stay clickable, which means the canvas itself never hears a pointer.
 *   • No EffectComposer — the original's vignette/RGB-shift pass isn't worth
 *     re-adding the postprocessing dependency this site deliberately dropped;
 *     the CSS bottom-fade does the framing instead.
 *   • Palette from lib/scene.ts: charcoal ground, cubes one step lighter,
 *     wave peaks in the cobalt accent.
 *   • `lite` shrinks the grid 40 → 26 and drops shadows; `reduced` renders
 *     the grid flat and still — frozen, not hidden.
 *   • The original's idle behaviour is kept: after 3s without movement a
 *     random point drops every 1.5s, so the hero breathes on its own.
 */

// Must match the literal 128.0 in the vertex shader texture lookup.
const MAX_TRAIL = 128;

const CUBE_W = 0.8;
const CUBE_H = 3;
const GAP = 0.01;

// Wave params — the demo's defaults.
const WAVE = {
  amplitude: 0.4,
  speed: 4.5, // world units / second
  freq: 1.2, // radians / world unit
  width: 3.0, // Gaussian half-width of the ring
  jitter: 0.2,
  maxHeight: 0.4,
  fadeTime: 2.0, // seconds to fall to ~37%
  trailSpacing: 0.1, // min world-unit gap between trail points
};

// Camera orbit — top-down with a slight mouse tilt, as in the original.
const RADIUS = 12;
const ALPHA_RANGE = Math.PI * 0.03; // mouse Y → tilt around X
const BETA_RANGE = Math.PI * 0.05; // mouse X → orbit around Z

/* Shared by the Phong and depth materials so the shadow map deforms in
   lockstep with the visible geometry. GLSL is the original's, verbatim. */
function injectWave(vertexShader: string): string {
  return vertexShader
    .replace(
      "#include <common>",
      /* glsl */ `#include <common>
      varying float vHeight;
      attribute vec2 aOffset;
      uniform sampler2D uTrailTexture;
      uniform int       uTrailCount;
      uniform float     uWaveSpeed;
      uniform float     uWaveFreq;
      uniform float     uWaveWidth;
      uniform float     uFadeTime;
      uniform float     uAmplitude;
      uniform float     uJitter;
      uniform float     uMaxHeight;

      // Deterministic per-instance hash -> two values in [-0.5, 0.5], to
      // break up perfectly circular wavefronts.
      vec2 hash2( vec2 p ) {
        p = vec2( dot( p, vec2( 127.1, 311.7 ) ),
                  dot( p, vec2( 269.5, 183.3 ) ) );
        return fract( sin( p ) * 43758.5453123 ) - 0.5;
      }`,
    )
    .replace(
      "#include <begin_vertex>",
      /* glsl */ `#include <begin_vertex>

      vHeight = 0.0;

      // Bottom vertices stay put — half the work, and the base of each
      // column never shows anyway.
      if ( position.y > 0.0 ) {
        vec2 jitter  = hash2( aOffset ) * uJitter;
        vec2 worldXZ = aOffset + jitter;
        float waveHeight  = 0.0;
        float totalWeight = 0.0;

        for ( int i = 0; i < uTrailCount; i++ ) {
          // texel layout: (worldX, worldZ, age, distDelta)
          vec4 td = texture2D( uTrailTexture,
                               vec2( ( float(i) + 0.5 ) / 128.0, 0.5 ) );
          float dist      = length( worldXZ - td.rg );
          float wavefront = uWaveSpeed * td.b;
          float relDist   = dist - wavefront;

          // Gaussian envelope centred on the expanding wavefront
          float window = exp( -( relDist * relDist ) / ( uWaveWidth * uWaveWidth ) );
          // Exponential time-fade + distance attenuation; distDelta damps
          // waves from closely spaced trail points.
          float fade   = exp( -td.b / uFadeTime );
          float atten  = 1.0 / ( 1.0 + dist * 0.1 );
          float weight = fade * window * atten * td.a;

          waveHeight  += weight * cos( uWaveFreq * relDist );
          totalWeight += weight;
        }

        // Weighted average: overlapping waves average rather than stack,
        // cancelling chaotic superposition while preserving single peaks.
        waveHeight /= max( totalWeight, 1.0 );

        float displacement = clamp( waveHeight * uAmplitude, -uMaxHeight, uMaxHeight );
        transformed.y += displacement;
        vHeight = displacement;
      }`,
    );
}

type TrailPoint = { x: number; z: number; age: number; distDelta: number };

export function WaveGrid({ reduced, lite }: { reduced: boolean; lite: boolean }) {
  const { gl, camera } = useThree();
  const grid = lite ? 26 : 40;
  const bounds = grid * (CUBE_W + GAP);

  const { mesh, uniforms, texture, trailData, dispose } = useMemo(() => {
    const count = grid * grid;
    const geometry = new THREE.BoxGeometry(CUBE_W, CUBE_H, CUBE_W);

    // Per-instance XZ world position, read by the wave loop.
    const offsets = new THREE.InstancedBufferAttribute(new Float32Array(count * 2), 2);
    geometry.setAttribute("aOffset", offsets);

    const trailData = new Float32Array(MAX_TRAIL * 4);
    const texture = new THREE.DataTexture(trailData, MAX_TRAIL, 1, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;

    // One shared uniform set, assigned by REFERENCE into both programs in
    // onBeforeCompile, so per-frame mutations reach the GPU with no plumbing.
    const uniforms: Record<string, THREE.IUniform> = {
      uTrailTexture: { value: texture },
      uTrailCount: { value: 0 },
      uWaveSpeed: { value: WAVE.speed },
      uWaveFreq: { value: WAVE.freq },
      uWaveWidth: { value: WAVE.width },
      uFadeTime: { value: WAVE.fadeTime },
      uAmplitude: { value: WAVE.amplitude },
      uJitter: { value: WAVE.jitter },
      uMaxHeight: { value: WAVE.maxHeight },
      uColorBase: { value: new THREE.Color(sceneHex("--color-ground-2")) },
      // The raw accent at full lighting washed out the headline sitting over
      // it — the peaks carry a deepened accent so the text zone stays dark.
      uColorHigh: { value: new THREE.Color(sceneHex("--color-accent")).multiplyScalar(0.4) },
    };

    const material = new THREE.MeshPhongMaterial();
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = injectWave(shader.vertexShader);
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          /* glsl */ `#include <common>
          varying float vHeight;
          uniform vec3  uColorBase;
          uniform vec3  uColorHigh;
          uniform float uMaxHeight;`,
        )
        .replace(
          "#include <color_fragment>",
          /* glsl */ `#include <color_fragment>
          float t = clamp( vHeight / uMaxHeight, 0.0, 1.0 );
          diffuseColor.rgb = mix( uColorBase, uColorHigh, t );`,
        );
    };

    const depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
    });
    depthMaterial.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = injectWave(shader.vertexShader);
    };

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.customDepthMaterial = depthMaterial;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // The columns displace vertically after culling is decided.
    mesh.frustumCulled = false;

    const dummy = new THREE.Object3D();
    const spacing = CUBE_W + GAP;
    const offset = ((grid - 1) * spacing) / 2;
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const index = i * grid + j;
        const x = i * spacing - offset;
        const z = j * spacing - offset;
        dummy.position.set(x, 0, z);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        offsets.setXY(index, x, z);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;

    const dispose = () => {
      geometry.dispose();
      material.dispose();
      depthMaterial.dispose();
      texture.dispose();
    };
    return { mesh, uniforms, texture, trailData, dispose };
  }, [grid]);

  useEffect(() => () => dispose(), [dispose]);

  // Simulation state lives outside React — mutated per event / per frame.
  const sim = useRef({
    trail: [] as TrailPoint[],
    lastPoint: null as { x: number; z: number } | null,
    timeSinceLastMove: 0,
    randomPointTimer: 0,
    placingRandomPoints: true, // waves from the first seconds, cursor or not
    mouse: new THREE.Vector2(0, 0), // window-space NDC, drives the tilt
    lerpedMouse: new THREE.Vector2(0, 0),
  });

  useEffect(() => {
    if (reduced) return;
    const s = sim.current;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const planeY0 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();

    // The canvas never receives pointer events (see header), so listen on
    // window and cache its rect; scroll moves the hero under the cursor, so
    // the cache refreshes on scroll too.
    let rect = gl.domElement.getBoundingClientRect();
    const refreshRect = () => {
      rect = gl.domElement.getBoundingClientRect();
    };

    const onPointerMove = (e: PointerEvent) => {
      s.mouse.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      );

      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      // Off the hero there is nothing to stir.
      if (Math.abs(ndc.x) > 1.1 || Math.abs(ndc.y) > 1.1) return;

      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(planeY0, hit)) return;
      const { x, z } = hit;

      let distDelta = 0;
      if (s.lastPoint) {
        const dx = x - s.lastPoint.x;
        const dz = z - s.lastPoint.z;
        distDelta = Math.sqrt(dx * dx + dz * dz);
        if (distDelta < WAVE.trailSpacing) return;
      }

      if (s.trail.length >= MAX_TRAIL) s.trail.shift();
      s.trail.push({ x, z, age: 0, distDelta });
      s.lastPoint = { x, z };
      s.timeSinceLastMove = 0;
      s.placingRandomPoints = false;
      s.randomPointTimer = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", refreshRect);
    window.addEventListener("scroll", refreshRect, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", refreshRect);
      window.removeEventListener("scroll", refreshRect);
    };
  }, [gl, camera, reduced]);

  useFrame((_, delta) => {
    const s = sim.current;

    // Camera: start overhead at (0, r, 0), tilt by the damped mouse — a
    // rotation around X for mouse Y, around Z for mouse X.
    if (!reduced) {
      s.lerpedMouse.x += (s.mouse.x - s.lerpedMouse.x) * 0.04;
      s.lerpedMouse.y += (s.mouse.y - s.lerpedMouse.y) * 0.04;
    }
    const alpha = s.lerpedMouse.y * ALPHA_RANGE;
    const beta = s.lerpedMouse.x * BETA_RANGE;
    camera.position.set(
      -RADIUS * Math.cos(alpha) * Math.sin(beta),
      RADIUS * Math.cos(alpha) * Math.cos(beta),
      RADIUS * Math.sin(alpha),
    );
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);

    if (reduced) return; // flat grid, still camera — frozen, not hidden

    // Age and prune. Past fadeTime * 4 the shader fade is exp(-4) ≈ 0.018.
    const expiry = WAVE.fadeTime * 4;
    for (let i = s.trail.length - 1; i >= 0; i--) {
      s.trail[i].age += delta;
      if (s.trail[i].age > expiry) s.trail.splice(i, 1);
    }

    // Idle behaviour: after 3s without movement, a random ripple every 1.5s.
    s.timeSinceLastMove += delta;
    if (s.timeSinceLastMove >= 3.0 && !s.placingRandomPoints) {
      s.placingRandomPoints = true;
      s.randomPointTimer = 0;
    }
    if (s.placingRandomPoints) {
      s.randomPointTimer += delta;
      if (s.randomPointTimer >= 1.5) {
        s.randomPointTimer = 0;
        if (s.trail.length >= MAX_TRAIL) s.trail.shift();
        s.trail.push({
          x: (Math.random() * 0.5 - 0.25) * bounds,
          z: (Math.random() * 0.5 - 0.25) * bounds,
          age: 0,
          distDelta: 0.8 + Math.random() * 0.2,
        });
      }
    }

    // Upload live points; runs once more after the trail empties so the
    // shader sees the count drop to zero.
    const count = Math.min(s.trail.length, MAX_TRAIL);
    if (count > 0 || uniforms.uTrailCount.value > 0) {
      for (let i = 0; i < count; i++) {
        const ti = i * 4;
        trailData[ti] = s.trail[i].x;
        trailData[ti + 1] = s.trail[i].z;
        trailData[ti + 2] = s.trail[i].age;
        trailData[ti + 3] = s.trail[i].distDelta;
      }
      texture.needsUpdate = true;
      uniforms.uTrailCount.value = count;
    }
  });

  return (
    <group>
      <primitive object={mesh} />
      <ambientLight color="#ffffff" intensity={0.4} />
      <directionalLight
        color="#ffffff"
        intensity={1.6}
        position={[-20, 10, 6]}
        castShadow={!lite}
        shadow-mapSize={[1024, 1024]}
        shadow-radius={6}
        shadow-bias={0.0001}
        shadow-camera-near={0.1}
        shadow-camera-far={60}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />
      <directionalLight color="#ffffff" intensity={0.8} position={[10, 5, -3]} />
    </group>
  );
}
