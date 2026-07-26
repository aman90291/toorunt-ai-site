import type { Metadata } from "next";
import { Container, Heading, Accent, Eyebrow, SectionRule, Button } from "@/components/ui";
import { BrowserFrame } from "@/components/BrowserFrame";
import { MediaReveal } from "@/components/MediaReveal";
import { ReviewLoop } from "@/components/ReviewLoop";
import { AutonomyDial } from "@/components/AutonomyDial";
import { CTASection } from "@/components/CTASection";
import { DemoButton } from "@/components/DemoButton";
import { GATES } from "@/lib/gates";

export const metadata: Metadata = {
  title: "Product — how it works",
  description:
    "From a Jira ticket to a merged PR, every step gated: scope, plan, human approval, implement with red→green tests, peer review, gated merge, and post-merge watch.",
  openGraph: { images: ["/og/product.png"] },
};

/* Each phase carries the 1-indexed gates it clears (from lib/gates.ts), so
   the walkthrough can show the chain instead of just claiming it. Three
   phases are human-gated — matching gates 04 / 12 / 13 exactly. */
const PHASES: { n: string; t: string; d: string; human?: boolean; gates: number[] }[] = [
  { n: "01", t: "Ingest & scope", d: "It watches your board, picks up the ticket, and resolves the right GitHub repo — from a curated registry or a semantic match. Ambiguous requirements get a clarifying question, never a guess.", gates: [1, 2, 3] },
  { n: "02", t: "Plan & approval gate", d: "It posts an implementation plan to Jira — files, approach, risks, acceptance criteria — and stops. It never writes code before a human sees the plan.", human: true, gates: [4, 5] },
  { n: "03", t: "Implement & prove", d: "It implements the change and writes tests until green. For a bug, it writes a reproduction test that is RED before the fix and GREEN after — proof the fix actually fixes the bug.", gates: [6, 7, 8, 9, 10] },
  { n: "04", t: "Review orchestration", d: "A second agent reviews a seven-point checklist; a peer bot with a distinct identity reviews the PR. Human comments are handled one by one — fixed, politely rebutted, or asked about.", human: true, gates: [11, 12] },
  { n: "05", t: "Merge & watch", d: "It merges only on verified-green tests, CI, no conflicts, and review approval — then watches CI and production, raising a revert alert if the change regresses.", human: true, gates: [13, 14] },
  { n: "∞", t: "Continuous learning", d: "Every reviewer correction becomes a lesson and a graduated guardrail. The next ticket starts smarter — and the improvement is on the dashboard.", gates: [] },
];

/* Short gate names for the chips, keyed by 1-indexed gate number. */
const GATE_SHORT = ["right repo", "requirements", "dependencies", "plan approved", "novelty", "rework", "tests green", "quality", "coverage", "no secrets", "risk cap", "review signed", "merged", "watched"];

/* The three human decisions — one card each, named the way the home timeline
   names them. Copy adds information beyond the phase rows above. */
const DECISIONS = [
  {
    n: "01",
    t: "Sign the PRD",
    d: "The plan waits in Jira until you reply /approve — or /reject with a reason it has to answer. In auto-with-veto mode this becomes a timed window: it proceeds unless you object.",
    gate: "gate 04",
  },
  {
    n: "02",
    t: "Approve the PR",
    d: "By the time it reaches you, a peer bot with its own GitHub identity has already torn the change apart once. Your review is the second signature, not the first line of defense.",
    gate: "gate 12",
  },
  {
    n: "03",
    t: "Unlock the merge",
    d: "The merge button only arms on verified-green: tests, CI, zero conflicts, review approval. Your click is the last gate — and the watch that follows it is automatic.",
    gate: "gate 13",
  },
];

