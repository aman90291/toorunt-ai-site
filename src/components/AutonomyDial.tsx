"use client";

import { useState } from "react";

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

  /* The active pill used to be a shared-layout `layoutId` element that sprang
     between tabs, and the copy cross-faded on AnimatePresence. Both are gone —
     the pill is now just the active button's own background. The control
     behaves identically; it simply switches instead of animating. */
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-ground-2 p-6 sm:p-8">
      <div className="inline-flex rounded-md border border-line bg-ground p-1">
        {MODES.map((m2, idx) => (
          <button
            key={m2.key}
            onClick={() => setI(idx)}
            aria-pressed={i === idx}
            className={`rounded px-4 py-2 text-[13px] font-medium transition-colors ${
              i === idx ? "bg-accent text-accent-ink" : "text-ink-dim hover:text-ink"
            }`}
          >
            {m2.label}
          </button>
        ))}
      </div>

      <div className="mt-7 min-h-[104px]">
        <p className="font-display text-[22px] leading-tight text-ink">{active.headline}</p>
        <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-ink-dim">{active.body}</p>
      </div>
    </div>
  );
}
