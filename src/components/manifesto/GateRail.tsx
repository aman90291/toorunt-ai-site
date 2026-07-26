import { GATES } from "@/lib/gates";

/** Short mono labels for the rail — derived from gates.ts names, 1–3 words. */
const SHORT: Record<string, string> = {
  "Right repository": "Right repo",
  "Requirements understood": "Requirements",
  "Dependencies built first": "Dependencies",
  "Plan approved": "Plan approved",
  "Novelty calibration": "Novelty",
  "Rework until shippable": "Rework",
  "Tests green": "Tests green",
  "Code quality": "Code quality",
  "Every change is tested": "Coverage",
  "No secrets in the code": "No secrets",
  "Risk & confidence": "Risk cap",
  "Independent review": "Review signed",
  Merged: "Merged",
  "Watched after merge": "Watched",
};

/**
 * The fourteen gates as one rail — every gate visible, in order, driven by
 * GATES from lib/gates.ts so the diagram can never drift from the product
 * (timeline.ts already guards the three-human invariant in dev).
 *
 * Deliberately NOT the 7-beat Timeline: the Timeline collapses gates into
 * phases; the manifesto's argument needs all fourteen on screen. Human gates
 * are filled in the danger tone AND tagged "human" — never colour alone.
 */
export function GateRail() {
  return (
    <figure className="my-12 md:-mx-24">
      {/* role="list" survives list-style:none in WebKit — the 14-in-order
          sequence is the whole point and must announce as a list. */}
      <ol role="list" className="grid list-none grid-cols-4 gap-x-3 gap-y-7 sm:grid-cols-7">
        {GATES.map((g, i) => {
          const human = g.actor === "human";
          return (
            <li key={g.name} className="flex flex-col items-center gap-2 text-center" title={g.evidence}>
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-lg border font-mono text-[12px] tabular-nums ${
                  human
                    ? "border-danger bg-danger font-semibold text-ground"
                    : "border-line-2 text-ink-dim"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[10px] uppercase leading-tight tracking-[0.1em] text-ink-faint">
                {SHORT[g.name] ?? g.name}
              </span>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                  human ? "font-semibold text-danger" : "text-ink-faint"
                }`}
              >
                {human ? "human" : "auto"}
              </span>
              {/* the evidence line, for readers the title tooltip can't
                  reach — screen readers, keyboards, touch */}
              <span className="sr-only">{g.evidence}</span>
            </li>
          );
        })}
      </ol>
      <figcaption className="mt-7 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
        11 machine · 3 human · 0 exceptions
      </figcaption>
    </figure>
  );
}
