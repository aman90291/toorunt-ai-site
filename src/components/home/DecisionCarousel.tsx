"use client";

import { useEffect, useRef, useState } from "react";
import { DECISIONS } from "@/content/home-scenes";

export function DecisionCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.45 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || paused || reducedMotion) return;
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % DECISIONS.length), 5200);
    return () => window.clearTimeout(timer);
  }, [active, inView, paused, reducedMotion]);

  const move = (next: number) => setActive((next + DECISIONS.length) % DECISIONS.length);

  return (
    <div
      ref={root}
      className="decision-carousel"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="decision-carousel-meta">
        <span>Human authority channel</span>
        <span>{String(active + 1).padStart(2, "0")} / {String(DECISIONS.length).padStart(2, "0")}</span>
      </div>

      <div className="decision-carousel-window">
        <div className="decision-carousel-track" style={{ transform: `translate3d(${-active * 100}%,0,0)` }}>
          {DECISIONS.map((decision, i) => (
            <article key={decision.gate} className={i === active ? "is-active" : ""} aria-hidden={i !== active}>
              <div className="decision-gate-number" aria-hidden="true">{decision.gateNumber}</div>
              <div className="decision-card-copy">
                <span>{decision.gate} · signature required</span>
                <h3>{decision.t}</h3>
                <p>{decision.d}</p>
              </div>
              <div className="decision-signature" aria-hidden="true">
                <svg viewBox="0 0 120 120" role="presentation">
                  <circle cx="60" cy="60" r="48" />
                  <path d="M34 62 51 78 86 40" />
                </svg>
                <span>human<br />authority</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="decision-carousel-controls">
        <div role="tablist" aria-label="Human decisions">
          {DECISIONS.map((decision, i) => (
            <button
              key={decision.gate}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Show ${decision.t}`}
              onClick={() => move(i)}
            >
              <span>{decision.n}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
        <div>
          <button type="button" onClick={() => move(active - 1)} aria-label="Previous human decision">←</button>
          <button type="button" onClick={() => move(active + 1)} aria-label="Next human decision">→</button>
        </div>
      </div>
    </div>
  );
}
