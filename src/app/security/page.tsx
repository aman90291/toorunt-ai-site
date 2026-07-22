import type { Metadata } from "next";
import { Container, Heading, Accent, Eyebrow, SectionRule } from "@/components/ui";
import { GATES } from "@/lib/gates";
import { AuditTrailTicker } from "@/components/AuditTrailTicker";
import { BrowserFrame } from "@/components/BrowserFrame";
import { MediaReveal } from "@/components/MediaReveal";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Security & governance",
  description:
    "14 hard gates per change, a hash-chained tamper-evident audit trail, per-bot credential vaulting, an ingress firewall against prompt injection, DB safe-fail, and a kill switch. Worst case is a rejected pull request.",
  openGraph: { images: ["/og/security.png"] },
};

const CONTROLS = [
  { t: "Secrets can't leak", d: "The vault is the only writer of secret values — 0600 files outside the checkout, shredded on rotation. Tokens never touch Jira, logs, or commits. The secret-scan gate blocks committed credentials; it has refused a reviewer's request to hardcode an API key, live." },
  { t: "Prompt injection, neutralized", d: "An ingress firewall screens every inbound human or web reply — pasted secrets are quarantined and injection patterns neutralized before any model sees them. Gate verdicts are deterministic code an injected prompt cannot vote on." },
  { t: "Blast radius = a rejected PR", d: "No direct-to-main, ever. Everything ships through PRs behind branch protection, peer review, and the gate chain. Per-bot least-privilege tokens scope each bot to its repos. One click on the kill switch stops the fleet." },
  { t: "Database safe-fail", d: "Deep-verify blocks irreversible migrations before they ship; risky changes must carry a reversibility plan or they don't merge. In a live run, a seed script containing DROP TABLE was held for human sign-off." },
  { t: "Attributable & replayable", d: "Every action is hash-chained with the actor's identity — which bot, which gate, which approval. Alter one record and every hash after it breaks. Incident forensics and SOC 2 evidence are the same artifact." },
  { t: "Isolation & escalation", d: "Per-tenant state, policy, keys, and kill switch. Control-plane API keys are stored hash-only. Money-moving, irreversible, or cross-team actions hit a hard escalation contract — a human signs, or it doesn't happen." },
];

export default function SecurityPage() {
  return (
    <>
      <section className="pt-32 pb-16 sm:pt-40">
        <Container>
          <Eyebrow>Security & governance</Eyebrow>
          <Heading as="h1" className="mt-6 max-w-3xl text-[clamp(36px,5.5vw,60px)] leading-[1.06]">
            Worst case is <Accent>a rejected pull request.</Accent>
          </Heading>
          <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-ink-dim">
            Governance isn&rsquo;t a slide here — it&rsquo;s the first thing that was built, and every other subsystem runs
            inside it. Built for the question a CISO actually asks: what&rsquo;s the worst that can happen?
          </p>
        </Container>
      </section>

      {/* Controls grid */}
      <section className="pb-24 sm:pb-28">
        <Container>
          <SectionRule label="The controls" />
          <div className="reveal mt-10 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2">
            {CONTROLS.map((c) => (
              <div key={c.t} className="bg-ground-2 p-6 sm:p-7">
                <h2 className="text-[17px] font-semibold text-ink">{c.t}</h2>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-dim">{c.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Audit trail */}
      <section className="border-y border-line bg-ground-2 py-24 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionRule label="Tamper-evident audit" />
              <Heading className="mt-6 text-[clamp(26px,4vw,40px)] leading-[1.1]">
                Every action, <Accent>hash-chained.</Accent>
              </Heading>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-dim">
                Each record commits to the one before it. Change any past decision and every subsequent hash breaks —
                so the log is either intact or provably altered. Optionally HMAC-signed, and exportable for SOC 2.
              </p>
            </div>
            <AuditTrailTicker />
          </div>
        </Container>
      </section>

      {/* The 14 gates */}
      <section className="py-24 sm:py-28">
        <Container>
          <SectionRule label="The 14 gates" />
          <Heading className="mt-6 max-w-2xl text-[clamp(26px,4vw,40px)] leading-[1.1]">
            What every change passes <Accent>before it can merge.</Accent>
          </Heading>
          <div className="reveal mt-10 grid gap-x-10 gap-y-0 sm:grid-cols-2">
            {GATES.map((g, i) => (
              <div key={g.name} className="flex items-start gap-4 border-t border-line py-4">
                <span className="mt-0.5 font-mono text-[11px] tabular-nums text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: g.actor === "human" ? "var(--color-accent-text)" : "var(--color-pass)" }} />
                <div>
                  <p className="flex items-center gap-2 text-[15px] font-medium text-ink">
                    {g.name}
                    {g.actor === "human" && (
                      <span className="rounded-sm bg-accent-wash px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-accent-text">
                        human
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug text-ink-faint">{g.evidence}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <Heading className="text-[clamp(24px,3.5vw,34px)] leading-[1.12]">
                See it on a real ticket.
              </Heading>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-dim">
                Every ticket carries its own chain — pass, waiting, or skip, each with the evidence a non-expert can
                read. Nothing merges around it.
              </p>
            </div>
            <MediaReveal>
              <BrowserFrame shot="gatechain" url="app.toorunt.ai/tickets/SCRUM-307" />
            </MediaReveal>
          </div>
        </Container>
      </section>

      <CTASection
        eyebrow="For security teams"
        title="Bring the questions."
        accent="We built for them."
        sub="SOC 2 Type I on the roadmap, pen test scheduled, zero-retention model terms. Book a security review."
      />
    </>
  );
}
