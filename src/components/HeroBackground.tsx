"use client";

import dynamic from "next/dynamic";
import { GLBoundary, useGLTier } from "@/components/three/gl";

const Scene3D = dynamic(() => import("./three/Scene3D"), { ssr: false });

/**
 * The hero's moving background — the wave-grid canvas.
 *
 * Previously this was `BackgroundFX`, mounted in the root layout as a fixed,
 * full-viewport canvas at -z-10 behind every page, which is why `body` had to
 * be transparent. It is now absolutely positioned inside the hero <section>,
 * so it is bounded by the hero, the rest of the page is opaque white, and the
 * GL context is torn down as soon as the hero scrolls out of the tree.
 *
 * The error boundary and perf tiers moved to three/gl.tsx when the /book
 * particle panel became the second canvas.
 *
 * There is no fallback artwork: the hero already sits on the dark ground, so a
 * missing canvas reads as a plain dark band rather than a hole.
 */
export function HeroBackground() {
  const { mode, lite } = useGLTier();

  if (mode === "off") return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <GLBoundary>
        <Scene3D reduced={mode === "reduced"} lite={lite} />
      </GLBoundary>
      {/* Bottom fade into the hero ground, so the canvas meets the white body
          on a soft edge instead of a hard seam at the section boundary. */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ground" />
      {/* Text-protection scrim: the headline column sits on the left, and a
          wave peak wandering under it costs more contrast than the grid is
          worth. Two stops only — a via-stop put a visible seam mid-screen. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ground/75 to-transparent" />
    </div>
  );
}
