/**
 * The receipts wall.
 *
 * The reference for this section (clodo.ai) closes its page on a scrolling
 * wall of customer reviews. There are no customer reviews anywhere in this
 * repository, and writing some would be fabricating testimonials on a site
 * whose entire pitch is a tamper-evident audit trail — so the wall carries
 * the strongest thing that IS true and sourced: the receipts.
 *
 * Every row below traces to `lib/stats.ts`, `lib/gates.ts`, or verbatim copy
 * on /security, /pricing or the home page. `source` is printed on the card,
 * because an unattributed number on a governance product is worth less than
 * no number at all.
 *
 * When real testimonials exist, they slot in as `kind: "quote"` — the
 * component already renders that shape — and these stay alongside them.
 */

import { ECON } from "@/lib/stats";

export type Receipt = {
  kind: "figure" | "moment" | "quote";
  /** figure: the number. moment/quote: the statement. */
  value: string;
  /** The line under it. */
  label: string;
  source: string;
  /** Marks the ones that carry the palette's accent. Keep this scarce. */
  hot?: boolean;
};

export const RECEIPTS: readonly Receipt[] = [
  {
    kind: "figure",
    value: "2h 36m",
    label: "Idea to deployed product, in one live evening.",
    source: "Founding run · July 2026",
    hot: true,
  },
  {
    kind: "moment",
    value: "It refused a reviewer who asked it to hardcode an API key.",
    label: "The secret-scan gate does not negotiate — and this happened live, not in a test.",
    source: "Security · control 01",
  },
  {
    kind: "figure",
    value: "14",
    label: "Gates cleared per change. No exceptions, no skip path.",
    source: "lib/gates.ts · the verification chain",
  },
  {
    kind: "moment",
    value: "A seed script containing DROP TABLE was held for human sign-off.",
    label: "Deep-verify blocks irreversible migrations before they ship.",
    source: "Security · database safe-fail",
  },
  {
    kind: "figure",
    value: "~76%",
    label: "True resolution on SWE-bench Lite — the defensible half nobody else gates on.",
    source: "Proven fixes · red→green required",
  },
  {
    kind: "figure",
    value: `$${ECON.cogsLow}–${ECON.cogsHigh}`,
    label: "Compute per merged PR, metered on an append-only ledger you can read.",
    source: "Pricing · unit economics",
  },
  {
    kind: "moment",
    value: "Change one past decision and every hash after it breaks.",
    label: "The log is either intact or provably altered. Incident forensics and SOC 2 evidence are the same artifact.",
    source: "Security · tamper-evident audit",
    hot: true,
  },
  {
    kind: "figure",
    value: "3",
    label: "Decisions that are yours: sign the PRD, approve the PR, unlock the merge.",
    source: "Product · human decisions",
  },
  {
    kind: "figure",
    value: "75%",
    label: "Of Google's new code is AI-generated — and still approved by engineers.",
    source: "Google · Q3 2025 earnings call",
  },
  {
    kind: "figure",
    value: "95%",
    label: "Of enterprise GenAI pilots deliver no measurable P&L impact.",
    source: "MIT NANDA · 2025",
  },
  {
    kind: "moment",
    value: "Worst case is a rejected pull request.",
    label: "No direct-to-main, ever. Per-bot least-privilege tokens, branch protection, and a kill switch.",
    source: "Security · blast radius",
    hot: true,
  },
  {
    kind: "figure",
    value: "10–20×",
    label: "Cycle-time compression against a manual SDLC. Weeks become hours.",
    source: "Home · three eras of cost",
  },
  {
    kind: "moment",
    value: "It answers review like an engineer, not a bot.",
    label: "Fix it, disagree with a reason, ask when intent is unclear, or refuse when it's unsafe.",
    source: "Product · the review loop",
  },
  {
    kind: "figure",
    value: "~90%",
    label: "Lower cost per unit of shipped, reviewed work.",
    source: `vs. $${ECON.humanLow}–${ECON.humanHigh} loaded engineer cost per PR`,
  },
];

if (process.env.NODE_ENV !== "production") {
  // The wall splits into two counter-scrolling rows; an odd count leaves one
  // row visibly shorter than the other at the seam where it repeats.
  if (RECEIPTS.length % 2 !== 0) {
    throw new Error(`RECEIPTS must be an even count for the two-row wall; got ${RECEIPTS.length}`);
  }
}
