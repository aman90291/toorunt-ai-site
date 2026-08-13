import type { Metadata } from "next";
import { SectionFrame, Heading, Accent, Button } from "@/components/ui";
import { ReviewLoop } from "@/components/ReviewLoop";
import { AutonomyDial } from "@/components/AutonomyDial";
import { CTASection } from "@/components/CTASection";
import { DemoButton } from "@/components/DemoButton";
import { Timeline } from "@/components/Timeline";
import { GATES } from "@/lib/gates";
import { PageHead } from "@/components/system/PageHead";
import { Panel, StatusDot } from "@/components/system/Panel";
import { ControlPlane } from "@/components/system/ControlPlane";
import { Signatures } from "@/components/system/blocks";

export const metadata: Metadata = {
  title: "Product: how it works",
  description:
    "From a Jira ticket to a merged PR, every step gated: scope, plan, human approval, implement with red to green tests, peer review, gated merge, and post merge watch.",
  openGraph: { images: ["/og/product.png"] },
};

/**
 * /product — rebuilt in the instrument language (components/system/*).
 *
 * The page's job is to answer "what actually happens to my ticket", so it is
 * ordered as the ticket experiences it: the rail (where am I), the phases
 * (what runs), the surfaces (where I watch it), my three signatures, then the
 * two things people ask about most once they believe the rest — how it
 * handles review pushback, and how much rope they can give it.
 *
 * `<ControlPlane>` and `<Signatures>` are the same components the home page
 * uses. That is deliberate: a reader arriving here from home should recognise
 * the instrument, not meet a second rendering of the same four surfaces.
 */

/* Each phase carries the 1-indexed gates it clears (from lib/gates.ts), so the
   walkthrough shows the chain rather than claiming it. Copy unchanged. */
const PHASES: { n: string; t: string; d: string; human?: boolean; gates: number[] }[] = [
  { n: "01", t: "Ingest & scope", d: "It watches your board, picks up the ticket, and resolves the right GitHub repo from a curated registry or a semantic match. Ambiguous requirements get a clarifying question, never a guess.", gates: [1, 2, 3] },
  { n: "02", t: "Plan & approval gate", d: "It posts an implementation plan to Jira: files, approach, risks, and acceptance criteria, then stops. It never writes code before a human sees the plan.", human: true, gates: [4, 5] },
  { n: "03", t: "Implement & prove", d: "It implements the change and writes tests until green. For a bug, it writes a reproduction test that is RED before the fix and GREEN after. This proves the fix actually fixes the bug.", gates: [6, 7, 8, 9, 10] },
  { n: "04", t: "Review orchestration", d: "A second agent reviews a seven point checklist; a peer bot with a distinct identity reviews the PR. Human comments are handled one by one: fixed, politely rebutted, or asked about.", human: true, gates: [11, 12] },
  { n: "05", t: "Merge & watch", d: "It merges only on verified green tests, CI, no conflicts, and review approval, then watches CI and production, raising a revert alert if the change regresses.", human: true, gates: [13, 14] },
  { n: "∞", t: "Continuous learning", d: "Every reviewer correction becomes a lesson and a graduated guardrail. The next ticket starts smarter and the improvement is on the dashboard.", gates: [] },
];

/* Short gate names for the chips, keyed by 1-indexed gate number. */
const GATE_SHORT = ["right repo", "requirements", "dependencies", "plan approved", "novelty", "rework", "tests green", "quality", "coverage", "no secrets", "risk cap", "review signed", "merged", "watched"];

const FLEET = [
  ["Atomic claims", "A ticket is claimed exactly once. Two bots can race for it, one wins, and the other moves on."],
  ["File claim locks", "Every bot declares the files it will touch before it starts; overlapping claims queue instead of colliding."],
  ["Park & failover", "Blocked on a dependency, a bot parks the ticket with its state intact. Any peer can resume it from the record."],
  ["Escalation ladder", "Who to contact is deterministic: CODEOWNERS, git blame, Jira roles, and on call. The ladder is bounded, so it always terminates."],
];

