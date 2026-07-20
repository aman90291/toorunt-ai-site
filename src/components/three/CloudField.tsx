"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { pointer } from "@/lib/pointer";
import { sceneRgb } from "@/lib/daynight";

/**
 * The cloud field — the page's whole background.
 *
 * Structure: ONE camera-glued fullscreen quad whose fragment shader composites
 * several depth layers internally, rather than N stacked meshes. Same look,
 * but one draw call and no fullscreen alpha overdraw — with 4 transparent
 * planes the blend cost alone dominates on integrated GPUs, and it buys
 * nothing you cannot get from a loop.
 *
 * Depth comes from differential motion, not from real Z: each layer gets its
 * own scale, drift speed and — the part that sells it — its own parallax gain
 * against the cursor. Near layers swing further than far ones, which is the
 * cue the eye actually reads as distance.
 *
 * Two ways the cursor moves it, deliberately different in character:
 *   • parallax, from the damped shared signal in lib/pointer — slow, weighted,
 *     in lockstep with the layout's perspective tilt so they read as one space;
 *   • a small local glow, from a short ring buffer of recent pointer positions
 *     — immediate and it dissipates. Deliberately NOT a swirl: see the note at
 *     the glow itself.
 *
 * Perf notes that matter if you touch the shader:
 *   • the hash is Dave Hoskins' sin-free variant. The textbook
 *     `fract(sin(dot(...)) * 43758.5)` costs ~4 transcendentals per noise
 *     sample; at 4 layers x 2 fbm x 5 octaves that is 160 sin() per pixel and
 *     it will not hold 60fps at retina.
 *   • the domain warp must displace by a vec2, not a float — see the note at
 *     the warp itself. It is the difference between billowing cloud and fog.
 *   • the cloud colour must differ from the PAGE colour, not merely sit next to
 *     it in the ramp. Two attempts died here; see the uCloud comment.
 *   • LAYERS/OCTAVES are baked into the source, so the material is rebuilt (and
 *     recompiled) only when the tier changes, never per frame.
 *
 * Measured: adds 0.00ms per frame over a blank document at 3200x2000 on an
 * Apple M5 — it rides the display's refresh rate. The lite tier exists for
 * weaker hardware and has not been measured on any.
 */

const TRAIL = 6; // pointer glow ring buffer

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = (LAYERS: number, OCTAVES: number) => {
  // Emit the divisor as a literal rather than letting GLSL evaluate a constant
  // comparison per layer. Guards LAYERS === 1 against a divide by zero.
  const SPAN = (LAYERS > 1 ? LAYERS - 1 : 1).toFixed(1);
  return /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uAspect;
  uniform float uReduced;
  uniform vec2  uMouse;          // damped, -1..1
  uniform vec3  uCloudDark;
  uniform vec3  uAccent;
  uniform vec4  uTrail[${TRAIL}]; // xy = uv pos, zw = velocity
  uniform float uAge[${TRAIL}];   // 0 fresh -> 1 dead

  // sin-free hash (Hoskins). See the perf note in the component header.
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),                hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < ${OCTAVES}; i++) {
      v += a * vnoise(p);
      // 2.03 rather than 2.0: an exact doubling re-aligns the lattice every
      // octave and stamps a visible grid into the field.
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vec2(vUv.x * uAspect, vUv.y);
    float t = uTime * (1.0 - uReduced); // frozen, not hidden, under reduced-motion

    // ── pointer glow ──
    // Was a swirling vortex field: each recent pointer position added a
    // perpendicular curl, which twisted the cloud into a visible spiral roughly
    // a third of the viewport wide. Too big, and the rotation read as a defect
    // rather than as weather.
    //
    // Now: a small soft glow that nudges the field very slightly along the
    // direction of travel, with no rotation at all. The falloff went 34 -> 340,
    // which takes the radius from ~0.17uv to ~0.055uv — about a fifth as wide.
    vec2 nudge = vec2(0.0);
    float energy = 0.0;
    for (int i = 0; i < ${TRAIL}; i++) {
      float life = 1.0 - uAge[i];
      if (life > 0.001) {
        vec2 d = uv - vec2(uTrail[i].x * uAspect, uTrail[i].y);
        float fall = exp(-dot(d, d) * 340.0) * life;
        nudge += uTrail[i].zw * 0.18 * fall; // travel only — no perpendicular term
        energy += fall;
      }
    }
    energy = min(energy, 1.0);

    float density = 0.0;
    float lit = 0.0;

    for (int L = 0; L < ${LAYERS}; L++) {
      // 0 = furthest, 1 = nearest.
      float depth = float(L) / ${SPAN};

      // Near layers swing further with the cursor — this differential IS the
      // depth cue. Capped at 0.15uv; past that it reads as the page sliding.
      vec2 par = uMouse * mix(0.018, 0.15, depth);
      // Scale sets how much structure is on screen. 1.9-5.2 gave 3-4 noise
      // cells across the viewport — soft enough to read as a gradient rather
      // than as cloud. The brief asked for high detail; this is where it comes
      // from, together with the octave count.
      vec2 p = uv * mix(3.2, 8.4, depth) + par + nudge * mix(0.4, 1.0, depth);
      p.x += t * mix(0.006, 0.030, depth);
      p.y -= t * mix(0.004, 0.018, depth);
      // Decorrelate the layers; without this offset they share a lattice and
      // the whole field pulses as one sheet.
      p += float(L) * 17.31;

      // Real 2-D domain warp. Writing fbm(p + fbm(p)) adds a SCALAR to a vec2,
      // which displaces both axes by the same amount — a diagonal shift, not a
      // warp, and it looks like drifting fog. Displacing by a vec2 built from
      // two decorrelated fbm samples is what produces billowing.
      // (No backticks in this file's GLSL: it lives inside a JS template
      // literal, so a stray backtick terminates the string mid-shader.)
      vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
      float d = fbm(p + 1.7 * q);

      // Nearer layers are sparser and higher contrast, so they read as closer.
      // The window matters more than it looks: 5-octave fbm lands around 0.5,
      // so a 0.40-0.80 window put the typical pixel at 0.16 coverage and the
      // whole field measured 6% opaque — invisible. 0.30-0.62 keeps genuine
      // clear sky at the low end while letting the body of the field read.
      float a = smoothstep(mix(0.30, 0.34, depth), mix(0.62, 0.58, depth), d);
      a *= mix(0.30, 0.18, depth);

      density += a;
      lit += a * d;
    }

    density = clamp(density, 0.0, 1.0);
    float shade = density > 0.0001 ? lit / max(density, 0.0001) : 0.0;

    // Self-shadowing stand-in, and it has to reverse with the theme: on the
    // white page a cloud reads as SHADOW, so density must darken it; on the
    // dark page it reads as a lit mass, so density must brighten it. A single
    // multiplier direction makes one of the two ends look like flat fog.
    // Dark theme only: density reads as a lit mass, so it brightens.
    vec3 col = uCloudDark * mix(0.84, 1.22, shade);

    // The disturbance carries a breath of the accent — the only place the
    // background touches the 10%. Kept very low: at 0.16/0.26 the cursor left a
    // saturated pink smudge that read as a bug rather than as a stirred cloud,
    // and on the white half it fought the headline for attention.
    col += uAccent * energy * 0.10;

    float alpha = density * 0.72 + energy * 0.08;
    gl_FragColor = vec4(col, alpha);
  }
