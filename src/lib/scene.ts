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
 * DELIBERATELY VERY DARK — these are not "the colour of the globe", they are
 * what ONE grain of dust contributes, and the globe's actual colour is what
 * hundreds of them sum to under additive blending. The reference ships
 * `#1c2631`, near-black, for exactly this reason: a lone particle is almost
 * invisible, the limb glows because thousands overlap along the line of
 * sight, and the core blows out to white where the flow field piles them up.
 *
 * These are that idea moved onto the site's sage/eucalyptus light rather than
 * the reference's slate, and lifted slightly because our sphere is ~300px in the
 * hero, not full-screen, so it accumulates fewer particles per pixel than the
 * original does.
 *
 * Raising these to a "nice blue" is the obvious change and it destroys the
 * effect: every particle becomes individually visible, the density gradient
 * flattens, and the globe turns into uniform speckle. If it looks too dim in
 * isolation, that is correct — check it composited, not as a swatch.
 */
export const GLOBE_COLORS = {
  /** The ordinary grain — the vast majority of the field. */
  base: "#7fadde",
  /** The heavier grain on ~1.6% of particles; near-white, so the scattered
   *  larger points read as highlights inside the dust and the densest
   *  convergences blow out to white rather than to pale blue. */
  hot: "#eaf3ff",
};
