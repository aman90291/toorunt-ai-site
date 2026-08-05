"use client";

import { useState } from "react";
import { computePricing, fmtUSD } from "@/lib/pricing";
import { ECON } from "@/lib/stats";

/**
 * The savings model — now with the chart it always needed.
 *
 * It previously printed four numbers and a slider. The whole point of a
 * calculator is that the reader DRAGS it and watches the answer move, and
 * four numbers re-rendering is not something you can watch: the eye cannot
 * compare `$6,000` to `$20,000–40,000` at a glance, which is precisely the
 * comparison the widget exists to make.
 *
 * So the two costs are now bars on ONE shared axis (they are the same measure
 * — dollars per month — so one axis is correct here, unlike cost-vs-time in
 * the ledger, which must never share one). The human bar is the full width;
 * ours is the fraction of it you actually pay. Drag the slider and the gap
 * moves. That gap IS the product.
 *
 * Emphasis, not categorical: ours takes the hue, the human baseline is
 * context ink. Values sit outside the bars because at 12% of the axis a label
 * inside the accent bar would be clipped.
 */
export function PricingCalculator({ compact = false }: { compact?: boolean }) {
  const [prs, setPrs] = useState(40);
  const r = computePricing(prs);

  // The human range's midpoint sets the axis; ours is measured against it.
  const humanMid = (r.humanLow + r.humanHigh) / 2;
  const oursPct = Math.max((r.tooruntCost / humanMid) * 100, 1.5);

  return (
    <div className={compact ? "" : "sm:px-1"}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor="prs" className="text-[14px] text-ink-dim">
          Merged PRs / month
        </label>
        <span className="font-display text-[30px] leading-none text-accent-text">{prs}</span>
      </div>

      <input
        id="prs"
        type="range"
        min={5}
        max={200}
        step={5}
        value={prs}
        onChange={(e) => setPrs(Number(e.target.value))}
        className="mt-4 w-full accent-[var(--color-accent-text)]"
        aria-valuetext={`${prs} merged pull requests per month`}
      />

      {/* ── the comparison ─────────────────────────────────────── */}
      <div className="mt-8 space-y-5" role="img" aria-label={`At ${prs} merged PRs a month: tOOrunt AI ${fmtUSD(r.tooruntCost)}, human equivalent ${fmtUSD(r.humanLow)} to ${fmtUSD(r.humanHigh)}.`}>
        <Row
          label="Human equivalent"
          value={`${fmtUSD(r.humanLow)}–${fmtUSD(r.humanHigh)}`}
          pct={100}
          sub={`$${ECON.humanLow}–${ECON.humanHigh} per PR, loaded`}
        />
        <Row
          label="tOOrunt AI"
          value={fmtUSD(r.tooruntCost)}
          pct={oursPct}
          sub={`${prs} × ${fmtUSD(ECON.price)} list`}
          emphasis
        />
      </div>

      {/* The answer, stated once and large — the reader's actual question. */}
      <div className="mt-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line pt-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            You save / month
          </p>
          <p className="mt-1.5 font-display text-[clamp(28px,3.6vw,44px)] font-semibold leading-none text-pass">
            {fmtUSD(r.savings)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Engineer-hours returned
          </p>
          <p className="mt-1.5 font-display text-[clamp(22px,2.4vw,30px)] font-semibold leading-none text-ink">
            {r.hoursReturned}h
          </p>
        </div>
      </div>

      {!compact && (
        <p className="mt-5 font-mono text-[11px] leading-relaxed text-ink-faint">
          Our compute COGS is {fmtUSD(ECON.cogsLow)}–{fmtUSD(ECON.cogsHigh)} per merged PR — you see the
          ledger. A rejected PR costs you nothing.
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  sub,
  pct,
  emphasis,
}: {
  label: string;
  value: string;
  sub: string;
  pct: number;
  emphasis?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className={`text-[13.5px] ${emphasis ? "font-medium text-ink" : "text-ink-dim"}`}>
          {label}
        </span>
        <span
          className={`shrink-0 font-mono text-[13px] tabular-nums ${
            emphasis ? "font-semibold text-ink" : "text-ink-dim"
          }`}
        >
          {value}
        </span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ground-3">
        <span
          className="block h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: `${pct}%`,
            background: emphasis
              ? "var(--color-pass)"
              : "color-mix(in srgb, var(--color-ink) 24%, transparent)",
          }}
        />
      </div>
      <p className="mt-1.5 font-mono text-[10.5px] text-ink-faint">{sub}</p>
    </div>
  );
}
