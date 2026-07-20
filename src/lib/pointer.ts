/**
 * The one pointer signal, shared by everything that reacts to the cursor.
 *
 * The clouds parallax, the layout's perspective tilt and the cursor itself all
 * read from here. That is the point: three effects lerping their own copy of
 * the mouse at three slightly different rates is what makes a page feel like a
 * pile of plugins instead of one space. One damped value, read by all of them,
 * and they move as a single system.
 *
 * A module singleton rather than context, because it has to cross the R3F
 * reconciler boundary into useFrame — the same reason lib/theme.ts is one.
 *
 * Updated on gsap.ticker (which R3F, Lenis and ScrollTrigger already share) so
 * this adds no new rAF loop. pointermove only writes raw target values; the
 * damping and every read happen once per frame.
 */

import { gsap } from "gsap";

export const pointer = {
  /** Raw target, viewport centre = 0, edges = ±1. */
  tx: 0,
  ty: 0,
  /** Damped follow — THE shared signal. Same range as the target. */
  x: 0,
  y: 0,
  /** Per-frame delta of the damped value, for squash/stretch and cloud swirl. */
  vx: 0,
  vy: 0,
  /** Magnitude of the raw movement in normalised units/frame. */
  speed: 0,
  /** Client pixels, for anything that needs to position against the viewport. */
  px: 0,
  py: 0,
  /** False until a fine pointer actually moves — stays false on touch-only,
   *  so effects can idle at centre instead of snapping to a phantom corner. */
  active: false,
};

/**
 * Lerp factor per frame at 60fps. 0.075 settles in roughly 200ms — fast enough
 * to feel attached to the hand, slow enough that the trailing layers read as
 * depth rather than lag. Frame-rate corrected below so a 120Hz display does not
 * damp twice as fast.
 */
const DAMP = 0.075;

let started = false;
let stop: (() => void) | null = null;

/** Idempotent — safe to call from several components; only the first wins. */
export function startPointer(): () => void {
  if (started) return () => {};
  started = true;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const onMove = (e: PointerEvent) => {
    // Coarse pointers (touch) would slam the signal to wherever a tap landed
    // and leave it there, so the whole layout sits permanently skewed.
    if (e.pointerType !== "mouse" && !fine) return;
    pointer.px = e.clientX;
    pointer.py = e.clientY;
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    pointer.active = true;
  };

  // Returning to centre when the cursor leaves avoids the layout being frozen
  // mid-tilt while the pointer sits in another window.
  const onLeave = () => {
    pointer.tx = 0;
    pointer.ty = 0;
  };

  const tick = () => {
    // Correct the lerp for the real frame time. gsap.ticker.deltaRatio(60)
    // returns 1 at 60fps, 0.5 at 120fps — without it, high-refresh displays
    // converge twice as fast and the parallax feels stiff on exactly the
    // machines most likely to be running it.
    const k = 1 - Math.pow(1 - DAMP, gsap.ticker.deltaRatio(60));
    const nx = pointer.x + (pointer.tx - pointer.x) * k;
    const ny = pointer.y + (pointer.ty - pointer.y) * k;
    pointer.vx = nx - pointer.x;
    pointer.vy = ny - pointer.y;
    pointer.speed = Math.hypot(pointer.vx, pointer.vy);
    pointer.x = nx;
    pointer.y = ny;
  };

  if (!reduce) {
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("blur", onLeave);
    gsap.ticker.add(tick);
  }

  stop = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerout", onLeave);
    window.removeEventListener("blur", onLeave);
    gsap.ticker.remove(tick);
    started = false;
    stop = null;
  };
  return stop;
}

export function stopPointer() {
  stop?.();
}
