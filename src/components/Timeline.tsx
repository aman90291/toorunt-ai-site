import { TIMELINE, TIMELINE_EYEBROW, HUMAN_GATE_COUNT } from "@/content/timeline";
import { Container } from "@/components/ui";

/**
 * IDEA → SHIPPED SOFTWARE.
 *
 * Marked up as an ordered list so the sequence is real structure: it reads as
 * seven steps in order, three of them flagged as human decisions, to a screen
 * reader as much as to the eye. No node is focusable, clickable or hoverable.
 *
 * It was a GSAP ScrollTrigger timeline scrubbed against the section — a
 * self-drawing spine, mirrored dot entries, clip-path label wipes and a
 * per-character type-on for the human tags. All of it is gone, and with it the
 * gsap and ScrollTrigger imports and the "use client" boundary; this is a
 * server component now.
 *
 * That deletion was safe precisely because the markup was authored in its
 * finished state and the animation only enhanced it — the old reduced-motion
 * branch returned early and rendered exactly what you see here.
 */
export function Timeline() {
  return (
    <section
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
          {/* 38px = the HUMAN tag (16) + its margin (8) + half the 28px dot
              row (14). The dots are centred in a fixed-height row precisely so
              this one number lines the spine up with every dot regardless of
              its size. */}
          <li
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[38px] hidden h-[2px] sm:block"
            style={{ gridColumn: "1 / -1" }}
          >
            <span
              data-spine
              className="block h-[2px] w-full origin-left bg-line-2"
            />
          </li>

          {TIMELINE.map((node, i) => {
            const human = node.actor === "human";
            return (
              /* min-w-0 matters: a grid item defaults to min-width:auto, so the
                 widest label ("MERGE + WATCH") refused to shrink and pushed the
                 last column past the container edge instead of wrapping. */
              <li key={node.key} className="relative flex min-w-0 flex-col items-center px-1 text-center">
                {/* HUMAN tag, above the dot, in the accent. This is the only
                    place the 10% appears in this section, and it appears
                    exactly on the gates a person has to clear. */}
                <span className="mb-2 block h-[16px] font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-accent-text">
                  {human ? (
                    <span data-human-tag="HUMAN" data-order={i}>
                      HUMAN
                    </span>
                  ) : null}
                </span>

                {/* Fixed-height row, dot centred inside it. Without this the
                    15px human dots and the 9px autonomous ones sat on
                    different axes and neither met the spine. */}
                <span className="relative z-10 flex h-7 items-center justify-center">
                  <span
                    data-dot
                    className={`block rounded-full ${
                      human ? "h-[22px] w-[22px] bg-accent-text" : "h-[13px] w-[13px] bg-pass"
                    }`}
                    style={
                      human
                        ? { boxShadow: "0 0 0 7px var(--color-accent-wash)" }
                        : undefined
                    }
                  />
                </span>

                <span
                  data-label
                  className={`mt-4 block font-mono text-[13px] leading-tight uppercase tracking-[0.08em] ${
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

        {/* Names the three decisions instead of just counting them — the
            rail above tags WHERE they sit, this says what they are. */}
        <p className="mt-[clamp(40px,5vw,72px)] font-mono text-[12.5px] leading-relaxed uppercase tracking-[0.15em] text-ink-faint">
          {HUMAN_GATE_COUNT} human decisions — sign the PRD, approve the PR, unlock the merge ·
          14 hard gates on every change · everything between them runs autonomous, on the record
        </p>
      </Container>
    </section>
  );
}
