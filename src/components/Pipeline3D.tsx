"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Environment, Lightformer, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * The 3D hero: DevAgent's team rendered as a "brain of bots" — a living
 * constellation of small agent-nodes floating in a slow-rotating cloud,
 * wired by thin bronze synapses, with signals travelling the edges as the
 * team coordinates. Two bronze nodes are the humans-in-the-loop. A fixed
 * full-screen canvas sits behind the page; as you scroll the real document
 * the camera orbits and cranes around the constellation (the tinyvilla move).
 *
 * Fully procedural — every coordinate is authored here, so framing is exact.
 */

const GROUND = "#f1efe9";
const INK = "#1a1b1e";
const BRONZE = "#8a7856";

// ── Deterministic layout ─────────────────────────────────────────────
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Node = {
  pos: THREE.Vector3;
  r: number;
  human: boolean;
};

function buildBrain() {
  const rand = mulberry32(20260714);
  const N = 30;
  // ellipsoid radii — a touch wider than tall for a brain-like cloud
  const RX = 2.75, RY = 1.9, RZ = 2.3;
  const nodes: Node[] = [];

  // Fibonacci sphere for even angular spread, pushed to a shell with jitter
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2; // 1 → -1
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    let x = Math.cos(theta) * rad;
    let z = Math.sin(theta) * rad;
    let yy = y;
    // shell thickness + organic jitter
    const shell = 0.7 + 0.3 * rand();
    x *= shell; yy *= shell; z *= shell;
    x += (rand() - 0.5) * 0.28;
    yy += (rand() - 0.5) * 0.28;
    z += (rand() - 0.5) * 0.28;
    nodes.push({
      pos: new THREE.Vector3(x * RX, yy * RY, z * RZ),
      r: 0.06 + rand() * 0.07,
      human: false,
    });
  }

  // Two humans-in-the-loop: a front node and a left node, well separated.
  const byZ = [...nodes].sort((a, b) => b.pos.z - a.pos.z);
  const h1 = byZ[1];
  const byX = [...nodes].sort((a, b) => a.pos.x - b.pos.x);
  const h2 = byX.find((n) => n !== h1) ?? byX[0];
  for (const h of [h1, h2]) {
    h.human = true;
    h.r = 0.17;
  }

  // Edges: connect near neighbours, capped. Bias so humans stay connected.
  const edges: [number, number, number][] = []; // i, j, distance
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const d = nodes[i].pos.distanceTo(nodes[j].pos);
      const near = d < 1.55;
      const wantHuman = (nodes[i].human || nodes[j].human) && d < 2.4;
      if ((near && rand() < 0.62) || (wantHuman && rand() < 0.7)) {
        edges.push([i, j, d]);
      }
    }
  }

  return { nodes, edges };
}

// ── Camera choreography — orbits the constellation centre [0,0,0] ──────
const CENTER: [number, number, number] = [0, 0, 0];
const KEYS: { p: [number, number, number]; t: [number, number, number] }[] = [
  { p: [1.6, 1.1, 7.2], t: CENTER },      // hero — front, slightly above
  { p: [6.4, 0.6, 2.6], t: CENTER },      // orbit right
  { p: [4.4, 3.6, -4.6], t: CENTER },     // crane up & swing behind-right
  { p: [-3.2, 1.0, -6.2], t: CENTER },    // behind-left
  { p: [-6.6, 2.2, 2.0], t: CENTER },     // far left, lifted
  { p: [-1.4, 0.8, 7.4], t: CENTER },     // settle back to front-left
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
    dp.current.set(...KEYS[i].p).lerp(new THREE.Vector3(...KEYS[i + 1].p), t);
    dt.current.set(...KEYS[i].t).lerp(new THREE.Vector3(...KEYS[i + 1].t), t);
    pos.current.lerp(dp.current, reduced ? 1 : 0.06);
    tgt.current.lerp(dt.current, reduced ? 1 : 0.06);
    camera.position.copy(pos.current);
    camera.lookAt(tgt.current);
  });
  return null;
}

