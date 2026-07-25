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
  "--color-ground": "#1f1f1f",   /* hero ground — matches .on-dark charcoal */
  "--color-ground-2": "#131927", /* cube rest colour — one step off the ground */
  "--color-accent": "#233281",   /* cobalt — wave peaks on charcoal */
};

/** A token as its raw hex string, for THREE.Color (which converts sRGB itself). */
export function sceneHex(token: string): string {
  return TOKENS[token] ?? "#000000";
}

/** WebGL clear colour, derived rather than re-typed. */
export const SCENE = { bg: TOKENS["--color-ground"] };
