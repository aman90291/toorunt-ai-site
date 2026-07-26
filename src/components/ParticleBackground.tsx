"use client";

import dynamic from "next/dynamic";
import { GLBoundary, useGLTier } from "@/components/three/gl";

const ParticleScene = dynamic(() => import("./three/ParticleScene"), { ssr: false });

/**
 * The /book panel's moving background — the FBO curl-noise particle cloud,
 * mounted absolutely inside the panel the way HeroBackground sits inside the
 * hero. No fallback artwork: the panel is already the dark ground, so a
 * missing canvas reads as a plain dark card rather than a hole.
 */
export function ParticleBackground() {
  const { mode, lite } = useGLTier();

  if (mode === "off") return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <GLBoundary>
        <ParticleScene reduced={mode === "reduced"} lite={lite} />
      </GLBoundary>
      {/* Legibility floor for the quote and receipts that sit over the
          bottom of the panel. */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent via-ground/55 to-ground" />
    </div>
  );
}
