import { Container, Heading, Accent, Eyebrow } from "@/components/ui";
import { CountUp } from "@/components/CountUp";
import type { ReactNode } from "react";

/** Full-screen story beat. `side` feeds the 3D model-avoidance. */
function Beat({ side = "left", id, children }: { side?: "left" | "right" | "center"; id?: string; children: ReactNode }) {
  return (
    <section data-side={side} id={id} className="relative flex min-h-screen items-center py-24">
      <Container>{children}</Container>
    </section>
  );
}

/** A legible card for dense beats sitting over the live 3D. Near-opaque (no
 *  backdrop-blur — blurring an animated WebGL backdrop every frame is a GPU sink). */
function Glass({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-card)] border border-line bg-ground-2/90 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

/* ── Act I · The problem ────────────────────────────────────────────── */
export function ProblemBeat() {
  return (
    <Beat side="center">
      <div className="reveal txt-legible mx-auto max-w-4xl text-center">
        <Eyebrow>Act I · The shift</Eyebrow>
        <Heading className="perspective-3d mt-6 text-[clamp(28px,4.4vw,58px)] leading-[1.06]">
          The code is already written by AI. <Accent>Nobody owns accountability for it.</Accent>
        </Heading>
        <div className="mt-12 grid grid-cols-1 gap-10 sm:mt-16 sm:grid-cols-2">
          <div>
            <div className="font-display text-[clamp(60px,11vw,128px)] font-semibold leading-[0.9] tracking-[-0.03em] text-accent-text">
              <CountUp value={75} suffix="%" />
            </div>
            <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-ink-dim">
              of Google&rsquo;s new code is AI-generated — and still approved by engineers.
            </p>
          </div>
          <div>
            <div className="font-display text-[clamp(60px,11vw,128px)] font-semibold leading-[0.9] tracking-[-0.03em] text-accent-text">
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
const ERAS = [
  { label: "Manual SDLC", people: "4–6 people", time: "1–2 weeks", cost: "$500–1,000", bar: "100%", accent: false },
  { label: "+ AI copilots", people: "4–6 · faster typing", time: "~1 week", cost: "$400–800", bar: "78%", accent: false },
  { label: "Toorunt AI · auto", people: "0–1 · approvals only", time: "Hours · 2h 36m", cost: "$10–50", bar: "6%", accent: true },
];
export function CostErasBeat() {
  return (
    <Beat side="right">
      <div className="reveal txt-legible ml-auto max-w-2xl">
        <Eyebrow>Act I · The economics</Eyebrow>
        <Heading className="perspective-3d mt-6 text-[clamp(30px,4.4vw,60px)] leading-[1.03]">
          Same ticket. <Accent>Three eras of cost.</Accent>
        </Heading>
      </div>
      <Glass className="reveal mt-8 ml-auto max-w-3xl">
        <div className="grid grid-cols-3 gap-4">
          {ERAS.map((e) => (
            <div key={e.label} className={`flex flex-col gap-2 rounded-lg p-3 ${e.accent ? "bg-accent-wash" : ""}`}>
              <p className={`font-mono text-[10px] uppercase tracking-[0.12em] ${e.accent ? "text-accent-text" : "text-ink-faint"}`}>{e.label}</p>
              <p className={`font-display text-[clamp(20px,2.4vw,30px)] font-semibold leading-none ${e.accent ? "text-accent-text" : "text-ink"}`}>{e.cost}</p>
              <p className="text-[12px] text-ink-dim">{e.people}</p>
              <p className="text-[12px] text-ink-dim">{e.time}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-2.5">
          {ERAS.map((e) => (
            <div key={e.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-right font-mono text-[10px] text-ink-faint">{e.cost}</span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-ground-3">
                <span className={`block h-full rounded-full ${e.accent ? "bg-accent-text" : "bg-line-2"}`} style={{ width: e.bar }} />
              </span>
            </div>
          ))}
        </div>
      </Glass>
      <p className="reveal mt-6 ml-auto max-w-3xl text-[15px] text-ink-dim">
        <span className="font-semibold text-ink">~95% lower cost</span> per unit of shipped, reviewed work ·{" "}
        <span className="font-semibold text-ink">10–20×</span> cycle-time compression — weeks become hours.
      </p>
    </Beat>
  );
}

/* ── Act III · Why us (competitive) ─────────────────────────────────── */
const COMPARE = {
  cols: ["Claude Cowork", "Devin", "Toorunt AI"],
  rows: [
    ["Unit of value", "One person’s session", "One task → one PR", "An accountable team"],
    ["Identity", "The user’s own", "One shared org agent", "Per-bot Jira + GitHub identities"],
    ["Review", "—", "Your humans review it", "Bot-to-bot adversarial review — gates the merge"],
    ["Governance", "Folder / tool permissions", "SSO + VPC + logs", "14 gates · hash-chained audit · vault · kill switch"],
    ["Cost model", "Subscription", "Usage ACUs, open-ended", "3 LLM layers · capped · $10–50/PR, to the dollar"],
  ],
};
export function WhyUsBeat() {
  return (
    <Beat side="left">
      <div className="reveal txt-legible max-w-3xl">
        <Eyebrow>Act III · The business</Eyebrow>
        <Heading className="perspective-3d mt-6 text-[clamp(28px,4.2vw,56px)] leading-[1.04]">
          Everyone sells an agent. <Accent>Nobody sells an accountable team.</Accent>
        </Heading>
      </div>
      <Glass className="reveal mt-8 max-w-4xl overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="w-[22%]" />
              {COMPARE.cols.map((c, i) => (
                <th
                  key={c}
                  className={`px-3 pb-3 align-bottom font-display text-[14px] font-semibold ${i === 2 ? "text-accent-text" : "text-ink-dim"}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.rows.map((r) => (
              <tr key={r[0]} className="border-t border-line align-top">
                <td className="py-3 pr-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">{r[0]}</td>
                {r.slice(1).map((cell, i) => (
                  <td
                    key={i}
                    className={`px-3 py-3 text-[13px] leading-snug ${i === 2 ? "rounded-sm bg-accent-wash font-medium text-ink" : "text-ink-dim"}`}
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
      <div className="reveal txt-legible ml-auto max-w-3xl text-right">
        <Eyebrow>Act II · Our USP</Eyebrow>
        <Heading className="perspective-3d mt-6 text-[clamp(30px,4.4vw,60px)] leading-[1.03]">
          Anyone can generate code. <Accent>We land proven fixes.</Accent>
        </Heading>
      </div>
      <Glass className="reveal mt-8 ml-auto max-w-4xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAGES.map((s, i) => (
            <div key={s.name} className={`rounded-lg border p-4 ${i === 3 ? "border-accent-text/40 bg-accent-wash" : "border-line bg-ground/40"}`}>
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
        <span className="font-display text-[clamp(28px,3.4vw,40px)] font-semibold text-accent-text">
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
      <div className="reveal txt-legible max-w-3xl">
        <Eyebrow>Act II · The answer</Eyebrow>
        <Heading className="perspective-3d mt-6 text-[clamp(30px,4.4vw,60px)] leading-[1.03]">
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
