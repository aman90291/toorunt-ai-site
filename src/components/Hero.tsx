import { Container, Eyebrow } from "@/components/ui";
import { DemoButton } from "@/components/DemoButton";
import { Button } from "@/components/ui";
import { HeroBackground } from "@/components/HeroBackground";
import { Doodle } from "@/components/Doodle";
import { RECEIPT } from "@/lib/stats";

/**
 * The hero — the page's one dark band, and the only place anything moves.
 *
 * `.on-dark` re-points the colour tokens for this subtree, so the same
 * `text-ink` / `border-line` utilities the white sections use resolve to their
 * dark values here. Nothing inside needs a per-element override.
 *
 * The canvas is mounted here rather than in the layout, and sits absolutely
 * inside this section, so it is bounded by the hero and torn down when the
 * route changes. Content sits in a `relative z-10` layer above it.
 *
 * The height came down from `min-h-[100svh]`: a full-viewport hero that shows
 * nothing but a headline is a showcase pattern, and it pushes the first real
 * content below the fold on every laptop.
 */
export function Hero() {
  return (
    <section
      data-hero
      className="on-dark relative overflow-hidden bg-ground pt-[calc(56px+10vh)] pb-[var(--space-block)]"
    >
      <HeroBackground />

      <div className="relative z-10">
        <Container>
          <div className="grid grid-cols-12 gap-y-8">
            <div className="col-span-12 lg:col-span-8 xl:col-span-7">
              <Eyebrow>Governed AI engineering teams</Eyebrow>

              {/* leading-[1.02] is tight on purpose: at display size the default
                  line box opens a gap that reads as two paragraphs, not one
                  statement. Loosened from 0.94 now that the ramp is smaller. */}
              <h1
                className="mt-[var(--space-block)] font-display font-semibold tracking-[-0.03em] text-balance text-ink"
                style={{ fontSize: "var(--text-hero)", lineHeight: 1.02 }}
              >
                Software Development Lifecycle{" "}
                <span className="text-accent">automation, end&nbsp;to&nbsp;end.</span>
                {/* Lime reads at 15.9:1 here — a stroke this thin would vanish
                    on any of the white sections. */}
                <Doodle name="sparkle" width={30} className="ml-3 inline-block align-top text-accent" />
              </h1>

              <p
                className="mt-6 max-w-[56ch] leading-[1.6] text-ink-dim"
                style={{ fontSize: "var(--text-lead)" }}
              >
                A governed team of AI engineers that carries every ticket from your Jira board to a
                reviewed, tested, merged pull request — behind fourteen hard gates, with a human on
                every decision that counts.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <DemoButton>Book a demo</DemoButton>
                <Button href="/product/" variant="ghost">
                  See how it works
                </Button>
              </div>
            </div>
          </div>
        </Container>

        {/* Receipts. Hairline-separated rather than boxed — a card here would
            introduce a surface the rest of the page does not use. */}
        <Container>
          <div className="mt-[7vh]">
            <div className="mb-6 h-px w-full bg-line" />
            <div className="grid grid-cols-2 gap-x-10 gap-y-12 text-center md:grid-cols-4 md:gap-x-16">
              {RECEIPT.map((r) => (
                <div key={r.label}>
                  <div
                    className="font-display font-bold tracking-[-0.02em] text-ink"
                    style={{ fontSize: "clamp(30px, 3vw, 44px)", lineHeight: 1 }}
                  >
                    {r.value}
                  </div>
                  {/* ink-dim, not ink: this line is the caption for the number
                      above it, and at this size in full-strength ink the two
                      competed instead of reading as figure-then-label. */}
                  <div className="mt-2.5 text-[15px] leading-snug text-ink-dim">{r.label}</div>
                  <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                    {r.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
