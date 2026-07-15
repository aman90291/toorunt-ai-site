/**
 * The canonical 14-gate verification chain, verbatim from the tOOrunt AI
 * dashboard (`devagent/dashboard/server.py :: _verification_chain`).
 * Evidence lines are the product's own copy — not marketing invention.
 */
export type Gate = {
  name: string;
  evidence: string;
  /** who clears it: the machine, or a required human decision */
  actor: "auto" | "human";
};

export const GATES: Gate[] = [
  { name: "Right repository", evidence: "resolves the target repo from the ticket — curated registry or semantic match", actor: "auto" },
  { name: "Requirements understood", evidence: "no material ambiguity — clarifies with a human before building, never guesses", actor: "auto" },
  { name: "Dependencies built first", evidence: "nothing this change depends on is missing; parks and resumes if it is", actor: "auto" },
  { name: "Plan approved", evidence: "the plan is posted to Jira and waits — it never writes code before a human sees it", actor: "human" },
  { name: "Novelty calibration", evidence: "routine work ships; unfamiliar territory forces extra deliberation and a human merge", actor: "auto" },
  { name: "Rework until shippable", evidence: "when a gate pushes back, it improves the change and re-runs — it doesn't give up", actor: "auto" },
  { name: "Tests green", evidence: "the change's own suite passes; for a bug, a red→green reproduction proves the fix", actor: "auto" },
  { name: "Code quality", evidence: "0 findings — no leaks, deadlocks, bug patterns, or injections", actor: "auto" },
  { name: "Every change is tested", evidence: "each changed file has covering tests; missing ones are written before the PR", actor: "auto" },
  { name: "No secrets in the code", evidence: "scanned for live credential values and secret patterns: clean", actor: "auto" },
  { name: "Risk & confidence", evidence: "scores risk and confidence; anything past the cap escalates to a human", actor: "auto" },
  { name: "Independent review", evidence: "a second agent reviews a 7-point checklist; a human reviewer signs the PR", actor: "human" },
  { name: "Merged", evidence: "merges only on verified-green tests, CI, no conflicts, and review approval", actor: "auto" },
  { name: "Watched after merge", evidence: "watches CI and production after merge; raises a revert alert if it regresses", actor: "auto" },
];

/** The compact hero/preview subset — the beats a pipeline animation walks through. */
export const PIPELINE_STAGES = [
  { key: "ingest", label: "Ingest", actor: "auto" as const },
  { key: "plan", label: "Plan", actor: "auto" as const },
  { key: "approve", label: "Approve", actor: "human" as const },
  { key: "implement", label: "Build", actor: "auto" as const },
  { key: "test", label: "Test", actor: "auto" as const },
  { key: "review", label: "Peer review", actor: "auto" as const },
  { key: "signoff", label: "Sign-off", actor: "human" as const },
  { key: "merge", label: "Merge", actor: "auto" as const },
  { key: "watch", label: "Watch", actor: "auto" as const },
];
