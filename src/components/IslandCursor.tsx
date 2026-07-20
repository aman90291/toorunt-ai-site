"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { pointer } from "@/lib/pointer";

/**
 * The cursor — a small liquid blob that morphs into a glass pill over anything
 * clickable, in the spirit of Apple's Dynamic Island.
 *
 * Three layers, each owning a disjoint set of animated properties. That
 * separation is the whole design: if one element owned transform AND width AND
 * border-radius, the follow tween and the morph tween would fight over the same
 * matrix every frame.
 *
 *   root   — owns transform only (x, y, rotation, scaleX/scaleY). Never
 *            interrupted; runs for the page lifetime via gsap.quickTo.
 *   shape  — owns width, height, border-radius and the glass material.
 *            Retargeted on state change only.
 *   blob   — owns the idle wobble, on its own element so its border-radius
 *            animation can never collide with the shape's.
 *
 * Why the morph is not a scale
 * ----------------------------
 * The Dynamic Island read comes from the expansion being NON-uniform: width
 * grows far more than height, and the corner travels from a true circle to a
 * fixed pixel radius. `transform: scale()` cannot express that — it would
 * stretch the label and keep the corners circular. So width/height/radius are
 * animated for real, which is why they live on their own layer.
 *
 * Glass over both themes
 * ----------------------
 * The page crosses from warm white to near-black, so a fixed glass tint fails
 * at one end. The material is built from the themed tokens plus
 * `mix-blend-mode: difference` on the inner dot, which self-inverts against
 * whatever is underneath — the one treatment that needs no theme branch.
 */

type State = "idle" | "hot" | "text";

const SIZES: Record<State, { w: number; h: number; r: number }> = {
  idle: { w: 14, h: 14, r: 7 },
  // Deliberately NOT square. 14->76 on both axes with the radius tracking half
  // the width is just a circle growing into a bigger circle — indistinguishable
  // from transform: scale(). The Island read comes from the axes moving by
  // different factors (width x6.3, height x4.1) while the corner leaves a true
  // circle for a fixed pixel radius. That is exactly what a scale cannot do,
  // and the reason width/height/radius are animated for real.
  hot: { w: 88, h: 58, r: 26 },
  text: { w: 3, h: 26, r: 2 },
};

export function IslandCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const shape = shapeRef.current;
    const blob = blobRef.current;
    const label = labelRef.current;
    if (!root || !shape || !blob || !label) return;

    // No cursor to replace on touch, and nothing should chase the pointer under
    // reduced-motion. In both cases the native cursor stays and this unmounts.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    document.documentElement.classList.add("has-island-cursor");

    // Centre the shape on the hotspot via the transform matrix, so it survives
    // the scale tween on press and stays centred at every morph size.
    gsap.set(shape, { xPercent: -50, yPercent: -50 });
    // Start off-screen: without this the cursor sits at 0,0 until first move.
    gsap.set(root, { x: -100, y: -100 });

    // quickTo redirects a running tween instead of spawning a new one, and skips
    // unit parsing and plugin resolution — the only form safe to call per frame.
    const xTo = gsap.quickTo(root, "x", { duration: 0.24, ease: "power3" });
    const yTo = gsap.quickTo(root, "y", { duration: 0.24, ease: "power3" });
    const rotTo = gsap.quickTo(root, "rotation", { duration: 0.3, ease: "power3" });
    const sxTo = gsap.quickTo(root, "scaleX", { duration: 0.3, ease: "power3" });
    const syTo = gsap.quickTo(root, "scaleY", { duration: 0.3, ease: "power3" });

    // Idle wobble lives on the inner blob so it never collides with the
    // shape-level border-radius tween.
    const wobble = gsap
      .timeline({ repeat: -1, yoyo: true })
      .to(blob, {
        borderRadius: "58% 42% 38% 62% / 42% 58% 52% 48%",
        duration: 3.2,
        ease: "sine.inOut",
      });
    const spin = gsap.to(blob, { rotation: 360, duration: 14, ease: "none", repeat: -1 });

    let state: State = "idle";
    const setState = (next: State, text = "") => {
      if (next === state) return;
      state = next;
      const s = SIZES[next];

      if (next === "idle") wobble.play();
      else wobble.pause();

      gsap.to(shape, {
        width: s.w,
        height: s.h,
        borderRadius: s.r,
        // Underdamped, with visible overshoot — the spring is what sells the
        // morph as physical rather than as a resize.
        duration: 0.55,
        ease: next === "idle" ? "power3.out" : "elastic.out(0.85, 0.62)",
        overwrite: "auto",
      });
      gsap.to(blob, { opacity: next === "idle" ? 1 : 0, duration: 0.18, overwrite: "auto" });

      label.textContent = text;
      // Asymmetric on purpose: the label leaves fast and arrives late, so the
      // shape reads as expanding to make room for it rather than cross-fading.
      gsap.to(label, {
        opacity: text ? 1 : 0,
        duration: text ? 0.26 : 0.1,
        delay: text ? 0.14 : 0,
        overwrite: "auto",
      });
    };

    const tick = () => {
      xTo(pointer.px);
      yTo(pointer.py);
      // Velocity-driven squash and stretch, aligned to the direction of travel.
      // This is the difference between "liquid" and "a div that moves".
      const sp = Math.hypot(pointer.vx, pointer.vy) * 60;
      if (state === "idle") {
        const stretch = Math.min(sp * 0.9, 0.42);
        rotTo((Math.atan2(pointer.vy, pointer.vx) * 180) / Math.PI);
        sxTo(1 + stretch);
        syTo(1 - stretch * 0.6);
      } else {
        rotTo(0);
        sxTo(1);
        syTo(1);
      }
    };
    gsap.ticker.add(tick);

    // Event delegation, so nothing has to register itself and content added
    // later still works.
    const HOT = 'a,button,[role="button"],summary,label,select,[data-cursor]';
    const TEXT = "p,h1,h2,h3,h4,li,blockquote,code,pre,input,textarea";

    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest) return;
      const hot = t.closest<HTMLElement>(HOT);
      if (hot) {
        setState("hot", hot.dataset.cursor || "");
        return;
      }
      setState(t.closest(TEXT) ? "text" : "idle");
    };
    const onDown = () => gsap.to(shape, { scale: 0.86, duration: 0.14, overwrite: "auto" });
    const onUp = () => gsap.to(shape, { scale: 1, duration: 0.3, ease: "back.out(2)", overwrite: "auto" });
    // Leaving the window should hide it, or it sits frozen at the last position.
    const onLeave = () => gsap.to(root, { opacity: 0, duration: 0.2, overwrite: "auto" });
    const onEnter = () => gsap.to(root, { opacity: 1, duration: 0.2, overwrite: "auto" });

    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      document.documentElement.classList.remove("has-island-cursor");
      gsap.ticker.remove(tick);
      wobble.kill();
      spin.kill();
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div ref={rootRef} className="island-cursor" aria-hidden="true">
      <div ref={shapeRef} className="island-cursor__shape">
        <span ref={blobRef} className="island-cursor__blob" />
        <span ref={labelRef} className="island-cursor__label" />
      </div>
    </div>
  );
}
