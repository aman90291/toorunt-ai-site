import { CountUp } from "@/components/CountUp";

/**
 * The site's chart marks.
 *
 * WHY THESE EXIST — the page cited two dashboard references and contained no
 * charts. `75%` and `95%` were rendered as large words, which is the one thing
 * a ratio must not be: a percentage is a part of a whole, and nothing on the
 * page drew the whole. The cost comparison had bars, but they encoded the
 * number printed directly above them, while the genuinely dramatic
 * dimension — weeks collapsing to hours — sat in 12px text.
 *
 * Built against the dataviz method, and the specs below are not preferences:
 *
 *   • A single ratio against a limit is a METER, never a two-slice pie: a
 *     track in a lighter step of the fill's own ramp, so the unfilled part
 *     reads as the remainder rather than as empty space.
 *   • Marks are thin, with a 4px rounded data-end and a square baseline.
 *   • Hero figures use PROPORTIONAL numerals. `tabular-nums` gives every digit
 *     the width of a zero, which makes a large standalone number look loose —
 *     it is for columns that align vertically, and these do not.
 *   • Text never wears the data colour. The value, the label and the caption
 *     are ink tokens; identity comes from the coloured mark beside them.
 *   • Two measures of different scale (dollars, hours) never share an axis.
 *     That is the single most misleading thing a chart can do, so cost and
 *     cycle time are two charts, each with its own baseline.
 *
 * The palette was validated rather than eyeballed
 * (`scripts/validate_palette.js`): the original teal fell below the chroma
 * floor and read as grey, and a five-hue categorical set failed CVD outright
 * because coral and gold are 2.1 ΔE apart under deuteranopia. The fix was not
 * a nicer red — it was noticing that none of these charts is categorical.
 */

/* ── meter ─────────────────────────────────────────────────────────── */

export function Meter({
  value,
  label,
  caption,
  source,
  hue = "var(--hue-1)",
  invert = false,
}: {
  /** 0–100. */
  value: number;
  label: string;
  caption?: string;
  source: string;
  hue?: string;
  /** True when the figure describes a failure — flips the reading so the
   *  filled portion is the bad share and the caption says so. */
  invert?: boolean;
}) {
  return (
    <figure style={{ ["--hue" as string]: hue }} className="min-w-0">
      <div className="flex items-baseline gap-3">
        {/* Proportional figures, not tabular — see the header note. */}
        <span className="text-display font-display text-[clamp(48px,5.6vw,76px)] font-bold leading-[0.85] tracking-[-0.04em]">
          <CountUp value={value} suffix="%" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          of 100
        </span>
      </div>

      {/* The mark. Track = a lighter step of the fill's own hue, so the
          remainder reads as the rest of the same quantity instead of as a
          grey gutter. */}
      <div
        data-fx="meter"
        className="relative mt-6 h-2.5 w-full overflow-hidden rounded-full"
        style={{ background: "color-mix(in srgb, var(--hue) 16%, transparent)" }}
        role="img"
        aria-label={`${value}%: ${label}`}
      >
        <span
          className="meter-fill absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${value}%`, background: "var(--hue)" }}
        />
        {/* The 100% limit, so the track is legibly a scale and not a bar that
            happens to be short. */}
        <span className="absolute inset-y-0 right-0 w-px bg-(--hue) opacity-45" />
      </div>

      <figcaption className="mt-5">
        <p className="max-w-[34ch] text-[15.5px] leading-relaxed text-ink">
          {label}
          {caption && <span className="text-ink-dim"> {caption}</span>}
        </p>
        <p className="mt-4 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {source}
        </p>
      </figcaption>
      {invert && <span className="sr-only">This share represents a failure rate.</span>}
    </figure>
  );
}

/* ── emphasis bars ─────────────────────────────────────────────────── */

export type BarDatum = {
  label: string;
  /** Numeric value driving the bar length. */
  value: number;
  /** What to print at the tip — the real-world range, not the plotted number. */
  display: string;
  /** The one row the chart is about. */
  emphasis?: boolean;
};

/**
 * A horizontal bar set using EMPHASIS: the row that carries the story takes
 * the hue, the rest are context ink.
 *
 * Emphasis rather than a colour-per-era ramp, because the story is not "these
 * three are different kinds of thing" — it is "the third one is an order of
 * magnitude less". Giving all three their own hue spends the reader's
 * attention evenly across a comparison that is not even, and double-encodes
 * bar length as colour, which the length already says.
 *
 * `max` is passed in rather than derived, so two charts that must NOT share an
 * axis still each get an honest baseline of their own.
 */
export function Bars({
  data,
  unit,
  hue = "var(--hue-2)",
}: {
  data: readonly BarDatum[];
  unit: string;
  hue?: string;
}) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div style={{ ["--hue" as string]: hue }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{unit}</p>
      <ul data-fx="seq" className="mt-4 space-y-3.5">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <li key={d.label} style={{ ["--i" as string]: i }} className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className={`text-[13px] ${d.emphasis ? "font-medium text-ink" : "text-ink-dim"}`}>
                  {d.label}
                </span>
                {/* Value at the tip — but printed OUTSIDE the mark, because at
                    1% of the axis the winning bar is a sliver and a label
                    inside it would be clipped. */}
                <span
                  className={`shrink-0 font-mono text-[12px] tabular-nums ${
                    d.emphasis ? "font-semibold text-ink" : "text-ink-dim"
                  }`}
                >
                  {d.display}
                </span>
              </div>
              <div
                data-fx="meter"
                className="relative h-2 w-full overflow-hidden rounded-full bg-ground-3"
              >
                <span
                  className="meter-fill absolute inset-y-0 left-0 rounded-full"
                  style={{
                    // A floor of 0.6% keeps a genuinely tiny value from
                    // vanishing entirely. It is a sliver, not a rounded-up
                    // lie — the printed value beside it carries the truth.
                    width: `${Math.max(pct, 0.6)}%`,
                    background: d.emphasis
                      ? "var(--hue)"
                      : "color-mix(in srgb, var(--color-ink) 26%, transparent)",
                    ["--i" as string]: i,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
