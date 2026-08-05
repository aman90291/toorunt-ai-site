import { Heading, Accent, SectionFrame } from "@/components/ui";
import { CountUp } from "@/components/CountUp";
import { Surface } from "@/components/Surface";
import type { ReactNode } from "react";

/**
 * The beats all sit on the shared `<SectionFrame>` spine now (see ui.tsx).
 *
 * They used to be bare `<section>`s with centred text and nothing but
 * `--space-section` between them, which read as a document rather than as a
 * designed page: no bounds, no index, nothing for the content to align to on
 * a wide screen, and every gap indistinguishable from a mistake.
 *
 * Two consequences worth knowing when editing these:
 *   • Content is LEFT-ALIGNED inside the frame. Centring it again fights the
 *     rail — the whole point of the left edge is that everything shares it.
 *   • Each beat owns its index and label. They are passed in rather than
 *     derived, because the order on the page is a narrative decision that
 *     lives in app/page.tsx, not something these components should guess.
 */

/** The dense-beat card. Now the shared `<Surface>` (components/Surface.tsx)
 *  plus this section's padding, rather than its own copy of the border /
 *  ground / shadow triple — that copy had already drifted from the one on
 *  /pricing and /security by a shadow and a radius. */
function Glass({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Surface sheen className={`p-6 sm:p-8 ${className}`}>
      {children}
    </Surface>
  );
}

