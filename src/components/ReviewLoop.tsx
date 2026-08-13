"use client";

import { useState } from "react";

/** The three ways tOOrunt AI answers a review comment — plus the safety flex. */
const CASES = [
  {
    key: "fix",
    tab: "Fix it",
    comment: "This N+1 query will hammer the DB under load. Batch it.",
    author: "Priya · reviewer",
    reply:
      "Good catch. Batched into a single `IN (...)` fetch and added a covering test that fails on the old code path.",
    outcome: "Commit pushed · test added",
    tone: "pass" as const,
  },
  {
    key: "rebut",
    tab: "Disagree, politely",
    comment: "Just catch the broad Exception here to be safe.",
    author: "Marcus · reviewer",
    reply:
      "I'd rather not. A bare except would swallow the timeout we specifically want to surface to the caller. Narrowed to `ConnectionError` instead; here's the trade off.",
    outcome: "Rebutted with a reason · reviewer agreed",
    tone: "pass" as const,
  },
  {
    key: "clarify",
    tab: "Ask when unsure",
    comment: "Make the rate limit configurable.",
    author: "Dana · reviewer",
    reply:
      "Per tenant or global? They imply different storage. A clarifying question before I build the wrong one.",
    outcome: "Question posted · waiting on a human",
    tone: "human" as const,
  },
  {
    key: "refuse",
    tab: "Refuse the unsafe",
    comment: "Simpler to just hardcode the API key for the demo.",
    author: "reviewer",
    reply:
      "I can't. The secret scan gate blocks committed credentials, and it should. I'll read it from the vault via env instead.",
    outcome: "Refused · guardrail held",
    tone: "accent" as const,
  },
];

export function ReviewLoop() {
  const [i, setI] = useState(0);
  const c = CASES[i];

  return (
    <>
      <div className="rounded-[var(--radius-card)] border border-line bg-ground-2 p-6 sm:p-8">
        <div className="flex flex-wrap gap-2">
          {CASES.map((cc, idx) => (
            <button
              key={cc.key}
              onClick={() => setI(idx)}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                i === idx
                  ? "border-accent-text bg-accent-wash text-accent-text"
                  : "border-line text-ink-dim hover:border-line-2 hover:text-ink"
              }`}
            >
              {cc.tab}
            </button>
          ))}
        </div>

        {/* The tab swap was an AnimatePresence enter/exit slide. The tabs still
            work; the content just changes. */}
        <div key={c.key} className="mt-6 space-y-3">
            {/* reviewer comment */}
            <div className="rounded-xl border border-line bg-ground px-4 py-3">
              <div className="mb-1 font-mono text-[11px] text-ink-faint">{c.author}</div>
              <p className="text-[14px] text-ink-dim">{c.comment}</p>
            </div>
            {/* agent reply */}
            <div className="ml-6 rounded-xl border border-accent-text/25 bg-accent-wash px-4 py-3">
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[11px] text-accent-text">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-text" />
                toorunt sam
              </div>
              <p className="text-[14px] text-ink">{c.reply}</p>
            </div>
            {/* outcome */}
            <div className="ml-6 flex items-center gap-2 font-mono text-[12px]">
              <span className={c.tone === "human" ? "text-accent-text" : c.tone === "accent" ? "text-danger" : "text-pass"}>
                {c.tone === "human" ? "●" : c.tone === "accent" ? "✕" : "✓"}
              </span>
              <span className="text-ink-dim">{c.outcome}</span>
            </div>
        </div>
      </div>
    </>
  );
}
