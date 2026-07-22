"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";

const Scene3D = dynamic(() => import("./three/Scene3D"), { ssr: false });

/** If WebGL throws at runtime, fall back to the flat hero ground. */
class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
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
 * The hero's moving background — the only animated surface left on the site.
 *
 * Previously this was `BackgroundFX`, mounted in the root layout as a fixed,
 * full-viewport canvas at -z-10 behind every page, which is why `body` had to
 * be transparent. It is now absolutely positioned inside the hero <section>,
 * so it is bounded by the hero, the rest of the page is opaque white, and the
 * GL context is torn down as soon as the hero scrolls out of the tree.
 *
 * There is no fallback artwork: the hero already sits on the dark ground, so a
 * missing canvas reads as a plain dark band rather than a hole. The old
 * StaticPipeline fallback was drawn in the retired warm palette and would have
 * needed redrawing to survive the revamp.
 */
export function HeroBackground() {
  const [mode, setMode] = useState<"off" | "reduced" | "full">("off");
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasWebGL()) setMode("off");
    else if (reduce) setMode("reduced");
    else setMode("full");
    // "lite" tier: fewer shader layers and lower DPR on phones and low-power
    // machines — the main cause of scroll lag on the old build.
    const nav = navigator as Navigator & { deviceMemory?: number };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 820;
    const weak = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4;
    setLite(coarse || small || weak);
  }, []);

  if (mode === "off") return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <GLBoundary>
        <Scene3D reduced={mode === "reduced"} lite={lite} />
      </GLBoundary>
      {/* Bottom fade into the hero ground, so the canvas meets the white body
          on a soft edge instead of a hard seam at the section boundary. */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ground" />
    </div>
  );
}
