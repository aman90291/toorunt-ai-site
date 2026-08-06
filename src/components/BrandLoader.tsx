"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type ParticleStyle = CSSProperties & {
  "--loader-x": string;
  "--loader-y": string;
  "--loader-dx": string;
  "--loader-dy": string;
  "--loader-size": string;
  "--loader-delay": string;
  "--loader-duration": string;
};

/* Deterministic rather than random-at-render, so server and client paint the
   same field. The irregular modular steps avoid obvious rows while keeping
   the cost bounded to 72 tiny compositor-animated elements. */
const PARTICLES: readonly ParticleStyle[] = Array.from({ length: 72 }, (_, i) => {
  const x = (i * 47 + (i % 7) * 13 + 3) % 101;
  const y = (i * i * 17 + i * 29 + 11) % 101;
  return {
    "--loader-x": `${x}%`,
    "--loader-y": `${y}%`,
    "--loader-dx": `${50 - x}vw`,
    "--loader-dy": `${50 - y}vh`,
    "--loader-size": `${1 + (i % 4) * 0.55}px`,
    "--loader-delay": `${(i % 13) * 34}ms`,
    "--loader-duration": `${1780 + (i % 9) * 72}ms`,
  };
});

/**
 * Initial-load brand film.
 *
 * It is intentionally DOM + one animated WebP rather than a second WebGL
 * scene. On the homepage the real particle globe is already rendering behind
 * this layer; a second simulation would double GPU work at the worst possible
 * moment. The full-screen dust converges while the supplied globe resolves,
 * then three distorted rings carry the energy out to the viewport edge.
 *
 * Mounted in the root layout, so it plays once per hard load and survives
 * client-side route changes without replaying on every click.
 */
export function BrandLoader() {
  const globeImage = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("brand-loader-open");
    return () => document.documentElement.classList.remove("brand-loader-open");
  }, []);

  useEffect(() => {
    /* The high-priority image can finish between the server paint and React
       hydration, before onLoad is attached. Check its completed state after
       mounting and retain a short fallback so the intro can never stall on a
       broken decoder, unusual cache, or slow browser event. */
    if (globeImage.current?.complete) setReady(true);
    const readyFallback = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(readyFallback);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const exitAfter = reduced ? 420 : 4150;
    const removeAfter = reduced ? 760 : 4850;
    const exitTimer = window.setTimeout(() => setExiting(true), exitAfter);
    const removeTimer = window.setTimeout(() => setVisible(false), removeAfter);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [ready]);

  useEffect(() => {
    if (!visible) document.documentElement.classList.remove("brand-loader-open");
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <noscript>
        <style>{`.brand-loader { display: none !important; }`}</style>
      </noscript>
      <div
        className="brand-loader"
        data-ready={ready ? "true" : "false"}
        data-exiting={exiting ? "true" : "false"}
        role="status"
        aria-live="polite"
        aria-label="Loading tOOrunt AI"
      >
        <span className="sr-only">Loading tOOrunt AI</span>

        <div className="brand-loader-particles" aria-hidden="true">
          {PARTICLES.map((style, i) => (
            <i key={i} style={style} />
          ))}
        </div>

        <div className="brand-loader-stage" aria-hidden="true">
          <span className="brand-loader-aura" />
          <span className="brand-loader-wave brand-loader-wave-1" />
          <span className="brand-loader-wave brand-loader-wave-2" />
          <span className="brand-loader-wave brand-loader-wave-3" />
          <span className="brand-loader-wave brand-loader-wave-4" />

          <picture className="brand-loader-globe">
            <source
              media="(prefers-reduced-motion: reduce)"
              srcSet="/brand/globe-loader-still.webp"
            />
            <img
              ref={globeImage}
              src="/brand/globe-loader.webp"
              alt=""
              width="320"
              height="320"
              decoding="async"
              fetchPriority="high"
              draggable={false}
              onLoad={() => setReady(true)}
              onError={() => setReady(true)}
            />
          </picture>
        </div>
      </div>
    </>
  );
}
