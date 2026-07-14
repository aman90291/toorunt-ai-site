import type { Metadata } from "next";
import { Container, Heading, Accent, Eyebrow, SectionRule } from "@/components/ui";
import { BrowserFrame } from "@/components/BrowserFrame";
import { MediaReveal } from "@/components/MediaReveal";
import { ReviewLoop } from "@/components/ReviewLoop";
import { AutonomyDial } from "@/components/AutonomyDial";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Product — how it works",
  description:
    "From a Jira ticket to a merged PR, every step gated: scope, plan, human approval, implement with red→green tests, peer review, gated merge, and post-merge watch.",
  openGraph: { images: ["/og/product.png"] },
};

const PHASES = [
  { n: "01", t: "Ingest & scope", d: "It watches your board, picks up the ticket, and resolves the right GitHub repo — from a curated registry or a semantic match. Ambiguous requirements get a clarifying question, never a guess." },
  { n: "02", t: "Plan & approval gate", d: "It posts an implementation plan to Jira — files, approach, risks, acceptance criteria — and stops. It never writes code before a human sees the plan.", human: true },
  { n: "03", t: "Implement & prove", d: "It implements the change and writes tests until green. For a bug, it writes a reproduction test that is RED before the fix and GREEN after — proof the fix actually fixes the bug." },
  { n: "04", t: "Review orchestration", d: "A second agent reviews a seven-point checklist; a peer bot with a distinct identity reviews the PR. Human comments are handled one by one — fixed, politely rebutted, or asked about." },
  { n: "05", t: "Merge & watch", d: "It merges only on verified-green tests, CI, no conflicts, and review approval — then watches CI and production, raising a revert alert if the change regresses.", human: true },
  { n: "∞", t: "Continuous learning", d: "Every reviewer correction becomes a lesson and a graduated guardrail. The next ticket starts smarter — and the improvement is on the dashboard." },
];

export default function ProductPage() {
  return (
    <>
      <section className="pt-32 pb-16 sm:pt-40">
        <Container>
          <Eyebrow>How it works</Eyebrow>
          <Heading as="h1" split className="mt-6 max-w-3xl text-[clamp(36px,5.5vw,60px)] leading-[1.06]">
            From ticket to merged PR — <Accent>every step gated.</Accent>
          </Heading>
          <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-ink-dim">
            The same five-phase pipeline runs whether you hand DevAgent a one-line product idea or a ticket off your
            existing backlog. A human decides three things; everything else runs inside the gates.
          </p>
        </Container>
      </section>

      {/* Lifecycle walkthrough */}
      <section className="pb-24 sm:pb-28">
        <Container>
          <div className="border-t border-line">
            {PHASES.map((p) => (
              <div key={p.n} className="reveal grid gap-4 border-b border-line py-8 sm:grid-cols-[120px_1fr] sm:gap-10">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-[40px] leading-none text-accent/80 tabular-nums">{p.n}</span>
                </div>
                <div>
                  <h3 className="flex items-center gap-3 font-display text-[24px] text-ink">
                    {p.t}
                    {p.human && (
                      <span className="rounded-sm bg-accent-wash px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-text">
                        human decision
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-ink-dim">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Review loop showpiece */}
      <section className="border-t border-line bg-ground-2/30 py-24 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <SectionRule label="Review" />
              <Heading split className="mt-6 text-[clamp(26px,4vw,40px)] leading-[1.1]">
                It answers review like <Accent>an engineer, not a bot.</Accent>
              </Heading>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-dim">
                Every comment gets one of four honest responses — fix it, disagree with a reason, ask when the intent
                is unclear, or refuse when it&rsquo;s unsafe. The last one is the point.
              </p>
            </div>
            <ReviewLoop />
          </div>
        </Container>
      </section>

      {/* Autonomy dial */}
      <section className="py-24 sm:py-28">
        <Container>
          <SectionRule label="Autonomy" />
          <Heading split className="mt-6 max-w-2xl text-[clamp(26px,4vw,40px)] leading-[1.1]">
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

      {/* Fleet screenshot */}
      <section className="border-t border-line py-24 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <SectionRule label="The fleet" />
              <Heading split className="mt-6 text-[clamp(26px,4vw,40px)] leading-[1.1]">
                A team that routes itself.
              </Heading>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-dim">
                Bots claim tickets atomically, hold file-claim locks so two never touch the same surface, park when
                blocked, and hand off on failover. Who to contact is deterministic — CODEOWNERS, git blame, Jira roles,
                on-call — with a bounded escalation ladder that always terminates.
              </p>
            </div>
            <MediaReveal>
              <BrowserFrame shot="teamsync" url="app.devagent.dev/team" />
            </MediaReveal>
          </div>
        </Container>
      </section>

      <CTASection title="Point it at your backlog." accent="See it ship." sub="A live demo on a repo you choose." />
    </>
  );
}
