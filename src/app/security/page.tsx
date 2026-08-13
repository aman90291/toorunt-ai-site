import type { Metadata } from "next";
import { SectionFrame, Heading, Accent } from "@/components/ui";
import { GATES } from "@/lib/gates";
import { AuditTrailTicker } from "@/components/AuditTrailTicker";
import { CTASection } from "@/components/CTASection";
import { PageHead } from "@/components/system/PageHead";
import { Panel, StatusDot } from "@/components/system/Panel";
import { GateChain } from "@/components/system/GateChain";

export const metadata: Metadata = {
  title: "Security & governance",
  description:
    "14 hard gates per change, a hash chained tamper evident audit trail, per bot credential vaulting, an ingress firewall against prompt injection, DB safe fail, and a kill switch. Worst case is a rejected pull request.",
  openGraph: { images: ["/og/security.png"] },
};

/**
 * /security — rebuilt in the instrument language (components/system/*).
 *
 * This page has the best claim to that language of any on the site: a CISO
 * reading it is not looking for prose, they are looking for controls, and a
 * control either exists or it does not. So each one is a row with a state
 * dot, and the fourteen gates are the same `<GateChain>` the home page uses —
 * one component, one source of truth, and a reader who saw it on the home
 * page recognises it here rather than having to re-learn a second rendering
 * of the same fourteen facts.
 *
 * Copy is unchanged from the previous version of this page.
 */

const CONTROLS = [
  {
    t: "Secrets can't leak",
    d: "The vault is the only writer of secret values: 0600 files outside the checkout, shredded on rotation. Tokens never touch Jira, logs, or commits. The secret scan gate blocks committed credentials; it has refused a reviewer's request to hardcode an API key, live.",
    tag: "vault",
  },
  {
    t: "Prompt injection, neutralized",
    d: "An ingress firewall screens every inbound human or web reply. Pasted secrets are quarantined and injection patterns neutralized before any model sees them. Gate verdicts are deterministic code an injected prompt cannot vote on.",
    tag: "ingress",
  },
  {
    t: "Blast radius = a rejected PR",
    d: "No direct to main, ever. Everything ships through PRs behind branch protection, peer review, and the gate chain. Per bot least privilege tokens scope each bot to its repos. One click on the kill switch stops the fleet.",
    tag: "blast radius",
  },
  {
    t: "Database safe fail",
    d: "Deep verify blocks irreversible migrations before they ship; risky changes must carry a reversibility plan or they don't merge. In a live run, a seed script containing DROP TABLE was held for human sign off.",
    tag: "migrations",
  },
  {
    t: "Attributable & replayable",
    d: "Every action is hash chained with the actor's identity: which bot, which gate, which approval. Alter one record and every hash after it breaks. Incident forensics and SOC 2 evidence are the same artifact.",
    tag: "audit",
  },
  {
    t: "Isolation & escalation",
    d: "Per tenant state, policy, keys, and kill switch. Control plane API keys are stored hash only. Money moving, irreversible, or cross team actions hit a hard escalation contract: a human signs, or it doesn't happen.",
    tag: "tenancy",
  },
];

export default function SecurityPage() {
  const humans = GATES.filter((g) => g.actor === "human").length;

  return (
    <>
      <PageHead
        flavor="security"
        label="Security & governance"
        title="Worst case is"
        accent="a rejected pull request."
        lead="Governance isn't a slide here. It is the first thing that was built, and every other subsystem runs inside it. Built for the question a CISO actually asks: what's the worst that can happen?"
        readouts={[
          ["gates per change", String(GATES.length)],
          ["human signatures", String(humans)],
          ["direct to main", "0"],
          ["kill switch", "1 click"],
        ]}
      />

      <SectionFrame index="01" label="The controls" motion="scan" className="mt-[var(--space-section)]">
        <div data-fx="rise">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            Six controls. <Accent>Each one either exists or it doesn&rsquo;t.</Accent>
          </Heading>
          <div className="mt-[var(--space-block)]">
            <Panel label="enforced controls" status="6 active" tone="auto" flush>
              <ul data-fx="seq" className="grid grid-cols-1 md:grid-cols-2">
                {CONTROLS.map((c, i) => (
                  <li
                    key={c.t}
                    style={{ ["--i" as string]: i }}
                    className="border-b border-line p-5 sm:p-6 md:[&:nth-child(odd)]:border-r"
                  >
                    <div className="flex items-center gap-2.5">
                      <StatusDot tone="auto" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                        {c.tag}
                      </span>
                    </div>
                    <h2 className="mt-3 text-[17px] font-semibold text-ink">{c.t}</h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">{c.d}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </SectionFrame>

      <SectionFrame index="02" label="The chain" motion="sequence">
        <div data-fx="rise">
          <Heading className="max-w-[22ch] text-[length:var(--text-h2)] leading-[1.05]">
            What every change passes <Accent>before it can merge.</Accent>
          </Heading>
          <p className="mt-5 max-w-[58ch] text-[16.5px] leading-relaxed text-ink-dim">
            Every ticket carries its own chain: pass, waiting, or skip, each with evidence a
            non expert can read. Nothing merges around it.
          </p>
          <div className="mt-[var(--space-block)]">
            <GateChain />
          </div>
        </div>
      </SectionFrame>

      <SectionFrame index="03" label="The record" motion="hash">
        <div data-fx="rise">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            Every action, <Accent>hash chained.</Accent>
          </Heading>
          <p className="mt-5 max-w-[58ch] text-[16.5px] leading-relaxed text-ink-dim">
            Each record commits to the one before it. Change any past decision and every subsequent
            hash breaks, so the log is either intact or provably altered. Optionally HMAC signed,
            and exportable for SOC 2.
          </p>
          <div className="mt-[var(--space-block)]">
            <Panel label="audit trail" status="append only" tone="live" flush>
              <div className="p-5 sm:p-6">
                <AuditTrailTicker />
              </div>
            </Panel>
          </div>
        </div>
      </SectionFrame>

      <CTASection
        eyebrow="For security teams"
        title="Bring the questions."
        accent="We built for them."
        sub="SOC 2 Type I on the roadmap, pen test scheduled, zero retention model terms. Book a security review."
      />
    </>
  );
}
