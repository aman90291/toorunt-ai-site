"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/**
 * The Peachworlds move: every heading marked `data-split` rises in line-by-line
 * from behind a mask as it enters. One component enhances the whole page — the
 * markup stays server-rendered and fully visible (fail-safe); this only adds motion.
 * Mounted in template.tsx so it re-scans on every route change.
 */
export function TextReveals() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const splits: SplitText[] = [];
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      const els = gsap.utils.toArray<HTMLElement>("[data-split]");
      els.forEach((el) => {
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "line",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 115,
              opacity: 0,
              duration: 0.95,
              stagger: 0.085,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 84%", once: true },
            });
          },
        });
        splits.push(split);
      });
      ScrollTrigger.refresh();
    };

    // Split only after fonts settle, or lines mis-wrap and masks clip mid-word.
    if (document.fonts?.ready) document.fonts.ready.then(run);
    else run();

    return () => {
      cancelled = true;
      splits.forEach((s) => s.revert());
    };
  }, []);

  return null;
}
