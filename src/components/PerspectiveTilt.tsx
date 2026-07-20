"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { pointer } from "@/lib/pointer";

/**
 * Publishes the damped pointer as CSS custom properties so the layout can lean
 * with the cursor.
 *
 * This replaces a per-element hover tilt (each `.perspective-3d` rotating about
 * its own centre when you happened to be over it). The brief asks for something
 * different in kind: the LAYOUT reacting to cursor position, so the page reads
 * as one space being looked around rather than a set of independently
 * hover-reactive widgets.
 *
 * Why custom properties and not a transformed wrapper
 * ---------------------------------------------------
 * The obvious implementation — wrap the page in one `.stage` div and rotate it
 * — quietly breaks every `position: fixed` descendant, because a transformed
 * element becomes the containing block for fixed children. The nav and the
 * demo dialog are both fixed. Publishing `--mx`/`--my` and letting individual
 * elements opt in via a class costs one style recalc and cannot break
 * positioning, because nothing large is ever transformed.
 *
 * The values are the SAME damped signal the cloud shader reads (lib/pointer),
 * which is what makes the background and the layout move as one thing.
 */
export function PerspectiveTilt() {
  useEffect(() => {
    // No cursor to follow on touch; nothing should lean under reduced-motion.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    let px = 0;
    let py = 0;

    const tick = () => {
      // Only touch the DOM when the value actually moved. Writing a custom
      // property invalidates style for every element that references it, so an
      // unconditional write per frame would recalc the whole tilt subtree even
      // with the mouse parked.
      if (Math.abs(pointer.x - px) < 0.001 && Math.abs(pointer.y - py) < 0.001) return;
      px = pointer.x;
      py = pointer.y;
      root.style.setProperty("--mx", px.toFixed(4));
      root.style.setProperty("--my", py.toFixed(4));
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      root.style.removeProperty("--mx");
      root.style.removeProperty("--my");
    };
  }, []);

  return null;
}
