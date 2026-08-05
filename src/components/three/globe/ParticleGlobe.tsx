"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { globeSignal } from "@/lib/globe-signal";
import { GLOBE_COLORS } from "@/lib/scene";
import { generateLookup, generateSeeds } from "./positions";
import { POINTS_FRAGMENT, POINTS_VERTEX, SIM_FRAGMENT, SIM_VERTEX } from "./shaders";

/**
 * The FBO particle globe.
 *
 * Two passes per frame. The SIMULATION pass draws one fullscreen quad into a
 * float render target sized `sim × sim`, so one texel holds one particle's
 * position; the DRAW pass renders `sim²` points whose vertex shader looks its
 * own position up out of that target. Nothing about the particles touches the
 * CPU after setup — which is the whole point of the technique, and why fifty
 * thousand of them cost one draw call.
 *
 * Ordering inside React Three Fiber: R3F runs every `useFrame` subscriber in
 * priority order and only then renders the main scene, so doing the offscreen
 * pass in an ordinary priority-0 callback puts it ahead of the draw without
 * having to take over the render loop.
 *
 * See `shaders.ts` for what the simulation computes and whose work it is.
 */

const AXIAL_TILT = 0.34;

type Props = {
  /** Simulation texture edge; particle count is the square of it. */
  sim: number;
  reduced: boolean;
  lite: boolean;
};

