import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { SplitWords } from "@/components/SplitWords";
import { LINES, RECEIPT } from "@/lib/stats";
import { CountUp } from "@/components/CountUp";
import { Timeline } from "@/components/Timeline";
import { AuditTrailTicker } from "@/components/AuditTrailTicker";
import { GateRail } from "@/components/manifesto/GateRail";
import {
  FigBottleneck,
  FigShareBar,
  FigDemoVsOrg,
  FigConvergence,
  FigBoundary,
  FigHashChain,
  FigCostTable,
  FigPyramid,
} from "@/components/manifesto/figures";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Writing code stopped being the bottleneck. Accountability is the bottleneck now, and it's why 95% of enterprise AI pilots show no P&L impact. This is what a governed AI engineering team looks like.",
  openGraph: { images: ["/og/manifesto.png"] },
};

/**
 * The manifesto — an essay with conceptual checkpoints, in the Vorflux
 * register: every major idea gets one abstract diagram (see
 * components/manifesto/figures.tsx for the shared grammar), numbers render in
 * monospace, and the page closes on an image rather than a sales CTA.
 *
 * DELIBERATELY NOT REBUILT in the instrument language every other page now
 * uses (components/system/*). Those pages are panels because the product is a
 * console and the reader is evaluating it. A manifesto is an argument, and an
 * argument is read in prose — measured column, long lines, a drop cap, one
 * drawing per idea. Wrapping this essay in mono channel labels and status
 * dots would make it look like telemetry and read like none.
 *
 * The one thing that changed with the dark-first palette: the old band rhythm
 * (light problem → charcoal machine → light proof) is gone, because there is
 * no light scope left to alternate against. The acts now separate by depth —
 * `--ground` vs `.on-dark` — and by the figures themselves.
 *
 * The human-decision mark still recurs through FIG 4 → the gate rail → the
 * Timeline's human nodes → FIG 9: four drawings of the same three decisions.
 */

const PROSE =
  "space-y-6 text-[18px] leading-[1.7] text-ink-dim [&_strong]:font-medium [&_strong]:text-ink";

function SectionHead({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <h2 data-fx="words" className="mb-8 font-display text-[length:var(--text-figure)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
      <span className="mr-4 font-mono text-[13px] font-normal tracking-[0.2em] text-ink-faint align-middle">
        {index}
      </span>
      <SplitWords>{children}</SplitWords>
    </h2>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-12 border-l-2 border-accent-text pl-6">
      <p className="font-display text-[clamp(24px,3.4vw,32px)] leading-[1.25] text-ink text-balance">{children}</p>
    </blockquote>
  );
}

