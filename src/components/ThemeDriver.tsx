"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { heroState, sideToOffset } from "@/lib/heroState";

/**
 * Aims the 3D scene away from whichever text panel is on screen.
 *
 * This used to also drive a scroll-linked day→night journey — painting a dozen
 * interpolated CSS custom properties on <html> every frame. The site is dark
 * only now, so the palette is static in the `@theme` block and none of that
 * work is needed. What is left is layout, not motion, so it keeps running under
 * prefers-reduced-motion.
 */
export function ThemeDriver() {
  const pathname = usePathname();

  useEffect(() => {
    const isHome = pathname === "/";
    if (!isHome) {
      heroState.offsetX = 0;
      heroState.offsetY = 0;
      return;
    }

    const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-side]"));
    let raf = 0;
    let alive = true;

    const tick = () => {
      if (!alive) return;
      const mid = window.innerHeight / 2;
      for (const el of panels) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          const off = sideToOffset(el.dataset.side || "left");
          heroState.offsetX = off.x;
          heroState.offsetY = off.y;
          break;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
