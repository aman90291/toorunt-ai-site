/**
 * CPU-side data for the particle globe.
 *
 * There is almost nothing here, and that is the point. The globe's shape is
 * not authored on the CPU at all — the simulation shader's `curlNoise` ends
 * in `normalize()`, so the sphere falls out of the maths (see shaders.ts).
 * All this file provides is, per particle, a coordinate to sample the flow
 * field at and a random number.
 *
 * An earlier revision generated Fibonacci-sphere targets plus a graticule of
 * meridians and parallels here, ~90 lines of it. All of it is gone: it
 * produced a tidy wireframe globe instead of the reference's turbulent dust.
 */

/**
 * Deterministic PRNG (mulberry32). The globe must look identical on every
 * load — `Math.random()` here would mean the intro assembled differently on
 * each refresh, which reads as a glitch rather than as a signature.
 */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Per-particle flow-field lookup coordinates: `xyz` a point in a ball,
 * `w` a plain 0..1 random used for the assembly stagger and launch radius.
 *
 * These are sampled UNIFORMLY on the sphere (see the note in the loop). The
 * reference's own generator clumps toward the poles, which is invisible at
 * its 250,000 particles and leaves visible bald patches at ours.
 */
export function generateSeeds(size: number): Float32Array {
  const count = size * size;
  const data = new Float32Array(count * 4);
  const rand = rng(0x5eed_1);

  for (let i = 0; i < count; i++) {
    const s = i * 4;

    // UNIFORM on the sphere: z picked flat in [-1,1] and the ring radius
    // taken as sqrt(1-z²) — Archimedes' theorem. The reference instead feeds
    // `randFloatSpread(360)` (degrees) into sin/cos and gets a distribution
    // that clumps toward the poles, which at its 250,000 particles is
    // invisible and at ours leaves bald patches in the shell.
    const z = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(Math.max(1 - z * z, 0));
    // Radius still varies, because these coordinates are also the lookup into
    // the curl field — a pure unit shell would sample one surface of the
    // noise and lose all of its internal structure.
    const dist = 0.35 + Math.sqrt(rand()) * 1.65;

    data[s] = r * Math.cos(a) * dist;
    data[s + 1] = r * Math.sin(a) * dist;
    data[s + 2] = z * dist;
    data[s + 3] = rand();
  }

  return data;
}

/**
 * The Points geometry's `position` attribute — a texel address, not a
 * coordinate. `xy` locates the particle in the simulation target; `z` is
 * unused but kept so the attribute stays a vec3, which is what three's
 * default geometry plumbing expects.
 *
 * Note that the draw shader keys its larger grains off `position.x`, exactly
 * as the reference does — that is why the "big" particles form thin vertical
 * bands in texel space rather than being randomly scattered.
 */
export function generateLookup(size: number): Float32Array {
  const count = size * size;
  const data = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const s = i * 3;
    // +0.5 samples texel centres — without it NearestFilter lands on the
    // boundary between two texels and the mapping is off by one at the edges.
    data[s] = ((i % size) + 0.5) / size;
    data[s + 1] = (Math.floor(i / size) + 0.5) / size;
    data[s + 2] = 0;
  }

  return data;
}
