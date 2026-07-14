"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // native scroll; Lenis stays inert (options below also soften it)

    const update = (time: number) => {
      const l = lenisRef.current?.lenis;
      l?.raf(time * 1000);
      // expose for programmatic scroll (e.g. verification harness); harmless in prod
      (window as unknown as { __lenis?: unknown }).__lenis = l;
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    const onScroll = () => ScrollTrigger.update();
    lenisRef.current?.lenis?.on("scroll", onScroll);
    return () => {
      gsap.ticker.remove(update);
      lenisRef.current?.lenis?.off("scroll", onScroll);
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
      options={{ autoRaf: false, lerp: 0.1, duration: 1.2, smoothWheel: true, syncTouch: false, anchors: true }}
    >
      {children}
    </ReactLenis>
  );
}