export default function ProductPage() {
  return (
    <>
      <section className="pt-32 pb-16 sm:pt-40">
        <Container>
          <Eyebrow>How it works</Eyebrow>
          <Heading as="h1" className="mt-6 max-w-3xl text-[length:var(--text-hero)] leading-[1.06]">
            From ticket to merged PR — <Accent>every step gated.</Accent>
          </Heading>
          <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-ink-dim">
            The same five-phase pipeline runs whether you hand tOOrunt AI a one-line product idea or a ticket off your
            existing backlog. A human decides three things; everything else runs inside the gates.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <DemoButton>Book a demo</DemoButton>
            <Button href="/security/" variant="ghost">
              See the 14 gates →
            </Button>
          </div>
          {/* Proof before prose: the product's own Mission Control, first. */}
          <div className="mt-14">
            <MediaReveal>
              <BrowserFrame shot="overview" priority url="app.toorunt.ai" />
            </MediaReveal>
          </div>
        </Container>
      </section>

      {/* Lifecycle walkthrough — each phase shows the gates it clears */}
      <section className="pb-24 sm:pb-28">
        <Container>
          <div className="border-t border-line">
            {PHASES.map((p) => (
              <div key={p.n} className="reveal grid gap-4 border-b border-line py-8 sm:grid-cols-[120px_1fr] sm:gap-10">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-[40px] leading-none text-accent-text/80 tabular-nums">{p.n}</span>
                </div>
                <div>
                  <h2 className="flex items-center gap-3 font-display text-[length:var(--text-h3)] text-ink">
                    {p.t}
                    {p.human && (
                      <span className="rounded-sm bg-accent-wash px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-text">
                        human decision
                      </span>
                    )}
                  </h2>
                  <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-ink-dim">{p.d}</p>
                  {p.gates.length > 0 && (
                    <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.1em]">
                      {p.gates.map((g) => {
                        const human = GATES[g - 1].actor === "human";
                        return (
                          <span key={g} className={human ? "font-semibold text-accent-text" : "text-ink-faint"}>
                            <span className="tabular-nums">{String(g).padStart(2, "0")}</span> {GATE_SHORT[g - 1]}
                            {/* colour+weight alone isn't a cue AT can hear */}
                            {human && <span className="sr-only"> (human gate)</span>}
                          </span>
                        );
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* The three human decisions — the pipeline's punctuation, beside the
          inbox where they actually happen. */}
      <section className="border-t border-line py-24 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div>
              <SectionRule label="Human decisions" />
              <Heading className="mt-6 text-[length:var(--text-h2)] leading-[1.08]">
                Three decisions. <Accent>All yours, only yours.</Accent>
              </Heading>
              <ol role="list" className="mt-9 list-none space-y-7">
                {DECISIONS.map((d) => (
                  <li key={d.n} className="border-l-2 border-accent-text pl-5">
                    <h3 className="flex items-baseline gap-3 font-display text-[18px] font-semibold text-ink">
                      {d.t}
                      <span className="font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-ink-faint">
                        {d.gate}
                      </span>
                    </h3>
                    <p className="mt-1.5 max-w-[52ch] text-[14.5px] leading-relaxed text-ink-dim">{d.d}</p>
                  </li>
                ))}
              </ol>
            </div>
            <MediaReveal>
              <BrowserFrame shot="approvals" url="app.toorunt.ai/approvals" />
            </MediaReveal>
          </div>
        </Container>
      </section>

      {/* Review loop showpiece */}
      <section className="border-t border-line bg-ground-2 py-24 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <SectionRule label="Review" />
              <Heading className="mt-6 text-[length:var(--text-h2)] leading-[1.08]">
                It answers review like <Accent>an engineer, not a bot.</Accent>
              </Heading>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-dim">
                Every comment gets one of four honest responses — fix it, disagree with a reason, ask when the intent
                is unclear, or refuse when it&rsquo;s unsafe. The last one is the point.
              </p>
            </div>
            <ReviewLoop />
          </div>
          {/* The page's proof peak earns its own quiet ask. */}
          <div className="mt-14 flex flex-wrap items-center gap-5 border-t border-line pt-8">
            <p className="text-[15px] text-ink-dim">Watch it answer review on your own repo.</p>
            <DemoButton>Book a demo</DemoButton>
          </div>
        </Container>
      </section>

      {/* Autonomy dial */}
      <section className="py-24 sm:py-28">
        <Container>
          <SectionRule label="Autonomy" />
          <Heading className="mt-6 max-w-2xl text-[length:var(--text-h2)] leading-[1.08]">
            You choose how much rope. <Accent>It&rsquo;s a config, not a rebuild.</Accent>
          </Heading>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-dim">
            Start with a human on every plan and PR. Earn your way to full autonomy as the track record builds — the
            envelope widens on post-merge evidence and snaps back on a single regression.
          </p>
          <div className="mt-10">
            <AutonomyDial />
          </div>
        </Container>
      </section>

      {/* Fleet — the deep cut, not the home-page card again */}
      <section className="border-t border-line py-24 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <SectionRule label="The fleet" />
              <Heading className="mt-6 text-[length:var(--text-h2)] leading-[1.08]">
                Ten bots, <Accent>zero collisions.</Accent>
              </Heading>
              <dl className="mt-8 space-y-5">
                {[
                  ["Atomic claims", "A ticket is claimed exactly once — two bots can race for it, one wins, the other moves on."],
                  ["File-claim locks", "Every bot declares the files it will touch before it starts; overlapping claims queue instead of colliding."],
                  ["Park & failover", "Blocked on a dependency, a bot parks the ticket with its state intact — any peer can resume it from the record."],
                  ["Escalation ladder", "Who to contact is deterministic — CODEOWNERS, git blame, Jira roles, on-call — and the ladder is bounded, so it always terminates."],
                ].map(([t, d]) => (
                  <div key={t}>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-text">{t}</dt>
                    <dd className="mt-1 max-w-md text-[14.5px] leading-relaxed text-ink-dim">{d}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <MediaReveal>
              <BrowserFrame shot="teamsync" url="app.toorunt.ai/team" />
            </MediaReveal>
          </div>
        </Container>
      </section>

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
