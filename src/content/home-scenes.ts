/**
 * Shared homepage comparison copy.
 *
 * These are existing product claims, kept outside the view components so the
 * instrument versions and the more editorial homepage scenes cannot drift.
 */
export const DECISIONS = [
  {
    n: "01",
    gate: "gate 04",
    gateNumber: "04",
    t: "Sign the PRD",
    d: "The plan waits in Jira until you reply /approve — or /reject with a reason it has to answer. In auto-with-veto mode this becomes a timed window: it proceeds unless you object.",
  },
  {
    n: "02",
    gate: "gate 12",
    gateNumber: "12",
    t: "Approve the PR",
    d: "By the time it reaches you, a peer bot with its own GitHub identity has already torn the change apart once. Your review is the second signature, not the first line of defense.",
  },
  {
    n: "03",
    gate: "gate 13",
    gateNumber: "13",
    t: "Unlock the merge",
    d: "The merge button only arms on verified-green: tests, CI, zero conflicts, review approval. Your click is the last gate — and the watch that follows it is automatic.",
  },
] as const;

export const FIELD = {
  cols: [
    { group: "Copilots", names: "Copilot · Cursor" },
    { group: "Session assistants", names: "Claude Cowork · ChatGPT" },
    { group: "Autonomous agents", names: "Devin · OpenHands" },
    { group: "The team", names: "tOOrunt AI" },
  ],
  rows: [
    ["Unit of value", "Suggestions in your editor", "One person's session", "One task → one PR", "An accountable team"],
    ["Identity", "The developer's own", "The user's own", "One shared org agent", "Per-bot Jira + GitHub identities"],
    ["Review", "You review your own output", "—", "Your humans review it", "Bot-to-bot adversarial — gates the merge"],
    ["Governance", "IDE / org settings", "Folder / tool permissions", "SSO + VPC + logs", "14 gates · hash-chained audit · vault · kill switch"],
    ["Cost model", "Per-seat subscription", "Subscription", "Usage ACUs, open-ended", "3 LLM layers · capped · $20–150/PR"],
  ],
} as const;
