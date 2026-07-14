"use client";

import { useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, useScroll, useMotionValueEvent } from "./motion";
import { GATES } from "@/lib/gates";
import { Container, Eyebrow } from "./ui";

/**
 * The cinematic centerpiece. Scrolling through a tall track "pins" the stage via
 * CSS position:sticky (robust with Lenis — it moves the real document scroll), and
 * the 14-gate pipeline runs one gate at a time as scroll progress advances. Fail-safe:
 * the server/no-JS/reduced-motion render is a static full list; JS swaps in the take.
 */
export function PipelineTake() {
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) setEnhanced(true);
  }, []);
  return enhanced ? <Take /> : <StaticList />;
}

function Take() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setIdx(Math.min(GATES.length - 1, Math.max(0, Math.floor(p * GATES.length * 0.999))));
  });

  const g = GATES[idx];
  return (
    <LazyMotion features={domAnimation}>
      <section className="border-y border-line bg-ground-2/20">
        <div ref={trackRef} className="relative" style={{ height: "460vh" }}>
          <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden py-16">
            <Container>
              <Eyebrow>The gate chain</Eyebrow>
              <p className="mt-5 max-w-2xl font-display text-[clamp(28px,4vw,50px)] font-medium leading-[1.06] tracking-[-0.01em] text-ink">
                Fourteen gates. Every change. <span className="text-accent-text">No exceptions.</span>
              </p>

              {/* center stage — the active gate crossfades as scroll advances */}
              <div className="mt-10 min-h-[210px] sm:mt-12">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-[clamp(44px,7vw,88px)] leading-none tabular-nums text-accent/90">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-faint">
                    / {GATES.length}
                  </span>
                </div>
                <m.div
                  key={g.name}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4"
                >
                  <h3 className="flex flex-wrap items-center gap-3 font-display text-[clamp(24px,3.4vw,40px)] leading-tight text-ink">
                    {g.name}
                    {g.actor === "human" && (
                      <span className="rounded-sm bg-accent-wash px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-text">
                        human decision
                      </span>
                    )}
                  </h3>
                  <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-dim">{g.evidence}</p>
                </m.div>
              </div>

              {/* the rail — a playhead across 14 nodes */}
              <div className="mt-10 flex items-center gap-1.5 sm:mt-12">
                {GATES.map((gate, i) => {
                  const reached = i <= idx;
                  const active = i === idx;
                  const isHuman = gate.actor === "human";
                  return (
                    <div key={gate.name} className="flex flex-1 items-center">
                      <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                        {isHuman ? (
                          <>
                            <span className={`absolute inset-0 rounded-full ring-2 transition-colors duration-300 ${reached ? "ring-accent" : "ring-line-2"}`} />
                            <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${reached ? "bg-accent" : "bg-line-2"}`} />
                          </>
                        ) : (
                          <span className={`rounded-full transition-all duration-300 ${active ? "h-3.5 w-3.5 bg-accent" : reached ? "h-2.5 w-2.5 bg-pass" : "h-2 w-2 bg-line-2"}`} />
                        )}
                      </span>
                      {i < GATES.length - 1 && (
                        <span className={`h-px flex-1 transition-colors duration-500 ${i < idx ? "bg-accent/50" : "bg-line"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </Container>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

/** Server / no-JS / reduced-motion fallback: the full chain, statically. */
function StaticList() {
  return (
    <section className="border-y border-line bg-ground-2/20 py-24 sm:py-28">
      <Container>
        <Eyebrow>The gate chain</Eyebrow>
        <p className="mt-5 max-w-2xl font-display text-[clamp(28px,4vw,50px)] font-medium leading-[1.06] tracking-[-0.01em] text-ink" data-split>
          Fourteen gates. Every change. <span className="text-accent-text">No exceptions.</span>
        </p>
        <div className="mt-12 grid gap-x-10 sm:grid-cols-2">
          {GATES.map((g, i) => (
            <div key={g.name} className="flex items-start gap-4 border-t border-line py-4">
              <span className="mt-0.5 font-mono text-[11px] tabular-nums text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: g.actor === "human" ? "var(--color-accent)" : "var(--color-pass)" }} />
              <div>
                <p className="flex items-center gap-2 text-[15px] font-medium text-ink">
                  {g.name}
                  {g.actor === "human" && (
                    <span className="rounded-sm bg-accent-wash px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-accent-text">human</span>
                  )}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-ink-faint">{g.evidence}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
