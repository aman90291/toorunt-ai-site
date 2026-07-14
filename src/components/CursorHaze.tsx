"use client";

import { useEffect, useRef } from "react";

/**
 * A soft, bronze-tinted haze that trails the cursor — atmosphere over the 3D
 * background. Sits above the canvas but below the content; its colour follows
 * the day→night journey (--haze-color). Skipped on touch / reduced-motion.
 */
export function CursorHaze() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse) return; // no haze on touch devices

    let tx = window.innerWidth / 2, ty = window.innerHeight * 0.4;
    let x = tx, y = ty, raf = 0, alive = true, seen = false;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      if (!seen) { seen = true; el.style.opacity = "1"; }
    };
    const tick = () => {
      if (!alive) return;
      const k = reduce ? 1 : 0.12; // trail (instant under reduced-motion)
      x += (tx - x) * k; y += (ty - y) * k;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <div ref={ref} aria-hidden className="cursor-haze" style={{ opacity: 0 }} />;
}
