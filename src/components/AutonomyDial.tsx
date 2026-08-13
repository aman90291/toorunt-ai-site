"use client";

import { useState } from "react";

/**
 * The autonomy envelope — an actual dial now, not three tabs and a paragraph.
 *
 * The control is a three-stop track with a travelling indicator, because the
 * thing being described is a CONTINUUM the customer moves along over time
 * ("earn your way to full autonomy"). Three separate tab buttons said the
 * opposite: three unrelated modes, pick one. The form was arguing against the
 * copy.
 *
 * The readout underneath is the payload: at each stop it shows what the three
 * human gates actually do. That is the question a buyer is really asking —
 * not "what are the modes" but "what am I still signing at each one" — and it
 * is answerable from `lib/gates.ts`, so no new claims are made.
 */

const MODES = [
  {
    key: "manual",
    label: "Manual",
    headline: "Every plan and PR waits for you.",
    body: "The agent posts a plan to Jira and stops until a human replies /approve. Maximum control, the day one posture for a new team.",
    gates: ["you sign", "you sign", "you sign"],
  },
  {
    key: "auto_with_veto",
    label: "Auto with veto",
    headline: "It proceeds unless you object.",
    body: "The plan posts, a veto window runs, then the bot proceeds if no human posts /hold or /reject. Oversight without babysitting.",
    gates: ["timed veto", "you sign", "you sign"],
  },
  {
    key: "auto",
    label: "Auto",
    headline: "Ships within policy. Nothing outside it.",
    body: "Self approves and self merges when risk ≤ cap, cost ≤ cap, tests and CI are green, and a peer verdict is in. Anything riskier escalates to a human automatically.",
    gates: ["within policy", "within policy", "within policy"],
  },
] as const;

const GATE_NAMES = ["Gate 04 · plan", "Gate 12 · review", "Gate 13 · merge"];

export function AutonomyDial() {
  const [i, setI] = useState(0);
  const active = MODES[i];

  return (
    <div>
      {/* ── the track ───────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute inset-x-0 top-[11px] h-[2px] bg-line" aria-hidden="true" />
        {/* The travelled portion, in the accent — so the control reads as a
            distance covered rather than as a selected item. */}
        <div
          className="absolute top-[11px] h-[2px] bg-accent-text transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${(i / (MODES.length - 1)) * 100}%` }}
          aria-hidden="true"
        />
        <div role="radiogroup" aria-label="Autonomy level" className="relative flex justify-between">
          {MODES.map((m, idx) => {
            const on = idx <= i;
            return (
              <button
                key={m.key}
                role="radio"
                aria-checked={i === idx}
                onClick={() => setI(idx)}
                className="group flex flex-col items-center gap-3 focus-visible:outline-none"
                style={{ flex: idx === 0 || idx === MODES.length - 1 ? "0 0 auto" : "0 0 auto" }}
              >
                <span
                  className={`h-6 w-6 rounded-full border-2 transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-accent-text group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[color:var(--color-ground-2)] ${
                    i === idx
                      ? "scale-110 border-accent-text bg-accent-text"
                      : on
                        ? "border-accent-text bg-ground-2"
                        : "border-line-2 bg-ground-2"
                  }`}
                />
                <span
                  className={`font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors ${
                    i === idx ? "text-ink" : "text-ink-faint group-hover:text-ink-dim"
                  }`}
                >
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── the readout ─────────────────────────────────────────── */}
      <div className="mt-9 min-h-[112px]">
        <p className="font-display text-[clamp(20px,2.2vw,26px)] leading-tight text-ink">
          {active.headline}
        </p>
        <p className="mt-2.5 max-w-[60ch] text-[14.5px] leading-relaxed text-ink-dim">{active.body}</p>
      </div>

      {/* What each of the three signatures becomes at this stop. */}
      <dl className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-3">
        {GATE_NAMES.map((g, idx) => {
          const state = active.gates[idx];
          const signed = state === "you sign";
          return (
            <div key={g} className="bg-ground-2 p-4">
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">{g}</dt>
              <dd className="mt-2 flex items-center gap-2 text-[13.5px]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full transition-colors duration-300"
                  style={{ background: signed ? "var(--color-accent-text)" : "var(--color-pass)" }}
                />
                <span className={signed ? "text-ink" : "text-ink-dim"}>{state}</span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
