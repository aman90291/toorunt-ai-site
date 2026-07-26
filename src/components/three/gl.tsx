"use client";

import { Component, useEffect, useState, type ReactNode, type RefObject } from "react";

/**
 * Shared plumbing for the site's WebGL mounts (the hero wave grid, the /book
 * particle field): the runtime error boundary and the capability/perf tiers.
 * Extracted from HeroBackground when the second canvas arrived.
 */

/** If WebGL throws at runtime, fall back to the flat dark ground. */
export class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

/**
 * mode: "off" (no GL) | "reduced" (prefers-reduced-motion: frozen, not hidden)
 * | "full". lite: fewer particles / smaller grids and lower DPR on phones and
 * low-power machines — the main cause of scroll lag on the old build.
 */
export function useGLTier() {
  const [mode, setMode] = useState<"off" | "reduced" | "full">("off");
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasWebGL()) setMode("off");
    else if (reduce) setMode("reduced");
    else setMode("full");
    const nav = navigator as Navigator & { deviceMemory?: number };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 820;
    const weak = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4;
    setLite(coarse || small || weak);
  }, []);

  return { mode, lite };
}

/**
 * Whether an element is inside (or within `rootMargin` of) the viewport.
 * Canvas mounts use it to stop rendering while scrolled away — with more
 * than one canvas on a page, only the visible one should be burning frames.
 */
export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = "35%") {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
