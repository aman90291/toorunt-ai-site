"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { OPEN_DEMO_EVENT, CLOSE_DEMO_EVENT } from "@/lib/demo";

type LenisLike = {
  scrollTo: (
    target: number,
    opts: { duration?: number; easing?: (t: number) => number; lock?: boolean; force?: boolean; onComplete?: () => void }
  ) => void;
};

/**
 * Section-by-section scrolljacking (Step 4), home page only. One wheel flick
 * (or arrow/PageDown key) = one full-screen section, animated by Lenis with a
 * dramatic S-curve (power4.inOut ≈ cubic-bezier(0.76, 0, 0.24, 1)).
 *
 * The scroll is LOCKED while animating (Lenis `lock` + our own gate) and
 * unlocks right after, with a short cooldown that eats trackpad inertia so a
 * momentum tail can't chain-skip sections.
 *
 * Touch keeps natural scrolling (coarse pointers skip the jack entirely), and
 * reduced-motion disables it. Scrollbar dragging still works — Observer only
 * intercepts wheel gestures.
 */
export function ScrollJack() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    gsap.registerPlugin(Observer);

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
    if (sections.length < 2) return;

    let animating = false;
    let cooledUntil = 0;

    // the luxurious S-curve — power4.inOut
    const sCurve = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

    const targets = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const arr = sections.map((s) => Math.min(s.offsetTop, max));
      if (max - arr[arr.length - 1] > 160) arr.push(max); // the footer as a final stop
      return arr;
    };

    const go = (dir: 1 | -1) => {
      const now = performance.now();
      if (animating || now < cooledUntil) return;

      const ts = targets();
      const y = window.scrollY;
      let idx = 0;
      for (let i = 0; i < ts.length; i++) if (y >= ts[i] - 2) idx = i;
      let next = idx + dir;
      if (dir === -1 && y > ts[idx] + 2) next = idx; // mid-way up → top of current
      if (next < 0 || next >= ts.length) return;

      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
      animating = true;
      if (lenis?.scrollTo) {
        lenis.scrollTo(ts[next], {
          duration: 1.25,
          easing: sCurve,
          lock: true,   // user input frozen during the transition
          force: true,
          onComplete: () => {
            animating = false;
            cooledUntil = performance.now() + 260; // absorb momentum tail
          },
        });
      } else {
        window.scrollTo({ top: ts[next], behavior: "smooth" });
        animating = false;
      }
    };

    // one gesture = one section (official GSAP pattern: wheelSpeed -1 unifies
    // wheel direction with touch, so onUp = forward)
    const obs = Observer.create({
      target: window, // wheel events bubble to window — catches them all
      type: "wheel",
      wheelSpeed: -1,
      tolerance: 10,
      preventDefault: true,
      allowClicks: true,
      onDown: () => go(-1),
      onUp: () => go(1),
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);

    // pause section-snapping (and its wheel preventDefault) while the demo modal
    // is open, so the dialog can scroll internally on short screens
    const pause = () => obs.disable();
    const resume = () => obs.enable();
    window.addEventListener(OPEN_DEMO_EVENT, pause);
    window.addEventListener(CLOSE_DEMO_EVENT, resume);

    return () => {
      obs.kill();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_DEMO_EVENT, pause);
      window.removeEventListener(CLOSE_DEMO_EVENT, resume);
    };
  }, []);

  return null;
}
