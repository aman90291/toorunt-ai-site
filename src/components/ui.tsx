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
    <As className={`reveal-words font-display font-semibold tracking-[-0.025em] text-balance text-ink ${className}`}>
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
  return <span className="font-bold text-ink">{children}</span>;
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
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-[14px] font-medium transition-colors duration-150";
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
