import { Container, Heading, Accent, Hot, Button, Eyebrow } from "@/components/ui";
import { Hero } from "@/components/Hero";
import { StickyFeatures } from "@/components/StickyFeatures";
import { Timeline } from "@/components/Timeline";
import { DemoButton } from "@/components/DemoButton";
import { ProblemBeat, CostErasBeat, ProvenFixesBeat, TrustScreenBeat, WhyUsBeat } from "@/components/story";
import { Integrations } from "@/components/Integrations";

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
        {/* `.reveal` is opacity-only now, so the second wrapper that used to
            keep the reveal's transform from clobbering the panel tilt is no
            longer load-bearing — it is kept only because `align` and the
            measure constraint are separate concerns. */}
        <div className={align}>
          <div className="reveal max-w-2xl">{children}</div>
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
        <Heading className="mt-6 text-[length:var(--text-h2)] leading-[1.04]">
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
        <Heading className="mt-6 text-[length:var(--text-h2)] leading-[1.02]">
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
        <Heading className="mt-6 text-[length:var(--text-h2)] leading-[1.02]">
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

      {/* Integrations wall — dark band, logos light up with their brand colour */}
      <Integrations />

      {/* The "On the record" numbers panel that used to sit here was removed —
          the hero's receipt strip already shows the same four RECEIPT figures,
          so this was the one place on the page saying something twice. */}

      {/* 12 · CTA — solid, ends the 3D */}
      <section id="demo" className="relative scroll-mt-24 bg-ground pt-24 pb-32 sm:pt-32">
        <Container className="text-center">
          <Eyebrow>Get started</Eyebrow>
          <Heading as="h2" className="mx-auto mt-6 max-w-4xl text-[length:var(--text-hero)] leading-[0.98]">
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
