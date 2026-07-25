import { Container, Heading, Accent } from "@/components/ui";
import { CountUp } from "@/components/CountUp";
import type { ReactNode } from "react";

/**
 * A story beat.
 *
 * Was `min-h-screen` with vertically centred content — every section its own
 * full viewport, text floating in the middle. That is the single biggest reason
 * the page read as the old site: a stack of identical full-height slides has no
 * rhythm, because nothing is ever longer or shorter than anything else.
 *
 * Now on the shared `--space-section` interval, so beats size to their content
 * and the page has a cadence. `side` still feeds the 3D model-avoidance.
 */
function Beat({ side = "left", id, children }: { side?: "left" | "right" | "center"; id?: string; children: ReactNode }) {
  return (
    <section
      data-side={side}
      id={id}
      className="relative"
      style={{ paddingBlock: "var(--space-section)" }}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** A legible card for dense beats sitting over the live 3D. Near-opaque (no
 *  backdrop-blur — blurring an animated WebGL backdrop every frame is a GPU sink). */
function Glass({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-card)] border border-line bg-ground-2 p-6 shadow-[0_10px_30px_-16px_rgba(20,24,28,0.14)] sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

/* ── Act I · The problem ────────────────────────────────────────────── */
export function ProblemBeat() {
  return (
    <Beat side="center">
      <div className="reveal mx-auto max-w-4xl text-center">
        <Heading className="mt-6 text-[length:var(--text-h2)] leading-[1.06]">
          The code is already written by AI. <Accent>Nobody owns accountability for it.</Accent>
        </Heading>
        <div className="mt-12 grid grid-cols-1 gap-10 sm:mt-16 sm:grid-cols-2">
          <div>
            <div className="font-display text-[length:var(--text-stat)] font-bold leading-[0.9] tracking-[-0.03em] text-accent-text">
              <CountUp value={75} suffix="%" />
            </div>
            <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-ink-dim">
              of Google&rsquo;s new code is AI-generated — and still approved by engineers.
            </p>
          </div>
          <div>
            <div className="font-display text-[length:var(--text-stat)] font-bold leading-[0.9] tracking-[-0.03em] text-accent-text">
              <CountUp value={95} suffix="%" />
            </div>
            <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-ink-dim">
              of enterprise GenAI pilots deliver no measurable P&amp;L impact.
            </p>
          </div>
        </div>
        <p className="mt-12 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-faint">
          The bottleneck moved from writing code to governing it.
        </p>
      </div>
    </Beat>
  );
}

/* ── Act I · Three eras of cost ─────────────────────────────────────── */
/* barColor is a data-viz cost ramp (red → orange → green), not a brand token:
   the bars encode "expensive → cheap", so the winner reads instantly. The
   brand accent can't stand in — as a pale fill it would be an invisible bar;
   the tOOrunt row gets a legible green instead.

   These are the base ramp lightened ~18%. They sit on the `bg-ground-3`
   (#eceff4) track at 3.05 / 2.06 / 2.37 : 1, so only the red clears the 3:1
   non-text contrast guideline. That is acceptable HERE specifically because
   the bar is not the only carrier of the value — the dollar figure is printed
   beside every row, and the rows differ in length as well as hue. Do not reuse
   these values for a bar that has no numeric label. */
const ERAS = [
  { label: "Manual SDLC", people: "4–6 people", time: "1–2 weeks", cost: "$500–1,000", bar: "100%", barColor: "#d8665e", accent: false },
  { label: "+ AI copilots", people: "4–6 · faster typing", time: "~1 week", cost: "$400–800", bar: "78%", barColor: "#e59658", accent: false },
  { label: "tOOrunt AI · auto", people: "0–1 · approvals only", time: "Hours · 2h 36m", cost: "$20–150", bar: "11%", barColor: "#54af66", accent: true },
];
export function CostErasBeat() {
  return (
    <Beat side="center">
      <div className="reveal mx-auto max-w-3xl text-center">
        <Heading className="mt-6 text-[length:var(--text-h2)] leading-[1.03]">
          Same ticket. <Accent>Three eras of cost.</Accent>
        </Heading>
      </div>

      {/* Wider and structured: the card is now a real comparison table — three
          equal columns split by hairlines, a consistent row grammar inside each
          (label / price / spec rows), and the chart in its own ruled band
          below. Padding lives on the sections, not the card, so the dividers
          run edge to edge. */}
      {/* Not <Glass>: its baked-in p-6/p-8 would inset the column dividers,
          and overriding it needs an important-modifier arms race. Same shell,
          zero padding — the sections pad themselves. */}
      <div className="reveal mx-auto mt-10 max-w-5xl overflow-hidden rounded-[var(--radius-card)] border border-line bg-ground-2 shadow-[0_10px_30px_-16px_rgba(20,24,28,0.14)]">
        <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {ERAS.map((e) => (
            <div key={e.label} className={`p-6 sm:p-8 ${e.accent ? "bg-accent-wash" : ""}`}>
              <p className={`font-mono text-[10px] uppercase tracking-[0.14em] ${e.accent ? "text-accent-text" : "text-ink-faint"}`}>
                {e.label}
              </p>
              {/* whitespace-nowrap: "$500–1,000" was breaking after the dash
                  and reading as two stacked numbers */}
              <p className={`mt-3 font-display text-[clamp(26px,2.4vw,36px)] font-semibold leading-none whitespace-nowrap tabular-nums ${e.accent ? "text-accent-text" : "text-ink"}`}>
                {e.cost}
              </p>
              <dl className="mt-6 space-y-2.5 border-t border-line pt-4 text-[13px]">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="shrink-0 text-ink-faint">Team</dt>
                  <dd className="text-right text-ink-dim">{e.people}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="shrink-0 text-ink-faint">Cycle</dt>
                  <dd className="text-right text-ink-dim">{e.time}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        <div className="border-t border-line px-6 py-6 sm:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Cost per shipped ticket
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {ERAS.map((e) => (
              <div key={e.label} className="flex items-center gap-4">
                <span className="w-32 shrink-0 truncate font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint">
                  {e.label}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-ground-3">
                  <span className="block h-full rounded-full" style={{ width: e.bar, backgroundColor: e.barColor }} />
                </span>
                <span className={`w-24 shrink-0 text-right font-mono text-[11px] tabular-nums ${e.accent ? "font-semibold text-accent-text" : "text-ink-dim"}`}>
                  {e.cost}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="reveal mx-auto mt-6 max-w-5xl text-center text-[15px] text-ink-dim">
        <span className="font-semibold text-ink">~90% lower cost</span> per unit of shipped, reviewed work ·{" "}
        <span className="font-semibold text-ink">10–20×</span> cycle-time compression — weeks become hours.
      </p>
    </Beat>
  );
}

/* ── Act III · Why us (competitive) ─────────────────────────────────── */
/* Competitors grouped by CATEGORY, one column per group, so the table
   compares kinds of product rather than a flat list of names — the exemplar
   products sit under each group label. */
const COMPARE = {
  cols: [
    { group: "Copilots", names: "Copilot · Cursor" },
    { group: "Session assistants", names: "Claude Cowork · ChatGPT" },
    { group: "Autonomous agents", names: "Devin · OpenHands" },
    { group: "The team", names: "tOOrunt AI" },
  ],
  rows: [
    ["Unit of value", "Suggestions in your editor", "One person’s session", "One task → one PR", "An accountable team"],
    ["Identity", "The developer’s own", "The user’s own", "One shared org agent", "Per-bot Jira + GitHub identities"],
    ["Review", "You review your own output", "—", "Your humans review it", "Bot-to-bot adversarial review — gates the merge"],
    ["Governance", "IDE / org settings", "Folder / tool permissions", "SSO + VPC + logs", "14 gates · hash-chained audit · vault · kill switch"],
    ["Cost model", "Per-seat subscription", "Subscription", "Usage ACUs, open-ended", "3 LLM layers · capped · $20–150/PR, to the dollar"],
  ],
};
export function WhyUsBeat() {
  return (
    <Beat side="left">
      <div className="reveal max-w-3xl">
        <Heading className="mt-6 text-[length:var(--text-h2)] leading-[1.04]">
          Everyone sells an agent. <Accent>Nobody sells an accountable team.</Accent>
        </Heading>
      </div>
      <Glass className="reveal mt-8 max-w-5xl overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="w-[14%]" />
              {COMPARE.cols.map((c, i) => {
                const us = i === COMPARE.cols.length - 1;
                return (
                  <th key={c.group} className="px-3 pb-3 align-bottom">
                    <span
                      className={`block font-mono text-[9px] uppercase tracking-[0.16em] ${us ? "text-accent-text" : "text-ink-faint"}`}
                    >
                      {c.group}
                    </span>
                    <span
                      className={`mt-1 block font-display text-[14px] font-semibold ${us ? "text-accent-text" : "text-ink-dim"}`}
                    >
                      {c.names}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {COMPARE.rows.map((r) => (
              <tr key={r[0]} className="border-t border-line align-top">
                <td className="py-3 pr-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">{r[0]}</td>
                {r.slice(1).map((cell, i) => (
                  <td
                    key={i}
                    className={`px-3 py-3 text-[13px] leading-snug ${
                      i === COMPARE.cols.length - 1
                        ? "rounded-sm bg-accent-wash font-medium text-ink"
                        : "text-ink-dim"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Glass>
      <p className="reveal mt-6 max-w-3xl text-[14px] italic text-ink-dim">
        Neither can tell your auditor who approved the merge. We&rsquo;re the only one whose product is the answer to that question.
      </p>
    </Beat>
  );
}

/* ── Act II · Proven fixes (USP) ────────────────────────────────────── */
const STAGES = [
  { n: "01", name: "Localize", note: "Read the real files first — no guessing." },
  { n: "02", name: "Match", note: "Edits anchored to exact existing lines." },
  { n: "03", name: "Apply", note: "Surgical diffs · completeness sweeps." },
  { n: "04", name: "Prove", note: "Repro must fail pre-patch, pass post." },
];
export function ProvenFixesBeat() {
  return (
    <Beat side="right">
      <div className="reveal ml-auto max-w-3xl text-right">
        <Heading className="mt-6 text-[length:var(--text-h2)] leading-[1.03]">
          Anyone can generate code. <Accent>We land proven fixes.</Accent>
        </Heading>
      </div>
      <Glass className="reveal mt-8 ml-auto max-w-4xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAGES.map((s, i) => (
            <div key={s.name} className={`rounded-lg border p-4 ${i === 3 ? "border-accent-text/40 bg-accent-wash" : "border-line bg-ground-2"}`}>
              <p className="font-mono text-[10px] text-ink-faint">{s.n}</p>
              <p className={`mt-1.5 font-display text-[17px] font-semibold ${i === 3 ? "text-accent-text" : "text-ink"}`}>{s.name}</p>
              <p className="mt-1.5 text-[12px] leading-snug text-ink-dim">{s.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-dashed border-accent-text/40 px-4 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent-text">Fails closed</span>
          <span className="text-[12px] text-ink-dim">Ungrounded, unproven, or unvalidated → reject &amp; retry. Never silently promoted.</span>
        </div>
      </Glass>
      <p className="reveal mt-6 ml-auto flex max-w-4xl items-baseline justify-end gap-3 text-[15px] text-ink-dim">
        <span className="font-display text-[length:var(--text-h2)] font-semibold text-accent-text">
          <CountUp value={76} prefix="~" suffix="%" />
        </span>
        true resolution on SWE-bench Lite — the defensible half nobody else gates on.
      </p>
    </Beat>
  );
}

/* ── Act II · Trust is a screen ─────────────────────────────────────── */
const GUARANTEES = [
  { tag: "chmod 0600", title: "Secret vault", note: "Keys live in a vault the pipeline can’t echo into logs or a model." },
  { tag: "ingress", title: "Prompt-injection firewall", note: "Untrusted input is neutralized before any model sees it." },
  { tag: "DROP TABLE", title: "Migration gate", note: "Irreversible DB changes stop for human sign-off." },
  { tag: "SOC 2", title: "Traces & kill switch", note: "Explainable per-decision traces, exportable audit, instant stop." },
];
export function TrustScreenBeat() {
  return (
    <Beat side="left">
      <div className="reveal max-w-3xl">
        <Heading className="mt-6 text-[length:var(--text-h2)] leading-[1.03]">
          Trust is a screen, <Accent>not a promise.</Accent>
        </Heading>
      </div>
      <div className="reveal mt-8 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
        {GUARANTEES.map((g) => (
          <Glass key={g.title} className="!p-5">
            <span className="inline-block rounded bg-accent-wash px-2 py-0.5 font-mono text-[11px] text-accent-text">{g.tag}</span>
            <p className="mt-3 font-display text-[18px] font-semibold text-ink">{g.title}</p>
            <p className="mt-1.5 text-[13px] leading-snug text-ink-dim">{g.note}</p>
          </Glass>
        ))}
      </div>
      <p className="reveal mt-6 max-w-3xl text-[14px] italic text-ink-dim">
        A jailbreak can&rsquo;t talk its way past a gate that&rsquo;s code, not conversation.
      </p>
    </Beat>
  );
}
