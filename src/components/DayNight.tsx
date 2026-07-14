"use client";

import { useEffect } from "react";
import { DAY_TOKENS, NIGHT_TOKENS, THEME_VAR_KEYS, lerpToken, nightAmount } from "@/lib/daynight";
import { heroState, sideToOffset } from "@/lib/heroState";

/**
 * Drives the page's day→night journey: as you scroll the home page, the theme
 * tokens on <html> invert from warm daylight to night, so the text stays
 * readable while the 3D background darkens (Pipeline3D uses the same curve).
 *
 * Polls scroll position on its own rAF loop (like the WebGL render loop) rather
 * than the native `scroll` event — Lenis smooth-scroll doesn't reliably emit it.
 * Home-only — mounted from page.tsx; resets to day on unmount/navigation.
 */
export function DayNight() {
  useEffect(() => {
    const root = document.documentElement;
    // The day→night inversion is a motion effect (held under reduced-motion), but
    // the model-avoidance offset is layout, so it always runs.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-side]"));
    let raf = 0;
    let last = -1;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0;
      if (!reduce) {
        const n = nightAmount(p);
        if (Math.abs(n - last) >= 0.001) {
          last = n;
          for (const key of THEME_VAR_KEYS) {
            root.style.setProperty(key, lerpToken(DAY_TOKENS[key], NIGHT_TOKENS[key], n));
          }
        }
      }
      // active panel → constellation focus target (so the model clears the text)
      const mid = window.innerHeight / 2;
      for (const el of panels) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          const off = sideToOffset(el.dataset.side || "left");
          heroState.offsetX = off.x;
          heroState.offsetY = off.y;
          break;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      for (const key of THEME_VAR_KEYS) root.style.removeProperty(key); // back to day
    };
  }, []);

  return null;
}
