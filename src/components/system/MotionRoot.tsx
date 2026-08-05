"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * The site's entrance-animation driver.
 *
 * WHY THIS EXISTS AT ALL — the previous system scrubbed every entrance to
 * scroll position with native `animation-timeline: view()`. On paper that is
 * the better technique: no observers, no JS, runs on the compositor. In
 * practice it read as *no animation whatsoever*, for two reasons that are
 * obvious in hindsight:
 *
 *   1. A scrubbed animation only moves while you are actively scrolling. Stop,
 *      and it stops. It never *plays* — there is no moment where the interface
 *      does something while you watch.
 *   2. The range completed almost immediately after the element appeared, so
 *      anything you scrolled past at normal speed was already settled by the
 *      time your eye arrived, and anything above the fold was finished before
 *      first paint.
 *
 * So: one IntersectionObserver, elements animate on ENTER, time-based easing,
 * once. That is what people recognise as motion.
 *
 * ARCHITECTURE — a single observer for the whole document, mounted once in
 * the layout, watching `[data-fx]`. The alternative (a client component
 * wrapping every animated block) would push a "use client" boundary into
 * every panel on the site and serialise all of them to the client. Here the
 * panels stay server components and simply declare `data-fx="rise"` as an
 * attribute; only this 40-line driver ships.
 *
 * THE NO-JS CONTRACT — the hiding rule in globals.css is scoped to
 * `html.js`, and that class is added HERE, by the script itself. If the
 * bundle fails, is blocked, or has not run yet, the class is absent and every
 * element renders in its finished state. The page is never blank waiting for
 * JavaScript; the animation is strictly additive. Reduced-motion is handled
 * in CSS rather than by skipping the class, so the reveal still happens —
 * instantly — and nothing is left permanently invisible.
 */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");

    // Elements already past the fold on load should not animate in — they
    // were never "entered", and playing them produces a page that flickers
    // once on every navigation.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-in", "");
          io.unobserve(entry.target);
        }
      },
      // The bottom margin is POSITIVE, which extends the observed box below
      // the fold: an element starts its entrance while it is still ~20% of a
      // viewport away, so by the time it is actually on screen it has largely
      // finished. A negative inset (the intuitive choice — "play it once the
      // reader can see it") is what makes scroll reveals feel broken: scroll
      // at any speed and you arrive at a section that is still blank, then
      // watch it assemble after you have already started reading.
      //
      // threshold 0 for the same reason — fire on the first pixel, not after
      // 8% of a 900px panel has crossed.
      { rootMargin: "0px 0px 20% 0px", threshold: 0 },
    );

    const targets = document.querySelectorAll<HTMLElement>("[data-fx]");
    targets.forEach((el) => io.observe(el));

    return () => io.disconnect();
    // Re-queried per route: the layout persists across client-side
    // navigation, so a mount-only pass would leave every element on every
    // subsequent page unobserved and therefore permanently hidden.
  }, [pathname]);

  return null;
}
