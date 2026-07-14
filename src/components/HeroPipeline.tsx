"use client";

import { useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion } from "./motion";
import { PIPELINE_STAGES } from "@/lib/gates";

/** One simulated run's log lines, keyed to the stage that reveals them. */
const LOG: { at: number; text: string; kind: "auto" | "human" | "merge" }[] = [
  { at: 0, text: "SCRUM-412 · Rate-limit the /login endpoint", kind: "auto" },
  { at: 1, text: "plan posted to Jira — files, approach, risks", kind: "auto" },
  { at: 2, text: "awaiting human /approve", kind: "human" },
  { at: 3, text: "implementing · red→green reproduction test written", kind: "auto" },
  { at: 4, text: "tests green · secrets scan clean · 0 quality findings", kind: "auto" },
  { at: 5, text: "peer review · 2 bots, distinct identities · 30+ rounds", kind: "auto" },
  { at: 6, text: "awaiting human sign-off on the PR", kind: "human" },
  { at: 7, text: "merged — verified-green, CI, no conflicts", kind: "merge" },
  { at: 8, text: "watching CI + production · revert alerts armed", kind: "auto" },
];

const TOTAL = PIPELINE_STAGES.length; // 9
const HOLD_MS = 1250;
const STEP_MS = 900;

export function HeroPipeline() {
  const reduced = useReducedMotion();
  // Start on the COMPLETED frame so SSR / no-JS / reduced-motion / a screenshot
  // all show a rich, finished run — never an empty card. Animated users get it
  // rewound to 0 and played on mount.
  const [step, setStep] = useState(TOTAL);
  const wrapRef = useRef<HTMLDivElement>(null);
  const visible = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced) return; // hold the completed frame
    const el = wrapRef.current;
    const io = new IntersectionObserver(
      ([e]) => (visible.current = e.isIntersecting),
      { threshold: 0.2 }
    );
    if (el) io.observe(el);

    setStep(0); // rewind, then play
    const loop = () => {
      if (!visible.current || document.hidden) {
        timer.current = setTimeout(loop, 400);
        return;
      }
      setStep((s) => {
        const next = s >= TOTAL ? 0 : s + 1;
        timer.current = setTimeout(loop, next >= TOTAL ? HOLD_MS + 900 : STEP_MS);
        return next;
      });
    };
    timer.current = setTimeout(loop, STEP_MS);
    return () => {
      io.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const done = step >= TOTAL;

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={wrapRef}
        className="relative w-full min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-line-2 bg-ground-2/80 p-5 backdrop-blur-sm shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)] sm:p-6"
        aria-label="A simulated DevAgent run from ticket to merged pull request"
      >
        {/* header */}
        <div className="mb-5 flex items-center justify-between">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-pass" : "bg-clay"} ${!reduced && !done ? "animate-pulse" : ""}`} />
            {done ? "run complete" : "live run"}
          </span>
          <span className="font-mono text-[11px] text-ink-faint">devagent · fleet</span>
        </div>

        {/* the stage rail */}
        <div className="flex items-center justify-between gap-1">
          {PIPELINE_STAGES.map((s, i) => {
            const reached = step > i;
            const active = step === i + 0; // not used for styling directly
            const isHuman = s.actor === "human";
            return (
              <div key={s.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-center">
                  {i > 0 && (
                    <span
                      className={`h-px flex-1 transition-colors duration-500 ${reached ? "bg-clay/50" : "bg-line"}`}
                    />
                  )}
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    {isHuman ? (
                      <>
                        <span
                          className={`absolute inset-0 rounded-full ring-2 transition-all duration-300 ${
                            reached ? "ring-clay" : "ring-line-2"
                          } ${step === i + 1 && !done && !reduced ? "animate-ping-slow" : ""}`}
                        />
                        <span className={`h-2 w-2 rounded-full transition-colors duration-300 ${reached ? "bg-clay" : "bg-line-2"}`} />
                      </>
                    ) : (
                      <span
                        className={`h-3 w-3 rounded-full transition-all duration-300 ${
                          reached ? "scale-100 bg-pass" : "scale-90 bg-line-2"
                        }`}
                      />
                    )}
                  </span>
                  {i < TOTAL - 1 && (
                    <span
                      className={`h-px flex-1 transition-colors duration-500 ${step > i + 1 ? "bg-clay/50" : "bg-line"}`}
                    />
                  )}
                </div>
                <span
                  className={`w-full break-words text-center font-mono text-[8px] uppercase leading-tight tracking-tight transition-colors duration-300 sm:text-[9px] sm:tracking-wide ${
                    reached ? (isHuman ? "text-clay-text" : "text-ink-dim") : "text-ink-faint/60"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* log — plain CSS so it's readable in any frame (no opacity-gated fade) */}
        <div className="mt-6 h-[132px] space-y-1.5 overflow-hidden border-t border-line pt-4 font-mono text-[12px]">
          {LOG.filter((l) => done || l.at < step)
            .slice(-5)
            .map((l) => (
              <div key={l.text} className="flex items-start gap-2">
                <span
                  className={
                    l.kind === "human" ? "text-clay-text" : l.kind === "merge" ? "text-clay" : "text-pass"
                  }
                >
                  {l.kind === "human" ? "●" : l.kind === "merge" ? "◆" : "✓"}
                </span>
                <span className="text-ink-dim">{l.text}</span>
              </div>
            ))}
        </div>

        {/* receipt */}
        <AnimatePresence>
          {done && (
            <m.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-clay/30 bg-clay-wash px-4 py-3"
            >
              <span className="font-display text-[15px] text-ink">Merged</span>
              <span className="font-mono text-[12px] text-ink-dim">2h 36m idea → deployed</span>
              <span className="font-mono text-[12px] text-clay-text">3 human decisions</span>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
