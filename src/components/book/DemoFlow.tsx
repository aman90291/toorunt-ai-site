import { RECEIPT } from "@/lib/stats";

/**
 * The demo-flow infographic — the /book panel's centerpiece.
 *
 * A vertical map of what the live session actually shows: one ticket off the
 * prospect's board carried to a merged PR, the five phases on a spine, the
 * three human decisions marked as accent nodes (the Timeline's grammar —
 * accent dot + wash halo for a human beat, teal dot for an autonomous one),
 * and the fourteen gates distributed across the phases so they visibly sum to
 * the number the rest of the site claims. The four receipt figures caption it.
 *
 * Built in HTML/flex, not SVG: the labels carry the information, and they
 * stay crisp and reflow cleanly inside the panel's no-scroll column.
 */

type Stage = {
  name: string;
  gates: string;
  note?: string;
  human?: boolean;
};

const STAGES: Stage[] = [
  { name: "Ingest & scope", gates: "01–03", note: "the right repo, resolved" },
  { name: "Plan approved", gates: "04", human: true, note: "before a line of code" },
  { name: "Build & prove", gates: "05–10", note: "red → green tests" },
  { name: "Peer review", gates: "11–12", human: true, note: "you sign the PR" },
  { name: "Merge & watch", gates: "13–14", human: true, note: "you unlock the merge" },
];

function Chip({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] ${
        accent ? "border-accent-text/40 bg-accent-wash text-accent-text" : "border-line-2 text-ink-dim"
      }`}
    >
      {children}
    </span>
  );
}

export function DemoFlow() {
  return (
    <div>
      <Chip>A ticket from your board</Chip>

      {/* the spine: a left border on the rail column carries the line; each
          node sits on it, human beats wear the accent + halo. */}
      <ol className="mt-3 list-none">
        {STAGES.map((s, i) => (
          <li key={s.name} className="flex gap-4">
            <div className="relative flex w-4 flex-col items-center">
              {/* connector up into the previous node / the input chip */}
              <span className="h-3 w-px bg-line-2" />
              <span
                className={`shrink-0 rounded-full ${
                  s.human ? "h-3.5 w-3.5 bg-accent-text" : "h-2 w-2 bg-pass"
                }`}
                style={s.human ? { boxShadow: "0 0 0 5px var(--color-accent-wash)" } : undefined}
              />
              {/* connector down, except the last node hands off to the chip */}
              <span className={`w-px flex-1 bg-line-2 ${i === STAGES.length - 1 ? "" : "min-h-[18px]"}`} />
            </div>

            <div className="flex-1 pb-4 pt-1.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-[15px] font-semibold text-ink">{s.name}</span>
                {s.human && (
                  <span className="rounded-sm bg-accent-wash px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent-text">
                    you decide
                  </span>
                )}
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                  gate{s.gates.includes("–") ? "s" : ""} {s.gates}
                </span>
              </div>
              {s.note && <p className="mt-0.5 text-[12.5px] leading-snug text-ink-dim">{s.note}</p>}
            </div>
          </li>
        ))}
      </ol>

      <Chip accent>A merged, gated PR</Chip>

      {/* the receipts, as the infographic's caption */}
      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-6 sm:grid-cols-4">
        {RECEIPT.map((r) => (
          <div key={r.label} className="flex flex-col-reverse">
            <dt className="mt-1 font-mono text-[9.5px] uppercase leading-snug tracking-[0.12em] text-ink-faint">
              {r.label}
            </dt>
            <dd className="font-display text-[clamp(20px,1.8vw,26px)] font-semibold tabular-nums tracking-[-0.02em] text-ink">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
