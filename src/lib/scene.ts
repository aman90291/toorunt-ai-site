/**
 * Palette for the hero canvas.
 *
 * Replaces lib/daynight.ts, which mirrored the whole page palette back when one
 * fullscreen canvas sat behind every section. The canvas is now scoped to the
 * hero, and the hero is a dark bookend on an otherwise white page — so these are
 * the `.on-dark` values from globals.css, not the page ones. Mirroring
 * `--color-ground` here again would paint the hero white.
 *
 * Kept in sync by hand with the `.on-dark` block; there are only three.
 */
const TOKENS: Record<string, string> = {
  "--color-ground": "#101418",  /* hero ground — matches .on-dark */
  "--color-line-2": "#3c454f",  /* cloud body */
  "--color-accent": "#ccff66",  /* brand lime — reads at 15.9:1 on this ground */
};

/** WebGL clear colour, derived rather than re-typed. */
export const SCENE = { bg: TOKENS["--color-ground"] };

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
  const hex = (TOKENS[token] ?? "#000000").slice(1);
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex;
  return [
    toLinear(parseInt(full.slice(0, 2), 16)),
    toLinear(parseInt(full.slice(2, 4), 16)),
    toLinear(parseInt(full.slice(4, 6), 16)),
  ];
}