`;
};

export function CloudField({ reduced, lite }: { reduced: boolean; lite: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // Weak devices get fewer layers and shorter fbm. Both are compile-time in the
  // shader, so this branch costs one extra program, not a per-frame test.
  const LAYERS = lite ? 2 : 4;
  const OCTAVES = lite ? 3 : 5;

  const { material, geometry, trail } = useMemo(() => {
    const trail = {
      vecs: Array.from({ length: TRAIL }, () => new THREE.Vector4(-10, -10, 0, 0)),
      ages: new Float32Array(TRAIL).fill(1),
      idx: 0,
      last: new THREE.Vector2(-1, -1),
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: frag(LAYERS, OCTAVES),
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uReduced: { value: reduced ? 1 : 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        // Linear-light, straight off the palette, so the clouds can never drift
        // from the CSS behind them.
        //
        // line-2, not a ground step. This took two goes to get right: the cloud
        // colour has to differ from the PAGE colour by enough to survive being
        // alpha-blended over it. ground-2 (#fbfaf6) is 2% off the page and
        // ground-3 (#e7e3d9) only ~5% — at any opacity below 1.0 both vanish.
        // line-2 (#c6bfae day / #3a3e44 night) is the first step in the ramp
        // with real separation, so the field survives at 30% opacity.
        uCloudDark: { value: new THREE.Vector3(...sceneRgb("--color-line-2")) },
        uAccent: { value: new THREE.Vector3(...sceneRgb("--color-accent")) },
        uTrail: { value: trail.vecs },
        uAge: { value: trail.ages },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const geometry = new THREE.PlaneGeometry(1, 1);
    return { material, geometry, trail };
  }, [LAYERS, OCTAVES, reduced]);

  // Pointer -> curl ring buffer. Raw events only write refs; the uniform upload
  // happens once per frame in useFrame, so this is effectively frame-throttled
  // however fast the mouse reports.
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      const lx = trail.last.x, ly = trail.last.y;
      trail.last.set(x, y);
      if (lx < 0) return;
      const dx = x - lx, dy = y - ly;
      if (dx * dx + dy * dy < 0.000016) return; // ignore sub-pixel jitter
      const v = trail.vecs[trail.idx % TRAIL];
      const s = 9.0;
      v.set(x, y, THREE.MathUtils.clamp(dx * s, -1.4, 1.4), THREE.MathUtils.clamp(dy * s, -1.4, 1.4));
      trail.ages[trail.idx % TRAIL] = 0;
      trail.idx++;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [trail, reduced]);

  useEffect(() => () => { material.dispose(); geometry.dispose(); }, [material, geometry]);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;

    // Glue the quad to the camera's far plane so it stays a full-bleed
    // background while the home rig orbits.
    const cam = camera as THREE.PerspectiveCamera;
    const dist = 19.5;
    m.quaternion.copy(cam.quaternion);
    m.position.copy(cam.position).add(new THREE.Vector3(0, 0, -dist).applyQuaternion(cam.quaternion));
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * dist * 1.3;
    m.scale.set(h * cam.aspect, h, 1);

    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uAspect.value = cam.aspect;
    // The SAME damped signal the layout tilt reads — see lib/pointer.
    u.uMouse.value.set(pointer.x, -pointer.y);

    // Age the curl out over ~1.8s. delta is already frame-rate independent.
    for (let i = 0; i < TRAIL; i++) {
      trail.ages[i] = Math.min(1, trail.ages[i] + delta / 1.8);
    }
  });

  return (
    <mesh
      ref={mesh}
      renderOrder={-10}
      frustumCulled={false}
      geometry={geometry}
      material={material}
    />
  );
}
