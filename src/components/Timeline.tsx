"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TIMELINE, TIMELINE_EYEBROW, HUMAN_GATE_COUNT } from "@/content/timeline";
import { Container } from "@/components/ui";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * IDEA → SHIPPED SOFTWARE.
 *
 * Strictly visual and strictly scroll-triggered, as specified: no node is
 * focusable, clickable, or hoverable. It is marked up as an ordered list so the
 * sequence is real structure — with JS off, animation off, or a screen reader
 * running, it still reads as seven steps in order with three of them flagged as
 * human decisions.
 *
 * On the motion grammar
 * ---------------------
 * The reference is glitchandgrit.com, and the single most useful finding from
 * reading its source is what is NOT there: no glitch, no RGB split, no noise,
 * no scramble, no canvas. Its entire stylesheet contains one @keyframes rule,
 * a Webflow default. "Glitch" is the studio's name, not its technique. Adding
 * datamosh here would move away from the reference, not toward it.
 *
 * What it actually does, and what is used here — deliberately spread across
 * different elements so the section does not read as one effect on repeat:
 *
 *   • the spine        self-drawing line, gsap.from width 0%, power3.inOut
 *   • the dots         mirrored counter-directional entry (odd from above,
 *                      even from below), the house grammar of that site
 *   • the labels       half-width inset clip that never crosses the centreline
 *   • the human tags   TextPlugin per-character type-on at ease "none" —
 *                      mechanical cadence, the closest thing there to a
 *                      scramble
 *   • the eyebrow      scrubbed, not triggered, so it tracks the scroll
 *
 * All of it is one timeline scrubbed against the section, so scrubbing back up
 * reverses cleanly instead of replaying.
 */
export function Timeline() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Authored visible; motion only enhances. Under reduced-motion the finished
    // state IS the markup, so there is nothing to do and nothing is hidden.
    if (reduce) return;

    const ctx = gsap.context(() => {
      const spine = el.querySelector<SVGLineElement>("[data-spine]");
      const dots = gsap.utils.toArray<HTMLElement>("[data-dot]");
      const labels = gsap.utils.toArray<HTMLElement>("[data-label]");
      const tags = gsap.utils.toArray<HTMLElement>("[data-human-tag]");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          end: "bottom 72%",
          scrub: 0.8,
        },
      });

      // 1 · The spine draws itself. Verbatim the technique the reference uses
      //     for its .line-divider, which is already exactly a timeline spine.
      if (spine) {
        tl.fromTo(spine, { scaleX: 0 }, { scaleX: 1, ease: "power3.inOut", duration: 3 }, 0);
      }

      // 2 · Dots arrive mirrored — odd indices drop in, even ones rise. Left
      //     and right, or up and down, always moving in opposite directions is
      //     that site's signature; a uniform stagger looks generic by contrast.
      dots.forEach((dot, i) => {
        tl.fromTo(
          dot,
          { y: i % 2 ? -26 : 26, scale: 0.3, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, ease: "power2.out", duration: 0.5 },
          0.25 + i * 0.28
        );
      });

      // 3 · Labels open behind a half-width clip that never crosses their own
      //     centreline, so they wipe open rather than fade in.
      labels.forEach((label, i) => {
        tl.fromTo(
          label,
          { clipPath: "inset(0% 0% 100% 0%)", y: 10 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, ease: "power2.out", duration: 0.45 },
          0.34 + i * 0.28
        );
      });

      // 4 · HUMAN types on, one character at a time, with no easing at all.
      //     ease "none" is the point — a mechanical cadence, which is what the
      //     reference uses and what suits a gate that a person has to clear.
      tags.forEach((tag) => {
        const text = tag.dataset.humanTag || "HUMAN";
        const chars = text.split("");
        tl.fromTo(
          tag,
          { opacity: 1 },
          {
            opacity: 1,
            ease: "none",
            duration: 0.4,
            onUpdate() {
              const p = this.progress();
              tag.textContent = chars.slice(0, Math.round(p * chars.length)).join("");
            },
          },
          0.5 + Number(tag.dataset.order || 0) * 0.28
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="timeline-heading"
      className="relative"
      style={{ paddingBlock: "var(--space-section)" }}
    >
      <Container wide>
        <h2 id="timeline-heading" className="sr-only">
          From idea to shipped software
        </h2>

        <p className="eyebrow mb-[clamp(48px,7vw,96px)] text-ink-faint">{TIMELINE_EYEBROW}</p>

        {/* An ordered list, not a row of divs: the sequence is the meaning, and
            it has to survive with the animation off. */}
        <ol className="relative grid list-none grid-cols-1 gap-y-12 sm:grid-cols-7 sm:gap-y-0">
          {/* The spine sits behind the dots, drawn from the left. Rendered as a
              plain element rather than SVG so it inherits the themed hairline
              colour and needs no separate light/dark handling. */}
          <li
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[7px] hidden h-px sm:block"
            style={{ gridColumn: "1 / -1" }}
          >
            <span
              data-spine
              className="block h-px w-full origin-left bg-line-2"
            />
          </li>

          {TIMELINE.map((node, i) => {
            const human = node.actor === "human";
            return (
              <li key={node.key} className="relative flex flex-col items-center text-center">
                {/* HUMAN tag, above the dot, in the accent. This is the only
                    place the 10% appears in this section, and it appears
                    exactly on the gates a person has to clear. */}
                <span className="mb-1.5 block h-[13px] font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-text">
                  {human ? (
                    <span data-human-tag="HUMAN" data-order={i}>
                      HUMAN
                    </span>
                  ) : null}
                </span>

                <span
                  data-dot
                  className={`relative z-10 block rounded-full ${
                    human ? "h-[15px] w-[15px] bg-accent" : "h-[9px] w-[9px] bg-pass"
                  }`}
                  style={
                    human
                      ? { boxShadow: "0 0 0 5px var(--color-accent-wash)" }
                      : undefined
                  }
                />

                <span
                  data-label
                  className={`mt-3 block font-mono text-[11px] uppercase tracking-[0.14em] ${
                    human ? "font-semibold text-accent-text" : "text-ink-dim"
                  }`}
                >
                  {node.label}
                </span>

                {/* The detail is real content, not a tooltip — the nodes are
                    non-interactive, so there is nowhere to reveal it on demand.
                    Visually hidden on wide screens to keep the rail clean;
                    shown in the stacked mobile layout where there is room. */}
                <span className="mt-2 max-w-[34ch] px-2 text-[12px] leading-relaxed text-ink-faint sm:sr-only">
                  {node.detail}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="mt-[clamp(40px,5vw,72px)] font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          {HUMAN_GATE_COUNT} human decisions · 14 gates · everything else autonomous
        </p>
      </Container>
    </section>
  );
}
