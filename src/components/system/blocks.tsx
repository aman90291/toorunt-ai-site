import { ECON } from "@/lib/stats";
import { DECISIONS, FIELD } from "@/content/home-scenes";
import { Panel, StatusDot } from "./Panel";
import { Bars, Meter, type BarDatum } from "./charts";

/**
 * The remaining instruments. All four were prose sections on the old site;
 * all four are readings now.
 *
 * Same sourcing rule as everywhere else on this site — every figure and every
 * line of copy below already exists in `lib/stats.ts`, `lib/gates.ts`, or on
 * /product, /security and /pricing. Nothing here is newly claimed.
 */

/* ── 01 · the problem ───────────────────────────────────────────────── */

export function Figures() {
  return (
    <Panel label="the state of play" status="2 readings" tone="none" flush>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-line p-6 sm:p-8 md:border-b-0 md:border-r">
          <Meter
            value={75}
            hue="var(--hue-1)"
            label="of Google's new code is AI-generated"
            caption="— and still approved by engineers."
            source="Google · Q3 2025 earnings call"
          />
        </div>
        <div className="p-6 sm:p-8">
          {/* Coral because this reading is a failure rate, not a fifth
              category — status colour, and it ships with a label rather than
              relying on the hue to say "bad". */}
          <Meter
            value={95}
            invert
            hue="var(--hue-5)"
            label="of enterprise GenAI pilots deliver no measurable P&L impact"
            source="MIT NANDA · 2025"
          />
        </div>
      </div>
      <p className="border-t border-line px-6 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-text sm:px-8">
        The bottleneck moved from writing code to governing it.
      </p>
    </Panel>
  );
}

