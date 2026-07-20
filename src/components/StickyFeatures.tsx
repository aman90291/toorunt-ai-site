"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FEATURES } from "@/content/features";
import { SHOTS } from "@/lib/shots";
import { Container } from "@/components/ui";

/**
 * The feature stack — Izanami's scroll mechanic, rebuilt from what the site
 * actually does rather than from what it looks like it does.
 *
 * Worth stating plainly, because the brief assumed otherwise: izanami-official
 * .com's School/Craft/Retreat section has NO hover interaction. Reading its
 * bundle, there is not a single mouseenter bound to those cards — the only
 * hover code in the section is on the small "View" text links. The effect is
 * entirely scroll-driven, and it is inert to the pointer. That is what is
 * rebuilt here.
 *
 * The mechanic, and why each part matters:
 *
 *   1. HALF-RATE COUNTER-SCROLL. The wrapper translates up by
 *      progress * cardHeight * 0.5 while the page scrolls past at full rate.
 *      The stack therefore closes at half the speed you are scrolling, which is
 *      what produces the weighted "cards settling onto each other" feel. A 1:1
 *      slide feels cheap and is the usual giveaway of a reimplementation.
 *
 *   2. STAGGERED STICKY TOPS. Sticky elements all pin at the same offset by
 *      default, which gives a dead stack with no depth. Each card gets a
 *      computed `top` that fans them out, tied to the length of the scroll
 *      runway so it stays correct at any viewport height. The last card clears
 *      its top entirely so it scrolls free and finishes on top.
 *
 *   3. OCCLUSION. Each card carries an opaque panel behind it so it can cover
 *      the one below, plus a masking band that hides the seam of the outgoing
 *      card as the next slides over it. Without these you see cards through
 *      each other and the illusion collapses.
 *
 * Because none of it depends on hover, the section behaves identically on
 * touch — no separate mobile fallback is needed, which is exactly why the
 * original was built this way.
 */

const SHOT_W = 1100;

