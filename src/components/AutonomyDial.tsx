"use client";

import { useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "./motion";

const MODES = [
  {
    key: "manual",
    label: "Manual",
    headline: "Every plan and PR waits for you.",
    body: "The agent posts a plan to Jira and stops until a human replies /approve. Maximum control — the day-one posture for a new team.",
  },
  {
    key: "auto_with_veto",
    label: "Auto with veto",
    headline: "It proceeds unless you object.",
    body: "The plan posts, a veto window runs, then the bot proceeds if no human posts /hold or /reject. Oversight without babysitting.",
  },
  {
    key: "auto",
    label: "Auto",
    headline: "Ships within policy. Nothing outside it.",
    body: "Self-approves and self-merges when risk ≤ cap, cost ≤ cap, tests and CI are green, and a peer verdict is in. Anything riskier escalates to a human — automatically.",
  },
] as const;

export function AutonomyDial() {
  const [i, setI] = useState(0);
  const active = MODES[i];

  return (
    <LazyMotion features={domAnimation}>
      <div className="rounded-[var(--radius-card)] border border-line bg-ground-2/60 p-6 sm:p-8">
        <div className="inline-flex rounded-full border border-line bg-ground p-1">
          {MODES.map((m2, idx) => (
            <button
              key={m2.key}
              onClick={() => setI(idx)}
              className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                i === idx ? "text-[#1a1512]" : "text-ink-dim hover:text-ink"
              }`}
            >
              {i === idx && (
                <m.span
                  layoutId="dial-pill"
                  className="absolute inset-0 rounded-full bg-clay"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{m2.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-7 min-h-[104px]">
          <AnimatePresence mode="wait">
            <m.div
              key={active.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <p className="font-display text-[22px] leading-tight text-ink">{active.headline}</p>
              <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-ink-dim">{active.body}</p>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  );
}
