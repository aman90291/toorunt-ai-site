/** Headline receipt numbers — all from the July 2026 live founding run + the repo. */
export const RECEIPT = [
  { value: "2h 36m", label: "idea to deployed product", sub: "one live evening" },
  { value: "3", label: "human decisions", sub: "everything else autonomous" },
  { value: "14", label: "gates per change", sub: "no exceptions" },
  { value: "$20 to 150", label: "compute per merged PR", sub: "metered, on the ledger" },
];

export const ECON = {
  cogsLow: 20,
  cogsHigh: 150,
  price: 150, // per gate-passed, complexity-normalized merged PR
  humanLow: 500,
  humanHigh: 1000,
};

/** Copy fragments reused across pages (single source of truth for the voice). */
export const LINES = {
  thesis: "The bottleneck isn't writing code anymore. It's accountability.",
  worstCase: "Worst case is a rejected pull request.",
  brain: "Anthropic sells the engineer's brain. We sell the organization the brain works inside.",
  wedge: "Clears your backend bug backlog overnight with mandatory human approval, or policy bounded autonomy.",
  sub: "A governed AI engineering team with one bot per teammate, each with its own Jira and GitHub identity, 14 hard gates on every change, and an audit trail you can hand to your auditor.",
};