export default function ProductPage() {
  return (
    <>
      <PageHead
        flavor="product"
        label="How it works"
        title="From ticket to merged PR"
        accent="every step gated."
        lead="The same five phase pipeline runs whether you hand tOOrunt AI a one line product idea or a ticket off your existing backlog. A human decides three things; everything else runs inside the gates."
        readouts={[
          ["phases", "5"],
          ["gates cleared", String(GATES.length)],
          ["your signatures", "3"],
          ["cycle", "hours"],
        ]}
        actions={
          <>
            <DemoButton>Book a demo</DemoButton>
            <Button href="/security/" variant="ghost">See the 14 gates →</Button>
          </>
        }
      />

      {/* The rail — overview before detail. */}
      <Timeline />

      <SectionFrame index="01" label="The pipeline" motion="sequence">
        <div data-fx="rise">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            Five phases. <Accent>Each one clears its gates or stops.</Accent>
          </Heading>
          <div className="mt-[var(--space-block)]">
            <Panel label="lifecycle" status="5 phases" tone="live" flush>
              <ol data-fx="seq">
                {PHASES.map((p, i) => (
                  <li
                    key={p.n}
                    style={{ ["--i" as string]: i }}
                    className="grid gap-3 border-b border-line p-5 last:border-b-0 sm:grid-cols-[64px_1fr] sm:gap-6 sm:px-6"
                  >
                    <span className="font-display text-[30px] leading-none tabular-nums text-accent-text/70">
                      {p.n}
                    </span>
                    <div className="min-w-0">
                      <h3 className="flex flex-wrap items-center gap-2.5 font-display text-[19px] font-semibold text-ink">
                        {p.t}
                        {p.human && (
                          <span className="flex items-center gap-1.5 rounded-sm border border-accent-text/40 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.12em] text-accent-text">
                            <StatusDot tone="human" />
                            human
                          </span>
                        )}
                      </h3>
                      <p className="mt-2 max-w-[62ch] text-[14.5px] leading-relaxed text-ink-dim">{p.d}</p>
                      {p.gates.length > 0 && (
                        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.1em]">
                          {p.gates.map((g) => {
                            const human = GATES[g - 1].actor === "human";
                            return (
                              <span key={g} className={human ? "font-semibold text-accent-text" : "text-ink-faint"}>
                                <span className="tabular-nums">{String(g).padStart(2, "0")}</span>{" "}
                                {GATE_SHORT[g - 1]}
                                {/* colour + weight alone is not a cue AT can hear */}
                                {human && <span className="sr-only"> (human gate)</span>}
                              </span>
                            );
                          })}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        </div>
      </SectionFrame>

      <SectionFrame index="02" label="The surfaces" motion="dock">
        <div data-fx="rise">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            Where you watch it <Accent>actually happen.</Accent>
          </Heading>
          <div className="mt-[var(--space-block)]">
            <ControlPlane />
          </div>
        </div>
      </SectionFrame>

      <SectionFrame index="03" label="Your seat" motion="orbit">
        <div data-fx="rise">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            Three decisions. <Accent>All yours, only yours.</Accent>
          </Heading>
          <div className="mt-[var(--space-block)]">
            <Signatures />
          </div>
        </div>
      </SectionFrame>

      <SectionFrame index="04" label="Review" motion="conversation">
        <div data-fx="rise">
          <Heading className="max-w-[22ch] text-[length:var(--text-h2)] leading-[1.05]">
            It answers review like <Accent>an engineer, not a bot.</Accent>
          </Heading>
          <p className="mt-5 max-w-[58ch] text-[16.5px] leading-relaxed text-ink-dim">
            Every comment gets one of four honest responses: fix it, disagree with a reason, ask
            when the intent is unclear, or refuse when it&rsquo;s unsafe. The last one is the point.
          </p>
          <div className="mt-[var(--space-block)]">
            <Panel label="review loop" status="4 responses" tone="auto">
              <ReviewLoop />
            </Panel>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <p className="text-[15px] text-ink-dim">Watch it answer review on your own repo.</p>
            <DemoButton>Book a demo</DemoButton>
          </div>
        </div>
      </SectionFrame>

      <SectionFrame index="05" label="Autonomy" motion="dial">
        <div data-fx="rise">
          <Heading className="max-w-[22ch] text-[length:var(--text-h2)] leading-[1.05]">
            You choose how much rope. <Accent>It&rsquo;s a config, not a rebuild.</Accent>
          </Heading>
          <p className="mt-5 max-w-[58ch] text-[16.5px] leading-relaxed text-ink-dim">
            Start with a human on every plan and PR. Earn your way to full autonomy as the track
            record builds. The envelope widens on post merge evidence and snaps back on a single
            regression.
          </p>
          <div className="mt-[var(--space-block)]">
            <Panel label="autonomy envelope" status="config" tone="human">
              <AutonomyDial />
            </Panel>
          </div>
        </div>
      </SectionFrame>

      <SectionFrame index="06" label="The fleet" motion="spread">
        <div data-fx="rise">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            Ten bots, <Accent>zero collisions.</Accent>
          </Heading>
          <div className="mt-[var(--space-block)]">
            <Panel label="fleet coordination" status="deterministic" tone="auto" flush>
              <dl data-fx="seq" className="grid grid-cols-1 md:grid-cols-2">
                {FLEET.map(([t, d], i) => (
                  <div
                    key={t}
                    style={{ ["--i" as string]: i }}
                    className="border-b border-line p-5 sm:p-6 md:[&:nth-child(odd)]:border-r"
                  >
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-text">{t}</dt>
                    <dd className="mt-2.5 text-[14px] leading-relaxed text-ink-dim">{d}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>
        </div>
      </SectionFrame>

      <CTASection
        title="Point it at your backlog."
        accent="See it ship."
        sub="A live demo on a repo you choose."
        secondaryHref="/pricing/"
        secondaryLabel="See pricing →"
      />
    </>
  );
}