export function StickyFeatures() {
  const target = useRef<HTMLDivElement>(null);
  const sections = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetEl = target.current;
    const wrapEl = sections.current;
    if (!targetEl || !wrapEl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(wrapEl.querySelectorAll<HTMLElement>("[data-card]"));
    if (!cards.length) return;

    // Under reduced motion the stack becomes a plain flow of cards: nothing
    // pins, nothing counter-scrolls, and every card is readable in order.
    if (reduce) {
      targetEl.style.height = "auto";
      cards.forEach((c) => {
        c.style.position = "static";
        c.style.top = "";
      });
      return;
    }

    /** Fan between pinned cards, so the stack shows a deck edge rather than a
     *  single flat plate. Small on purpose: a deep fan exposes the previous
     *  card's heading in the sliver instead of just its edge. */
    const STAGGER = 22;

    const layout = () => {
      // The runway is the natural content height — deliberately NOT shortened.
      //
      // Izanami counter-scrolls the whole wrapper by h * 0.5 and shortens the
      // runway to match. Both parts were tried here and both misbehaved with
      // our card proportions. Measured: the transform shifts sticky's
      // already-resolved position, so the ACTIVE card was pushed up to 311px
      // past the viewport top with its heading clipped; and shrinking the
      // runway made the wrapper overflow its own container, which exhausted
      // the sticky containing block early and dropped every card out of its
      // pin past ~75% of the section.
      //
      // Their cards absorb both because they are tall portrait images with
      // ~6vw of top padding and 100-200px fan offsets. Ours lead with text.
      // The settle is now carried by the pins and by the covered-card
      // treatment below, which gives the same weighted depth without the two
      // failure modes.
      targetEl.style.height = "";
      cards.forEach((card, i) => {
        if (i === cards.length - 1) card.style.top = "";
        else card.style.top = `${STAGGER * i}px`;
      });
    };

    // As the next card rises over a pinned one, the covered card eases back and
    // dims. This is what reads as depth: without it a sticky stack looks like
    // sheets of paper sliding, with it they look like they have thickness.
    const tick = () => {
      const vh = window.innerHeight;
      for (let i = 0; i < cards.length - 1; i++) {
        const next = cards[i + 1].getBoundingClientRect().top;
        const self = cards[i].getBoundingClientRect();
        // 0 while the next card is still below; 1 once it fully covers this one.
        const covered = Math.min(1, Math.max(0, (self.top + self.height - next) / self.height));
        // Dim and scale the CONTENT, never the card. The card is the occluding
        // surface — giving it opacity < 1 makes it translucent and the card
        // behind reads straight through it, which put two headings on screen at
        // once. Scaling it would likewise shrink its background and open a gap
        // at the edges.
        const inner = cards[i].querySelector<HTMLElement>(".sticky-card__inner");
        if (!inner) continue;
        inner.style.transformOrigin = "50% 0%";
        inner.style.transform = `scale(${(1 - covered * 0.04).toFixed(4)})`;
        inner.style.opacity = `${(1 - covered * 0.55).toFixed(3)}`;
        // Nothing to composite once it is fully hidden.
        cards[i].style.visibility = covered >= 0.999 && next < vh ? "hidden" : "";
      }
    };

    layout();
    gsap.ticker.add(tick);
    const ro = new ResizeObserver(layout);
    ro.observe(wrapEl);
    window.addEventListener("resize", layout);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      window.removeEventListener("resize", layout);
      cards.forEach((c) => {
        c.style.visibility = "";
        const inner = c.querySelector<HTMLElement>(".sticky-card__inner");
        if (inner) {
          inner.style.transform = "";
          inner.style.opacity = "";
        }
      });
    };
  }, []);

  return (
    <section aria-labelledby="features-heading" className="relative">
      <Container>
        <div className="pt-[var(--space-section)]">
          <p className="eyebrow flex items-center gap-3">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
            What you get
          </p>
          <h2
            id="features-heading"
            data-split
            className="reveal mt-[var(--space-block)] max-w-[16ch] font-display font-semibold tracking-[-0.035em] text-ink"
            style={{ fontSize: "var(--text-h2)", lineHeight: 0.98 }}
          >
            Not an agent. <span className="text-accent-text">An organization.</span>
          </h2>
        </div>
      </Container>

      {/* The runway. Its height is set in JS from the real content height. */}
      <div ref={target} className="relative">
        <div ref={sections} className="will-change-transform">
          {FEATURES.map((f, i) => {
            const shot = SHOTS[f.shot];
            return (
              <article
                key={f.key}
                data-card
                className="sticky-card sticky"
                style={{ top: 0 }}
                aria-label={f.title}
              >
                <div className="sticky-card__inner">
                  <Container wide>
                    <div className="grid grid-cols-12 items-start gap-x-8 gap-y-10 py-[clamp(40px,5vw,72px)]">
                      {/* Rail number — the quiet index that makes a stack read
                          as a sequence rather than a pile. */}
                      <div className="col-span-12 lg:col-span-1">
                        <span className="font-mono text-[11px] tracking-[0.2em] text-ink-faint">
                          {f.index}
                        </span>
                      </div>

                      <div className="col-span-12 lg:col-span-4">
                        <h3
                          className="font-display font-semibold tracking-[-0.03em] text-ink"
                          style={{ fontSize: "var(--text-h3)", lineHeight: 1.1 }}
                        >
                          {f.title}
                        </h3>
                        <p className="mt-4 text-[var(--text-lead)] leading-[1.5] text-accent-text">
                          {f.lead}
                        </p>
                        <p className="mt-5 max-w-[46ch] text-[var(--text-body)] leading-[1.7] text-ink-dim">
                          {f.body}
                        </p>
                      </div>

                      <div className="col-span-12 lg:col-span-7">
                        <figure className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-ground-2">
                          <picture>
                            <source
                              type="image/avif"
                              srcSet={`/shots/${f.shot}-${SHOT_W}.avif 1x, /shots/${f.shot}-2200.avif 2x`}
                            />
                            <img
                              src={`/shots/${f.shot}-${SHOT_W}.webp`}
                              srcSet={`/shots/${f.shot}-${SHOT_W}.webp 1x, /shots/${f.shot}-2200.webp 2x`}
                              width={shot.width}
                              height={shot.height}
                              alt={shot.alt}
                              // The first card is above the fold once the stack
                              // is reached; the rest genuinely can wait.
                              loading={i === 0 ? "eager" : "lazy"}
                              decoding="async"
                              className="block h-auto w-full"
                            />
                          </picture>
                        </figure>
                      </div>
                    </div>
                  </Container>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
