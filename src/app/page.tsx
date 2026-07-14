import { Container, Heading, Accent, Button, Eyebrow } from "@/components/ui";
import { HeroScene } from "@/components/HeroScene";
import { DayNight } from "@/components/DayNight";
import { RECEIPT, ECON } from "@/lib/stats";

/** A text panel that sits over the fixed 3D scene, anchored to one side. */
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
    <section data-side={side} className="relative flex min-h-screen items-center py-24">
      <Container>
        <div className={`reveal txt-legible max-w-2xl ${align}`}>{children}</div>
      </Container>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <DayNight />
      <HeroScene />

      {/* 1 · Hero */}
      <Panel side="left">
        <Eyebrow>Governed AI engineering teams</Eyebrow>
        <Heading as="h1" split className="mt-6 text-[clamp(46px,8vw,104px)] leading-[0.95]">
          Software engineers <Accent>that aren&rsquo;t people.</Accent>
        </Heading>
        <p className="mt-6 text-[18px] leading-relaxed text-ink-dim">
          One bot per teammate, each with its own Jira and GitHub identity — working your real backlog
          behind fourteen hard gates. Meet the engineer that isn&rsquo;t a person.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button href="#demo">Book a demo</Button>
          <Button href="/product/" variant="ghost">See how it works →</Button>
        </div>
        <p className="mt-14 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          Scroll to look around ↓
        </p>
      </Panel>

      {/* 2 · What it is — travel down the line */}
      <Panel side="right">
        <Eyebrow>What it is</Eyebrow>
        <Heading split className="mt-6 text-[clamp(34px,5.4vw,72px)] leading-[1.02]">
          The bottleneck isn&rsquo;t writing code. <Accent>It&rsquo;s accountability.</Accent>
        </Heading>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-dim">
          AI can already write the code. The unsolved part is who planned it, who reviewed it, who approved
          it — who&rsquo;s accountable. DevAgent is the governed team that answers that, on your real tools.
        </p>
      </Panel>

      {/* 3 · The approval gate — close on the first bronze node */}
      <Panel side="left">
        <Eyebrow>Human decision · 01</Eyebrow>
        <Heading split className="mt-6 text-[clamp(34px,5.4vw,72px)] leading-[1.02]">
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
        <Heading split className="mt-6 text-[clamp(34px,5.4vw,72px)] leading-[1.02]">
          Two bots review each other. <Accent>You sign off the PR.</Accent>
        </Heading>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-dim">
          A peer bot with its own GitHub identity reviews the change — a real, adversarial pass — then it
          waits for your approval before the second gate opens.
        </p>
      </Panel>

      {/* 5 · The numbers — crane overview */}
      <Panel side="center">
        <Eyebrow>On the record</Eyebrow>
        <Heading split className="mt-6 text-[clamp(34px,5.4vw,72px)] leading-[1.02]">
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

      {/* 6 · Economics / pricing — pull back */}
      <Panel side="left">
        <Eyebrow>The economics</Eyebrow>
        <Heading split className="mt-6 text-[clamp(34px,5.4vw,72px)] leading-[1.02]">
          A merged PR costs us <Accent>${ECON.cogsLow}&ndash;{ECON.cogsHigh}.</Accent>
        </Heading>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-dim">
          Only three layers of the pipeline call a model — the rest is deterministic code. We price at
          ${ECON.price} per merged PR against the ${ECON.humanLow}&ndash;${ECON.humanHigh} a human PR costs,
          with every dollar on a visible ledger.
        </p>
        <div className="mt-8">
          <Button href="/pricing/" variant="ghost">See the pricing →</Button>
        </div>
      </Panel>

      {/* 7 · CTA — solid, ends the 3D */}
      <section id="demo" className="relative scroll-mt-24 bg-ground pt-24 pb-32 sm:pt-32">
        <Container className="text-center">
          <Eyebrow>Get started</Eyebrow>
          <Heading as="h2" split className="mx-auto mt-6 max-w-4xl text-[clamp(40px,6.5vw,92px)] leading-[0.98]">
            Every company will employ engineers that aren&rsquo;t people.{" "}
            <Accent>We make them accountable.</Accent>
          </Heading>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button href="mailto:hello@devagent.dev?subject=DevAgent%20demo">Book a demo</Button>
            <Button href="/product/" variant="ghost">See how it works →</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
