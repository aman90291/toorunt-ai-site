import { Container, Heading, Accent, Button, Eyebrow, SectionRule } from "@/components/ui";
import { HeroPipeline } from "@/components/HeroPipeline";
import { StatStrip } from "@/components/StatStrip";
import { BentoGrid, BentoTile, TileTitle, TileBody } from "@/components/Bento";
import { GateChain } from "@/components/GateChain";
import { BrowserFrame } from "@/components/BrowserFrame";
import { AuditTrailTicker } from "@/components/AuditTrailTicker";
import { PricingCalculator } from "@/components/PricingCalculator";
import { CTASection } from "@/components/CTASection";
import { LINES, ECON } from "@/lib/stats";
import type { ShotName } from "@/lib/shots";

const TOUR: { shot: ShotName; url: string; title: string; body: string }[] = [
  { shot: "overview", url: "app.devagent.dev/overview", title: "Mission Control", body: "Every ticket, every stage, right now — value delivered, live lifecycle, and the whole fleet in one glance." },
  { shot: "approvals", url: "app.devagent.dev/approvals", title: "One inbox for every decision", body: "Plans, PRs, infra changes, credential requests — everything a human must decide lands here. Act, and the fleet moves instantly." },
  { shot: "members", url: "app.devagent.dev/members", title: "A bot per teammate", body: "Add a member and DevAgent provisions a dedicated bot — its own credentials, its own integrations, scoped access. Zero shared secrets." },
  { shot: "teamsync", url: "app.devagent.dev/team", title: "Coordinates like a team", body: "Live standup, ticket ownership, failover. Who to contact is deterministic — CODEOWNERS, git blame, Jira roles, on-call — never guessed." },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
            <div>
              <Eyebrow>Governed AI engineering teams</Eyebrow>
              <Heading as="h1" className="mt-6 text-[clamp(40px,6vw,68px)] leading-[1.04]">
                The bottleneck isn&rsquo;t writing code anymore. <Accent>It&rsquo;s accountability.</Accent>
              </Heading>
              <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-ink-dim">{LINES.sub}</p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button href="#demo">Book a demo</Button>
                <Button href="/product/" variant="ghost">See how it ships →</Button>
              </div>
            </div>
            <HeroPipeline />
          </div>
        </Container>
      </section>

      {/* ── Receipt band ─────────────────────────────────────── */}
      <section className="border-t border-line py-6">
        <Container>
          <StatStrip />
          <p className="mt-6 text-center font-mono text-[12px] text-ink-faint">
            A one-line idea became a deployed product. Every step on the record.
          </p>
        </Container>
      </section>

      {/* ── Bento features ───────────────────────────────────── */}
      <section className="py-24 sm:py-28">
        <Container>
          <SectionRule label="What it is" />
          <Heading className="mt-6 max-w-2xl text-[clamp(28px,4vw,44px)] leading-[1.1]">
            Not a copilot. <Accent>A team you can hold accountable.</Accent>
          </Heading>
          <div className="reveal mt-12">
            <BentoGrid>
              <BentoTile span={4}>
                <TileTitle>One bot per human teammate</TileTitle>
                <TileBody>
                  Each bot works your real Jira and GitHub under its own identity, with its own vaulted
                  credentials and scoped access. Your PRs show a real author and a real, different reviewer.
                </TileBody>
                <div className="mt-6 flex items-center gap-2 font-mono text-[12px] text-ink-faint">
                  <span className="rounded bg-ground px-2 py-1">devagent-sam</span>
                  <span>→ reviews →</span>
                  <span className="rounded bg-ground px-2 py-1">devagent-tyler</span>
                </div>
              </BentoTile>
              <BentoTile span={2}>
                <TileTitle>Two modes</TileTitle>
                <TileBody>
                  A one-line idea to a shipped product, or your existing backlog worked ticket by ticket —
                  same governed pipeline.
                </TileBody>
              </BentoTile>

              <BentoTile span={2}>
                <TileTitle>14 hard gates</TileTitle>
                <TileBody>Every change passes the same chain before it can merge. No exceptions, no back doors.</TileBody>
              </BentoTile>
              <BentoTile span={2}>
                <TileTitle>Tamper-evident audit</TileTitle>
                <TileBody>Every action hash-chained. Alter one record and every hash after it breaks. SOC 2-exportable.</TileBody>
              </BentoTile>
              <BentoTile span={2}>
                <TileTitle>Compounding memory</TileTitle>
                <TileBody>Every review correction becomes a lesson and a guardrail — per company, and it doesn&rsquo;t port to a competitor.</TileBody>
              </BentoTile>
            </BentoGrid>
          </div>
        </Container>
      </section>

      {/* ── Gate chain strip ─────────────────────────────────── */}
      <section className="border-y border-line bg-ground-2/30 py-24 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionRule label="The gate chain" />
              <Heading className="mt-6 text-[clamp(28px,4vw,44px)] leading-[1.1]">
                Fourteen gates. Every change. <Accent>No exceptions.</Accent>
              </Heading>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-dim">
                Between &ldquo;the code exists&rdquo; and &ldquo;it may merge&rdquo; sits a chain of checks — each with the
                evidence a non-expert can read. Two of them are human decisions, ringed in clay.
              </p>
              <p className="mt-6 font-display text-[20px] text-ink">{LINES.worstCase}</p>
            </div>
            <GateChain />
          </div>
        </Container>
      </section>

      {/* ── Screenshot tour ──────────────────────────────────── */}
      <section className="py-24 sm:py-28">
        <Container>
          <SectionRule label="The product" />
          <Heading className="mt-6 max-w-2xl text-[clamp(28px,4vw,44px)] leading-[1.1]">
            Trust is a screen, <Accent>not a promise.</Accent>
          </Heading>
          <div className="mt-14 flex flex-col gap-20">
            {TOUR.map((t, i) => (
              <div
                key={t.shot}
                className={`reveal grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14 ${i % 2 ? "lg:[&>figure]:order-first" : ""}`}
              >
                <div>
                  <h3 className="font-display text-[26px] text-ink">{t.title}</h3>
                  <p className="mt-3 max-w-md text-[16px] leading-relaxed text-ink-dim">{t.body}</p>
                </div>
                <BrowserFrame shot={t.shot} url={t.url} priority={i === 0} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Economics ────────────────────────────────────────── */}
      <section className="border-t border-line py-24 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionRule label="Economics" />
              <Heading className="mt-6 text-[clamp(28px,4vw,44px)] leading-[1.1]">
                A merged PR costs us <Accent>${ECON.cogsLow}&ndash;{ECON.cogsHigh}.</Accent>
              </Heading>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-dim">
                Only three layers of the pipeline call a model. The other nine — gates, routing, merge arithmetic,
                secret scans, audit, billing — are deterministic code, at zero tokens. So we know our cost per PR to
                the dollar, and price it at a fraction of the ${ECON.humanLow}&ndash;${ECON.humanHigh} a human PR costs.
              </p>
              <div className="mt-8">
                <Button href="/pricing/" variant="ghost">See the pricing →</Button>
              </div>
            </div>
            <div className="grid gap-4">
              <PricingCalculator compact />
              <AuditTrailTicker />
            </div>
          </div>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <CTASection
        id="demo"
        eyebrow="Get started"
        title="Clear your backlog"
        accent="overnight."
        sub="See DevAgent ship a real change end-to-end — on a repo you choose."
      />
    </>
  );
}
