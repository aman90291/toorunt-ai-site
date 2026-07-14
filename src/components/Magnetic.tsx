"use client";

import { useEffect } from "react";

/**
 * Magnetic hover: any element with [data-magnetic] is gently pulled toward the
 * cursor while hovered and springs back on leave. Uses the CSS `translate`
 * property (independent of `transform`) so Tailwind hover transforms still work.
 * Event-delegated — one manager for the whole app. Skipped on touch/reduced-motion.
 */
export function Magnetic() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const PULL = 0.32;   // fraction of cursor offset applied
    const MAX = 12;      // px clamp
    const K = 0.22;      // lerp factor per frame

    type State = { el: HTMLElement; tx: number; ty: number; x: number; y: number; hover: boolean };
    const active = new Map<HTMLElement, State>();
    let raf = 0;

    const loop = () => {
      raf = 0;
      let live = false;
      for (const s of active.values()) {
        s.x += (s.tx - s.x) * K;
        s.y += (s.ty - s.y) * K;
        if (Math.abs(s.x) < 0.05 && Math.abs(s.y) < 0.05 && !s.hover) {
          s.el.style.removeProperty("translate");
          active.delete(s.el);
        } else {
          s.el.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
          live = true;
        }
      }
      if (live) raf = requestAnimationFrame(loop);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(loop); };

    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element)?.closest?.("[data-magnetic]") as HTMLElement | null;
      // update / create the hovered element's state
      if (el) {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const s = active.get(el) ?? { el, tx: 0, ty: 0, x: 0, y: 0, hover: true };
        s.hover = true;
        s.tx = Math.max(-MAX, Math.min(MAX, dx * PULL));
        s.ty = Math.max(-MAX, Math.min(MAX, dy * PULL));
        active.set(el, s);
      }
      // anything no longer hovered springs home
      for (const s of active.values()) {
        if (s.el !== el) { s.hover = false; s.tx = 0; s.ty = 0; }
      }
      if (active.size) wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
      for (const s of active.values()) s.el.style.removeProperty("translate");
      active.clear();
    };
  }, []);

  return null;
}
