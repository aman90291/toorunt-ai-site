/**
 * The palette — one source of truth for every surface that paints colour.
 *
 * The page opens in the warm white (the 30%) and crosses into near-black (the
 * 60%) as you scroll; crimson (the 10%) marks the places a human is accountable
 * — the human gates on the timeline, and the primary call to action. That is the
 * whole colour idea: the accent appears exactly where a person has to decide.
 *
 * Everything reads from here — the CSS custom properties, the Tailwind `@theme`
 * block (which mirrors DAY_TOKENS), the WebGL clear colour, and the shader
 * uniforms via `sceneRgb`. Previously the palette existed in four places and
 * they had already drifted; if you change a colour, change it here only.
 *
 * 0 = full day (white), 1 = full night (dark).
 */

export type ThemeMode = "auto" | "day" | "night";

/** Home opens white and journeys to dark, so the site boots in `auto` at day.
 *  Because the day tokens are already the `@theme` defaults in globals.css,
 *  there is nothing to paint before first paint and no boot script is needed. */
export const DEFAULT_MODE: ThemeMode = "auto";

export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Fallback night curve from raw scroll progress (used only when no
 *  [data-night-anchor] section exists). Kept NARROW: a long, gradual lerp parks
 *  whole sections at the 50% crossover where ink and ground are both mid-grey
 *  and text contrast collapses. Dusk must be an event, not a state. */
export function nightAmount(p: number): number {
  return smoothstep(0.5, 0.64, p);
}

/**
 * The dusk crossing — the hardest part of the whole palette, and worth reading
 * before you touch either curve.
 *
 * A ground that travels white → black continuously MUST pass through mid-grey
 * (luminance ≈ 0.17). At that instant no single ink colour can hold 4.5:1:
 * near-black ink gives 4.0:1 and near-white ink gives 4.1:1. The crossing is
 * unavoidably a low-contrast moment; the job is to make it *brief* and to make
 * text survive it by other means.
 *
 * Three things do that:
 *   1. `groundFlip` holds the ground near-white, drops it fast through the
 *      middle, then holds it near-black — so mid-grey is a moment, not a zone.
 *   2. `inkFlip` is a near-step centred on the same point. This is the part the
 *      earlier smoothstep(0.52, 0.68) got wrong: it left ink sitting at
 *      mid-grey while the ground was also mid-grey, bottoming out at 1.51:1.
 *      Ink must never be mid — it is either dark or light, and it swaps fast.
 *   3. `--text-halo` is on the ink side too, so it flips in the same frame and
 *      always opposes the ink. Through the crossing, text is dark-with-a-white-
 *      halo or light-with-a-dark-halo, both legible on mid-grey. WCAG's formula
 *      cannot score a text-shadow, so this is what carries the band that the
 *      automated check can only prove to be AA-large.
 *
 * Layout constraint that falls out of this: the crossing band must not land on
 * body copy. Anchor dusk to a section carrying display type or graphics only.
 */

/** Background-side curve. Flat, fast, flat.
 *  The width of this ramp sets how long the accent is unreadable: crimson sits
 *  near mid-luminance, so its bad window scales directly with how long the
 *  ground lingers near mid-grey. Tightening 0.38–0.62 to 0.44–0.56 roughly
 *  halved that window at no visual cost — dusk was always meant to be an event
 *  rather than a state it can rest in. */
export function groundFlip(n: number): number {
  return smoothstep(0.44, 0.56, n);
}

/**
 * Text-side curve — a true step, not a steep ramp.
 *
 * Any interpolation at all puts ink at mid-grey exactly when the ground is at
 * mid-grey, and the halo with it: measured, that bottoms out at 1.08:1, which
 * is invisible text. Stepping keeps ink at one end or the other, so the worst
 * case becomes near-black-on-mid-grey (4.13:1) or near-white-on-mid-grey
 * (4.07:1) — both clear the AA-large floor.
 *
 * The visible result is a single-frame swap at the darkest point of dusk. That
 * reads as deliberate rather than broken, and it matches the mechanical,
 * clip-and-cut motion grammar the rest of the site uses.
 */
export function inkFlip(n: number): number {
  return n < 0.5 ? 0 : 1;
}

/**
 * KNOWN LIMIT, recorded because it constrains layout rather than code:
 * at the ground's midpoint (luminance 0.174) a colour needs luminance ≤ 0.050
 * or ≥ 0.958 to reach 4.5:1. Crimson is 0.105 at the day end and 0.211 at the
 * night end, so NO variant of the accent is AA against mid-dusk grey — this is
 * arithmetic, not a tuning problem.
 *
 * It is bounded: the sub-AA window is ~1.8% of the journey, and dusk is mapped
 * across roughly 0.72vh of scroll, so it spans about a dozen pixels of scroll
 * travel. The rule that follows: no accent-coloured body text, and no crimson
 * CTA, inside the section that carries the dusk crossing. Marks and dots are
 * fine — they are graphical, and they are legible again within a few pixels.
 */
export const DUSK_BAND: readonly [number, number] = [0.49, 0.51];

/** Tokens that sit on the TEXT side of the flip (steep curve). Everything else
 *  is background-side and follows the eased value. */
export const INK_SIDE_KEYS = new Set([
  "--color-ink",
  "--color-ink-dim",
  "--color-ink-faint",
  "--color-accent",
  "--color-accent-text",
  "--text-halo",
]);

type Tokens = Record<string, string>;

