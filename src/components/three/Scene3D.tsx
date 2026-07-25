"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { SCENE } from "@/lib/scene";
import { WaveGrid } from "./WaveGrid";

/**
 * The hero canvas: the wave-propagation cube grid, seen from above.
 *
 * This replaces the cloud-field quad (one fullscreen fragment shader), which
 * itself replaced a scroll-scrubbed orbit scene. The grid brings real
 * geometry back, but stays one draw call — a single InstancedMesh — plus a
 * shadow pass; see WaveGrid for the mechanics and the perf tiers.
 *
 * Camera values match the Codrops original (fov 40, overhead at RADIUS with
 * a mouse tilt, driven per-frame inside WaveGrid). Tone mapping too: ACES at
 * 1.95 exposure is where the demo's shading was tuned, and the palette
 * colours are dark enough that the curve never pushes them off-hue.
 */
export default function Scene3D({ reduced, lite = false }: { reduced: boolean; lite?: boolean }) {
  return (
    <Canvas
      dpr={lite ? [1, 1.25] : [1, 1.5]}
      shadows={!lite}
      gl={{
        antialias: !lite,
        powerPreference: lite ? "low-power" : "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.95,
      }}
      camera={{ position: [0, 12, 0], fov: 40, near: 0.1, far: 200 }}
    >
      <color attach="background" args={[SCENE.bg]} />
      <WaveGrid reduced={reduced} lite={lite} />
    </Canvas>
  );
}
