import { PIPELINE_STAGES } from "@/lib/gates";

/** The last few lines of a completed run — shown static, as a snapshot. */
const LOG: { text: string; kind: "auto" | "human" | "merge" }[] = [
  { text: "plan approved · implementing · red→green reproduction test written", kind: "auto" },
  { text: "tests green · secrets scan clean · 0 quality findings", kind: "auto" },
  { text: "peer review · 2 bots, distinct identities · 30+ rounds", kind: "auto" },
  { text: "merged — verified-green, CI, no conflicts", kind: "merge" },
  { text: "watching CI + production · revert alerts armed", kind: "auto" },
];

/**
 * A static snapshot of one completed DevAgent run — ticket to merged PR.
 * No animation: default values, always rendered whole. Server component,
 * zero client JS.
 */
export function HeroPipeline() {
  return (
    <div
      className="relative w-full min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-line-2 bg-ground-2/80 p-5 backdrop-blur-sm shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)] sm:p-6"
      aria-label="A completed DevAgent run, ticket to merged pull request"
    >
      {/* header */}
      <div className="mb-5 flex items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-pass" />
          run complete
        </span>
        <span className="font-mono text-[11px] text-ink-faint">devagent · fleet</span>
      </div>

      {/* the stage rail — all reached */}
      <div className="flex items-center justify-between gap-1">
        {PIPELINE_STAGES.map((s, i) => {
          const isHuman = s.actor === "human";
          return (
            <div key={s.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                {i > 0 && <span className="h-px flex-1 bg-accent/50" />}
                <span className="relative flex h-4 w-4 items-center justify-center">
                  {isHuman ? (
                    <>
                      <span className="absolute inset-0 rounded-full ring-2 ring-accent" />
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    </>
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-pass" />
                  )}
                </span>
                {i < PIPELINE_STAGES.length - 1 && <span className="h-px flex-1 bg-accent/50" />}
              </div>
              <span
                className={`w-full break-words text-center font-mono text-[8px] uppercase leading-tight tracking-tight sm:text-[9px] sm:tracking-wide ${
                  isHuman ? "text-accent-text" : "text-ink-dim"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* log */}
      <div className="mt-6 space-y-1.5 overflow-hidden border-t border-line pt-4 font-mono text-[12px]">
        {LOG.map((l) => (
          <div key={l.text} className="flex items-start gap-2">
            <span className={l.kind === "merge" ? "text-accent" : "text-pass"}>
              {l.kind === "merge" ? "◆" : "✓"}
            </span>
            <span className="text-ink-dim">{l.text}</span>
          </div>
        ))}
      </div>

      {/* receipt */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-accent/30 bg-accent-wash px-4 py-3">
        <span className="font-display text-[15px] text-ink">Merged</span>
        <span className="font-mono text-[12px] text-ink-dim">2h 36m idea → deployed</span>
        <span className="font-mono text-[12px] text-accent-text">3 human decisions</span>
      </div>
    </div>
  );
}
