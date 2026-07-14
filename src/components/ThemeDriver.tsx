"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  DAY_TOKENS,
  NIGHT_TOKENS,
  THEME_VAR_KEYS,
  INK_SIDE_KEYS,
  lerpToken,
  nightAmount,
  inkFlip,
  smoothstep,
} from "@/lib/daynight";
import { themeState } from "@/lib/theme";
import { heroState, sideToOffset } from "@/lib/heroState";

/**
 * Global theme driver (all pages, mounted once in the layout). Each frame it:
 *   1. computes the scroll-driven night amount (the home journey; interior = day),
 *   2. resolves the effective theme value — auto follows scroll, a manual pin
 *      (day/night toggle) is tweened by lib/theme.ts and honoured here,
 *   3. paints the CSS custom properties on <html> (only when the value moved),
 *   4. on the home page, aims the constellation away from the active text panel.
 *
 * Runs its own rAF (Lenis smooth-scroll doesn't emit native `scroll` events).
 * Under reduced-motion the scroll-driven inversion is held (no flashing), but a
 * deliberate manual toggle still applies instantly, and the layout offset—which
 * is position, not motion—keeps working.
 */
export function ThemeDriver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isHome = pathname === "/";
    const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-side]"));
    // Dusk is anchored to a section, not smeared across the page: night falls AS
    // this section enters the viewport, so no section ever rests mid-crossover
    // where ink and ground are both mid-grey and contrast collapses.
    const anchor = document.querySelector<HTMLElement>("[data-night-anchor]");

    let raf = 0;
    let painted = -1;
    let alive = true;

    const tick = () => {
      if (!alive) return;

      // 1. scroll journey (home only; interior pages rest at day)
      if (isHome && !reduce) {
        if (anchor) {
          const r = anchor.getBoundingClientRect();
          const vh = window.innerHeight;
          // 0 while the anchor is below the fold → 1 by the time it's centered
          themeState.scrollN = smoothstep(0, 1, (vh * 0.92 - r.top) / (vh * 0.72));
        } else {
          const max = root.scrollHeight - window.innerHeight;
          const p = max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0;
          themeState.scrollN = nightAmount(p);
        }
      } else {
        themeState.scrollN = 0;
      }

      // 2. effective value — a manual tween owns `value` while running
      if (!themeState.tweening && themeState.mode === "auto") {
        themeState.value = themeState.scrollN;
      }

      // 3. paint CSS vars only when the value actually moved. Background-side
      //    tokens ease with the value; text-side tokens flip on the steep curve
      //    (inkFlip) so text never lingers at the low-contrast crossover.
      const v = themeState.value;
      if (Math.abs(v - painted) >= 0.001) {
        painted = v;
        const vInk = inkFlip(v);
        for (const key of THEME_VAR_KEYS) {
          const t = INK_SIDE_KEYS.has(key) ? vInk : v;
          root.style.setProperty(key, lerpToken(DAY_TOKENS[key], NIGHT_TOKENS[key], t));
        }
      }

      // 4. constellation clears the active text panel (home only; layout, not motion)
      if (isHome) {
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
      } else {
        heroState.offsetX = 0;
        heroState.offsetY = 0;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
