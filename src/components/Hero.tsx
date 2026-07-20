import { Container, Eyebrow } from "@/components/ui";
import { DemoButton } from "@/components/DemoButton";
import { Button } from "@/components/ui";
import { RECEIPT } from "@/lib/stats";

/**
 * The hero.
 *
 * The spatial reading here comes from restraint, not from decoration: one very
 * large headline, a short measure of lead copy, and a lot of deliberate empty
 * space, all sitting over the live cloud field. The previous hero centred a
 * dense 3D constellation behind the text, and the subhead ran straight through
 * it — busy in the middle, empty at the edges, which is the opposite of
 * spatial.
 *
 * Structure is a 12-column grid so the content occupies a clear seven columns
 * and the remaining five are genuinely, visibly empty. Held-open space is what
 * makes the type feel large; a headline that fills its container just looks
 * cramped, however big the font.
 *
 * The receipt strip along the bottom does two jobs: it anchors the composition
 * to the baseline so the hero has a floor, and it puts the four numbers the
 * whole site is arguing for in front of the reader before any prose.
 */
export function Hero() {
  return (
    <section
      data-side="left"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-[18vh] pb-[var(--space-block)]"
    >
      <Container>
        <div className="tilt-stage">
          <div className="grid grid-cols-12 gap-y-8">
            <div className="col-span-12 lg:col-span-8 xl:col-span-7">
              <div className="reveal">
                <Eyebrow>Governed AI engineering teams</Eyebrow>
              </div>

              {/* leading-[0.94] is tight on purpose: at display size the default
                  line box opens a gap that reads as two paragraphs, not one
                  statement. */}
              <h1
                data-split
                className="reveal par-far mt-[var(--space-block)] font-display font-semibold tracking-[-0.038em] text-balance text-ink"
                style={{ fontSize: "var(--text-hero)", lineHeight: 0.94 }}
              >
                Software Development Lifecycle{" "}
                <span className="text-accent-text">automation, end&nbsp;to&nbsp;end.</span>
              </h1>

              <p
                className="reveal mt-9 max-w-[54ch] leading-[1.62] text-ink-dim"
                style={{ fontSize: "var(--text-lead)" }}
              >
                A governed team of AI engineers that carries every ticket from your Jira board to a
                reviewed, tested, merged pull request — behind fourteen hard gates, with a human on
                every decision that counts.
              </p>

              <div className="reveal mt-10 flex flex-wrap items-center gap-3">
                <DemoButton>Book a demo</DemoButton>
                <Button href="/product/" variant="ghost">
                  See how it works →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Receipts. Hairline-separated rather than boxed — a card here would
          introduce a surface the rest of the page does not use. */}
      <Container>
        <div className="reveal mt-[8vh]">
          <div className="mb-6 h-px w-full bg-line" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {RECEIPT.map((r) => (
              <div key={r.label} className="par-far">
                <div
                  className="font-display font-semibold tracking-[-0.03em] text-ink"
                  style={{ fontSize: "clamp(26px, 2.6vw, 40px)", lineHeight: 1 }}
                >
                  {r.value}
                </div>
                <div className="mt-2 text-[13px] leading-snug text-ink-dim">{r.label}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  {r.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
