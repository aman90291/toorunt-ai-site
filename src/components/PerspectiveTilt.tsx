"use client";

import { useEffect } from "react";

/**
 * Interactive perspective text: elements with `.perspective-3d` rotate and tilt
 * toward the mouse relative to their own centre —
 * `perspective(1000px) rotateX() rotateY()` — with a smoothing lerp so nothing
 * snaps (both while tracking and on settle-back). Event-delegated, one rAF.
 * Skipped on touch/reduced-motion.
 */
export function PerspectiveTilt() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const MAX_TILT = 7; // degrees
    const K = 0.12;     // lerp factor per frame

    type State = { el: HTMLElement; trx: number; try_: number; rx: number; ry: number; hover: boolean };
    const active = new Map<HTMLElement, State>();
    let raf = 0;

    const loop = () => {
      raf = 0;
      let live = false;
      for (const s of active.values()) {
        s.rx += (s.trx - s.rx) * K;
        s.ry += (s.try_ - s.ry) * K;
        if (!s.hover && Math.abs(s.rx) < 0.03 && Math.abs(s.ry) < 0.03) {
          s.el.style.removeProperty("transform");
          active.delete(s.el);
        } else {
          s.el.style.transform = `perspective(1000px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
          live = true;
        }
      }
      if (live) raf = requestAnimationFrame(loop);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(loop); };

    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element)?.closest?.(".perspective-3d") as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
        const s = active.get(el) ?? { el, trx: 0, try_: 0, rx: 0, ry: 0, hover: true };
        s.hover = true;
        s.try_ = nx * MAX_TILT;   // mouse right → rotateY positive (right edge away)
        s.trx = -ny * MAX_TILT;   // mouse down  → rotateX negative (bottom edge away)
        active.set(el, s);
      }
      for (const s of active.values()) {
        if (s.el !== el) { s.hover = false; s.trx = 0; s.try_ = 0; }
      }
      if (active.size) wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
      for (const s of active.values()) s.el.style.removeProperty("transform");
      active.clear();
    };
  }, []);

  return null;
}
