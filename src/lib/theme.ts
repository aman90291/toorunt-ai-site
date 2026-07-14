"use client";

import { gsap } from "gsap";

/**
 * Global theme state — the single source of truth for how "night" the site is.
 * `value` (0 = day, 1 = night) is read every frame by BOTH worlds:
 *   • ThemeDriver → CSS custom properties (text, surfaces, glows)
 *   • the WebGL scene → shader uniforms, lights, bloom (haze, dust, constellation)
 * so a toggle flips everything in perfect sync.
 *
 * Modes:
 *   auto  — the scroll-driven day→night journey (home); interior pages rest at day
 *   day   — pinned day, everywhere
 *   night — pinned night, everywhere
 *
 * The toggle is "instant yet seamless": a fast GSAP tween (power4.out) drives
 * `value`, which repaints CSS vars and WebGL uniforms on the same frames.
 * Module singleton (not React context) so it crosses the R3F reconciler boundary.
 */

export type ThemeMode = "auto" | "day" | "night";

export const themeState = {
  mode: "auto" as ThemeMode,
  value: 0,        // effective night amount, 0..1 — THE number everything reads
  scrollN: 0,      // latest scroll-driven night amount (home journey)
  tweening: false, // a manual tween owns `value` right now
};

let tween: gsap.core.Tween | null = null;

/** Flip the global theme. Fast-seamless by default; instant under reduced-motion. */
export function setThemeMode(mode: ThemeMode) {
  themeState.mode = mode;
  const target = mode === "night" ? 1 : mode === "day" ? 0 : themeState.scrollN;
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  tween?.kill();
  if (reduce) {
    themeState.value = target;
    themeState.tweening = false;
    return;
  }
  themeState.tweening = true;
  tween = gsap.to(themeState, {
    value: target,
    duration: 0.45,
    ease: "power4.out",
    overwrite: true,
    onComplete: () => {
      themeState.tweening = false; // in auto, the driver takes back over
      tween = null;
    },
  });
}

/** Kill any in-flight theme tween (app teardown). */
export function killThemeTween() {
  tween?.kill();
  tween = null;
  themeState.tweening = false;
}
