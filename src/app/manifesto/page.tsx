import type { Metadata } from "next";
import { Container, Eyebrow, Button } from "@/components/ui";
import { LINES } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Writing code stopped being the bottleneck. Accountability is the bottleneck now — and it's why 95% of enterprise AI pilots show no P&L impact. This is what a governed AI engineering team looks like.",
  openGraph: { images: ["/og/manifesto.png"] },
};

export default function ManifestoPage() {
  return (
    <>
      <article className="pt-32 pb-24 sm:pt-40">
        <Container className="max-w-[720px]">
          <Eyebrow>Manifesto</Eyebrow>
          <h1 className="mt-6 font-display text-[clamp(36px,5.5vw,58px)] font-medium leading-[1.08] tracking-[-0.01em] text-balance">
            The bottleneck moved. <span className="text-clay-text">Most people haven&rsquo;t noticed.</span>
          </h1>

          <div className="mt-12 space-y-6 text-[18px] leading-[1.7] text-ink-dim [&_strong]:font-medium [&_strong]:text-ink">
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[68px] first-letter:leading-[0.8] first-letter:text-clay">
              For most of software&rsquo;s history, the scarce thing was people who could write the code. That
              constraint is gone. AI writes most of the new code at the frontier now — three-quarters of it at Google,
              and every line still approved by an engineer.
            </p>
            <p>
              So the work should be ten times faster and cheaper. It isn&rsquo;t. <strong>Ninety-five percent of
              enterprise AI pilots show no measurable impact on the bottom line.</strong> Not because the models
              can&rsquo;t code — they can — but because a demo that ships beautifully on a clean repo collapses the
              moment someone asks the only question that matters in a real organization: <em>who approved this?</em>
            </p>

            <PullQuote>{LINES.thesis}</PullQuote>

            <p>
              A copilot makes one engineer faster. A task-agent takes a ticket and returns a pull request. Both are
              useful. Neither is accountable — there is no chain of approval, no tamper-evident record, no control over
              the blast radius. And so the enterprise, correctly, won&rsquo;t let them near the thing that matters.
            </p>
            <p>
              What&rsquo;s missing isn&rsquo;t a smarter model. It&rsquo;s the <strong>organization</strong> the model
              works inside: identities, so every action has an owner. Gates, so nothing ships unproven. An audit trail,
              so the record is either intact or provably altered. A vault, so secrets never leak. A kill switch, so a
              human is always one click from stopping everything.
            </p>

            <PullQuote>{LINES.brain}</PullQuote>

            <p>
              We know it works because we watched it. One evening, a one-line product idea became a signed spec, a
              backlog, thirty-plus rounds of review between two agents with distinct GitHub identities, and a deployed
              product — in <strong>two hours and thirty-six minutes</strong>, with exactly three human decisions.
              Every step is on the hash-chained record; we couldn&rsquo;t have faked it after the fact if we wanted to.
            </p>
            <p>
              That&rsquo;s the whole idea. Not autonomy for its own sake — <strong>autonomy someone can answer for.</strong>{" "}
              An engineering team that isn&rsquo;t people, but is accountable like one.
            </p>
            <p className="font-display text-[20px] text-ink">
              {LINES.worstCase}
            </p>
          </div>

          <div className="mt-14 border-t border-line pt-8">
            <p className="text-[14px] text-ink-faint">— The DevAgent team</p>
            <div className="mt-6">
              <Button href="mailto:hello@devagent.dev?subject=DevAgent%20demo">Book a demo</Button>
            </div>
          </div>
        </Container>
      </article>
    </>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-10 border-l-2 border-clay pl-6">
      <p className="font-display text-[clamp(24px,3.4vw,32px)] leading-[1.25] text-ink text-balance">{children}</p>
    </blockquote>
  );
}
