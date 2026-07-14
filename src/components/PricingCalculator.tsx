"use client";

import { useState } from "react";
import { computePricing, fmtUSD } from "@/lib/pricing";
import { ECON } from "@/lib/stats";

export function PricingCalculator({ compact = false }: { compact?: boolean }) {
  const [prs, setPrs] = useState(40);
  const r = computePricing(prs);

  return (
    <div className={`rounded-[var(--radius-card)] border border-line bg-ground-2/60 p-6 ${compact ? "" : "sm:p-8"}`}>
      <div className="flex items-baseline justify-between">
        <label htmlFor="prs" className="text-[14px] text-ink-dim">
          Merged PRs / month
        </label>
        <span className="font-display text-[28px] tabular-nums text-clay">{prs}</span>
      </div>
      <input
        id="prs"
        type="range"
        min={5}
        max={200}
        step={5}
        value={prs}
        onChange={(e) => setPrs(Number(e.target.value))}
        className="mt-3 w-full accent-[#d97757]"
        aria-valuetext={`${prs} merged pull requests per month`}
      />

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
        <Metric label="DevAgent" value={fmtUSD(r.devagentCost)} sub={`${prs} × ${fmtUSD(ECON.price)} list`} accent />
        <Metric
          label="Human equivalent"
          value={`${fmtUSD(r.humanLow)}–${fmtUSD(r.humanHigh)}`}
          sub={`${ECON.humanLow}–${ECON.humanHigh}/PR loaded`}
          strike
        />
        <Metric label="You save / month" value={fmtUSD(r.savings)} sub={`~${r.savingsPct}% vs. human cost`} />
        <Metric label="Engineer-hours returned" value={`${r.hoursReturned}h`} sub="redeployed to hard problems" />
      </div>

      {!compact && (
        <p className="mt-6 border-t border-line pt-4 font-mono text-[11.5px] leading-relaxed text-ink-faint">
          Our compute COGS is {fmtUSD(ECON.cogsLow)}–{fmtUSD(ECON.cogsHigh)} per merged PR — you see the ledger.
          A rejected PR costs you nothing.
        </p>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  accent,
  strike,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  strike?: boolean;
}) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div
        className={`mt-1.5 font-display text-[clamp(22px,3vw,30px)] leading-none tabular-nums ${
          accent ? "text-clay" : strike ? "text-ink-dim line-through decoration-line-2" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[11px] text-ink-faint">{sub}</div>
    </div>
  );
}