export default function ManifestoPage() {
  return (
    <article>
      {/* ── 01 · the bottleneck moved ─────────────────────────── */}
      <section className="pt-32 pb-4 sm:pt-40">
        <Container className="max-w-[720px]">
          <p className="eyebrow">Manifesto</p>
          <h1 data-fx="words" className="mt-6 font-display text-[clamp(36px,5.5vw,58px)] font-medium leading-[1.08] tracking-[-0.01em] text-balance">
            <SplitWords>
              The bottleneck moved. <span className="text-accent-text">Most people haven&rsquo;t noticed.</span>
            </SplitWords>
          </h1>

          <div className={`mt-12 ${PROSE}`}>
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[68px] first-letter:leading-[0.8] first-letter:text-accent-text">
              For fifty years the scarce thing in software was a person who could write it. Whole industries
              organized around that scarcity: the hiring funnel, the sprint ritual, the seniority ladder. That
              constraint is gone. AI writes three quarters of the new code at Google now, and it writes it well.
            </p>
            <p>
              We felt it ourselves. The first time an agent implemented a change faster and cleaner than we would
              have, the honest reaction wasn&rsquo;t fear. It was relief, followed by a question nobody had a good
              answer to. Fine, it wrote the code. <strong>Who answers for it?</strong>
            </p>
            <p>
              The bottleneck didn&rsquo;t disappear. It moved from writing the code to being accountable for it.
              Most of the industry is still optimizing the part that&rsquo;s already solved.
            </p>
          </div>
          <FigBottleneck />
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            AI share of new code: Google, Q3 2025 earnings call
          </p>
        </Container>
      </section>

      {/* ── 02 · ninety-five percent ──────────────────────────── */}
      <section className="py-14">
        <Container className="max-w-[720px]">
          <SectionHead index="02">Ninety five percent</SectionHead>
          <div className={PROSE}>
            <p>
              If code were still the constraint, the numbers would show it: everything ten times faster, ten times
              cheaper. Instead, <strong>ninety five percent of enterprise AI pilots show no measurable P&amp;L
              impact.</strong> The models can code. The pilots still die.
            </p>
          </div>
          <FigShareBar />
          <div className={PROSE}>
            <p>
              They die at a predictable spot. The demo ships beautifully on a clean repo. Then someone in the real
              organization asks the only question that matters: <em>who approved this?</em> There is no
              answer. No owner, no chain of approval, no record that survives an audit.
            </p>
          </div>
          <FigDemoVsOrg />
          <PullQuote>{LINES.thesis}</PullQuote>
        </Container>
      </section>

      {/* ── 03 · the babysitting moved up a level ─────────────── */}
      <section className="pb-24">
        <Container className="max-w-[720px]">
          <SectionHead index="03">The babysitting moved up a level</SectionHead>
          <div className={PROSE}>
            <p>
              A copilot makes one engineer faster. A task agent takes a ticket and returns a pull request. Both are
              real progress, and both share a failure mode: every line they produce still funnels through one human
              who must read it, understand it, and stake their name on it.
            </p>
            <p>
              Scale the agents and you scale the queue, not the throughput. Ten agents filing pull requests at one
              reviewer is not a faster team. <strong>It is a slower human.</strong> The babysitting didn&rsquo;t go
              away. It moved up a level, and it concentrated.
            </p>
          </div>
          <FigConvergence />
        </Container>
      </section>

      {/* ── 04–06 · one continuous dark act: inside the machine ─ */}
      <div className="on-dark bg-ground">
        <section className="pt-24 pb-8">
          <Container className="max-w-[720px]">
            <SectionHead index="04">Accountability is a structure</SectionHead>
            <div className={PROSE}>
              <p>
                Accountability is not a feeling of trust in the model. It is a structure you can point at. An
                identity, so every action has an owner. Gates, so nothing ships unproven. A tamper evident record, so
                the history is either intact or provably altered. A boundary, so a human decides exactly the things a
                human must decide, with a kill switch one click away.
              </p>
            </div>
            <FigBoundary />
            <PullQuote>{LINES.brain}</PullQuote>
          </Container>
        </section>

        <section className="py-8">
          <Container className="max-w-[720px]">
            <SectionHead index="05">Fourteen gates. Three are human.</SectionHead>
            <div className={PROSE}>
              <p>
                Every change tOOrunt AI ships crosses the same fourteen gates, in order, no exceptions. Eleven are
                machine cleared: right repository, requirements understood, tests green, zero quality findings, no
                secrets in the code, risk scored against a cap. Three are human: the plan is approved before any code
                is written, the pull request is signed by a reviewer, and the merge happens only on verified green.
              </p>
              <p>
                That is the entire human job. <strong>Three decisions per change,</strong> placed exactly where
                judgment matters and nowhere else.
              </p>
            </div>
            <GateRail />
          </Container>
        </section>

        <section className="pt-8 pb-24">
          <Container className="max-w-[720px]">
            <SectionHead index="06">A record you can&rsquo;t fake</SectionHead>
            <div className={PROSE}>
              <p>
                Each audit record commits to the hash of the one before it. Alter any past decision and every
                subsequent hash breaks visibly and provably. There is no third state between intact and tampered.
                Incident forensics and SOC&nbsp;2 evidence stop being two documents; they are the same artifact,
                HMAC signed and exportable.
              </p>
              <p>
                We hold ourselves to it. The founding run in the next section lives on that chain. We could not have
                faked it after the fact if we had wanted to.
              </p>
            </div>
            <FigHashChain />
          </Container>
          <div className="mt-12">
            <AuditTrailTicker />
          </div>
        </section>
      </div>

      {/* ── 07 · the proof, in daylight ───────────────────────── */}
      <section className="pt-24 pb-4">
        <Container className="max-w-[720px]">
          <SectionHead index="07">Two hours, thirty six minutes</SectionHead>
          <div className={PROSE}>
            <p>
              One evening in July, a one line product idea went in. Two hours and thirty six minutes later, a product
              was deployed: a signed spec, a backlog, thirty plus rounds of review between two agents with distinct
              GitHub identities and exactly three human decisions along the way. Every step is on the hash chained
              record.
            </p>
          </div>

          {/* the receipt strip — values in ink, labels in the eyebrow voice */}
          <dl className="mt-12 grid grid-cols-2 gap-y-8 border-t border-line pt-8 sm:grid-cols-4">
            {RECEIPT.map((r) => (
              <div key={r.label} className="flex flex-col-reverse">
                <dt className="mt-1.5 font-mono text-[10.5px] uppercase leading-snug tracking-[0.14em] text-ink-faint">
                  {r.label}
                </dt>
                <dd className="font-display text-[clamp(24px,2.4vw,32px)] font-semibold tabular-nums tracking-[-0.02em] text-ink">
                  {r.value === "3" ? <CountUp value={3} /> : r.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 font-display text-[20px] text-ink">Not a benchmark. A receipt.</p>
        </Container>
      </section>

      {/* the founding run's seven beats — the crimson nodes rhyme with the
          human squares of FIG 4, the rail, and FIG 9 */}
      <Timeline />

      {/* ── 08 · the economics ────────────────────────────────── */}
      <section className="py-8">
        <Container className="max-w-[720px]">
          <SectionHead index="08">The economics, in monospace</SectionHead>
          <div className={PROSE}>
            <p>
              A merged pull request from a senior engineer costs the organization five hundred to a thousand dollars
              once salary, review time, and coordination are counted. The same unit of work through tOOrunt AI is
              twenty to a hundred and fifty dollars of metered compute on the ledger, per PR, visible. The price is
              a hundred and fifty dollars flat, per gate passed, complexity normalized merged pull request.
            </p>
            <p>
              The unit is the point. Not seats, not usage vibes: a priced, audited unit of shipped work.{" "}
              <strong>Engineering stops being a cost you estimate and becomes one you read.</strong>
            </p>
          </div>
          <FigCostTable />
        </Container>
      </section>

      {/* ── 09 · the shape of the team after ──────────────────── */}
      <section className="pt-8 pb-28">
        <Container className="max-w-[720px]">
          <SectionHead index="09">The shape of the team after</SectionHead>
          <div className={PROSE}>
            <p>
              The backlog was never too much work. It was work waiting behind too few people entitled to say yes.
              When saying yes is structured, with three decisions, fourteen gates, and a chain of custody, the queue drains,
              and the org chart changes shape.
            </p>
            <p>
              The pyramid of implementers flattens into a wide, governed, autonomous interior. What remains of the
              human organization is thin, senior, and load bearing: <strong>the people who decide what should exist,
              and sign for it.</strong>
            </p>
          </div>
          <FigPyramid />
        </Container>
      </section>

      {/* ── closing — dark bookend, an image, not a pitch ─────── */}
      <section className="on-dark relative flex min-h-[70vh] flex-col justify-center overflow-hidden bg-ground py-28">
        <Container className="relative z-10 max-w-[760px] text-center">
          <p className="font-display text-[clamp(22px,2.6vw,30px)] leading-[1.35] text-ink-dim">
            Somewhere tonight a backlog is draining while its owners sleep. Every change owned. Every gate on the
            record. Three decisions that were actually theirs.
          </p>
          <p className="mt-14 font-display text-[clamp(30px,4vw,46px)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
            {LINES.worstCase}
          </p>
          <p className="mt-12 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-faint">
            The tOOrunt AI team · July 2026, on the chain
          </p>
        </Container>
      </section>
    </article>
  );
}
