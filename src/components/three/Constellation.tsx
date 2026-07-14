"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { smoothstep } from "@/lib/daynight";
import { themeState } from "@/lib/theme";
import { heroState } from "@/lib/heroState";
import { scrollProgress } from "./scroll";

/**
 * The "brain of bots" constellation — agent-nodes wired by bronze synapses,
 * signal motes travelling the edges, two glowing gate-node humans. Two variants
 * (day brain / night galaxy) crossfade along the scroll journey; node colours
 * follow the global theme value so the day/night toggle recolours them too.
 */

const BRONZE = "#8a7856";
const C_NODE_DAY = new THREE.Color("#1a1b1e");
const C_NODE_NIGHT = new THREE.Color("#a9a599");
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _focus = new THREE.Vector3();

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

// Day: compact organic "brain". Night: denser, rounder "galaxy".
export const LAYOUT_DAY = buildConstellation({ seed: 20260714, N: 30, rx: 2.75, ry: 1.9, rz: 2.3, shellMin: 0.7, jitter: 0.28, rMin: 0.06, rVar: 0.07, humanR: 0.17, edgeDist: 1.55, edgeProb: 0.62, maxEdges: 52 });
export const LAYOUT_NIGHT = buildConstellation({ seed: 99137, N: 46, rx: 2.7, ry: 2.55, rz: 2.7, shellMin: 0.84, jitter: 0.18, rMin: 0.05, rVar: 0.055, humanR: 0.16, edgeDist: 1.55, edgeProb: 0.8, maxEdges: 96 });

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

export function Constellation({ layout, phase, reduced }: { layout: Layout; phase: "day" | "night"; reduced: boolean }) {
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

  const lineGeo = useMemo(() => {
    const pts: number[] = [];
    for (const [i, j] of edges) pts.push(...nodes[i].pos.toArray(), ...nodes[j].pos.toArray());
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [nodes, edges]);

  // GC: dispose everything this variant owns when it unmounts
  useEffect(() => {
    return () => {
      lineGeo.dispose();
      glow.dispose();
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [lineGeo, glow, mats]);

  const SIGNALS = phase === "night" ? 20 : 16;
  const signals = useRef(
    Array.from({ length: SIGNALS }, (_, k) => ({ edge: edges.length ? k % edges.length : 0, t: k / SIGNALS, speed: 0.12 + (k % 5) * 0.05 }))
  );

  useFrame((state, delta) => {
    const prog = reduced ? 0.04 : scrollProgress();
    const n = themeState.value; // colours follow the global theme (toggle included)
    const emerge = smoothstep(0.4, 0.66, prog); // variant swap follows the journey
    const fade = reduced ? (phase === "day" ? 1 : 0) : phase === "day" ? 1 - emerge : emerge;

    if (group.current) group.current.visible = fade > 0.01;
    if (fade <= 0.01) return;

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

/** Slides the constellation off the active text side (screen space). */
export function FocusGroup({ reduced, children }: { reduced: boolean; children: React.ReactNode }) {
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
