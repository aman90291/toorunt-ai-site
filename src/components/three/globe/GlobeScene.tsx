"use client";

import { Canvas } from "@react-three/fiber";
import { ParticleGlobe } from "./ParticleGlobe";

/**
 * The globe's canvas.
 *
 * Transparent, not cleared to a colour: the hero paints its own charcoal
 * ground and a cobalt bloom behind this, and an opaque clear would cover
 * them. `alpha: true` plus `gl.setClearAlpha(0)` is what lets the additive
 * particles sit on that gradient instead of on a flat slab.
 *
 * Tone mapping is off here, unlike the wave-grid hero. ACES exists to roll
 * highlights off gracefully, which is right for lit geometry and exactly
 * wrong for an additive point cloud whose entire look is the limb building
 * past 1.0 — the curve would flatten the brightest part of the sphere into
 * the dimmest reading of it.
 *
 * `sim` is the simulation texture's edge; the particle count is its square.
 */
export default function GlobeScene({
  reduced,
  lite = false,
}: {
  reduced: boolean;
  lite?: boolean;
}) {
  // 50,176 / 147,456 particles. Density is the medium: the light comes from
  // overlap, so dropping the count does not make a sparser globe, it makes a
  // dimmer one with holes in it. Raised alongside the smaller point size —
  // halving a particle's width quarters its area, so the count has to climb
  // just to hold the same coverage, and the reference runs ~250,000.
  const sim = lite ? 216 : 352;

  return (
    <Canvas
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      gl={{
        alpha: true,
        antialias: false, // points are round-masked in the shader; MSAA buys nothing
        powerPreference: lite ? "low-power" : "high-performance",
        premultipliedAlpha: false,
      }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
      /* Set on the canvas itself as well as the wrapper. `touch-action` is not
         an inherited property, so the canvas computes `auto` even under a
         `pan-y` ancestor — the ancestor still constrains the gesture, but
         relying on that indirection for "does the page scroll when you swipe
         the globe on a phone" is not worth the ambiguity. */
      style={{ touchAction: "pan-y" }}
      /* z=3.0 puts the unit sphere at ~80% of the frame height. Pulling in
         further fills more of the box but starts clipping the intro cloud
         (which reaches r≈1.6) against the square canvas edge, and a hard
         rectangular cut across a particle field during the assembly is far
         more noticeable than a slightly smaller globe. */
      camera={{ position: [0, 0, 3.0], fov: 45, near: 0.1, far: 100 }}
    >
      <ParticleGlobe sim={sim} reduced={reduced} lite={lite} />
    </Canvas>
  );
}
