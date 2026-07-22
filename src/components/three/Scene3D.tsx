"use client";

import { Canvas } from "@react-three/fiber";
import { SCENE } from "@/lib/scene";
import { CloudField } from "./CloudField";

/**
 * The hero canvas: one fullscreen shader quad, nothing else.
 *
 * This used to be a whole scene — a scroll-scrubbed six-keyframe camera orbit,
 * a particle dust field, a drei Environment with three lightformers, and a
 * Bloom + Vignette composer — mounted globally behind every page. All of it is
 * gone. The clouds are a fragment shader on a camera-glued plane, so lights, an
 * environment and a moving camera were lighting and framing nothing; and the
 * orbit was driven by whole-document scroll, which is meaningless now that the
 * canvas only occupies the hero.
 *
 * Removing them dropped @react-three/drei and @react-three/postprocessing
 * entirely. What is left is three + @react-three/fiber rendering one quad.
 */
export default function Scene3D({ reduced, lite = false }: { reduced: boolean; lite?: boolean }) {
  return (
    <Canvas
      dpr={lite ? [1, 1.25] : [1, 1.5]}
      gl={{ antialias: !lite, powerPreference: lite ? "low-power" : "high-performance" }}
      camera={{ position: [0, 0, 7.2], fov: 42, near: 0.1, far: 100 }}
    >
      <color attach="background" args={[SCENE.bg]} />
      <CloudField reduced={reduced} lite={lite} />
    </Canvas>
  );
}
