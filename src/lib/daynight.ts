/**
 * Day → night journey, shared by the page theme (DayNight.tsx) and the 3D scene
 * (three/Scene3D.tsx) so they darken in lockstep as you scroll. 0 = full day,
 * 1 = full night. Bronze accent stays warm on both ends.
 */

export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** How "night" the scene is, from scroll progress p (0..1). Day holds at the top,
 *  the transition happens through the middle, full night near the bottom. */
export function nightAmount(p: number): number {
  return smoothstep(0.12, 0.9, p);
}

type Tokens = Record<string, string>;

// Themed CSS vars at each end of the journey. Overriding these on <html> flips
// every Tailwind token-utility (bg-ground, text-ink, bg-accent, …) at once.
export const DAY_TOKENS: Tokens = {
  "--color-ground": "#f1efe9",
  "--color-ground-2": "#fbfaf6",
  "--color-ground-3": "#e7e3d9",
  "--color-line": "#ddd8cb",
  "--color-line-2": "#c6bfae",
  "--color-ink": "#1a1b1e",
  "--color-ink-dim": "#52575d",
  "--color-ink-faint": "#8f8a7d",
  "--color-accent": "#1a1b1e",
  "--color-accent-text": "#8a7856",
  "--text-halo": "rgba(241, 239, 233, 0.72)",
  "--haze-color": "rgba(150, 132, 96, 0.10)",
};

export const NIGHT_TOKENS: Tokens = {
  "--color-ground": "#0d0e10",
  "--color-ground-2": "#16181b",
  "--color-ground-3": "#202226",
  "--color-line": "#2a2d31",
  "--color-line-2": "#3a3e44",
  "--color-ink": "#f3f1ea",
  "--color-ink-dim": "#b6b1a4",
  "--color-ink-faint": "#7f7b73",
  "--color-accent": "#f3f1ea",
  "--color-accent-text": "#c8ae7e",
  "--text-halo": "rgba(7, 8, 10, 0.8)",
  "--haze-color": "rgba(205, 180, 125, 0.18)",
};

// Scene (WebGL) colours, kept here so the canvas matches the page exactly.
export const SCENE = {
  bgDay: "#f1efe9",
  bgNight: "#0d0e10",
};

export const THEME_VAR_KEYS = Object.keys(DAY_TOKENS);

function hexToRgb(h: string): [number, number, number] {
  const s = h.replace("#", "");
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function parseRgba(s: string): [number, number, number, number] {
  const m = s.match(/rgba?\(([^)]+)\)/);
  const p = m![1].split(",").map((x) => parseFloat(x.trim()));
  return [p[0], p[1], p[2], p[3] ?? 1];
}
function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Interpolate a token value (either #hex or rgba(...)). */
export function lerpToken(a: string, b: string, t: number): string {
  if (a.startsWith("rgba") || b.startsWith("rgba")) {
    const A = parseRgba(a), B = parseRgba(b);
    return `rgba(${Math.round(mix(A[0], B[0], t))}, ${Math.round(mix(A[1], B[1], t))}, ${Math.round(
      mix(A[2], B[2], t)
    )}, ${mix(A[3], B[3], t).toFixed(3)})`;
  }
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${Math.round(mix(A[0], B[0], t))}, ${Math.round(mix(A[1], B[1], t))}, ${Math.round(
    mix(A[2], B[2], t)
  )})`;
}
