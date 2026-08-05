import Link from "next/link";
import type { ReactNode } from "react";
import { SplitWords } from "@/components/SplitWords";

/** Page shell — consistent max width + fluid gutter.
 *  `wide` opens up to full-bleed-ish for the stacked and pinned sections. */
export function Container({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full ${wide ? "max-w-[1560px]" : "max-w-[1240px]"} ${className}`}
      style={{ paddingInline: "var(--gutter)" }}
    >
      {children}
    </div>
  );
}

/**
 * The section rhythm. Every band on the page uses this, which is most of what
 * makes a layout read as composed rather than assembled — the eye picks up the
 * repeating interval even when it cannot name it.
 */
export function Section({
  children,
  className = "",
  wide = false,
  id,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
  id?: string;
} & Record<string, unknown>) {
  return (
    <section
      id={id}
      className={`relative ${className}`}
      style={{ paddingBlock: "var(--space-section)" }}
      {...rest}
    >
      <Container wide={wide}>{children}</Container>
    </section>
  );
}

/**
 * The page's spine.
 *
 * Every major band sits in one of these: a hairline top rule, and a sticky
 * mono index + label in a narrow left column that holds while the section's
 * content scrolls past it.
 *
 * This is the single change that stopped the page reading as a document. The
 * sections used to be centred text blocks separated by nothing but ~110px of
 * air, which gives the eye no way to tell "new section" from "paragraph
 * break" and makes every gap look like a mistake. A numbered rail does three
 * things at once: it bounds each section, it tells you where you are, and it
 * puts a hard left edge on the page so the content has something to align to
 * instead of floating in the middle of a very wide screen.
 *
 * The rail collapses above the content below `lg` — a 152px column on a phone
 * would eat half the line length.
 */
/** The five brand hues, in the order sections cycle through them. */
const HUES = ["hue-1", "hue-2", "hue-3", "hue-4", "hue-5"] as const;
const MOTIONS = ["rise", "split", "dock", "sequence", "orbit", "reconcile", "scan", "conversation", "dial", "spread", "meter", "stack", "hash"] as const;

export function SectionFrame({
  index,
  label,
  children,
  className = "",
  id,
  wide = false,
  hue,
  motion = "rise",
  backdrop,
}: {
  index: string;
  label: string;
  children: ReactNode;
  className?: string;
  id?: string;
  wide?: boolean;
  /** Overrides the automatic cycle. Use when a section's meaning has a hue —
   *  the gate chain is teal because teal means "the machine cleared it". */
  hue?: (typeof HUES)[number];
  /** The section's entrance grammar. It describes how the content works:
   *  screens dock, gates sequence, ledgers reconcile, records scan. */
  motion?: (typeof MOTIONS)[number];
  /** Optional oversized environmental copy. Homepage scenes use this behind
   *  their instrument instead of treating every chapter as a document band. */
  backdrop?: readonly [string, string?];
}) {
  // Derived from the index so the page cycles through all five without every
  // call site having to pick one, and without two adjacent sections colliding.
  const n = parseInt(index, 10);
  const hueClass = hue ?? HUES[(n - 1 + HUES.length) % HUES.length];

  return (
    <section
      id={id}
      data-stage={index}
      data-motion={motion}
      className={`${hueClass} section-frame relative overflow-hidden border-t border-line bg-ground ${className}`}
      style={{ paddingBlock: "var(--space-section)" }}
    >
      {backdrop && (
        <div className="section-frame-backdrop" aria-hidden="true">
          <span>{backdrop[0]}</span>
          {backdrop[1] && <span>{backdrop[1]}</span>}
        </div>
      )}
      <Container wide={wide}>
        <div className="section-frame-grid grid gap-x-10 gap-y-6 lg:grid-cols-[128px_minmax(0,1fr)]">
          {/* Index STACKED above the label, not beside it. Side by side,
              "03  THE ECONOMICS" needs ~150px of mono at this tracking and
              wraps inside a 128px column — and a wrapped label in a rail
              looks like a bug. Stacked it never wraps at any label length,
              and it reads more like a plate than a breadcrumb. */}
          <div className="section-frame-rail lg:sticky lg:top-24 lg:self-start">
            <p className="flex items-baseline gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint lg:block">
              <span className="tabular-nums text-(--hue)">{index}</span>
              <span className="lg:mt-2 lg:block">{label}</span>
              {/* A short rule in the section's hue, drawn on entry. It is the
                  cheapest possible way to give the rail chromatic rhythm down
                  the page without colouring any actual content. */}
              <span
                data-fx="draw"
                aria-hidden="true"
                className="mt-4 hidden h-px w-10 bg-(--hue) lg:block"
              />
            </p>
          </div>
          <div className="section-frame-content">{children}</div>
        </div>
      </Container>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow flex items-center gap-3">
      <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent-text" />
      {children}
    </p>
  );
}

/** Section heading. Every heading carries the on-scroll word reveal
 *  (globals.css "On-scroll typography"): SplitWords wraps each word in a
 *  mask/riser pair and the CSS view-timeline scrubs them in, staggered.
 *  Headings already on screen at load sit at the timeline's end, i.e. they
 *  render settled — so page-top h1s are static, as they should be. */
export function Heading({
  children,
  as: As = "h2",
  className = "",
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <As data-fx="words" className={`text-display font-display font-semibold tracking-[-0.025em] text-balance ${className}`}>
      <SplitWords>{children}</SplitWords>
    </As>
  );
}

/**
 * Emphasis for the turn of a heading — a weight bump, in ink.
 *
 * This used to be crimson, and it broke the 60-30-10 budget badly: `<Accent>`
 * wraps roughly half of every section heading, so at h2 scale, on every band of
 * the page, the accent was reading as 15-20% of the visual field rather than
 * 10%. Weight alone carries the emphasis; the colour is what has to stay rare.
 *
 * Use `<Hot>` where crimson genuinely belongs — see below.
 */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-display font-bold">{children}</span>;
}

/**
 * The 10%. Crimson, and deliberately scarce — the whole colour idea is that it
 * marks where a human is accountable, so spending it on ordinary emphasis
 * makes it mean nothing.
 *
 * Reserved for: the hero and closing CTA turns (the bookends), the human gates
 * on the timeline, primary buttons, and the eyebrow dot. If you are reaching
 * for it anywhere else, reach for `<Accent>` instead.
 */
export function Hot({ children }: { children: ReactNode }) {
  return <span className="font-bold text-accent-text">{children}</span>;
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  /* One property changes on hover, and it changes instantly enough to feel like
     a control rather than an animation. The old button stacked four things —
     a background swap, a 1px lift, an inset white highlight, and a magnetic
     pull that dragged the element toward the cursor — which is why it read as
     a marketing flourish instead of a button. */
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-colors duration-150";
  /* Primary wears the logo-spectrum `.btn-ai` treatment (gradient fill +
     animated rainbow edge), defined in globals.css. It carries its own fixed
     dark ink, so it looks identical in the hero, footer and white sections. */
  const styles =
    variant === "primary"
      ? "btn-ai"
      : "border border-line-2 text-ink hover:bg-ground-2";
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {variant === "primary" ? <span className="ai-label">{children}</span> : children}
    </Link>
  );
}

/** A hairline-topped divider with a mono label — the deck's section grammar. */
export function SectionRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="eyebrow whitespace-nowrap text-accent-text">{label}</span>
      <span className="hairline flex-1" />
    </div>
  );
}
