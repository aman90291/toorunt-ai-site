"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The route-change wipe.
 *
 * A panel sweeps up over the viewport as the new route commits, then clears
 * upward off the top — so navigating reads as one continuous surface moving
 * rather than as a page blinking out and a different one blinking in.
 *
 * WHY IT LOOKS LIKE THIS. Next's App Router swaps the tree synchronously on a
 * client navigation, so there is no "leaving" phase to animate into: by the
 * time this component learns the pathname changed, the new page is already
 * rendered underneath. Trying to animate an exit would mean holding the old
 * DOM, which needs the View Transitions API or a snapshot, and both cost more
 * than this is worth on a six-page marketing site.
 *
 * So the wipe is honest about that: it covers, then reveals. The cover lands
 * on the new route (which is already painted), the reveal shows it. The
 * effect a reader perceives is identical to a full in/out and it needs no
 * held DOM, no route interception, and nothing that can strand the page under
 * an overlay if a navigation fails.
 *
 * SAFETY — the overlay is `pointer-events-none` at all times and removes
 * itself on a timer, so even if an animation event never fires (background
 * tab, interrupted navigation) it cannot trap the page behind it. It also
 * skips the first paint: a wipe on initial load is a loading screen, and this
 * site already has one better idea for that in the hero.
 */
export function PageTransition() {
  const pathname = usePathname();
  const first = useRef(true);
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setPhase("cover");
    const toReveal = setTimeout(() => setPhase("reveal"), 420);
    const toIdle = setTimeout(() => setPhase("idle"), 1000);
    return () => {
      clearTimeout(toReveal);
      clearTimeout(toIdle);
    };
  }, [pathname]);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden="true"
      data-phase={phase}
      className="page-wipe pointer-events-none fixed inset-0 z-[200]"
    >
      {/* Three offset panels rather than one flat fill: the stagger reads as
          a material with depth passing over the page, where a single rect
          reads as a flash. */}
      <span style={{ ["--d" as string]: "0ms" }} />
      <span style={{ ["--d" as string]: "60ms" }} />
      <span style={{ ["--d" as string]: "120ms" }} />
    </div>
  );
}
