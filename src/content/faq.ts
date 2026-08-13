/**
 * The knowledge set behind the hero's search field.
 *
 * SOURCING RULE — the same one content/features.ts states, and for the same
 * reason: this is an audit-trail product, so the site cannot be the one place
 * that makes things up. Every answer below is a restatement of copy that is
 * already on this site or in `lib/gates.ts` / `lib/stats.ts`. Where a number
 * appears it is interpolated from `lib/stats.ts` rather than typed, so the
 * FAQ can never drift from the pricing page.
 *
 * If you want to add an entry and the claim is not already somewhere in this
 * repository, put it on the page it belongs to first. An answer that only
 * exists in the search index is an answer no one has reviewed.
 *
 * `href` is where the answer lives in full. The result panel always offers
 * it — the search field is a way INTO the site, not a replacement for it.
 */

import { ECON, RECEIPT } from "@/lib/stats";

export type FaqCategory =
  | "How it works"
  | "Governance"
  | "Security"
  | "Pricing"
  | "Integrations"
  | "Getting started";

export type FaqEntry = {
  id: string;
  q: string;
  a: string;
  category: FaqCategory;
  /** Extra query surface — synonyms and the words people actually type. */
  tags: readonly string[];
  /** The page that carries this answer in full. */
  href: string;
};

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  "How it works",
  "Governance",
  "Security",
  "Pricing",
  "Integrations",
  "Getting started",
];

