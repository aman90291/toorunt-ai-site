import Link from "next/link";
import type { ReactNode } from "react";

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
      <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent" />
      {children}
    </p>
  );
}

/** Modern flat-sans section heading. Pass `split` to enable line-by-line mask reveal. */
export function Heading({
  children,
  as: As = "h2",
  className = "",
  split = false,
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  split?: boolean;
}) {
  return (
    <As
      {...(split ? { "data-split": true } : {})}
      className={`font-display font-semibold tracking-[-0.035em] text-balance text-ink ${className}`}
    >
      {children}
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
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2";
  const styles =
    variant === "primary"
      ? "bg-accent text-ground hover:bg-accent-text hover:-translate-y-px shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]"
      : "border border-line-2 text-ink hover:border-accent hover:bg-accent-wash";
  return (
    <Link href={href} data-magnetic className={`${base} ${styles} ${className}`}>
      {children}
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
