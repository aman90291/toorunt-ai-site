import { Container, Heading, Accent, Hot, Button, Eyebrow } from "@/components/ui";
import { Hero } from "@/components/Hero";
import { StickyFeatures } from "@/components/StickyFeatures";
import { Timeline } from "@/components/Timeline";
import { DemoButton } from "@/components/DemoButton";
import { ProblemBeat, CostErasBeat, ProvenFixesBeat, TrustScreenBeat, WhyUsBeat } from "@/components/story";
import { RECEIPT } from "@/lib/stats";

/** A text panel that sits over the fixed 3D scene. */
function Panel({
  side = "left",
  children,
}: {
  side?: "left" | "right" | "center";
  children: React.ReactNode;
}) {
  const align =
    side === "right" ? "lg:ml-auto lg:text-left" : side === "center" ? "mx-auto text-center" : "";
  return (
    <section
      data-side={side}
      className="relative"
      style={{ paddingBlock: "var(--space-section)" }}
    >
      <Container>
        {/* Two elements, deliberately. `.reveal` animates transform, and a
            running animation's transform WINS over a base transform
            declaration — sharing one element silently reduced the tilt to the
            reveal's identity matrix with no error anywhere.

            tilt-stage is also applied per panel rather than once around the
            page: it transforms, and a transformed ancestor would capture the
            fixed nav and demo dialog as its containing block. */}
        <div className={`tilt-stage ${align}`}>
          <div className="reveal txt-legible max-w-2xl">{children}</div>
        </div>
      </Container>
    </section>
  );
}

export default function Home() {
  return (
    <>
      {/* 1 · Hero */}
      <Hero />

      {/* 2 · The problem — 75% / 95% */}
      <ProblemBeat />

      {/* 3 · What it is — the thesis */}
      <Panel side="right">
        <Eyebrow>What it is</Eyebrow>
        <Heading split className="perspective-3d mt-6 text-[length:var(--text-h2)] leading-[1.04]">
          We don&rsquo;t sell the brain. <Accent>We sell the organization that brain works inside.</Accent>
        </Heading>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-dim">
          The Jira board. The reviewers. The QA gates. The on-call rotation. The audit trail. The
          accountability structure a real engineering team runs on.
        </p>
      </Panel>

      {/* 4 · Three eras of cost */}
      <CostErasBeat />

      {/* 5 · The approval gate */}
      <Panel side="left">
        <Eyebrow>Human decision · 01</Eyebrow>
        <Heading split className="perspective-3d mt-6 text-[length:var(--text-h2)] leading-[1.02]">
          It never writes code <Accent>before you approve the plan.</Accent>
        </Heading>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-dim">
          The bot posts an implementation plan to Jira — files, approach, risks, acceptance criteria — and
          stops at the first human gate. One of two decisions you actually make.
        </p>
      </Panel>

      {/* 6 · Peer review + sign-off */}
      <Panel side="right">
        <Eyebrow>Human decision · 02</Eyebrow>
        <Heading split className="perspective-3d mt-6 text-[length:var(--text-h2)] leading-[1.02]">
          Two bots review each other. <Accent>You sign off the PR.</Accent>
        </Heading>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-dim">
          A peer bot with its own GitHub identity reviews the change — a real, adversarial pass — then it
          waits for your approval before the second gate opens.
        </p>
      </Panel>

      {/* 7 · The four core surfaces, as a scroll-driven sticky stack. */}
      <StickyFeatures />

      {/* 7b · IDEA → SHIPPED SOFTWARE. Strictly visual, strictly scroll-driven. */}
      <Timeline />

      {/* 8 · Proven fixes — 9 · Trust is a screen — 10 · Why us */}
      <ProvenFixesBeat />
      <TrustScreenBeat />
      <WhyUsBeat />

      {/* 11 · The numbers — crane overview. */}
      <Panel side="center">
        <Eyebrow>On the record</Eyebrow>
        <Heading split className="perspective-3d mt-6 text-[length:var(--text-h2)] leading-[1.02]">
          One evening. One product. <Accent>Three decisions.</Accent>
        </Heading>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
          {RECEIPT.map((r) => (
            <div key={r.label}>
              <div className="font-display text-[length:var(--text-figure)] leading-none tabular-nums text-ink">
                {r.value}
              </div>
              <div className="mt-2 text-[13px] text-ink-dim">{r.label}</div>
            </div>
          ))}
        </div>
      </Panel>

      {/* 12 · CTA — solid, ends the 3D */}
      <section id="demo" className="relative scroll-mt-24 bg-ground pt-24 pb-32 sm:pt-32">
        <Container className="text-center">
          <Eyebrow>Get started</Eyebrow>
          <Heading as="h2" split className="perspective-3d mx-auto mt-6 max-w-4xl text-[length:var(--text-hero)] leading-[0.98]">
            Every company will employ engineers that aren&rsquo;t people.{" "}
            <Hot>We make them accountable.</Hot>
          </Heading>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <DemoButton>Book a demo</DemoButton>
            <Button href="/product/" variant="ghost">See how it works →</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
