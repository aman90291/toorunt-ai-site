import { GATES } from "@/lib/gates";
import { Panel } from "./Panel";

/**
 * The verification chain, drawn as a chain.
 *
 * The gates were previously a two-column bulleted list on /security and a
 * sentence ("14 hard gates") everywhere else. Both undersell the thing: the
 * whole claim is that these run IN ORDER and that a change cannot route
 * around them, and a bulleted list communicates neither — a list is a set,
 * and a set has no order and no gaps you can see.
 *
 * So the top of the panel is the chain itself: fourteen segments, in
 * sequence, coloured by who clears each one. You can count the three cobalt
 * ones without reading a word, which is the single most important fact on the
 * page. The detail rows below are the same fourteen, expanded.
 *
 * Server component — there is no state here. An earlier draft made the
 * segments hoverable to filter the list; it added a client boundary and a
 * mode the reader had to discover, to save them a glance down the page.
 */
export function GateChain() {
  const humans = GATES.filter((g) => g.actor === "human").length;

  return (
    <Panel label="verification chain" status={`${GATES.length} gates`} tone="auto" flush>
      {/* ── the chain at a glance ─────────────────────────────────── */}
      <div className="border-b border-line p-5 sm:p-6">
        {/* `fx-seq` fills the fourteen left to right as the panel enters —
            the one moment on the page where the motion is the argument. You
            watch a change clear gate after gate and stop at the three cobalt
            ones. Static, it is still a chain; animated, it is a process. */}
        <ol data-fx="chain" className="flex gap-[3px]" aria-label="The fourteen gates in order">
          {GATES.map((g, i) => (
            <li
              key={g.name}
              style={{
                ["--i" as string]: i,
                background:
                  g.actor === "human"
                    ? "var(--color-accent-text)"
                    : "color-mix(in srgb, var(--color-pass) 46%, transparent)",
              }}
              className="group relative h-9 flex-1 rounded-[3px] transition-transform duration-200 hover:-translate-y-0.5"
            >
              {/* The number sits ON the segment — a separate label row under
                  fourteen 3px-gapped bars is unreadable at any width. */}
              <span className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-[9px] tabular-nums text-[#06121f]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="sr-only">
                {g.name} — {g.actor === "human" ? "human decision" : "automatic"}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-4 rounded-[2px]" style={{ background: "color-mix(in srgb, var(--color-pass) 46%, transparent)" }} />
            {GATES.length - humans} automatic
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-4 rounded-[2px] bg-accent-text" />
            {humans} human decisions
          </span>
          <span className="text-ink-dim">0 skippable</span>
        </div>
      </div>

      {/* ── the fourteen, expanded ───────────────────────────────── */}
      <ol data-fx="seq" className="grid grid-cols-1 md:grid-cols-2">
        {GATES.map((g, i) => {
          const human = g.actor === "human";
          return (
            <li
              key={g.name}
              style={{ ["--i" as string]: i }}
              className={`flex gap-3.5 border-b border-line p-4 sm:px-6 md:[&:nth-child(odd)]:border-r ${
                human ? "bg-accent-wash/45" : ""
              }`}
            >
              <span className="mt-px shrink-0 font-mono text-[11px] tabular-nums text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="mt-[7px] h-2 w-2 shrink-0 rounded-full"
                style={{ background: human ? "var(--color-accent-text)" : "var(--color-pass)" }}
              />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14.5px] font-medium text-ink">
                  {g.name}
                  {human && (
                    <span className="rounded-sm border border-accent-text/40 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.12em] text-accent-text">
                      human
                    </span>
                  )}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-ink-faint">{g.evidence}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
