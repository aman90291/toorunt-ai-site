import { Container, Eyebrow } from "@/components/ui";
import { DemoButton } from "@/components/DemoButton";
import { Button } from "@/components/ui";
import { HeroBackground } from "@/components/HeroBackground";
import { Doodle } from "@/components/Doodle";

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

        {/* The receipts strip (2h 36m · 3 · 14 · $10–50) that closed the hero
            was removed — the same figures already carry the cost and decision
            beats further down the page. The bottom padding stands in for the
            vertical space it occupied so the hero keeps its proportions. */}
        <div className="pb-[10vh]" />
      </div>
    </section>
  );
}