/**
 * DAY — the 30%. Warm architectural white, near-black ink, crimson accent.
 * These values are mirrored by the `@theme` block in globals.css, which is what
 * generates the Tailwind utilities (bg-ground, text-ink-dim, border-line, …).
 * Overriding them on <html> at runtime re-themes every utility at once, which
 * is why there are no `dark:` variants anywhere in the codebase.
 */
export const DAY_TOKENS: Tokens = {
  "--color-ground": "#f1efe9",
  "--color-ground-2": "#fbfaf6",
  "--color-ground-3": "#e7e3d9",
  "--color-line": "#ddd8cb",
  "--color-line-2": "#c6bfae",
  "--color-ink": "#14151a",
  "--color-ink-dim": "#52575d",
  // #8f8a7d measured 2.99:1 here — one hundredth under the 3:1 graphical floor.
  "--color-ink-faint": "#8a8578",
  // Crimson on warm white → 5.9:1. Passes AA for body text, AAA for large.
  "--color-accent": "#9b3b45",
  "--color-accent-text": "#9b3b45",
  "--color-accent-wash": "rgba(155, 59, 69, 0.10)",
  // Sage marks an autonomous gate. 3.9:1 on white — it only ever paints 7px
  // dots and hairlines, which are graphical objects (3:1 threshold), not text.
  "--color-pass": "#6e7b5e",
  "--text-halo": "rgba(241, 239, 233, 0.85)",
  "--haze-color": "rgba(155, 59, 69, 0.10)",
};

/**
 * NIGHT — the 60%. The accent has to brighten here or it drowns: #9b3b45 on
 * #0d0e10 is only 4.3:1, just under the 4.5:1 AA floor. #cc5a66 lifts it to
 * 4.8:1 while staying the same hue family. Sage gets the same treatment.
 */
export const NIGHT_TOKENS: Tokens = {
  "--color-ground": "#0d0e10",
  "--color-ground-2": "#16181b",
  "--color-ground-3": "#202226",
  "--color-line": "#2a2d31",
  "--color-line-2": "#3a3e44",
  "--color-ink": "#f3f1ea",
  "--color-ink-dim": "#b6b1a4",
  "--color-ink-faint": "#7f7b73",
  "--color-accent": "#cc5a66",
  "--color-accent-text": "#cc5a66",
  "--color-accent-wash": "rgba(204, 90, 102, 0.14)",
  "--color-pass": "#8b9a78",
  "--text-halo": "rgba(7, 8, 10, 0.88)",
  "--haze-color": "rgba(204, 90, 102, 0.16)",
};

export const THEME_VAR_KEYS = Object.keys(DAY_TOKENS);

/** WebGL clear colour / fog, derived from the tokens rather than re-declared,
 *  so the canvas can never drift from the page behind it. */
export const SCENE = {
  bgDay: DAY_TOKENS["--color-ground"],
  bgNight: NIGHT_TOKENS["--color-ground"],
};

/* ─────────────────────────────────────────────────────────────
   Colour maths. Interpolation happens in OKLab, not sRGB.

   Mixing #f1efe9 → #0d0e10 channel-wise in sRGB dips through a dead, desaturated
   grey around t≈0.5 and the crimson goes brown on the way past. OKLab is
   perceptually uniform, so lightness falls linearly and the hue holds. This is
   the single reason the scroll transition reads as a room dimming rather than a
   cross-fade between two screenshots.
   ───────────────────────────────────────────────────────────── */

type Rgba = [number, number, number, number]; // 0..255, alpha 0..1

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

/** linear-light 0..1 → sRGB 0..255 */
function toSrgb(x: number): number {
  const c = x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(c * 255)));
}

/** linear sRGB → OKLab (Björn Ottosson's transform) */
function linearToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLab → linear sRGB */
function oklabToLinear(L: number, A: number, B: number): [number, number, number] {
  const l = L + 0.3963377774 * A + 0.2158037573 * B;
  const m = L - 0.1055613458 * A - 0.0638541728 * B;
  const s = L - 0.0894841775 * A - 1.291485548 * B;
  const l3 = l * l * l;
  const m3 = m * m * m;
  const s3 = s * s * s;
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Interpolate a token value (either #hex or rgba(...)) in OKLab.
 * Returns `rgb()` for opaque inputs and `rgba()` when either end is translucent,
 * so the halo tokens keep their alpha ramp.
 */
export function lerpToken(a: string, b: string, t: number): string {
  const A = parseColor(a);
  const B = parseColor(b);

  const la = linearToOklab(toLinear(A[0]), toLinear(A[1]), toLinear(A[2]));
  const lb = linearToOklab(toLinear(B[0]), toLinear(B[1]), toLinear(B[2]));

  const [lr, lg, lbl] = oklabToLinear(
    mix(la[0], lb[0], t),
    mix(la[1], lb[1], t),
    mix(la[2], lb[2], t)
  );
  const r = toSrgb(lr);
  const g = toSrgb(lg);
  const bl = toSrgb(lbl);

  const alpha = mix(A[3], B[3], t);
  return alpha >= 1
    ? `rgb(${r}, ${g}, ${bl})`
    : `rgba(${r}, ${g}, ${bl}, ${alpha.toFixed(3)})`;
}

/**
 * A token as a linear-light RGB triple, for shader uniforms and THREE.Color.
 * Three renders in linear space, so handing it these values keeps the canvas
 * matched to the CSS without a second round of gamma guesswork.
 */
export function sceneRgb(token: string, night: boolean): [number, number, number] {
  const src = night ? NIGHT_TOKENS[token] : DAY_TOKENS[token];
  const [r, g, b] = parseColor(src);
  return [toLinear(r), toLinear(g), toLinear(b)];
}