/* ── the three human decisions ──────────────────────────────────────── */
/* Verbatim from /product · "Three decisions. All yours, only yours." */
export function Signatures() {
  return (
    <Panel label="human decisions" status="3 required" tone="human" flush>
      <div data-fx="seq" className="grid grid-cols-1 md:grid-cols-3">
        {DECISIONS.map((d, i) => (
          <div
            key={d.n}
            style={{ ["--i" as string]: i }}
            className={`p-5 sm:p-6 ${i < 2 ? "border-b border-line md:border-b-0 md:border-r" : ""}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] tabular-nums text-accent-text">{d.n}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">{d.gate}</span>
            </div>
            <h3 className="mt-4 font-display text-[19px] font-semibold tracking-[-0.015em] text-ink">{d.t}</h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{d.d}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ── the ledger ─────────────────────────────────────────────────────── */
/* barColor is a data-viz cost ramp (expensive → cheap), not a brand token —
   except the winner, which rides `--color-pass`, the same teal that marks
   "verified / autonomous" everywhere else on the site, so "good" is ONE hue
   site-wide rather than two competing greens. The dollar figure is printed
   beside every bar, so the bar never carries the value alone. */
const ERAS = [
  { label: "Manual SDLC", team: "4–6 people", cycle: "1–2 weeks", cost: "$500–1,000", bar: 100, color: "#d8665e" },
  { label: "+ AI copilots", team: "4–6 · faster typing", cycle: "~1 week", cost: "$400–800", bar: 78, color: "#c07f33" },
  { label: "tOOrunt AI", team: "0–1 · approvals only", cycle: "Hours · 2h 36m", cost: `$${ECON.cogsLow}–${ECON.cogsHigh}`, bar: 11, color: "var(--color-pass)", win: true },
];

/* Plotted values are the midpoints of the ranges printed above; the tip
   label always shows the real range, so the mark never overstates precision
   the source does not have. Cycle: 1–2 weeks and ~1 week as working days
   (×24h), and the founding run's 2h 36m. */
const COST: BarDatum[] = [
  { label: "Manual SDLC", value: 750, display: "$500–1,000" },
  { label: "+ AI copilots", value: 600, display: "$400–800" },
  { label: "tOOrunt AI", value: 85, display: "$20–150", emphasis: true },
];
const CYCLE: BarDatum[] = [
  { label: "Manual SDLC", value: 252, display: "1–2 weeks" },
  { label: "+ AI copilots", value: 168, display: "~1 week" },
  { label: "tOOrunt AI", value: 2.6, display: "2h 36m", emphasis: true },
];

export function Ledger() {
  return (
    <Panel label="cost per shipped ticket" status="3 eras" tone="none" flush>
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {ERAS.map((e, i) => (
          <div
            key={e.label}
            className={`p-5 sm:p-6 ${i < 2 ? "border-b border-line sm:border-b-0 sm:border-r" : ""} ${e.win ? "bg-accent-wash/45" : ""}`}
          >
            <p className={`font-mono text-[10px] uppercase tracking-[0.14em] ${e.win ? "text-accent-text" : "text-ink-faint"}`}>
              {e.label}
            </p>
            {/* whitespace-nowrap: "$500–1,000" was breaking after the dash and
                reading as two stacked numbers. */}
            <p className={`mt-3 font-display text-[clamp(26px,2.5vw,38px)] font-semibold leading-none whitespace-nowrap ${e.win ? "text-ink" : "text-ink"}`}>
              {e.cost}
            </p>
            <dl className="mt-5 border-t border-line pt-3 text-[12.5px]">
              <div className="flex items-baseline justify-between gap-3 py-1">
                <dt className="text-ink-faint">Team</dt>
                <dd className="text-right text-ink-dim">{e.team}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-1">
                <dt className="text-ink-faint">Cycle</dt>
                <dd className="text-right text-ink-dim">{e.cycle}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {/* TWO charts, not one with two scales. Dollars and hours have no
          shared baseline, and forcing them onto one axis invents a
          relationship the data does not contain — the single most misleading
          thing a chart can do. Small multiples instead: same three rows, same
          emphasis, two honest baselines. */}
      <div className="grid grid-cols-1 gap-8 border-t border-line p-5 sm:p-6 md:grid-cols-2 md:gap-10">
        <Bars unit="Cost per merged PR · USD" data={COST} />
        <Bars unit="Cycle time · hours" data={CYCLE} />
      </div>

      <p className="flex flex-wrap items-center gap-x-2 border-t border-line px-5 py-4 text-[13.5px] text-ink-dim sm:px-6">
        <span className="font-semibold text-ink">~90% lower cost</span> per unit of shipped, reviewed work
        <span className="text-ink-faint">·</span>
        <span className="font-semibold text-ink">10–20×</span> cycle-time compression
      </p>
    </Panel>
  );
}

/* ── the field ──────────────────────────────────────────────────────── */
export function Matrix() {
  const last = FIELD.cols.length - 1;
  return (
    <Panel label="the field" status="5 axes" tone="none" flush>
      {/* min-w matters: a w-full table shrinks to fit, so overflow-x-auto
          never engages and five columns compress into slivers on phones. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr>
              <th className="w-[15%] border-b border-line" />
              {FIELD.cols.map((c, i) => (
                <th
                  key={c.group}
                  className={`border-b border-line px-4 pb-3 pt-5 align-bottom ${i === last ? "bg-accent-wash/45" : ""}`}
                >
                  <span className={`block font-mono text-[9px] uppercase tracking-[0.16em] ${i === last ? "text-accent-text" : "text-ink-faint"}`}>
                    {c.group}
                  </span>
                  <span className={`mt-1.5 block font-display text-[14px] font-semibold ${i === last ? "text-accent-text" : "text-ink-dim"}`}>
                    {c.names}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIELD.rows.map((r) => (
              <tr key={r[0]} className="align-top">
                <td className="border-b border-line py-3.5 pl-5 pr-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                  {r[0]}
                </td>
                {r.slice(1).map((cell, i) => (
                  <td
                    key={i}
                    className={`border-b border-line px-4 py-3.5 text-[13px] leading-snug ${
                      i === last ? "bg-accent-wash/45 font-medium text-ink" : "text-ink-dim"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="flex items-center gap-2.5 px-5 py-4 text-[13.5px] italic text-ink-dim sm:px-6">
        <StatusDot tone="human" />
        Neither can tell your auditor who approved the merge.
      </p>
    </Panel>
  );
}
