"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { nightAmount, smoothstep } from "@/lib/daynight";
import { heroState } from "@/lib/heroState";

/**
 * The 3D hero: DevAgent's team as a living constellation of agent-nodes wired by
 * bronze synapses, with signals travelling the edges and two bronze gate-nodes as
 * the humans-in-the-loop. As you scroll:
 *   • the camera orbits (the tinyvilla move),
 *   • the scene journeys day→night in lockstep with the page (daynight.ts),
 *   • the constellation slides off the active text side (heroState.ts), and
 *   • a second, denser "galaxy" variant crossfades in for the night half.
 */

const BRONZE = "#8a7856";
const C_BG_DAY = new THREE.Color("#f1efe9");
const C_BG_NIGHT = new THREE.Color("#0d0e10");
const C_NODE_DAY = new THREE.Color("#1a1b1e");
const C_NODE_NIGHT = new THREE.Color("#a9a599");
const _bg = new THREE.Color();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _focus = new THREE.Vector3();

// ── Deterministic layouts ────────────────────────────────────────────
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

type Node = { pos: THREE.Vector3; r: number; human: boolean };
type Layout = { nodes: Node[]; edges: [number, number, number][] };
type ShapeOpts = {
  seed: number; N: number; rx: number; ry: number; rz: number;
  shellMin: number; jitter: number; rMin: number; rVar: number; humanR: number;
  edgeDist: number; edgeProb: number; maxEdges: number;
};