/* ── Act I · The problem ────────────────────────────────────────────── */
export function ProblemBeat() {
  return (
    <SectionFrame index="01" label="The problem">
      <div data-fx="rise">
        <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.06]">
          The code is already written by AI. <Accent>Nobody owns accountability for it.</Accent>
        </Heading>

        {/* Two figures on one rule rather than two centred blocks floating in
            white space. The divider is what makes them read as a comparison
            — and the source sits with its own number instead of as a single
            shared footnote nobody can map back. */}
        <dl className="mt-[var(--space-block)] grid grid-cols-1 border-t border-line sm:grid-cols-2 sm:divide-x sm:divide-line">
          {[
            {
              v: 75,
              d: "of Google's new code is AI-generated — and still approved by engineers.",
              s: "Google · Q3 2025 earnings call",
            },
            {
              v: 95,
              d: "of enterprise GenAI pilots deliver no measurable P&L impact.",
              s: "MIT NANDA · 2025",
            },
          ].map((f, i) => (
            <div key={f.v} className={`py-8 ${i === 0 ? "sm:pr-10" : "border-t border-line pt-8 sm:border-t-0 sm:pl-10"}`}>
              <dt className="font-display text-[length:clamp(52px,7vw,92px)] font-bold leading-[0.86] tracking-[-0.04em] text-accent-text">
                <CountUp value={f.v} suffix="%" />
              </dt>
              <dd className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-ink-dim">{f.d}</dd>
              {/* Sources travel with the numbers — for an audit-trail product,
                  an uncited statistic undercuts the whole brand promise. */}
              <dd className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{f.s}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 border-t border-line pt-6 font-mono text-[12px] uppercase tracking-[0.18em] text-accent-text">
          The bottleneck moved from writing code to governing it.
        </p>
      </div>
    </SectionFrame>
  );
}

/* ── Act I · Three eras of cost ─────────────────────────────────────── */
/* barColor is a data-viz cost ramp (expensive → cheap), not a brand token —
   except the winner: the tOOrunt row rides `--color-pass`, the same teal that
   marks "autonomous/verified" everywhere else, so "good" is ONE hue site-wide
   rather than two competing greens. Red stays for the manual era; the copilot
   row is a darkened amber. All three now clear the 3:1 non-text guideline on
   the `bg-ground-3` (#eceff4) track (3.05 / 3.69 / 4.87 : 1), and the dollar
   figure is still printed beside every row, so the bar never carries the
   value alone. */
const ERAS = [
  { label: "Manual SDLC", people: "4–6 people", time: "1–2 weeks", cost: "$500–1,000", bar: "100%", barColor: "#d8665e", accent: false },
  { label: "+ AI copilots", people: "4–6 · faster typing", time: "~1 week", cost: "$400–800", bar: "78%", barColor: "#b06a2a", accent: false },
  { label: "tOOrunt AI · auto", people: "0–1 · approvals only", time: "Hours · 2h 36m", cost: "$20–150", bar: "11%", barColor: "var(--color-pass)", accent: true },
];
export function CostErasBeat() {
  return (
    <SectionFrame index="03" label="The economics">
      <div data-fx="rise" className="max-w-3xl">
        <Heading className="text-[length:var(--text-h2)] leading-[1.03]">
          Same ticket. <Accent>Three eras of cost.</Accent>
        </Heading>
      </div>

      {/* Wider and structured: the card is now a real comparison table — three
          equal columns split by hairlines, a consistent row grammar inside each
          (label / price / spec rows), and the chart in its own ruled band
          below. Padding lives on the sections, not the card, so the dividers
          run edge to edge. */}
      {/* Not <Glass>: its baked-in p-6/p-8 would inset the column dividers,
          and overriding it needs an important-modifier arms race. Same shell
          via <Surface>, zero padding — the sections pad themselves. */}
      <Surface data-fx="rise" className="mt-10 overflow-hidden">
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
      </Surface>

      <p data-fx="rise" className="mt-6 text-[15px] text-ink-dim">
        <span className="font-semibold text-ink">~90% lower cost</span> per unit of shipped, reviewed work ·{" "}
        <span className="font-semibold text-ink">10–20×</span> cycle-time compression — weeks become hours.
      </p>
    </SectionFrame>
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
    <SectionFrame index="08" label="Why us">
      <div data-fx="rise" className="max-w-3xl">
        <Heading className="text-[length:var(--text-h2)] leading-[1.04]">
          Everyone sells an agent. <Accent>Nobody sells an accountable team.</Accent>
        </Heading>
      </div>
      <Glass data-fx="rise" className="mt-8 overflow-x-auto">
        {/* min-w matters: a w-full table shrinks to fit, so overflow-x-auto
            never engaged and five columns compressed into slivers on phones */}
        <table className="w-full min-w-[760px] border-collapse text-left">
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
      <p data-fx="rise" className="mt-6 max-w-[62ch] text-[14px] italic text-ink-dim">
        Neither can tell your auditor who approved the merge. We&rsquo;re the only one whose product is the answer to that question.
      </p>
    </SectionFrame>
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
    <SectionFrame index="06" label="Proven fixes">
      <div data-fx="rise" className="max-w-3xl">
        <Heading className="text-[length:var(--text-h2)] leading-[1.03]">
          Anyone can generate code. <Accent>We land proven fixes.</Accent>
        </Heading>
      </div>
      <Glass data-fx="rise" className="mt-8">
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
      <p data-fx="rise" className="mt-6 flex items-baseline gap-3 text-[15px] text-ink-dim">
        <span className="font-display text-[length:var(--text-h2)] font-semibold text-accent-text">
          <CountUp value={76} prefix="~" suffix="%" />
        </span>
        true resolution on SWE-bench Lite — the defensible half nobody else gates on.
      </p>
    </SectionFrame>
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
    <SectionFrame index="07" label="Trust">
      <div data-fx="rise" className="max-w-3xl">
        <Heading className="text-[length:var(--text-h2)] leading-[1.03]">
          Trust is a screen, <Accent>not a promise.</Accent>
        </Heading>
      </div>
      <div data-fx="rise" className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GUARANTEES.map((g) => (
          <Glass key={g.title} className="!p-5">
            <span className="inline-block rounded bg-accent-wash px-2 py-0.5 font-mono text-[11px] text-accent-text">{g.tag}</span>
            <p className="mt-3 font-display text-[18px] font-semibold text-ink">{g.title}</p>
            <p className="mt-1.5 text-[13px] leading-snug text-ink-dim">{g.note}</p>
          </Glass>
        ))}
      </div>
      <p data-fx="rise" className="mt-6 max-w-[62ch] text-[14px] italic text-ink-dim">
        A jailbreak can&rsquo;t talk its way past a gate that&rsquo;s code, not conversation.
      </p>
    </SectionFrame>
  );
}
