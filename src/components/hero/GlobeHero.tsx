import { Container, Eyebrow } from "@/components/ui";
import { DemoButton } from "@/components/DemoButton";
import { Button } from "@/components/ui";
import { SplitWords } from "@/components/SplitWords";
import { FaqSearch } from "@/components/faq/FaqSearch";
import { GlobeMount } from "@/components/three/globe/GlobeMount";

/**
 * The home hero: claim, globe, question field.
 *
 * WHY THE GLOBE SITS IN FLOW. The obvious build is a full-bleed canvas with
 * the copy floating on top, which is what the old wave-grid hero did and what
 * most particle heroes do. It is the wrong call here for one specific reason:
 * this hero has FOUR stacked elements that all have to stay legible inside
 * one viewport — eyebrow, headline, question field, CTAs — and a
 * centre-weighted particle sphere behind live text is a contrast problem you
 * can only solve by dimming the sphere until it isn't worth having. Giving
 * the globe its own row means nothing ever sits on top of it, so it can run
 * at full brightness.
 *
 * The row it gets is `clamp`ed against viewport height rather than fixed, so
 * on a 720px laptop the globe yields space to the copy instead of pushing the
 * CTAs under the fold — the globe is the thing that can afford to be smaller.
 *
 * TIMING. The entrance is one continuous shot: the particle cloud fades up
 * immediately, assembles into the globe over ~2.8s (see ParticleGlobe), and
 * the UI comes in underneath it on `.hero-in` delays timed to land as the
 * sphere resolves. Nothing here waits on a JS "ready" event — the copy is
 * authored visible and the animation only enhances it, so a failed canvas, a
 * blocked bundle or `prefers-reduced-motion` all land on a readable hero
 * rather than on an empty one.
 */
export function GlobeHero() {
  return (
    <section
      data-hero
      data-dark
      className="on-dark relative flex min-h-[100svh] flex-col overflow-hidden bg-ground pt-14"
    >
      {/* Cobalt bloom behind the sphere — gives the particles something to
          sit in, so the globe reads as lit rather than as dots on black. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 54% 66% at 76% 46%, color-mix(in srgb, var(--color-accent) 13%, transparent) 0%, color-mix(in srgb, var(--color-accent) 4%, transparent) 42%, transparent 72%)",
        }}
      />
      {/* Closing fade into the white body, so the dark band doesn't end on a
          hard seam mid-scroll. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ground"
      />

      <Container className="hero-layout relative z-10 flex min-h-0 flex-1 flex-col justify-center py-[clamp(36px,6vh,76px)]">
        <div className="grid min-h-0 items-center gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-4">
          <div className="relative z-20 lg:py-8">
            <div className="hero-in" style={{ "--d": "0ms" } as React.CSSProperties}>
              <Eyebrow>Governed AI engineering teams</Eyebrow>
            </div>

            <h1
              className="reveal-words-load mt-6 max-w-[13ch] font-display font-semibold tracking-[-0.045em] text-balance text-ink"
              style={{ fontSize: "clamp(48px, 6.2vw, 92px)", lineHeight: 0.94 }}
            >
              <SplitWords>
                The bottleneck isn&rsquo;t code. <span className="text-accent">It&rsquo;s accountability.</span>
              </SplitWords>
            </h1>

            <p
              className="hero-in mt-6 max-w-[56ch] text-[clamp(15px,1.25vw,18px)] leading-relaxed text-ink-dim"
              style={{ "--d": "1500ms" } as React.CSSProperties}
            >
              tOOrunt AI is the engineering organization around the model — one bot per teammate,
              fourteen hard gates, three human decisions, and every action on the record.
            </p>

            <p
              className="hero-in mt-5 flex flex-wrap items-center gap-y-1 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint sm:text-[10.5px]"
              style={{ "--d": "1750ms" } as React.CSSProperties}
            >
              {["14 gates", "3 decisions", "0 direct-to-main"].map((t, i, a) => (
                <span key={t} className={i < a.length - 1 ? "after:px-3 after:text-ink-faint/40 after:content-['/']" : undefined}>{t}</span>
              ))}
            </p>

            <div className="hero-in relative z-30 mt-7 w-full max-w-[39rem]" style={{ "--d": "2050ms" } as React.CSSProperties}>
              <FaqSearch />
            </div>

            <div className="hero-in mt-6 flex flex-wrap items-center gap-3" style={{ "--d": "2320ms" } as React.CSSProperties}>
              <DemoButton>Book a demo</DemoButton>
              <Button href="/product/" variant="ghost">See the system</Button>
            </div>
          </div>

          <div className="hero-globe-stage relative order-first mx-auto w-full max-w-[520px] lg:order-none lg:max-w-none">
            <GlobeMount className="mx-auto aspect-square w-[min(clamp(280px,46vw,570px),82vw)] lg:w-full" />
            <div className="hero-orbit-label hero-in" style={{ "--d": "1850ms" } as React.CSSProperties}>
              <span>accountability field</span>
              <strong>14 / 14</strong>
              <small>gates in force</small>
            </div>
          </div>
        </div>
      </Container>

      <div
        aria-hidden="true"
        className="hero-in relative z-10 flex justify-center pb-6"
        style={{ "--d": "2700ms" } as React.CSSProperties}
      >
        <span className="scroll-cue" />
      </div>
    </section>
  );
}
