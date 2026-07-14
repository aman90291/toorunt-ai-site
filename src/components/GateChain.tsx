"use client";

import { useRef } from "react";
import { LazyMotion, domAnimation, m, useScroll, useTransform, useReducedMotion } from "./motion";
import { GATES } from "@/lib/gates";

/**
 * The 14-gate chain. As you scroll it, the gates light in sequence — the
 * pipeline "runs" under the reader. Human-decision gates are ringed in accent.
 * Reduced-motion / no-scroll-support → fully lit static chain.
 */
export function GateChain() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.55"],
  });

  return (
    <LazyMotion features={domAnimation}>
      <div ref={ref} className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
        <ol className="contents">
          {GATES.map((g, i) => {
            const start = i / GATES.length;
            const end = start + 0.6 / GATES.length;
            return (
              <GateRow
                key={g.name}
                index={i}
                gate={g}
                progress={scrollYProgress}
                start={start}
                end={end}
                reduced={!!reduced}
              />
            );
          })}
        </ol>
      </div>
    </LazyMotion>
  );
}

function GateRow({
  index,
  gate,
  progress,
  start,
  end,
  reduced,
}: {
  index: number;
  gate: (typeof GATES)[number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
  reduced: boolean;
}) {
  const lit = useTransform(progress, [start, end], [0, 1]);
  const isHuman = gate.actor === "human";

  const opacity = reduced ? 1 : useTransform(lit, [0, 1], [0.32, 1]);
  const x = reduced ? 0 : useTransform(lit, [0, 1], [8, 0]);

  return (
    <m.li
      style={{ opacity, x }}
      className="flex items-start gap-3 border-t border-line py-3"
    >
      <span className="mt-0.5 font-mono text-[11px] tabular-nums text-ink-faint">
        {String(index + 1).padStart(2, "0")}
      </span>
      <m.span
        aria-hidden="true"
        className="relative mt-[3px] flex h-3 w-3 shrink-0 items-center justify-center"
      >
        {isHuman ? (
          <>
            <span className="absolute inset-0 rounded-full ring-2 ring-accent" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </>
        ) : (
          <m.span
            style={{ scale: reduced ? 1 : lit }}
            className="h-3 w-3 rounded-full bg-pass"
          />
        )}
      </m.span>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[14px] font-medium text-ink">
          {gate.name}
          {isHuman && (
            <span className="rounded-sm bg-accent-wash px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-accent-text">
              human
            </span>
          )}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-faint">{gate.evidence}</p>
      </div>
    </m.li>
  );
}
