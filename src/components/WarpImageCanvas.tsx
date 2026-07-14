"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The WebGL half of WarpImage (loaded dynamically so three.js stays out of the
 * page's first-load bundle): a subdivided plane textured with the screenshot,
 * rippled by a vertex-displacement shader while hovered. Demand frameloop —
 * renders only while there is motion. Texture/material/geometry disposed on
 * unmount.
 */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vWave;
  void main() {
    vUv = uv;
    float d = distance(uv, uMouse);
    float wave = sin(d * 26.0 - uTime * 5.5) * exp(-d * 4.5) * uHover;
    vec3 p = position;
    p.z += wave * 0.05;
    vWave = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uMap;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vWave;
  void main() {
    vec2 dir = normalize(vUv - uMouse + 1e-4);
    vec2 uv = clamp(vUv + dir * vWave * 0.014, 0.0, 1.0); // liquid refraction
    vec4 t = texture2D(uMap, uv);
    t.rgb += vWave * 0.22; // crest highlight
    gl_FragColor = t;
  }
`;

export type WarpPointer = { x: number; y: number; hover: number };

function WarpPlane({ texture, pointer }: { texture: THREE.Texture; pointer: React.RefObject<WarpPointer> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport, invalidate } = useThree();
  const eased = useRef({ h: 0, m: new THREE.Vector2(0.5, 0.5) });

  useFrame((state) => {
    const m = mat.current;
    const p = pointer.current;
    if (!m || !p) return;
    const e = eased.current;
    e.h += (p.hover - e.h) * 0.08;
    e.m.x += (p.x - e.m.x) * 0.12;
    e.m.y += (p.y - e.m.y) * 0.12;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uHover.value = e.h;
    (m.uniforms.uMouse.value as THREE.Vector2).copy(e.m);
    if (p.hover > 0 || e.h > 0.004) invalidate(); // stay awake only while moving
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 64, 44]} />
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{
          uMap: { value: texture },
          uTime: { value: 0 },
          uHover: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        }}
      />
    </mesh>
  );
}

export default function WarpImageCanvas({
  src,
  pointer,
  kick,
  onReady,
}: {
  src: string;
  pointer: React.RefObject<WarpPointer>;
  kick: React.RefObject<() => void>;
  onReady: () => void;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let dead = false;
    const loader = new THREE.TextureLoader();
    loader.load(src, (t) => {
      if (dead) { t.dispose(); return; }
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      setTexture(t);
      onReady();
    });
    return () => {
      dead = true;
      setTexture((prev) => { prev?.dispose(); return null; });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (!texture) return null;
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ antialias: false, alpha: true }}
      onCreated={(state) => { kick.current = state.invalidate; }}
    >
      <WarpPlane texture={texture} pointer={pointer} />
    </Canvas>
  );
}
