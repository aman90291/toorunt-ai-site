"use client";

import { Canvas } from "@react-three/fiber";
import { SCENE } from "@/lib/scene";
import { ParticleField } from "./ParticleField";

/**
 * Canvas host for the /book panel's particle field. No shadows, no lights —
 * the particles are self-lit additive sprites. Default tone mapping (ACES at
 * 1.0) rolls the additive hot spots off gently instead of clipping.
 */
export default function ParticleScene({ reduced, lite = false }: { reduced: boolean; lite?: boolean }) {
  return (
    <Canvas
      dpr={lite ? [1, 1.25] : [1, 1.5]}
      gl={{ antialias: false, powerPreference: lite ? "low-power" : "high-performance" }}
      camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 50 }}
    >
      <color attach="background" args={[SCENE.bg]} />
      <ParticleField reduced={reduced} lite={lite} />
    </Canvas>
  );
}