function buildConstellation(o: ShapeOpts): Layout {
  const rand = mulberry32(o.seed);
  const nodes: Node[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < o.N; i++) {
    const y = 1 - (i / (o.N - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    let x = Math.cos(theta) * rad, z = Math.sin(theta) * rad, yy = y;
    const shell = o.shellMin + (1 - o.shellMin) * rand();
    x *= shell; yy *= shell; z *= shell;
    x += (rand() - 0.5) * o.jitter; yy += (rand() - 0.5) * o.jitter; z += (rand() - 0.5) * o.jitter;
    nodes.push({ pos: new THREE.Vector3(x * o.rx, yy * o.ry, z * o.rz), r: o.rMin + rand() * o.rVar, human: false });
  }
  const byZ = [...nodes].sort((a, b) => b.pos.z - a.pos.z);
  const h1 = byZ[1];
  const byX = [...nodes].sort((a, b) => a.pos.x - b.pos.x);
  const h2 = byX.find((n) => n !== h1) ?? byX[0];
  for (const h of [h1, h2]) { h.human = true; h.r = o.humanR; }

  const edges: [number, number, number][] = [];
  for (let i = 0; i < o.N && edges.length < o.maxEdges; i++)
    for (let j = i + 1; j < o.N && edges.length < o.maxEdges; j++) {
      const d = nodes[i].pos.distanceTo(nodes[j].pos);
      const near = d < o.edgeDist;
      const wantHuman = (nodes[i].human || nodes[j].human) && d < o.edgeDist * 1.5;
      if ((near && rand() < o.edgeProb) || (wantHuman && rand() < 0.7)) edges.push([i, j, d]);
    }
  return { nodes, edges };
}

// Day: a compact, organic "brain". Night: a bigger, rounder, denser "galaxy".
const LAYOUT_DAY = buildConstellation({ seed: 20260714, N: 30, rx: 2.75, ry: 1.9, rz: 2.3, shellMin: 0.7, jitter: 0.28, rMin: 0.06, rVar: 0.07, humanR: 0.17, edgeDist: 1.55, edgeProb: 0.62, maxEdges: 52 });
const LAYOUT_NIGHT = buildConstellation({ seed: 99137, N: 46, rx: 2.7, ry: 2.55, rz: 2.7, shellMin: 0.84, jitter: 0.18, rMin: 0.05, rVar: 0.055, humanR: 0.16, edgeDist: 1.55, edgeProb: 0.8, maxEdges: 96 });

// ── Camera choreography ──────────────────────────────────────────────
const CENTER: [number, number, number] = [0, 0, 0];
const KEYS: { p: [number, number, number]; t: [number, number, number] }[] = [
  { p: [1.6, 1.1, 7.2], t: CENTER },
  { p: [6.4, 0.6, 2.6], t: CENTER },
  { p: [4.4, 3.6, -4.6], t: CENTER },
  { p: [-3.2, 1.0, -6.2], t: CENTER },
  { p: [-6.6, 2.2, 2.0], t: CENTER },
  { p: [-1.4, 0.8, 7.4], t: CENTER },
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

function makeGlowTexture() {
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
}

/** One constellation variant. `phase` picks its crossfade curve; the whole thing
 *  fades via a single opacity applied to every material. */
function Constellation({ layout, phase, reduced }: { layout: Layout; phase: "day" | "night"; reduced: boolean }) {
  const { nodes, edges } = layout;
  const group = useRef<THREE.Group>(null);
  const signalGroup = useRef<THREE.Group>(null);
  const glow = useMemo(() => makeGlowTexture(), []);

  const mats = useMemo(() => {
    const agent = new THREE.MeshPhysicalMaterial({ color: C_NODE_DAY.clone(), roughness: 0.35, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.25, transparent: true });
    const synapse = new THREE.LineBasicMaterial({ color: BRONZE, transparent: true, opacity: 0.26 });
    const signal = new THREE.MeshStandardMaterial({ color: BRONZE, emissive: BRONZE, emissiveIntensity: 1.4, roughness: 0.5, toneMapped: false, transparent: true });
    const core = new THREE.MeshStandardMaterial({ color: BRONZE, emissive: BRONZE, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.1, transparent: true });
    const ring = new THREE.MeshStandardMaterial({ color: BRONZE, emissive: BRONZE, emissiveIntensity: 0.6, roughness: 0.4, transparent: true });
    const sprite = new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, opacity: 0.9 });
    return { agent, synapse, signal, core, ring, sprite };
  }, [glow]);

  // synapse line segments (one geometry for the whole variant)
  const lineGeo = useMemo(() => {
    const pts: number[] = [];
    for (const [i, j] of edges) pts.push(...nodes[i].pos.toArray(), ...nodes[j].pos.toArray());
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [nodes, edges]);

  const SIGNALS = phase === "night" ? 20 : 16;
  const signals = useRef(
    Array.from({ length: SIGNALS }, (_, k) => ({ edge: edges.length ? k % edges.length : 0, t: k / SIGNALS, speed: 0.12 + (k % 5) * 0.05 }))
  );

  useFrame((state, delta) => {
    const prog = reduced ? 0.04 : scrollProgress();
    const n = nightAmount(prog);
    const emerge = smoothstep(0.4, 0.66, prog);
    const fade = reduced ? (phase === "day" ? 1 : 0) : phase === "day" ? 1 - emerge : emerge;

    if (group.current) group.current.visible = fade > 0.01;
    if (fade <= 0.01) return;

    // day→night colour + crossfade opacity, applied once for the whole variant
    mats.agent.color.copy(C_NODE_DAY).lerp(C_NODE_NIGHT, n);
    mats.agent.opacity = fade;
    mats.synapse.opacity = (0.24 + n * 0.2) * fade;
    mats.signal.opacity = fade;
    mats.signal.emissiveIntensity = (1.4 + n * 1.3) * fade;
    mats.core.opacity = fade;
    mats.ring.opacity = fade;
    mats.sprite.opacity = 0.9 * fade;

    if (group.current && !reduced) {
      group.current.rotation.y += delta * (phase === "night" ? -0.05 : 0.06);
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15 + (phase === "night" ? 1.5 : 0)) * 0.05;
    }
    const sg = signalGroup.current;
    if (sg && edges.length && !reduced) {
      signals.current.forEach((s, idx) => {
        s.t += delta * s.speed;
        if (s.t > 1) { s.t -= 1; s.edge = (s.edge + 7) % edges.length; }
        const [i, j] = edges[s.edge];
        sg.children[idx]?.position.lerpVectors(nodes[i].pos, nodes[j].pos, s.t);
      });
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo} material={mats.synapse} />
      {nodes.map((nd, k) =>
        nd.human ? (
          <group key={k} position={nd.pos.toArray()}>
            <sprite scale={[nd.r * 7, nd.r * 7, 1]} material={mats.sprite} />
            <mesh material={mats.core}>
              <sphereGeometry args={[nd.r, 32, 32]} />
            </mesh>
            <Billboard>
              <mesh material={mats.ring}>
                <torusGeometry args={[nd.r + 0.14, 0.014, 16, 64]} />
              </mesh>
            </Billboard>
          </group>
        ) : (
          <mesh key={k} position={nd.pos.toArray()} material={mats.agent}>
            <sphereGeometry args={[nd.r, 20, 20]} />
          </mesh>
        )
      )}
      <group ref={signalGroup}>
        {Array.from({ length: SIGNALS }).map((_, k) => (
          <mesh key={k} material={mats.signal}>
            <sphereGeometry args={[0.035, 12, 12]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Wraps both variants and slides them off the active text side (screen space). */
function FocusGroup({ reduced, children }: { reduced: boolean; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useFrame(() => {
    if (!group.current) return;
    _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    _up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    _focus.copy(_right).multiplyScalar(heroState.offsetX).addScaledVector(_up, heroState.offsetY);
    group.current.position.lerp(_focus, reduced ? 1 : 0.045);
  });
  return <group ref={group}>{children}</group>;
}

/** Lerps scene background/fog + lights + bloom day→night. */
function Atmosphere({ reduced, keyRef, fillRef, ambRef, bloomRef }: {
  reduced: boolean;
  keyRef: React.RefObject<THREE.DirectionalLight | null>;
  fillRef: React.RefObject<THREE.DirectionalLight | null>;
  ambRef: React.RefObject<THREE.AmbientLight | null>;
  bloomRef: React.RefObject<{ intensity: number; luminanceMaterial?: { threshold: number } } | null>;
}) {
  const { scene } = useThree();
  useFrame(() => {
    const n = nightAmount(reduced ? 0.04 : scrollProgress());
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

function Scene({ reduced }: { reduced: boolean }) {
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

      <FocusGroup reduced={reduced}>
        <Constellation layout={LAYOUT_DAY} phase="day" reduced={reduced} />
        <Constellation layout={LAYOUT_NIGHT} phase="night" reduced={reduced} />
      </FocusGroup>

      <Environment resolution={256}>
        <Lightformer intensity={2.0} position={[0, 5, -5]} scale={[10, 6, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-5, 2, 4]} scale={[6, 6, 1]} color="#f3ead6" />
        <Lightformer intensity={0.9} position={[5, 3, 4]} scale={[6, 6, 1]} color="#ffffff" />
      </Environment>

      {!reduced && (
        <EffectComposer>
          <Bloom ref={bloomRef} intensity={0.5} luminanceThreshold={0.98} luminanceSmoothing={0.15} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.42} />
        </EffectComposer>
      )}

      <Atmosphere reduced={reduced} keyRef={keyRef} fillRef={fillRef} ambRef={ambRef} bloomRef={bloomRef} />
    </>
  );
}

export function Pipeline3D({ reduced = false }: { reduced?: boolean }) {
  return (
    <div className="hero-3d fixed inset-0 -z-10" aria-hidden="true">
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
