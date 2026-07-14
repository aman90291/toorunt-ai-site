"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DAY_TOKENS, NIGHT_TOKENS, THEME_VAR_KEYS, lerpToken, nightAmount } from "@/lib/daynight";
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

    let raf = 0;
    let painted = -1;
    let alive = true;

    const tick = () => {
      if (!alive) return;

      // 1. scroll journey (home only; interior pages rest at day)
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0;
      themeState.scrollN = isHome && !reduce ? nightAmount(p) : 0;

      // 2. effective value — a manual tween owns `value` while running
      if (!themeState.tweening && themeState.mode === "auto") {
        themeState.value = themeState.scrollN;
      }

      // 3. paint CSS vars only when the value actually moved
      const v = themeState.value;
      if (Math.abs(v - painted) >= 0.001) {
        painted = v;
        for (const key of THEME_VAR_KEYS) {
          root.style.setProperty(key, lerpToken(DAY_TOKENS[key], NIGHT_TOKENS[key], v));
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