// Soft radial glow texture for the human nodes.
function useGlowTexture() {
  return useMemo(() => {
    const s = 128;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(170,148,104,0.95)");
    g.addColorStop(0.35, "rgba(138,120,86,0.45)");
    g.addColorStop(1, "rgba(138,120,86,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

function Brain({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { nodes, edges } = useMemo(() => buildBrain(), []);
  const glow = useGlowTexture();

  // Signals travelling the edges — bronze motes that flow along synapses.
  const SIGNALS = 16;
  const signals = useRef(
    Array.from({ length: SIGNALS }, (_, k) => ({
      edge: edges.length ? k % edges.length : 0,
      t: k / SIGNALS,
      speed: 0.12 + (k % 5) * 0.05,
    }))
  );
  const signalGroup = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // whole constellation drifts slowly, alive even when not scrolling
    if (group.current && !reduced) {
      group.current.rotation.y += delta * 0.06;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
    }
    // advance the travelling signals along their edges
    const sg = signalGroup.current;
    if (sg && edges.length) {
      signals.current.forEach((s, idx) => {
        s.t += delta * s.speed * (reduced ? 0 : 1);
        if (s.t > 1) {
          s.t -= 1;
          s.edge = (s.edge + 7) % edges.length; // hop to another synapse
        }
        const [i, j] = edges[s.edge];
        const a = nodes[i].pos, b = nodes[j].pos;
        const m = sg.children[idx];
        if (m) m.position.lerpVectors(a, b, s.t);
      });
    }
  });

  return (
    <group ref={group}>
      {/* synapses */}
      {edges.map(([i, j, d], k) => (
        <Line
          key={k}
          points={[nodes[i].pos.toArray(), nodes[j].pos.toArray()]}
          color={BRONZE}
          transparent
          opacity={Math.max(0.08, 0.34 - d * 0.09)}
          lineWidth={1}
        />
      ))}

      {/* agent nodes */}
      {nodes.map((n, k) =>
        n.human ? (
          <group key={k} position={n.pos.toArray()}>
            {/* soft glow billboard behind */}
            <sprite scale={[n.r * 7, n.r * 7, 1]}>
              <spriteMaterial map={glow} transparent depthWrite={false} opacity={0.9} />
            </sprite>
            {/* bronze core — the human gate */}
            <mesh>
              <sphereGeometry args={[n.r, 32, 32]} />
              <meshStandardMaterial color={BRONZE} emissive={BRONZE} emissiveIntensity={0.5} roughness={0.3} metalness={0.1} />
            </mesh>
            {/* camera-facing ring — echoes the logo's human-gate mark */}
            <Billboard>
              <mesh>
                <torusGeometry args={[n.r + 0.14, 0.014, 16, 64]} />
                <meshStandardMaterial color={BRONZE} emissive={BRONZE} emissiveIntensity={0.6} roughness={0.4} />
              </mesh>
            </Billboard>
          </group>
        ) : (
          <mesh key={k} position={n.pos.toArray()}>
            <sphereGeometry args={[n.r, 24, 24]} />
            <meshPhysicalMaterial
              color={INK}
              roughness={0.35}
              metalness={0.0}
              clearcoat={1}
              clearcoatRoughness={0.25}
            />
          </mesh>
        )
      )}

      {/* travelling signal motes */}
      <group ref={signalGroup}>
        {Array.from({ length: SIGNALS }).map((_, k) => (
          <mesh key={k}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color={BRONZE} emissive={BRONZE} emissiveIntensity={1.4} roughness={0.5} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <color attach="background" args={[GROUND]} />
      <fog attach="fog" args={[GROUND, 7, 20]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 6]} intensity={1.6} />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#f3ead6" />

      <Brain reduced={reduced} />

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 5, -5]} scale={[10, 6, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-5, 2, 4]} scale={[6, 6, 1]} color="#f3ead6" />
        <Lightformer intensity={0.9} position={[5, 3, 4]} scale={[6, 6, 1]} color="#ffffff" />
      </Environment>

      {!reduced && (
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.98} luminanceSmoothing={0.15} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.42} />
        </EffectComposer>
      )}
    </>
  );
}

export function Pipeline3D({ reduced = false }: { reduced?: boolean }) {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
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
