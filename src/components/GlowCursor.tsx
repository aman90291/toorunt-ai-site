"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a,button,[role=button],input,textarea,select,label,summary";

/**
 * Custom cursor: a bronze dot that tracks the pointer with a softly-trailing
 * glow ring that swells over interactive elements. Hides the native cursor.
 * Skipped on touch devices; tracks instantly under reduced-motion.
 */
export function GlowCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return; // touch → native cursor
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const dot = dotRef.current!, ring = ringRef.current!;
    root.classList.add("has-glow-cursor");

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let dx = mx, dy = my, rx = mx, ry = my, raf = 0, alive = true, shown = false;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      if (!shown) { shown = true; dot.style.opacity = "1"; ring.style.opacity = ""; }
    };
    const hot = (e: PointerEvent, on: boolean) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE)) ring.classList.toggle("is-hot", on);
    };
    const onOver = (e: PointerEvent) => hot(e, true);
    const onOut = (e: PointerEvent) => hot(e, false);
    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");

    const tick = () => {
      if (!alive) return;
      const kd = reduce ? 1 : 0.4, kr = reduce ? 1 : 0.18;
      dx += (mx - dx) * kd; dy += (my - dy) * kd;
      rx += (mx - rx) * kr; ry += (my - ry) * kr;
      dot.style.transform = `translate(${dx}px, ${dy}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      root.classList.remove("has-glow-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="glow-cursor-ring" aria-hidden style={{ opacity: 0 }} />
      <div ref={dotRef} className="glow-cursor-dot" aria-hidden style={{ opacity: 0 }} />
    </>
  );
}
