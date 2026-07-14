"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { WarpPointer } from "./WarpImageCanvas";

// three.js loads lazily (shared async chunk with the global scene) — the page's
// first-load bundle stays lean.
const WarpImageCanvas = dynamic(() => import("./WarpImageCanvas"), { ssr: false });

/**
 * 3D image mesh warp (Step 5b): overlays a screenshot with a WebGL plane that
 * ripples like liquid on hover (vertex displacement + refraction). The real
 * <img> underneath stays for SEO/LCP/no-JS; this layer fades in when its
 * texture is ready. Skips itself on touch, reduced-motion, and no-WebGL.
 */
export function WarpImage({ src, className = "" }: { src: string; className?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const pointer = useRef<WarpPointer>({ x: 0.5, y: 0.5, hover: 0 });
  const kick = useRef<() => void>(() => {});
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) return;
    } catch {
      return;
    }
    setEnabled(true);
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={wrap}
      className={`warp-canvas ${ready ? "is-ready" : ""} ${className}`}
      onPointerMove={(e) => {
        const r = wrap.current!.getBoundingClientRect();
        pointer.current.x = (e.clientX - r.left) / r.width;
        pointer.current.y = 1 - (e.clientY - r.top) / r.height;
      }}
      onPointerEnter={() => { pointer.current.hover = 1; kick.current(); }}
      onPointerLeave={() => { pointer.current.hover = 0; kick.current(); }}
    >
      <WarpImageCanvas src={src} pointer={pointer} kick={kick} onReady={() => setReady(true)} />
    </div>
  );
}
