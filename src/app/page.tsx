import { Container, Heading, Accent, Hot, Button, SectionFrame } from "@/components/ui";
import { GlobeHero } from "@/components/hero/GlobeHero";
import { DemoButton } from "@/components/DemoButton";
import { Integrations } from "@/components/Integrations";
import { Receipts } from "@/components/Receipts";
import { SystemSequence } from "@/components/system/SystemSequence";
import { CostLedger, FieldScanner, GapConvergence, GateWorkflow, SurfaceStack } from "@/components/home/HomeScenes";
import { DecisionCarousel } from "@/components/home/DecisionCarousel";

/**
 * The home page.
 *
 * Each chapter has its own visual argument. The opening gap converges two
 * figures; product surfaces stack; gates read as a drawn workflow; human
 * decisions move horizontally; the cost ledger wipes open; the field closes
 * as an opposing-column scanner. Repeating data-system cues still hold the
 * page together, but no chapter inherits another chapter's composition.
 *
 * The narrative underneath is unchanged and deliberate:
 *
 *   hero    the claim, and a field to interrogate it
 *   01      why this matters — the accountability gap, in two numbers
 *   02      what we actually sell — four stacked product surfaces
 *   03      the mechanism — fourteen gates, drawn as a workflow
 *   04      where you sit in it — three sliding signatures
 *   05      what it costs — a comparative ledger
 *   06      why not the others — a split market scanner
 *   —       integrations, receipts, ask
 *
 * Problem → product → mechanism → your control → price → alternatives. A
 * reader who bails after any one section has still been told something whole.
 *
 * The seven-node "idea → shipped" rail remains on /product, where it has room
 * to be that page's spine rather than duplicating the fourteen-gate workflow.
 */
export default function Home() {
  return (
    <>
      <GlobeHero />
      <SystemSequence />

      {/* 01 · paired figures converge while the section enters. */}
      <SectionFrame index="01" label="The gap" motion="split" wide className="home-frame home-frame-gap">
        <div data-fx="rise" className="home-gap-intro">
          <Heading className="max-w-[19ch] text-[length:var(--text-h2)] leading-[1.05]">
            The code is already written by AI. <Accent>Nobody owns accountability for it.</Accent>
          </Heading>
          <p>
            Adoption and impact are moving in opposite directions. The missing layer is not another model —
            it is the system that can prove who decided, who reviewed, and why the work shipped.
          </p>
        </div>
        <GapConvergence />
      </SectionFrame>

      {/* 02 · four real surfaces form a sticky, overlapping card stack. */}
      <SectionFrame index="02" label="The product" motion="dock" wide className="home-frame home-frame-product home-frame-sticky">
        <div data-fx="rise" className="home-product-scene-lead home-chapter-intro">
          <Heading className="max-w-[22ch] text-[length:var(--text-h2)] leading-[1.05]">
            Not another brain. <Accent>An accountable team.</Accent>
          </Heading>
          <div>
            <p>
              The Jira board. The reviewers. The QA gates. The on-call rotation. The audit trail — the
              accountability structure a real engineering team runs on.
            </p>
            <span>04 surfaces · one accountable record</span>
          </div>
        </div>
        <SurfaceStack />
      </SectionFrame>

      {/* 03 · a workflow ledger draws all fourteen deterministic steps. */}
      <SectionFrame index="03" label="The chain" motion="sequence" wide className="home-frame home-frame-chain">
        <div data-fx="rise" className="home-chain-lead">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            Fourteen gates. <Accent>No path around them.</Accent>
          </Heading>
          <p>
            Every change clears all fourteen before it can merge. Gate verdicts are deterministic code,
            not a conversation — a jailbreak can&rsquo;t talk its way past one.
          </p>
        </div>
        <GateWorkflow />
      </SectionFrame>

      {/* 04 · the three human signatures move as a horizontal carousel. */}
      <SectionFrame index="04" label="Your seat" motion="orbit" wide className="home-frame home-frame-seat">
        <div data-fx="rise" className="home-seat-lead">
          <p className="home-seat-kicker">Autonomy runs between signatures.</p>
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            Three decisions. <Accent>All yours, only yours.</Accent>
          </Heading>
          <p>
            Three of the fourteen need a signature. Everything between them runs autonomous, on the
            record — and you choose how much rope as the track record builds.
          </p>
        </div>
        <DecisionCarousel />
      </SectionFrame>

      {/* 05 · an editorial ledger wipes from the old cost structure to the new. */}
      <SectionFrame index="05" label="The ledger" motion="reconcile" wide className="home-frame home-frame-ledger">
        <div data-fx="rise" className="home-ledger-lead">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            Same ticket. <Accent>Three eras of cost.</Accent>
          </Heading>
          <p>Compare the whole unit of shipped, reviewed work — not the price of a typing assistant.</p>
        </div>
        <CostLedger />
      </SectionFrame>

      {/* 06 · opposing market claims converge into one accountable column. */}
      <SectionFrame index="06" label="The field" motion="scan" wide className="home-frame home-frame-field">
        <div data-fx="rise">
          <Heading className="max-w-[22ch] text-[length:var(--text-h2)] leading-[1.05]">
            Everyone sells an agent. <Accent>Nobody sells an accountable team.</Accent>
          </Heading>
        </div>
        <FieldScanner />
      </SectionFrame>

      <Integrations />
      <Receipts />

      {/* ── the ask ──────────────────────────────────────────────── */}
      <section id="demo" data-dark className="home-close on-dark relative scroll-mt-24 overflow-hidden border-t border-line bg-ground pt-28 pb-32 sm:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 56% at 50% 84%, color-mix(in srgb, var(--color-accent) 22%, transparent) 0%, color-mix(in srgb, var(--color-accent) 7%, transparent) 36%, transparent 70%)",
          }}
        />
        <Container className="relative z-10 text-center">
          <Heading as="h2" className="mx-auto max-w-4xl text-[length:var(--text-hero)] leading-[1.0]">
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
