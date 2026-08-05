/**
 * GLSL for the FBO particle globe.
 *
 * Port of Pavel Mazhuga's `fbo-particles` experiment
 * (pavelmazhuga.com/lab/fbo-particles — github.com/pavel-mazhuga/portfolio,
 * frontend/src/features/experiments/fbo-particles). A simulation pass renders
 * a fullscreen quad into a float render target, one texel per particle, and
 * the Points material reads that target back in its vertex shader.
 *
 * THE SETTLED STATE IS HIS DEMO, UNCHANGED: `curlNoise(seed * frequency +
 * time * speed)`. That one line is the whole look, and the reason is easy to
 * miss — `curlNoise` ends in `normalize()`, so every particle lands on the
 * UNIT SPHERE, positioned by where the flow field carries it. The globe is
 * not modelled anywhere. It is a side effect of the noise being normalised,
 * and the drifting ribbons and bright convergences across its surface are the
 * curl field itself, advancing with `uTime`.
 *
 * What is added: the ARRIVAL. His demo is a steady-state attractor that
 * churns from the first frame. The brief (logo.misterprada.com) is a
 * scattered cloud that converges into a definite shape and holds — so
 * `uProgress` crossfades each particle from a launch position outside the
 * sphere into its attractor position, staggered per particle.
 *
 * Two details carry how the assembly FEELS:
 *   • Mid-flight turbulence on `sin(p * PI)` — zero at both ends, peak
 *     halfway. Without it a crossfade between two points is a straight line,
 *     and fifty thousand particles on straight lines read as a morph rather
 *     than as flight.
 *   • The stagger keys off the destination's latitude, so the equator arrives
 *     first and the poles last: a ring opening into a sphere, not a fizzle.
 *
 * An earlier revision of this file replaced the attractor at rest with a
 * Fibonacci shell plus a drawn graticule of meridians and parallels. It made
 * a clean, legible wireframe globe — and it was the wrong globe. Keeping the
 * note because the mistake is an easy one to repeat: the reference's appeal
 * is the turbulent dust, and any structure regular enough to read as
 * "correct" destroys it.
 */

/* Ashima simplex noise + curl. Verbatim from the reference implementation. */
const CURL = /* glsl */ `
vec3 mod289_curl(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289_curl(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute_curl(vec4 x) { return mod289_curl(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt_curl(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289_curl(i);
    vec4 p = permute_curl(permute_curl(permute_curl(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt_curl(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 x) {
    float s  = snoise(vec3(x));
    float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
    float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
    return vec3(s, s1, s2);
}

vec3 curlNoise(vec3 p) {
    const float e = .1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    vec3 p_x0 = snoiseVec3(p - dx);
    vec3 p_x1 = snoiseVec3(p + dx);
    vec3 p_y0 = snoiseVec3(p - dy);
    vec3 p_y1 = snoiseVec3(p + dy);
    vec3 p_z0 = snoiseVec3(p - dz);
    vec3 p_z1 = snoiseVec3(p + dz);
    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
    const float divisor = 1.0 / (2.0 * e);
    return normalize(vec3(x, y, z) * divisor);
}
`;

export const SIM_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const SIM_FRAGMENT = /* glsl */ `
uniform sampler2D uSeed;   // xyz = curl-field lookup coordinate, w = 0..1 random
uniform float uTime;
uniform float uProgress;   // 0..1 assembly
uniform float uFrequency;  // reference default 0.2
uniform float uSpeed;      // reference default 0.07
uniform float uPulse;      // 0..1 decaying keystroke energy

varying vec2 vUv;

${CURL}

void main() {
    vec4 s = texture2D(uSeed, vUv);

    // ── the attractor · the reference, unchanged ─────────────────────────
    // curlNoise normalises, so this lands every particle on the unit sphere.
    // Nothing here models a globe; the sphere IS the normalisation, and the
    // drifting structure across it is the flow field advancing with uTime.
    // A keystroke nudges the field's rate, so the surface stirs when someone
    // types — brightness and flow, never shape.
    float speed = uSpeed * (1.0 + uPulse * 0.85);
    vec3 flow = curlNoise(s.xyz * uFrequency + uTime * speed);

    // The attractor alone concentrates particles into its flow structures and
    // leaves large voids in the shell — fine at the reference's 250,000, a
    // half-empty sphere at ours. Blending toward the seed's own (uniform)
    // direction fills the shell while keeping the curl's drifting seams and
    // bright convergences, which are the part worth having. Renormalised, so
    // every particle still lands exactly on the sphere and the silhouette
    // stays a clean circle.
    vec3 even = normalize(s.xyz + 1e-5);
    vec3 sphere = normalize(mix(even, flow, 0.55));

    vec3 pos = sphere;
    float p = 1.0;

    // ── the arrival ──────────────────────────────────────────────────────
    // Uniform branch: costs nothing once the intro is over, which matters
    // because curlNoise is 18 snoise evaluations and it already runs once
    // above for every particle, every frame.
    if (uProgress < 0.999) {
        float stagger = clamp(abs(sphere.y) * 0.72 + s.w * 0.28, 0.0, 1.0);
        p = clamp((uProgress - stagger * 0.55) / 0.45, 0.0, 1.0);
        p = 1.0 - pow(1.0 - p, 3.0);

        vec3 launch = normalize(s.xyz + 1e-5) * (1.35 + s.w * 0.85);
        vec3 turb = snoiseVec3(s.xyz * 2.2 + uTime * 0.35) * sin(p * 3.14159265) * 0.42;
        pos = mix(launch, sphere, p) + turb;
    }

    gl_FragColor = vec4(pos, p);
}
`;

