/**
 * Palette for the hero canvas.
 *
 * Replaces lib/daynight.ts, which mirrored the whole page palette back when one
 * fullscreen canvas sat behind every section. The canvas is now scoped to the
 * hero, and the hero is a dark bookend on an otherwise white page — so these are
 * the `.on-dark` values from globals.css rather than reading CSS from inside
 * the render loop.
 *
 * Kept in sync by hand with the `.on-dark` block; there are only three.
 */
const TOKENS: Record<string, string> = {
  "--color-ground": "#060c17",   /* hero ground — matches the deep cobalt bookend */
  "--color-ground-2": "#0c1423",
  "--color-accent": "#233281",
};

/** A token as its raw hex string, for THREE.Color (which converts sRGB itself). */
export function sceneHex(token: string): string {
  return TOKENS[token] ?? "#000000";
}

/** WebGL clear colour, derived rather than re-typed. */
export const SCENE = { bg: TOKENS["--color-ground"] };

/**
 * The particle globe's two emission colours.
 *
 * These values change emission colour only. Particle count, size, simulation,
 * assembly and interaction remain untouched. The saturated electric cobalt is
 * sampled from the supplied globe reference, while the cool-white hot colour
 * lets dense convergence points bloom without turning the field uniformly
 * bright under additive blending.
 */
export const GLOBE_COLORS = {
  /** The ordinary grain — the vast majority of the field. */
  base: "#3f91f4",
  /** The heavier grain on ~1.6% of particles; near-white, so the scattered
   *  larger points read as highlights inside the dust and the densest
   *  convergences blow out to white rather than to pale blue. */
  hot: "#d9f3ff",
};