export function ParticleGlobe({ sim, reduced, lite }: Props) {
  const { gl } = useThree();
  const group = useRef<THREE.Group>(null);
  const started = useRef(0);

  /* ── static GPU resources ─────────────────────────────────────────────
     Built once per `sim`. Float render targets need EXT_color_buffer_float,
     which is not universal even on WebGL2; half-float is, and since the
     simulation is stateless — every frame recomputes from the seed texture
     rather than feeding back on itself — reduced precision cannot accumulate
     into drift. A safe downgrade, not a compromise. */
  const rig = useMemo(() => {
    const ctx = gl.getContext();
    const canFloat =
      typeof WebGL2RenderingContext !== "undefined" &&
      ctx instanceof WebGL2RenderingContext &&
      !!ctx.getExtension("EXT_color_buffer_float");

    const target = new THREE.WebGLRenderTarget(sim, sim, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: canFloat ? THREE.FloatType : THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    });

    const seedTex = new THREE.DataTexture(
      generateSeeds(sim), sim, sim, THREE.RGBAFormat, THREE.FloatType,
    );
    seedTex.needsUpdate = true;

    const simUniforms: Record<string, THREE.IUniform> = {
      uSeed: { value: seedTex },
      uTime: { value: 0 },
      uProgress: { value: reduced ? 1 : 0 },
      uFrequency: { value: 0.2 }, // the reference's defaults for the attractor
      uSpeed: { value: 0.07 },
      uPulse: { value: 0 },
    };

    const simMaterial = new THREE.ShaderMaterial({
      uniforms: simUniforms,
      vertexShader: SIM_VERTEX,
      fragmentShader: SIM_FRAGMENT,
      depthTest: false,
      depthWrite: false,
    });

    const simScene = new THREE.Scene();
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    simCamera.position.z = 1;
    const simQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial);
    simScene.add(simQuad);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(generateLookup(sim), 3));
    // `position` here is a texel address, not a coordinate — three would cull
    // the whole cloud against a bounding box computed from lookup UVs.
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3);

    const drawUniforms: Record<string, THREE.IUniform> = {
      uPositions: { value: target.texture },
      // Device pixels, fixed (see POINTS_VERTEX). Lite runs larger grains
      // because it runs roughly a third of the particles and has to reach a
      // comparable coverage with them.
      // 1.5 device px. The reference's grain is DUST — individual particles
      // below the threshold where you can pick one out — and the previous
      // 2.55 read as a scatter of visible dots instead. Smaller points also
      // sharpen the limb: the silhouette is where the shell goes edge-on and
      // thousands stack along one line of sight, and a fine grain resolves
      // that edge where a coarse one blurs it.
      uSize: { value: lite ? 2.1 : 1.5 },
      uFocus: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color(GLOBE_COLORS.base) },
      uColorHot: { value: new THREE.Color(GLOBE_COLORS.hot) },
    };

    const drawMaterial = new THREE.ShaderMaterial({
      uniforms: drawUniforms,
      vertexShader: POINTS_VERTEX,
      fragmentShader: POINTS_FRAGMENT,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, drawMaterial);
    points.frustumCulled = false;

    const dispose = () => {
      target.dispose();
      seedTex.dispose();
      simQuad.geometry.dispose();
      simMaterial.dispose();
      geometry.dispose();
      drawMaterial.dispose();
    };

    return { target, simScene, simCamera, simUniforms, drawUniforms, points, dispose };
    // `reduced`/`lite` only seed initial values; they do not change at runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, sim]);

  useEffect(() => () => rig.dispose(), [rig]);

  /* ── drag to rotate ───────────────────────────────────────────────────
     The reference hangs OrbitControls off its canvas and you spin the thing
     with the mouse; that direct manipulation is a large part of why it reads
     as an object rather than as a video. This is the same interaction without
     the library — and without OrbitControls' two habits that are wrong on a
     marketing page: it captures the scroll wheel (so the page stops
     scrolling when the cursor is over the canvas) and it lets you dolly the
     camera into the middle of the particle field.

     Velocity is retained and damped after release, so a flick keeps spinning
     and eases back into the idle drift instead of stopping dead. `mul`
     converts a pixel drag into radians against the canvas width, so the
     globe turns the same amount per pixel at every size.

     TOUCH — the mount sets `touch-action: pan-y`, so a vertical swipe still
     scrolls the page and only horizontal drags rotate. Capturing both would
     make the globe a scroll trap on a phone, which is the single most
     hostile thing a decorative canvas can do. */
  const drag = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    velX: 0,
    velY: 0,
    rotX: AXIAL_TILT,
    rotY: 0,
  });

  useEffect(() => {
    if (reduced) return;
    const el = gl.domElement;
    const d = drag.current;

    const down = (e: PointerEvent) => {
      d.active = true;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      d.velX = 0;
      d.velY = 0;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!d.active) return;
      const mul = (Math.PI * 1.6) / Math.max(el.clientWidth, 1);
      d.velY = (e.clientX - d.lastX) * mul;
      d.velX = (e.clientY - d.lastY) * mul;
      d.rotY += d.velY;
      d.rotX += d.velX;
      // Clamp the tilt short of the poles — past ±80° the sphere reads as
      // flipping over, and there is nothing at a pole worth seeing.
      d.rotX = Math.max(-1.4, Math.min(1.4, d.rotX));
      d.lastX = e.clientX;
      d.lastY = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (!d.active) return;
      d.active = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      el.style.cursor = "grab";
    };

    el.style.cursor = "grab";
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl, reduced]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const { simUniforms, drawUniforms } = rig;
    const signal = globeSignal.read();
    // delta is unclamped after a tab switch; a 4-second step would fling the
    // easings past their targets in one frame.
    const dt = Math.min(delta, 1 / 20);

    if (!started.current) started.current = t;
    const since = t - started.current;

    // ── assembly ───────────────────────────────────────────────────────
    // Held for a beat first, so the scattered cloud registers as a state the
    // globe emerged FROM rather than as a stutter on the way in.
    const HOLD = 0.35;
    const RUN = 2.45;
    simUniforms.uProgress.value = reduced
      ? 1
      : Math.min(Math.max((since - HOLD) / RUN, 0), 1);
    simUniforms.uTime.value = t;

    // The cloud fades up rather than popping in with the first frame.
    drawUniforms.uOpacity.value = reduced ? 1 : Math.min(since / 0.55, 1);

    // ── question-field reactivity ──────────────────────────────────────
    // Brightness and flow rate only. Nothing here touches the silhouette:
    // deforming the sphere while someone reads an answer over it is noise,
    // and a shape built from normalised noise has no good way to deform.
    globeSignal.decay(dt);
    const focus = drawUniforms.uFocus.value as number;
    drawUniforms.uFocus.value = focus + (signal.focus - focus) * dt * 5;
    simUniforms.uPulse.value = signal.pulse;

    // ── the offscreen pass, then let R3F draw ──────────────────────────
    gl.setRenderTarget(rig.target);
    gl.render(rig.simScene, rig.simCamera);
    gl.setRenderTarget(null);

    if (group.current && !reduced) {
      const d = drag.current;
      if (!d.active) {
        // Inertia, then the idle drift resumes underneath it. Both are
        // additive, so a flick decays INTO the ambient spin rather than
        // fighting it to a stop and restarting.
        d.velY *= 0.94;
        d.velX *= 0.94;
        if (Math.abs(d.velY) < 1e-4) d.velY = 0;
        if (Math.abs(d.velX) < 1e-4) d.velX = 0;
        d.rotY += d.velY + dt * 0.075 * simUniforms.uProgress.value;
        d.rotX = Math.max(-1.4, Math.min(1.4, d.rotX + d.velX));
      }
      group.current.rotation.x = d.rotX;
      group.current.rotation.y = d.rotY;
    }
  });

  return (
    <group ref={group} rotation={[AXIAL_TILT, 0, 0]}>
      <primitive object={rig.points} />
    </group>
  );
}
