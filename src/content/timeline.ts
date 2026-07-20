/**
 * IDEA → SHIPPED SOFTWARE — the seven beats the scroll timeline draws.
 *
 * Strictly a visual: the nodes are not interactive and carry no links. The
 * section is rendered as an ordered list so the sequence survives with the
 * animation off, in a screen reader, and under prefers-reduced-motion.
 *
 * On the three human gates
 * ------------------------
 * The live site says "a human decides three things" on every page — the
 * manifesto, the product pipeline, the `3` receipt — but only ever names two
 * (plan approved, PR signed). The gate chain had the same gap: 04 and 12 were
 * tagged `human`, nothing else. Per the founder's decision the third is the
 * merge, which matches how /product/ already describes phase 05: "It merges
 * only on verified-green tests, CI, no conflicts, and review approval."
 *
 * So MERGE + WATCH is a human gate here, and gate 13 in lib/gates.ts is tagged
 * to match. The two files must agree — the timeline label counts them.
 */

import { GATES } from "@/lib/gates";

export type TimelineNode = {
  /** Stable key for animation targets. */
  key: string;
  /** The short label under the dot, as it reads on the rail. */
  label: string;
  /** Who clears this beat. `human` nodes take the crimson accent. */
  actor: "auto" | "human";
  /** Verbatim from the live site — read out on hover-free devices and by AT. */
  detail: string;
  /** 1-indexed gates from lib/gates.ts this beat covers, for cross-reference. */
  gates: readonly number[];
};

export const TIMELINE_EYEBROW = "Idea → shipped software · humans decide three things";

export const TIMELINE: readonly TimelineNode[] = [
  {
    key: "idea",
    label: "Idea",
    actor: "auto",
    detail:
      "The same five-phase pipeline runs whether you hand tOOrunt AI a one-line product idea or a ticket off your existing backlog.",
    gates: [1],
  },
  {
    key: "prd",
    label: "PRD signed",
    actor: "human",
    detail:
      "It posts an implementation plan to Jira — files, approach, risks, acceptance criteria — and stops. It never writes code before a human sees the plan.",
    // 5 (novelty calibration) sits here too: it is decided at planning time —
    // "routine work ships; unfamiliar territory forces extra deliberation and a
    // human merge".
    gates: [4, 5],
  },
  {
    key: "backlog",
    label: "Backlog",
    actor: "auto",
    detail:
      "It watches your board, picks up the ticket, and resolves the right GitHub repo — from a curated registry or a semantic match. Ambiguous requirements get a clarifying question, never a guess.",
    gates: [2, 3],
  },
  {
    key: "build",
    label: "Build + tests",
    actor: "auto",
    detail:
      "It implements the change and writes tests until green. For a bug, it writes a reproduction test that is RED before the fix and GREEN after — proof the fix actually fixes the bug.",
    gates: [6, 7, 9],
  },
  {
    key: "review",
    label: "Peer review",
    actor: "auto",
    detail:
      "A second agent reviews a seven-point checklist; a peer bot with a distinct identity reviews the PR. Human comments are handled one by one — fixed, politely rebutted, or asked about.",
    gates: [8, 10, 11],
  },
  {
    key: "approve",
    label: "PR approve",
    actor: "human",
    detail:
      "A peer bot with its own GitHub identity reviews the change — a real, adversarial pass — then it waits for your approval before the second gate opens.",
    gates: [12],
  },
  {
    key: "merge",
    label: "Merge + watch",
    actor: "human",
    detail:
      "It merges only on verified-green tests, CI, no conflicts, and review approval — then watches CI and production, raising a revert alert if the change regresses.",
    gates: [13, 14],
  },
] as const;

/** The count the eyebrow claims. Kept as a derived value so the copy and the
 *  data can never drift apart again — this is exactly how the live site ended
 *  up promising three and showing two. */
export const HUMAN_GATE_COUNT = TIMELINE.filter((n) => n.actor === "human").length;

if (process.env.NODE_ENV !== "production") {
  if (HUMAN_GATE_COUNT !== 3) {
    throw new Error(
      `TIMELINE has ${HUMAN_GATE_COUNT} human gates; the eyebrow and the "3 human decisions" receipt both say three.`
    );
  }
  const gateHumans = GATES.filter((g) => g.actor === "human").length;
  if (gateHumans !== 3) {
    throw new Error(
      `lib/gates.ts has ${gateHumans} human gates but the timeline shows 3 — /security/ and the timeline would contradict each other.`
    );
  }
  const covered = new Set(TIMELINE.flatMap((n) => n.gates));
  const missing = GATES.map((_, i) => i + 1).filter((n) => !covered.has(n));
  if (missing.length) {
    throw new Error(`Timeline leaves gates uncovered: ${missing.join(", ")}`);
  }
}
