/**
 * The palette — one fixed dark theme.
 *
 * This used to be a two-ended day→night journey with OKLab interpolation, a
 * scroll-driven dusk crossing, and a manual toggle. All of it is gone: the site
 * is dark only. What remains is the single source of truth for colour, shared
 * by the CSS (mirrored into the `@theme` block in globals.css) and by the WebGL
 * scene via `sceneRgb`, so the canvas can never drift from the page behind it.
 *
 * Contrast against the ground, measured:
 *   ink 17.1:1 · ink-dim 9.0:1 · ink-faint 4.6:1 · accent 4.8:1 · pass 6.4:1
 */

/** Kept as a named export because a few call sites still smooth values. */
export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export const TOKENS: Record<string, string> = {
  "--color-ground": "#0d0e10",
  "--color-ground-2": "#16181b",
  "--color-ground-3": "#202226",
  "--color-line": "#2a2d31",
  "--color-line-2": "#3a3e44",
  "--color-ink": "#f3f1ea",
  "--color-ink-dim": "#b6b1a4",
  "--color-ink-faint": "#7f7b73",
  "--color-accent": "#ff453a",
  "--color-accent-text": "#ff453a",
  "--color-accent-wash": "rgba(255, 69, 58, 0.13)",
  "--color-pass": "#8b9a78",
  "--text-halo": "rgba(7, 8, 10, 0.88)",
  "--haze-color": "rgba(255, 69, 58, 0.16)",
};

/** WebGL clear colour, derived rather than re-typed. */
export const SCENE = { bg: TOKENS["--color-ground"] };

type Rgba = [number, number, number, number];

function parseColor(s: string): Rgba {
  const t = s.trim();
  if (t.startsWith("#")) {
    const h = t.slice(1);
    const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
      1,
    ];
  }
  const m = t.match(/rgba?\(([^)]+)\)/);
  if (!m) return [0, 0, 0, 1];
  const p = m[1].split(",").map((x) => parseFloat(x.trim()));
  return [p[0] || 0, p[1] || 0, p[2] || 0, p[3] ?? 1];
}

/** sRGB 0..255 → linear-light 0..1 */
function toLinear(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

/**
 * A token as a linear-light RGB triple, for shader uniforms and THREE.Color.
 * Three renders in linear space, so handing it these keeps the canvas matched
 * to the CSS without a second round of gamma guesswork.
 */
export function sceneRgb(token: string): [number, number, number] {
  const [r, g, b] = parseColor(TOKENS[token] ?? "#000000");
  return [toLinear(r), toLinear(g), toLinear(b)];
}
