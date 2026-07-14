import { RECEIPT } from "@/lib/stats";

/**
 * Server component — the numbers are always in the DOM (visible by no-JS,
 * screenshot, and reduced-motion). The `.reveal` class adds a scroll-in via
 * native CSS animation-timeline only where supported; content never hides.
 */
export function StatStrip() {
  return (
    <div className="grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
      {RECEIPT.map((r) => (
        <div key={r.label} className="reveal border-t border-line px-2 py-6 lg:px-8">
          <div className="font-display text-[clamp(30px,4vw,44px)] leading-none tabular-nums text-accent">
            {r.value}
          </div>
          <div className="mt-2 text-[14px] text-ink">{r.label}</div>
          <div className="mt-0.5 font-mono text-[11px] text-ink-faint">{r.sub}</div>
        </div>
      ))}
    </div>
  );
}
