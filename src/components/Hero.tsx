import { Container, Eyebrow } from "@/components/ui";
import { DemoButton } from "@/components/DemoButton";
import { Button } from "@/components/ui";
import { HeroBackground } from "@/components/HeroBackground";
import { SplitWords } from "@/components/SplitWords";

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
 * Full-viewport again (svh, so mobile URL bars don't cause a jump): with the
 * wave grid behind it, the white body peeking in under the fold on load read
 * as a seam, not a teaser. Content centres in the band; `pt-14` keeps it
 * clear of the fixed nav.
 */
export function Hero() {
  return (
    <section
      data-hero
      className="on-dark relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-ground pt-14 pb-[var(--space-block)]"
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
              {/* The eyebrow carries the category; the H1 carries the claim —
                  the differentiator, not the market description. */}
              <h1
                className="reveal-words-load mt-[var(--space-block)] font-display font-semibold tracking-[-0.03em] text-balance text-ink"
                style={{ fontSize: "var(--text-hero)", lineHeight: 1.02 }}
              >
                <SplitWords>
                  An AI engineering team{" "}
                  <span className="text-accent">you can hold accountable.</span>
                </SplitWords>
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

              {/* The receipt strip — the four numbers the whole site keeps
                  its promises in, above the fold from the first pixel. */}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
