"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { SCENE } from "@/lib/daynight";
import { scrollProgress } from "./scroll";
import { CloudField } from "./CloudField";
import { DustField } from "./DustField";

/**
 * The global background scene: the cloud field plus thin particle dust, on one
 * persistent canvas mounted in the layout so navigation never rebuilds the GL
 * context. Fixed dark palette — there is no theme journey any more.
 */

// Derived from the palette, never re-typed — the canvas sits directly behind
// the page, so a drifted literal here shows up as a seam at the viewport edge.
const C_BG = new THREE.Color(SCENE.bg);

const CENTER: [number, number, number] = [0, 0, 0];
export const KEYS: { p: [number, number, number]; t: [number, number, number] }[] = [
  { p: [1.6, 1.1, 7.2], t: CENTER },
  { p: [6.4, 0.6, 2.6], t: CENTER },
  { p: [4.4, 3.6, -4.6], t: CENTER },
  { p: [-3.2, 1.0, -6.2], t: CENTER },
  { p: [-6.6, 2.2, 2.0], t: CENTER },
  { p: [-1.4, 0.8, 7.4], t: CENTER },
];

/** Scroll-scrubbed orbit (home). */
function Rig({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(...KEYS[0].p));
  const tgt = useRef(new THREE.Vector3(...KEYS[0].t));
  const dp = useRef(new THREE.Vector3());
  const dt = useRef(new THREE.Vector3());
  useFrame(() => {
    const prog = reduced ? 0.04 : scrollProgress();
    const f = prog * (KEYS.length - 1);
    const i = Math.min(KEYS.length - 2, Math.floor(f));
    const t = f - i;
    dp.current.set(...KEYS[i].p).lerp(new THREE.Vector3(...KEYS[i + 1].p), t);
    dt.current.set(...KEYS[i].t).lerp(new THREE.Vector3(...KEYS[i + 1].t), t);
    pos.current.lerp(dp.current, reduced ? 1 : 0.06);
    tgt.current.lerp(dt.current, reduced ? 1 : 0.06);
    camera.position.copy(pos.current);
    camera.lookAt(tgt.current);
  });
  return null;
}

/* StaticCam removed. Swapping <Rig> for <StaticCam> on navigation changed the
   shape of the R3F tree, and the reconciler threw "Converting circular
   structure to JSON" mid-route-change. GLBoundary caught it and swapped in the
   StaticPipeline fallback — the stray line art that appeared on the background
   after visiting another page. One unconditional camera keeps the tree stable
   across routes, and since the scene no longer differs per page there was
   nothing for the swap to buy. */


function SceneContents({ reduced, lite }: { reduced: boolean; lite: boolean }) {

  return (
    <>
      <color attach="background" args={[SCENE.bg]} />
      <fog attach="fog" args={[SCENE.bg, 7, 20]} />
      <ambientLight intensity={0.42} />
      <directionalLight position={[5, 8, 6]} intensity={0.7} />
      <directionalLight position={[-6, 3, -4]} intensity={0.32} color="#f3ead6" />

      <Rig reduced={reduced} />

      {/* The clouds are the background, so they render on every tier — the lite
          path drops to 2 layers / 3 octaves inside the shader rather than being
          cut, since removing them entirely leaves the page visibly bare. */}
      <CloudField reduced={reduced} lite={lite} />
      {/* Dust thinned hard (was 1600/650). With the clouds carrying the
          background it is no longer doing the atmospheric work it was added
          for, and at the old density its particles are the same size and
          value as the timeline's gate dots — the nodes got lost in the
          starfield and the rail stopped reading as a sequence. */}
      <DustField reduced={reduced} count={lite ? 180 : 420} />

      {/* The constellation is deliberately not rendered.
          It was the old site's signature image, and it works against what this
          rebuild is for: it is busy, it occupies the centre of the viewport
          where the headline lives, and it dominates every hero screenshot. The
          brief puts the clouds in the background — one atmosphere, with the
          type carrying the page.
          Kept in the tree (three/Constellation.tsx) rather than deleted so it
          can be restored in one line if we want it back on an interior page. */}

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 5, -5]} scale={[10, 6, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-5, 2, 4]} scale={[6, 6, 1]} color="#f3ead6" />
        <Lightformer intensity={0.9} position={[5, 3, 4]} scale={[6, 6, 1]} color="#ffffff" />
      </Environment>

      {!reduced && !lite && (
        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.72} luminanceSmoothing={0.15} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.42} />
        </EffectComposer>
      )}

    </>
  );
}

export default function Scene3D({ reduced, lite = false }: { reduced: boolean; lite?: boolean }) {
  return (
    <Canvas
      dpr={lite ? [1, 1.25] : [1, 1.5]}
      gl={{ antialias: !lite, powerPreference: lite ? "low-power" : "high-performance" }}
      camera={{ position: KEYS[0].p, fov: 42, near: 0.1, far: 100 }}
    >
      <SceneContents reduced={reduced} lite={lite} />
    </Canvas>
  );
}
