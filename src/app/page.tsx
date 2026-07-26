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
  /* The alignment classes must live on the SAME element as the max-width.
     They used to sit on a full-width wrapper around the constrained block —
     and `ml-auto` on an element that already fills its parent moves nothing,
     so `side="right"` silently rendered identical to `side="left"` and the
     alternating panels all stacked down the left edge. */
  const align =
    side === "right" ? "lg:ml-auto" : side === "center" ? "mx-auto text-center" : "";
  return (
    <section
      data-side={side}
      className="relative"
      style={{ paddingBlock: "var(--space-section)" }}
    >
      <Container>
        <div className={`reveal max-w-2xl ${align}`}>{children}</div>
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

      {/* The two "Human decision" panels moved to /product — they sit beside
          the lifecycle phases they gate (plan approval, PR sign-off) instead
          of interrupting the home narrative. */}

      {/* 7 · IDEA → SHIPPED SOFTWARE — the rail leads into the feature walk,
          so the reader sees the journey before the surfaces that run it. */}
      <Timeline />

      {/* 7b · The four core surfaces, as the pinned feature walk. */}
      <StickyFeatures />

      {/* 8 · Proven fixes — 9 · Trust is a screen — 10 · Why us */}
      <ProvenFixesBeat />
      <TrustScreenBeat />
      <WhyUsBeat />

      {/* Integrations wall — dark band, logos light up with their brand colour */}
      <Integrations />

      {/* The receipt figures live on /manifesto (§07) and /book — the home
          hero stays copy-and-canvas only, per the founder's call. */}

      {/* 12 · CTA — dark, so Integrations → CTA → Footer close as ONE charcoal
          bookend instead of a white sliver flashing between two dark slabs. */}
      <section id="demo" className="on-dark relative scroll-mt-24 overflow-hidden bg-ground pt-28 pb-36 sm:pt-36">
        {/* A cobalt bloom rising from below the headline — the Vorflux depth
            move, in our palette. Pure CSS radial gradient, no canvas. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 72% 58% at 50% 82%, color-mix(in srgb, var(--color-accent) 24%, transparent) 0%, color-mix(in srgb, var(--color-accent) 8%, transparent) 34%, transparent 68%)",
          }}
        />
        <Container className="relative z-10 text-center">
          <Heading as="h2" className="mx-auto max-w-4xl text-[length:var(--text-hero)] leading-[0.98]">
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
