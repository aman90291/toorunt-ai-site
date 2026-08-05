"use client";

import dynamic from "next/dynamic";
import { GLBoundary, useGLTier } from "@/components/three/gl";

const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false });

/**
 * Where the globe attaches to the page.
 *
 * Owns the capability tiers and the fallback, so `GlobeScene` never has to
 * know whether WebGL exists. Unlike the old wave-grid hero — which could
 * afford to render nothing, because a missing canvas there just left a plain
 * dark band — the globe IS the composition here. Something has to occupy that
 * space or the hero collapses into a headline floating over a search box.
 *
 * So `off` gets a real fallback: a CSS graticule built from three nested
 * conic/radial layers. It is not trying to impersonate the particle field —
 * it is the same IDEA at a lower fidelity, which is what a fallback should be.
 */
export function GlobeMount({ className = "" }: { className?: string }) {
  const { mode, lite } = useGLTier();

  return (
    /* Pointer events are ENABLED here, unlike the old wave-grid canvas which
       had to stay transparent to clicks because the headline sat on top of
       it. The globe has its own row in the hero and nothing overlaps it, so
       it can take the pointer and be dragged.

       `touch-action: pan-y` is the important half: a vertical swipe still
       scrolls the page and only horizontal drags reach the globe. Without it
       a decorative canvas becomes a scroll trap on a phone. */
    <div
      className={`relative touch-pan-y select-none ${className}`}
      aria-hidden="true"
    >
      {mode === "off" ? (
        <GlobeFallback />
      ) : (
        <GLBoundary fallback={<GlobeFallback />}>
          <GlobeScene reduced={mode === "reduced"} lite={lite} />
        </GLBoundary>
      )}
    </div>
  );
}

/** No-WebGL stand-in — a drawn globe, in the same palette. */
function GlobeFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="globe-fallback" />
    </div>
  );
}
