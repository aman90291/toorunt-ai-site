import { Container, Heading, Accent, Button, Eyebrow } from "@/components/ui";
import { ScrollJack } from "@/components/ScrollJack";
import { DemoButton } from "@/components/DemoButton";
import { ProblemBeat, CostErasBeat, ProvenFixesBeat, TrustScreenBeat, WhyUsBeat } from "@/components/story";
import { RECEIPT } from "@/lib/stats";

/** A text panel that sits over the fixed 3D scene, anchored to one side.
 *  `nightAnchor` marks the section whose arrival brings nightfall. */
function Panel({
  side = "left",
  nightAnchor = false,
  children,
}: {
  side?: "left" | "right" | "center";
  nightAnchor?: boolean;
  children: React.ReactNode;
}) {
  const align =
    side === "right" ? "lg:ml-auto lg:text-left" : side === "center" ? "mx-auto text-center" : "";
  return (
    <section
      data-side={side}
      {...(nightAnchor ? { "data-night-anchor": "" } : {})}
      className="relative flex min-h-screen items-center py-24"
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
      <ScrollJack />

      {/* 1 · Hero */}
      <Panel side="left">
        <Eyebrow>Governed AI engineering teams</Eyebrow>
        <Heading as="h1" split className="perspective-3d mt-6 text-[clamp(34px,5.4vw,72px)] leading-[1.0]">
          Software Development Lifecycle <Accent>automation, end&nbsp;to&nbsp;end.</Accent>
        </Heading>
        <p className="mt-6 text-[18px] leading-relaxed text-ink-dim">
          A governed team of AI engineers that carries every ticket from your Jira board to a reviewed,
          tested, merged pull request — behind fourteen hard gates, with a human on every decision that
          counts.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <DemoButton>Book a demo</DemoButton>
          <Button href="/product/" variant="ghost">See how it works →</Button>
        </div>
        <p className="mt-14 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          Scroll to look around ↓
        </p>
      </Panel>

      {/* 2 · The problem — 75% / 95% */}
      <ProblemBeat />

      {/* 3 · What it is — the thesis */}
      <Panel side="right">
        <Eyebrow>What it is</Eyebrow>
        <Heading split className="perspective-3d mt-6 text-[clamp(32px,5vw,64px)] leading-[1.04]">
          We don&rsquo;t sell the brain. <Accent>We sell the organization that brain works inside.</Accent>
        </Heading>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-dim">
          The Jira board. The reviewers. The QA gates. The on-call rotation. The audit trail. The
          accountability structure a real engineering team runs on.
        </p>
      </Panel>

      {/* 4 · Three eras of cost */}
      <CostErasBeat />

      {/* 5 · The approval gate — close on the first bronze node */}
      <Panel side="left">
        <Eyebrow>Human decision · 01</Eyebrow>
        <Heading split className="perspective-3d mt-6 text-[clamp(34px,5.4vw,72px)] leading-[1.02]">
          It never writes code <Accent>before you approve the plan.</Accent>
        </Heading>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-dim">
          The bot posts an implementation plan to Jira — files, approach, risks, acceptance criteria — and
          stops at the first human gate. One of two decisions you actually make.
        </p>
      </Panel>

      {/* 4 · Peer review + sign-off — close on the second bronze node */}
      <Panel side="right">
        <Eyebrow>Human decision · 02</Eyebrow>
        <Heading split className="perspective-3d mt-6 text-[clamp(34px,5.4vw,72px)] leading-[1.02]">
          Two bots review each other. <Accent>You sign off the PR.</Accent>
        </Heading>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-dim">
          A peer bot with its own GitHub identity reviews the change — a real, adversarial pass — then it
          waits for your approval before the second gate opens.
        </p>
      </Panel>

      {/* 8 · Proven fixes — 9 · Trust is a screen — 10 · Why us */}
      <ProvenFixesBeat />
      <TrustScreenBeat />
      <WhyUsBeat />

      {/* 11 · The numbers — crane overview. Night falls as this section arrives. */}
      <Panel side="center" nightAnchor>
        <Eyebrow>On the record</Eyebrow>
        <Heading split className="perspective-3d mt-6 text-[clamp(34px,5.4vw,72px)] leading-[1.02]">
          One evening. One product. <Accent>Three decisions.</Accent>
        </Heading>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
          {RECEIPT.map((r) => (
            <div key={r.label}>
              <div className="font-display text-[clamp(28px,3.4vw,40px)] leading-none tabular-nums text-ink">
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
          <Heading as="h2" split className="perspective-3d mx-auto mt-6 max-w-4xl text-[clamp(40px,6.5vw,92px)] leading-[0.98]">
            Every company will employ engineers that aren&rsquo;t people.{" "}
            <Accent>We make them accountable.</Accent>
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
