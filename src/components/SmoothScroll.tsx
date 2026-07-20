"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Buttery momentum scroll (Lenis) driven by a single GSAP ticker so ScrollTrigger,
 * Motion's useScroll, and CSS scroll-timelines all read the correct position — one
 * RAF loop, no jitter. Honors prefers-reduced-motion by leaving native scroll.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const update = (time: number) => {
      const l = lenisRef.current?.lenis;
      l?.raf(time * 1000);
      // expose for programmatic scroll (e.g. verification harness); harmless in prod
      (window as unknown as { __lenis?: unknown }).__lenis = l;
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  /**
   * Bridge Lenis' scroll into ScrollTrigger.
   *
   * This cannot be done in a `[]` effect reading `lenisRef.current.lenis`.
   * lenis/react creates the instance inside its OWN effect and publishes it
   * through state, so on the first commit the ref's `lenis` is still undefined
   * — the optional chain silently no-ops, the effect never re-runs, and
   * ScrollTrigger is never driven by Lenis for the whole session. Every
   * scrubbed trigger then lags the smoothed scroll. Polling for the instance
   * and re-binding when it appears is what actually wires it up.
   */
  useEffect(() => {
    let raf = 0;
    let bound: { off: (e: "scroll", cb: () => void) => void } | null = null;
    const onScroll = () => ScrollTrigger.update();
    const bind = () => {
      const l = lenisRef.current?.lenis;
      if (l) {
        l.on("scroll", onScroll);
        bound = l as unknown as typeof bound;
        ScrollTrigger.refresh();
        return;
      }
      raf = requestAnimationFrame(bind);
    };
    bind();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      bound?.off("scroll", onScroll);
    };
  }, []);

  // Reset scroll + refresh triggers on navigation (App Router keeps the instance).
  useEffect(() => {
    lenisRef.current?.lenis?.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.1,
        duration: 1.2,
        // MUST follow the media query. Lenis is not inert when it is merely
        // untickled: with smoothWheel on it calls preventDefault() on every
        // wheel event and then advances only from raf(). Previously the whole
        // effect early-returned under reduced-motion, so raf() was never
        // called while wheel events were still being swallowed — the page was
        // completely unscrollable by mouse or trackpad. Turning smoothWheel
        // off hands wheel back to the browser, which is what was intended.
        smoothWheel: !reduce,
        syncTouch: false,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
