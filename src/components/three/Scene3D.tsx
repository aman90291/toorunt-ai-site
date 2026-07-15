"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { themeState } from "@/lib/theme";
import { scrollProgress } from "./scroll";
import { Constellation, FocusGroup, LAYOUT_DAY, LAYOUT_NIGHT } from "./Constellation";
import { HazeLayer } from "./HazeLayer";
import { DustField } from "./DustField";

/**
 * The global background scene (every page): fluid haze + particle dust, plus the
 * brain-of-bots constellation and the orbiting scroll camera on the home page.
 * All colour/luminosity follows the global theme value (scroll journey or the
 * instant toggle) — CSS and WebGL repaint on the same frames.
 */

const C_BG_DAY = new THREE.Color("#f1efe9");
const C_BG_NIGHT = new THREE.Color("#0d0e10");
const _bg = new THREE.Color();

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

/** Fixed framing for interior pages. */
function StaticCam() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...KEYS[0].p);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

/** Lerps scene bg/fog + lights + bloom on the global theme value. */
function Atmosphere({ reduced, keyRef, fillRef, ambRef, bloomRef }: {
  reduced: boolean;
  keyRef: React.RefObject<THREE.DirectionalLight | null>;
  fillRef: React.RefObject<THREE.DirectionalLight | null>;
  ambRef: React.RefObject<THREE.AmbientLight | null>;
  bloomRef: React.RefObject<{ intensity: number; luminanceMaterial?: { threshold: number } } | null>;
}) {
  const { scene } = useThree();
  useFrame(() => {
    const n = themeState.value;
    _bg.copy(C_BG_DAY).lerp(C_BG_NIGHT, n);
    if (scene.background instanceof THREE.Color) scene.background.copy(_bg);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(_bg);
    if (keyRef.current) keyRef.current.intensity = 1.6 - n * 0.9;
    if (fillRef.current) fillRef.current.intensity = 0.5 - n * 0.18;
    if (ambRef.current) ambRef.current.intensity = 0.7 - n * 0.18;
    if (bloomRef.current) {
      bloomRef.current.intensity = 0.5 + n * 0.7;
      if (bloomRef.current.luminanceMaterial) bloomRef.current.luminanceMaterial.threshold = 0.98 - n * 0.26;
    }
  });
  return null;
}

function SceneContents({ home, reduced, lite }: { home: boolean; reduced: boolean; lite: boolean }) {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const ambRef = useRef<THREE.AmbientLight>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bloomRef = useRef<any>(null);

  return (
    <>
      <color attach="background" args={["#f1efe9"]} />
      <fog attach="fog" args={["#f1efe9", 7, 20]} />
      <ambientLight ref={ambRef} intensity={0.7} />
      <directionalLight ref={keyRef} position={[5, 8, 6]} intensity={1.6} />
      <directionalLight ref={fillRef} position={[-6, 3, -4]} intensity={0.5} color="#f3ead6" />

      {home ? <Rig reduced={reduced} /> : <StaticCam />}

      {/* Haze = heaviest fragment work — desktop only. Dust thinned on low-power. */}
      {!lite && <HazeLayer reduced={reduced} />}
      <DustField reduced={reduced} count={lite ? 650 : 1600} />

      {home && (
        <FocusGroup reduced={reduced}>
          <Constellation layout={LAYOUT_DAY} phase="day" reduced={reduced} />
          <Constellation layout={LAYOUT_NIGHT} phase="night" reduced={reduced} />
        </FocusGroup>
      )}

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 5, -5]} scale={[10, 6, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-5, 2, 4]} scale={[6, 6, 1]} color="#f3ead6" />
        <Lightformer intensity={0.9} position={[5, 3, 4]} scale={[6, 6, 1]} color="#ffffff" />
      </Environment>

      {!reduced && !lite && (
        <EffectComposer>
          <Bloom ref={bloomRef} intensity={0.5} luminanceThreshold={0.98} luminanceSmoothing={0.15} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.42} />
        </EffectComposer>
      )}

      <Atmosphere reduced={reduced} keyRef={keyRef} fillRef={fillRef} ambRef={ambRef} bloomRef={bloomRef} />
    </>
  );
}

export default function Scene3D({ home, reduced, lite = false }: { home: boolean; reduced: boolean; lite?: boolean }) {
  return (
    <Canvas
      dpr={lite ? [1, 1.25] : [1, 1.5]}
      gl={{ antialias: !lite, powerPreference: lite ? "low-power" : "high-performance" }}
      camera={{ position: KEYS[0].p, fov: 42, near: 0.1, far: 100 }}
    >
      <SceneContents home={home} reduced={reduced} lite={lite} />
    </Canvas>
  );
}