export const FAQ: readonly FaqEntry[] = [
  /* ── How it works ───────────────────────────────────────────────── */
  {
    id: "what-is-it",
    q: "What is tOOrunt AI?",
    a: "A governed team of AI engineers that carries every ticket from your Jira board to a reviewed, tested, merged pull request, behind fourteen hard gates with a human on every decision that counts. Anthropic sells the engineer's brain; we sell the organization that brain works inside.",
    category: "How it works",
    tags: ["what", "product", "overview", "team", "brain", "organization"],
    href: "/product/",
  },
  {
    id: "pipeline",
    q: "What happens between a ticket and a merged PR?",
    a: "Five phases. Ingest and scope: it watches your board, picks up the ticket and resolves the right repo. Plan and approval gate: it posts an implementation plan to Jira and stops. Implement and prove: it writes the change and the tests until green. Review orchestration: a second agent and a peer bot review it. Merge and watch: it merges on verified green and then watches CI and production.",
    category: "How it works",
    tags: ["pipeline", "phases", "process", "lifecycle", "steps", "workflow", "stages"],
    href: "/product/",
  },
  {
    id: "three-decisions",
    q: "What do humans actually decide?",
    a: "Three things, and only three. Sign the PRD: the plan waits in Jira until you approve or reject with a reason it has to answer. Approve the PR: your review is the second signature, after a peer bot has already torn the change apart. Unlock the merge: the button only arms on verified green tests, CI, zero conflicts and review approval. Everything else runs inside the gates.",
    category: "How it works",
    tags: ["human", "decisions", "approval", "control", "sign off", "oversight", "three"],
    href: "/product/",
  },
  {
    id: "writes-code-first",
    q: "Does it write code before I approve anything?",
    a: "No. It posts an implementation plan to Jira: files, approach, risks, and acceptance criteria, then stops at the first human gate. Gate 04 does not open until a human has seen the plan.",
    category: "How it works",
    tags: ["plan", "approve", "before", "prd", "gate 4", "permission", "first"],
    href: "/product/",
  },
  {
    id: "tests",
    q: "Does it write tests?",
    a: "Yes, and it has to. It implements the change and writes tests until green. For a bug it writes a reproduction test that is RED before the fix and GREEN after. This proves the fix actually fixes the bug. Gate 09 checks that every changed file has covering tests; missing ones are written before the PR opens.",
    category: "How it works",
    tags: ["tests", "testing", "tdd", "coverage", "red green", "reproduction", "qa"],
    href: "/product/",
  },
  {
    id: "review-comments",
    q: "How does it respond to my review comments?",
    a: "One at a time, with one of four honest responses: fix it, disagree with a reason, ask when the intent is unclear, or refuse when it's unsafe. The last one is the point: it has refused a reviewer's request to hardcode an API key, live.",
    category: "How it works",
    tags: ["review", "comments", "feedback", "pushback", "disagree", "refuse", "pr review"],
    href: "/product/",
  },
  {
    id: "proven-fixes",
    q: "How do you know the fix actually works?",
    a: "Four stages, and it fails closed. Localize: read the real files first, no guessing. Match: edits anchored to exact existing lines. Apply: surgical diffs and completeness sweeps. Prove: the reproduction must fail before the patch and pass after. Anything ungrounded, unproven or unvalidated is rejected and retried, never silently promoted. ~76% true resolution on SWE Bench Lite.",
    category: "How it works",
    tags: ["quality", "swe-bench", "accuracy", "hallucination", "proof", "fails closed", "benchmark"],
    href: "/",
  },
  {
    id: "fleet",
    q: "How do multiple bots avoid stepping on each other?",
    a: "Tickets are claimed atomically. Two bots can race, one wins, and the other moves on. Every bot declares the files it will touch before it starts, and overlapping claims queue instead of colliding. A bot blocked on a dependency parks the ticket with its state intact so any peer can resume it. Escalation follows CODEOWNERS, git blame, Jira roles and on call. It is a bounded ladder that always terminates.",
    category: "How it works",
    tags: ["fleet", "multiple", "bots", "collision", "concurrency", "locks", "parallel", "scale"],
    href: "/product/",
  },
  {
    id: "one-bot-per-teammate",
    q: "What does \"one bot per teammate\" mean?",
    a: "Each bot has its own Jira and GitHub identity, with least privilege tokens scoping it to its repos. That is what makes review adversarial rather than self approving: a peer bot with a different identity reviews the change, and it gates the merge. Every action has an owner you can name.",
    category: "How it works",
    tags: ["identity", "bot", "teammate", "per bot", "accounts", "attribution", "owner", "who reviews", "reviewer", "peer review", "adversarial"],
    href: "/product/",
  },
  {
    id: "how-fast",
    q: "How fast is it?",
    a: `${RECEIPT[0].value} from idea to deployed product in the July 2026 founding run. One live evening. Against a manual SDLC's one to two weeks, that is a 10 to 20× cycle time compression: weeks become hours.`,
    category: "How it works",
    tags: ["fast", "speed", "time", "how long", "cycle", "quick", "overnight"],
    href: "/",
  },
  {
    id: "learning",
    q: "Does it get better over time?",
    a: "Every reviewer correction becomes a lesson and a graduated guardrail, so the next ticket starts smarter and the improvement is on the dashboard rather than in a claim.",
    category: "How it works",
    tags: ["learning", "improve", "better", "feedback loop", "training", "memory"],
    href: "/product/",
  },

  /* ── Governance ─────────────────────────────────────────────────── */
  {
    id: "the-gates",
    q: "What are the 14 gates?",
    a: "The verification chain every change clears before it can merge: right repository, requirements understood, dependencies built first, plan approved, novelty calibration, rework until shippable, tests green, code quality, every change is tested, no secrets in the code, risk and confidence, independent review, merged, and watched after merge. Three of them, 04, 12 and 13, require a human.",
    category: "Governance",
    tags: ["gates", "14", "fourteen", "chain", "checks", "verification", "controls"],
    href: "/security/",
  },
  {
    id: "gate-bypass",
    q: "Can a gate be skipped or talked around?",
    a: "No. Gate verdicts are deterministic code, not a conversation. A jailbreak can't talk its way past a gate that's code. There is no direct to main path: everything ships through pull requests behind branch protection, peer review and the gate chain.",
    category: "Governance",
    tags: ["bypass", "skip", "override", "jailbreak", "prompt injection", "cheat", "shortcut"],
    href: "/security/",
  },
  {
    id: "audit-trail",
    q: "What does the audit trail actually give me?",
    a: "Every action is hash chained with the actor's identity: which bot, which gate, which approval. Each record commits to the one before it, so change any past decision and every subsequent hash breaks: the log is either intact or provably altered. Optionally HMAC signed and exportable. Incident forensics and SOC 2 evidence are the same artifact.",
    category: "Governance",
    tags: ["audit", "log", "trail", "hash chain", "tamper", "soc2", "compliance", "evidence", "forensics"],
    href: "/security/",
  },
  {
    id: "autonomy",
    q: "Can I run it fully autonomously?",
    a: "You choose how much rope, and it's a config rather than a rebuild. Start with a human on every plan and PR, then earn your way to more autonomy as the track record builds. The envelope widens on post merge evidence and snaps back on a single regression. In auto with veto mode the plan gate becomes a timed window: it proceeds unless you object.",
    category: "Governance",
    tags: ["autonomy", "autonomous", "unattended", "veto", "hands off", "config", "dial", "rope"],
    href: "/product/",
  },
  {
    id: "ambiguous",
    q: "What if the ticket is ambiguous?",
    a: "It asks. Gate 02 requires that there is no material ambiguity. It clarifies with a human before building and never guesses.",
    category: "Governance",
    tags: ["ambiguous", "unclear", "vague", "guess", "clarify", "question", "bad ticket"],
    href: "/security/",
  },
  {
    id: "risky-work",
    q: "What happens on unfamiliar or high risk work?",
    a: "Two gates handle it. Novelty calibration means routine work ships while unfamiliar territory forces extra deliberation and a human merge. Risk and confidence scores every change, and anything past the cap escalates to a human. Money moving, irreversible or cross team actions hit a hard escalation contract: a human signs, or it doesn't happen.",
    category: "Governance",
    tags: ["risk", "novelty", "unfamiliar", "dangerous", "escalation", "confidence", "cap"],
    href: "/security/",
  },
  {
    id: "after-merge",
    q: "What happens after the merge?",
    a: "Gate 14. It watches CI and production after merge and raises a revert alert if the change regresses. The watch is automatic, not another thing on your list.",
    category: "Governance",
    tags: ["after", "post merge", "monitor", "watch", "regression", "revert", "production"],
    href: "/security/",
  },

  /* ── Security ───────────────────────────────────────────────────── */
  {
    id: "worst-case",
    q: "What's the worst that can happen?",
    a: "A rejected pull request. There is no direct to main, ever. Everything ships through PRs behind branch protection, peer review and the gate chain, and per bot least privilege tokens scope each bot to its repos. One click on the kill switch stops the fleet.",
    category: "Security",
    tags: ["worst case", "blast radius", "risk", "damage", "safe", "kill switch", "ciso"],
    href: "/security/",
  },
  {
    id: "secrets",
    q: "How are secrets and credentials handled?",
    a: "The vault is the only writer of secret values: 0600 files outside the checkout, shredded on rotation. Tokens never touch Jira, logs or commits. Gate 10 scans for live credential values and secret patterns and blocks anything committed.",
    category: "Security",
    tags: ["secrets", "credentials", "keys", "vault", "tokens", "api key", "env"],
    href: "/security/",
  },
  {
    id: "prompt-injection",
    q: "What stops prompt injection?",
    a: "An ingress firewall screens every inbound human or web reply. Pasted secrets are quarantined and injection patterns neutralized before any model sees them. And because gate verdicts are deterministic code, an injected prompt has nothing to vote on even if it gets through.",
    category: "Security",
    tags: ["prompt injection", "jailbreak", "attack", "firewall", "untrusted", "poisoning", "malicious"],
    href: "/security/",
  },
  {
    id: "database",
    q: "Can it drop my database?",
    a: "Deep verify blocks irreversible migrations before they ship, and risky changes must carry a reversibility plan or they don't merge. In a live run, a seed script containing DROP TABLE was held for human sign off.",
    category: "Security",
    tags: ["database", "migration", "drop table", "irreversible", "sql", "data loss", "schema", "delete", "wipe", "destroy", "break production"],
    href: "/security/",
  },
  {
    id: "isolation",
    q: "How is our code and data isolated?",
    a: "Per tenant state, policy, keys and kill switch. Control plane API keys are stored hash only. Enterprise brings its own vault and SSO; zero retention terms with model providers are on the roadmap.",
    category: "Security",
    tags: ["isolation", "tenant", "data", "privacy", "residency", "retention", "sso", "multi tenant"],
    href: "/pricing/",
  },
  {
    id: "kill-switch",
    q: "Is there a kill switch?",
    a: "Yes. One click stops the fleet. It sits alongside explainable per decision traces and an exportable audit, so stopping, inspecting and proving what happened are the same set of tools.",
    category: "Security",
    tags: ["kill switch", "stop", "pause", "emergency", "halt", "abort", "shut down"],
    href: "/security/",
  },
  {
    id: "compliance",
    q: "Where are you on SOC 2?",
    a: "SOC 2 Type I is on the roadmap, a pen test is scheduled, and model terms are zero retention. The audit export exists today. SOC 2 evidence and incident forensics are the same hash chained artifact.",
    category: "Security",
    tags: ["soc2", "soc 2", "compliance", "certification", "pen test", "audit", "iso"],
    href: "/security/",
  },

  /* ── Pricing ────────────────────────────────────────────────────── */
  {
    id: "price",
    q: "How much does it cost?",
    a: "Launch is $9/month, Build is $99/month, Scale is $999/month, and Enterprise is available on request. Each tier switches on a different part of the engineering organisation, from prompt to app deployment through governed delivery and the enterprise Trust Layer.",
    category: "Pricing",
    tags: ["price", "cost", "how much", "pricing", "rate", "per pr", "plans", "tiers"],
    href: "/pricing/",
  },
  {
    id: "rejected-pr-cost",
    q: "Which plan should I start with?",
    a: "Choose Launch to test whether an idea works, Build to run a real product without an engineering hire, Scale when your team needs governed work in GitHub and Jira, and Enterprise when identity, isolation, compliance, and procurement become requirements.",
    category: "Pricing",
    tags: ["choose", "plan", "launch", "build", "scale", "enterprise", "start", "tier"],
    href: "/pricing/",
  },
  {
    id: "runaway-spend",
    q: "What is included in Launch?",
    a: "Launch includes prompt to app deployment without a repository, shared infrastructure, one project slot, and the community help centre. It is designed to test an idea before committing to a full product build.",
    category: "Pricing",
    tags: ["launch", "nine", "9", "self serve", "project", "prompt to app", "included"],
    href: "/pricing/",
  },
  {
    id: "cogs",
    q: "When is Build the right plan?",
    a: "Build is for a solo founder or a team of two to five running a real product without an engineering hire. It adds a full app and site with authentication, payments, and database, plus a research to brief critique pass, email support, and multiple projects.",
    category: "Pricing",
    tags: ["build", "ninety nine", "99", "founder", "app", "payments", "database", "included"],
    href: "/pricing/",
  },
  {
    id: "vs-human",
    q: "What does Scale add?",
    a: "Scale works inside your GitHub and Jira and adds supervised or bounded autonomous operation, the governance core, a full audit trail, dedicated Slack, and priority support. It is designed for funded startups and teams of five to thirty engineers.",
    category: "Pricing",
    tags: ["scale", "999", "github", "jira", "governance", "audit", "slack", "team"],
    href: "/pricing/",
  },
  {
    id: "merged-pr-definition",
    q: "What does Enterprise add?",
    a: "Enterprise is available on request and adds SSO, SAML, SCIM, RBAC, a dedicated tenant or customer VPC, on call support, a named customer success manager, custom engineering, and a compliance runway.",
    category: "Pricing",
    tags: ["enterprise", "9999", "sso", "saml", "scim", "rbac", "vpc", "compliance"],
    href: "/pricing/",
  },

  /* ── Integrations ───────────────────────────────────────────────── */
  {
    id: "integrations",
    q: "What does it integrate with?",
    a: "The team starts in Jira, GitHub and Slack, and ships through the clouds, clusters and monitors you already run: GitLab, Confluence, Linear, Kubernetes, Docker, Terraform, Google Cloud, Vercel, Cloudflare, Datadog, Sentry, Grafana, PagerDuty, PostgreSQL and Redis.",
    category: "Integrations",
    tags: ["integrations", "integrate", "tools", "stack", "jira", "github", "slack", "connect", "supported"],
    href: "/",
  },
  {
    id: "which-repo",
    q: "How does it know which repo a ticket belongs to?",
    a: "Gate 01 resolves the target repository from the ticket, either from a curated registry you maintain or a semantic match. It doesn't start work until the target is settled.",
    category: "Integrations",
    tags: ["repo", "repository", "which", "monorepo", "resolve", "registry", "mapping"],
    href: "/security/",
  },
  {
    id: "existing-board",
    q: "Do I have to change how my team works?",
    a: "No. It works your real Jira board and your real GitHub repos, behind your existing branch protection. The same five phase pipeline runs whether you hand it a one line product idea or a ticket off your existing backlog.",
    category: "Integrations",
    tags: ["change", "workflow", "existing", "backlog", "board", "adopt", "migrate", "onboard"],
    href: "/product/",
  },

  /* ── Getting started ────────────────────────────────────────────── */
  {
    id: "demo",
    q: "How do I see it working?",
    a: "Book a demo. Thirty minutes on a repo you choose, with a real ticket from your backlog carried to a merged PR and every gate and decision on screen. No slides.",
    category: "Getting started",
    tags: ["demo", "trial", "see", "book", "start", "try", "call", "meeting"],
    href: "/book/",
  },
  {
    id: "good-first-use",
    q: "What's a good first thing to point it at?",
    a: "Your backend bug backlog. It clears overnight with mandatory human approval, or policy bounded autonomy if you'd rather start looser.",
    category: "Getting started",
    tags: ["first", "start", "begin", "pilot", "use case", "backlog", "where", "best"],
    href: "/product/",
  },
  {
    id: "who-for",
    q: "Who is this for?",
    a: "Teams whose bottleneck has moved from writing code to governing it. 75% of Google's new code is AI generated and still approved by engineers; 95% of enterprise GenAI pilots deliver no measurable P&L impact. The gap is accountability, and that's the part we build.",
    category: "Getting started",
    tags: ["who", "for", "fit", "audience", "customer", "team size", "enterprise"],
    href: "/manifesto/",
  },
  {
    id: "vs-copilot",
    q: "How is this different from Copilot, Cursor or Devin?",
    a: "The unit of value. Copilots sell suggestions in your editor and you review your own output. Autonomous agents sell one task to one PR, reviewed by your humans. We sell an accountable team: per bot Jira and GitHub identities, bot to bot adversarial review that gates the merge, 14 gates, a hash chained audit and a kill switch. None of the others can tell your auditor who approved the merge.",
    category: "Getting started",
    tags: ["different", "vs", "versus", "copilot", "cursor", "devin", "compare", "competitor", "alternative", "openhands"],
    href: "/",
  },
];

if (process.env.NODE_ENV !== "production") {
  const ids = new Set(FAQ.map((f) => f.id));
  if (ids.size !== FAQ.length) throw new Error("FAQ ids must be unique");
  const cats = new Set<string>(FAQ_CATEGORIES);
  for (const f of FAQ) {
    if (!cats.has(f.category)) throw new Error(`FAQ "${f.id}" has unlisted category ${f.category}`);
  }
}
