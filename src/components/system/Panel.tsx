import type { ReactNode } from "react";

/**
 * THE SITE'S CORE PRIMITIVE — an instrument panel.
 *
 * The old site explained the product in prose: centred headings, paragraphs,
 * the occasional screenshot. That is the wrong grammar for what tOOrunt AI
 * actually is. The product is a control plane — a thing you WATCH: gates
 * clearing, bots claiming tickets, an append-only ledger growing. A page
 * built out of paragraphs asks the reader to imagine that; a page built out
 * of panels shows it.
 *
 * So every band below the hero is one of these: a titled instrument with a
 * mono label, an optional live status, and a hairline body. The repetition is
 * the point — after two of them the reader stops seeing "cards" and starts
 * reading the page as one console.
 *
 * Three rules keep it from decaying into generic card soup:
 *   • The label is ALWAYS mono, lowercase-source, uppercase-rendered. It is a
 *     channel name, not a heading. Headings live inside the body.
 *   • `status` is for genuine state ("14 gates", "live", "append-only") — not
 *     for adjectives. A panel labelled "amazing" is a card with a sticker.
 *   • The body owns its own padding. Panels that need edge-to-edge dividers
 *     (tables, tab bars) pass `flush` and pad their own sections, otherwise
 *     every divider stops 24px short of the border and the whole thing reads
 *     as a screenshot of a card rather than as an instrument.
 */
export function Panel({
  label,
  status,
  tone = "auto",
  children,
  className = "",
  flush = false,
  as: As = "div",
}: {
  label: string;
  status?: string;
  /** Colour of the status dot. `none` hides it. */
  tone?: "auto" | "human" | "live" | "none";
  children: ReactNode;
  className?: string;
  flush?: boolean;
  as?: "div" | "section" | "article";
}) {
  return (
    <As
      data-fx="lift"
      className={`panel-hue relative overflow-hidden rounded-[var(--radius-card)] border border-line ${className}`}
      style={{ background: "color-mix(in srgb, var(--hue, var(--hue-1)) 2.5%, var(--color-ground-2))" }}
    >
      <header
        className="flex h-10 items-center justify-between gap-4 border-b border-line px-4"
        style={{ background: "color-mix(in srgb, var(--hue, var(--hue-1)) 9%, transparent)" }}
      >
        <span data-fx="label" className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--hue)">
          {label}
        </span>
        {status && (
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {tone !== "none" && <StatusDot tone={tone} />}
            {status}
          </span>
        )}
      </header>
      <div className={flush ? "" : "p-5 sm:p-6"}>{children}</div>
    </As>
  );
}

/**
 * The state dot. One shape, three meanings, used everywhere on the page:
 * teal = the machine cleared it, cobalt = a human has to, gold = running now.
 *
 * `live` pulses. Nothing else does — an interface where everything pulses
 * communicates nothing, and this site has exactly one thing worth animating
 * at any moment.
 */
export function StatusDot({ tone = "auto" }: { tone?: "auto" | "human" | "live" }) {
  const color =
    tone === "human" ? "var(--color-accent-text)" : tone === "live" ? "var(--color-gold)" : "var(--color-pass)";
  return (
    <span className="relative inline-flex h-[7px] w-[7px] shrink-0">
      {tone === "live" && (
        <span
          className="absolute inset-0 animate-ping rounded-full opacity-70"
          style={{ background: color }}
        />
      )}
      <span className="relative inline-block h-full w-full rounded-full" style={{ background: color }} />
    </span>
  );
}

/** A mono key/value readout — the panel language's smallest unit. */
export function Readout({
  k,
  v,
  tone = "default",
}: {
  k: string;
  v: ReactNode;
  tone?: "default" | "accent" | "pass";
}) {
  const c = tone === "accent" ? "text-accent-text" : tone === "pass" ? "text-pass" : "text-ink";
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{k}</span>
      <span className={`text-right font-mono text-[12px] tabular-nums ${c}`}>{v}</span>
    </div>
  );
}