export const POINTS_VERTEX = /* glsl */ `
uniform sampler2D uPositions;
uniform float uSize;

varying float vProgress;
varying float vBig;
varying float vLimb;

void main() {
    // position.xy is this particle's texel in the simulation target.
    vec4 data = texture2D(uPositions, position.xy);
    vProgress = data.w;

    vec4 mvPosition = modelViewMatrix * vec4(data.xyz, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // LIMB BRIGHTENING — the brilliant ring around the reference's sphere.
    //
    // Not a decorative rim light: it is optical depth. The particles form a
    // thin shell, and a line of sight that grazes it tangentially passes
    // through far more of that shell than one aimed at the centre — path
    // length goes as 1/cos(angle from normal), which is why a planet's limb
    // or a soap bubble's edge is the bright part. Additive blending gets some
    // of this for free from the geometry, but at our particle count the free
    // version is too weak to read, so the term is made explicit.
    //
    // On a unit sphere the surface normal IS the position, so this is just
    // how perpendicular the particle's normal is to the view direction.
    vec3 nrm = normalize((modelViewMatrix * vec4(data.xyz, 0.0)).xyz);
    vec3 vdir = normalize(mvPosition.xyz);
    vLimb = pow(1.0 - abs(dot(nrm, vdir)), 2.2);

    // FIXED size — no perspective attenuation, as in the reference. Scaling
    // points by depth is "more correct" and looks worse: it separates the
    // near and far hemispheres into two visibly different grain sizes, and
    // the uniform grain is exactly what makes this read as dust rather than
    // as a 3-D scatter plot.
    //
    // The reference gives a thin slice of columns a larger point; those few
    // heavier grains are what keep the field from looking like flat noise.
    vBig = step(1.0 - (1.0 / 64.0), position.x);
    gl_PointSize = uSize * (vBig + 0.5) * mix(0.65, 1.0, vProgress);
}
`;

export const POINTS_FRAGMENT = /* glsl */ `
uniform vec3  uColor;
uniform vec3  uColorHot;
uniform float uFocus;
uniform float uOpacity;

varying float vProgress;
varying float vBig;
varying float vLimb;

void main() {
    // BRIGHTNESS COMES FROM ACCUMULATION, NOT FROM THE PARTICLE.
    //
    // This is the single thing that separates the reference's look from an
    // ordinary point cloud, and the easiest to get wrong. Each grain emits a
    // very dark blue and blending is additive, so a lone particle is nearly
    // invisible and only DENSITY produces light: the sphere's limb glows
    // because thousands stack along the same line of sight, and the core
    // blows out to white where the flow field piles particles up. Give the
    // particles their own brightness instead and every one of those gradients
    // flattens into uniform grey speckle.
    //
    // Which is also why there is no depth fog, no per-particle alpha ramp and
    // no colour-by-position here. Every one of them fights the accumulation.
    vec2 uv = gl_PointCoord - 0.5;
    float d2 = dot(uv, uv);
    if (d2 > 0.25) discard;

    // Soft radial falloff rather than a hard disc — at 2–3 device pixels the
    // difference is small, but it is the difference between dust and gravel.
    float fall = 1.0 - d2 * 4.0;
    fall *= fall;

    vec3 col = mix(uColor, uColorHot, vBig);

    // The limb term multiplies rather than adds, so the interior keeps its
    // full accumulated structure and only the grazing edge gains — the ring
    // is the shell being seen through, not a glow drawn on top of it.
    float limb = 0.55 + vLimb * 2.1;

    gl_FragColor = vec4(
        col * fall * limb * uOpacity * mix(0.3, 1.0, vProgress) * (1.0 + uFocus * 0.3),
        1.0
    );

    #include <colorspace_fragment>
}
`;
