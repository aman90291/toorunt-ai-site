"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * The 3D hero: DevAgent's SDLC pipeline as a physical object. A fixed full-screen
 * canvas sits behind the page; as you scroll the real document, the camera travels
 * and orbits the pipeline, gates ignite in sequence, and a pull-request packet
 * flows through. Warm gallery light, glass + brass, one bronze glow.
 */

const GROUND = "#f1efe9";
const NODE = "#d8d0bf";
const BRONZE = "#8a7856";
const INK = "#1a1b1e";

// 9 stages along X; two are human gates (Approve, Sign-off).
const STAGES = [
  { label: "ingest", human: false },
  { label: "plan", human: false },
  { label: "approve", human: true },
  { label: "build", human: false },
  { label: "test", human: false },
  { label: "review", human: false },
  { label: "sign-off", human: true },
  { label: "merge", human: false },
  { label: "watch", human: false },
];
const SPAN = 14; // total pipeline length on X
const X0 = -SPAN / 2;
const xAt = (i: number) => X0 + (SPAN * i) / (STAGES.length - 1);

// Camera choreography — [position], [lookAt target], keyed to scroll 0..1.
const KEYS: { p: [number, number, number]; t: [number, number, number] }[] = [
  { p: [2.5, 3.4, 13], t: [0, 0, 0] },       // hero — wide 3/4
  { p: [-8.5, 1.6, 4.5], t: [-1, 0.4, 0] },  // travel down the line from the start
  { p: [-4.2, 1.1, 3.2], t: [-4, 0.3, 0] },  // close on the first human gate (approve)
  { p: [5.5, 1.3, 3.4], t: [4.3, 0.4, 0] },  // close on the second human gate (sign-off)
  { p: [0, 9.5, 5.5], t: [0, 0, 0] },        // crane up — overview
  { p: [-3, 3.2, 13], t: [0, 0, 0] },        // pull back — opposite hero
];

function scrollProgress() {
  if (typeof document === "undefined") return 0;
  const el = document.documentElement;
  const max = el.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
}

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
    const a = KEYS[i], b = KEYS[i + 1];
    dp.current.set(...a.p).lerp(new THREE.Vector3(...b.p), t);
    dt.current.set(...a.t).lerp(new THREE.Vector3(...b.t), t);
    // extra smoothing toward the scrubbed target = buttery feel
    pos.current.lerp(dp.current, reduced ? 1 : 0.09);
    tgt.current.lerp(dt.current, reduced ? 1 : 0.09);
    camera.position.copy(pos.current);
    camera.lookAt(tgt.current);
  });
  return null;
}

function Node({ i, human }: { i: number; human: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);
  const x = xAt(i);
  useFrame(() => {
    // light this node once the PR packet has reached/passed it
    const prog = scrollProgress();
    const packetX = X0 + SPAN * prog;
    const lit = packetX >= x - 0.4;
    if (mat.current) {
      const target = lit ? (human ? 1.1 : 0.35) : 0;
      mat.current.emissiveIntensity += (target - mat.current.emissiveIntensity) * 0.1;
    }
    if (ref.current) {
      const s = lit && human ? 1.15 : 1;
      ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
    if (ring.current) ring.current.rotation.z += human ? 0.01 : 0;
  });
  return (
    <group position={[x, 0, 0]}>
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[human ? 0.5 : 0.4, 48, 48]} />
        <meshStandardMaterial
          ref={mat}
          color={human ? BRONZE : NODE}
          metalness={human ? 0.7 : 0.55}
          roughness={human ? 0.28 : 0.32}
          emissive={human ? BRONZE : "#fff6e6"}
          emissiveIntensity={0}
        />
      </mesh>
      {human && (
        <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.78, 0.03, 16, 64]} />
          <meshStandardMaterial color={BRONZE} metalness={0.8} roughness={0.3} emissive={BRONZE} emissiveIntensity={0.4} />
        </mesh>
      )}
    </group>
  );
}

function Conduits() {
  const segs = useMemo(
    () => STAGES.slice(0, -1).map((_, i) => ({ x: (xAt(i) + xAt(i + 1)) / 2, len: xAt(i + 1) - xAt(i) })),
    []
  );
  return (
    <>
      {segs.map((s, i) => (
        <mesh key={i} position={[s.x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, s.len - 0.7, 24]} />
          <meshStandardMaterial color="#c9beaa" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
    </>
  );
}

function Packet() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const prog = scrollProgress();
    if (ref.current) {
      ref.current.position.x = X0 + SPAN * prog;
      ref.current.position.y = 0.62 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
      ref.current.rotation.y += 0.02;
      ref.current.rotation.x += 0.012;
    }
  });
  return (
    <mesh ref={ref} position={[X0, 0.62, 0]} castShadow>
      <boxGeometry args={[0.34, 0.34, 0.34]} />
      <meshStandardMaterial color={INK} metalness={0.5} roughness={0.35} emissive={BRONZE} emissiveIntensity={0.25} />
    </mesh>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={[GROUND]} />
      <fog attach="fog" args={[GROUND, 16, 34]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 10, 8]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]}>
        <orthographicCamera attach="shadow-camera" args={[-12, 12, 12, -12, 0.1, 40]} />
      </directionalLight>
      <directionalLight position={[-8, 4, -6]} intensity={0.5} />

      <group>
        <Conduits />
        {STAGES.map((s, i) => (
          <Node key={i} i={i} human={s.human} />
        ))}
        {!reduced && <Packet />}
      </group>

      <ContactShadows position={[0, -0.62, 0]} opacity={0.5} scale={30} blur={2.6} far={6} color="#4a4636" />

      {/* soft studio reflections without an external HDR (static-export safe) */}
      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 5, -6]} scale={[12, 6, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-6, 2, 4]} scale={[6, 6, 1]} color="#f3ead6" />
        <Lightformer intensity={0.8} position={[6, 3, 4]} scale={[6, 6, 1]} color="#ffffff" />
      </Environment>

      {!reduced && (
        <EffectComposer>
          <Bloom intensity={0.55} luminanceThreshold={0.75} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
}

export function Pipeline3D({ reduced = false }: { reduced?: boolean }) {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.6]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: KEYS[0].p, fov: 42, near: 0.1, far: 100 }}
      >
        <Rig reduced={reduced} />
        <Scene reduced={reduced} />
      </Canvas>
    </div>
  );
}
