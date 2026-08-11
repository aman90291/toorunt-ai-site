import type { Metadata } from "next";
import { Accent, Button, Heading, SectionFrame } from "@/components/ui";
import { CTASection } from "@/components/CTASection";
import { DemoButton } from "@/components/DemoButton";
import { Doodle } from "@/components/Doodle";
import { PageHead } from "@/components/system/PageHead";
import { Panel, StatusDot } from "@/components/system/Panel";
import { CONTACT_MAILTO } from "@/lib/contact";
import { FAQ } from "@/content/faq";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Four product-development tiers: Launch at $9/month, Build at $99/month, Scale at $999/month, and Enterprise from $9,999/month.",
  openGraph: { images: ["/og/pricing.png"] },
};

const TIERS = [
  {
    gate: "Gate 01 · Self-serve",
    name: "Launch",
    price: "$9",
    unit: "/mo",
    status: "test the idea",
    tagline: "The fastest way to see if this idea is real.",
    forWhom: "Solo builders, students, and first-time founders testing an idea before spending real money.",
    features: [
      "Prompt-to-app deployment — no repository required",
      "Shared infrastructure and one project slot",
      "Community help centre",
    ],
    upgrade: "Move up when the idea gets traction or needs real functionality beyond a live demo.",
    accent: false,
  },
  {
    gate: "Gate 02 · Founding mode",
    name: "Build",
    price: "$99",
    unit: "/mo",
    status: "run the business",
    tagline: "A founding engineer’s judgement, without the hire.",
    forWhom: "Solo founders or teams of 2–5 running a real product without an engineering hire.",
    features: [
      "Full app and site — authentication, payments, and database",
      "Research → brief → critique pass",
      "Email support and multiple projects",
    ],
    upgrade: "Move up when the team grows or a customer or investor needs reviewed work before it ships.",
    accent: false,
  },
  {
    gate: "Gate 03 · SDLC mode",
    name: "Scale",
    price: "$999",
    unit: "/mo",
    status: "ship with control",
    tagline: "Ships a merged PR under policy — not a diff handed back to a human.",
    forWhom: "Funded startups and teams of 5–30 engineers. Built for CTOs and Heads of Engineering.",
    features: [
      "Works in your GitHub and Jira",
      "Supervised or bounded-autonomous operation",
      "Governance core and full audit trail",
      "Dedicated Slack and priority support",
    ],
    upgrade: "Move up when procurement requires SSO, SOC 2, dedicated infrastructure, or an on-call SLA.",
    accent: true,
  },
  {
    gate: "Gate 04 · Trust layer",
    name: "Enterprise",
    price: "Talk to us",
    unit: "/mo",
    status: "procurement ready",
    tagline: "Built for the CISO who signs — not only the engineer who tries it.",
    forWhom: "Engineering organisations of 100+ people, often regulated. Built for VPs of Engineering and CISOs.",
    features: [
      "SSO / SAML / SCIM and RBAC",
      "Dedicated tenant or customer VPC",
      "On-call support and named CSM",
      "Custom engineering and compliance runway",
    ],
    upgrade: "Custom-scoped by design, so growth becomes a renegotiation rather than a forced tier.",
    accent: false,
  },
] as const;

const TIER_QUESTIONS = [
  ["01 · $9", "Does my idea work?", "Prompt-to-app. No repository required."],
  ["02 · $99", "Can I run a business on this, alone?", "Founding mode, without a governance layer yet."],
  ["03 · $999", "Can my team ship faster, accountably?", "Governance, audit trail, and work in real repositories."],
  ["04 · Enterprise", "Can procurement sign off on this?", "Identity, compliance, isolation, and custom scope."],
] as const;

export default function PricingPage() {
  const questions = FAQ.filter((item) => item.category === "Pricing");

  return (
    <>
      <PageHead
        flavor="pricing"
        label="Pricing"
        title="Four tiers of engineering."
        accent="One accountable ladder."
        lead="Each step is a different product, not merely a bigger invoice. Choose how much of the engineering organisation toorunt AI should become — and how much Trust Layer you need switched on."
        readouts={[
          ["launch", "$9/mo"],
          ["build", "$99/mo"],
          ["scale", "$999/mo"],
          ["enterprise", "talk to us"],
        ]}
      />

      <SectionFrame index="01" label="The engineering ladder" motion="spread" className="mt-[var(--space-section)]" hue="hue-2">
        <div data-fx="rise">
          <p className="eyebrow text-pass">Self-serve → managed</p>
          <Heading className="mt-4 max-w-[21ch] text-[length:var(--text-h2)] leading-[1.05]">
            Buy the product you need <Accent>at the stage you are in.</Accent>
          </Heading>
          <p className="mt-5 max-w-[66ch] text-[16.5px] leading-relaxed text-ink-dim">
            Start by testing an idea. Add the founding engineer, the governed delivery system, and finally the
            enterprise trust layer only when the work demands them.
          </p>
        </div>

        <div data-fx="seq" className="mt-[var(--space-block)] grid grid-cols-1 gap-4 xl:grid-cols-2">
          {TIERS.map((tier, index) => (
            <div key={tier.name} style={{ ["--i" as string]: index }}>
              <Panel
                label={tier.gate}
                status={tier.status}
                tone={tier.accent ? "human" : "none"}
                className={`h-full ${tier.accent ? "!border-accent-text/50" : ""}`}
              >
                <div className="flex h-full flex-col">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h2 className="font-display text-[30px] font-semibold leading-none text-ink">{tier.name}</h2>
                      <p className="mt-3 max-w-[34ch] font-display text-[17px] italic leading-snug text-ink-dim">
                        “{tier.tagline}”
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-display text-[44px] leading-none tabular-nums ${tier.accent ? "text-pass" : "text-ink"}`}>
                        {tier.price}
                      </span>
                      <span className="font-mono text-[11px] text-ink-faint">{tier.unit}</span>
                    </div>
                  </div>

                  <div className="mt-7 grid flex-1 gap-6 border-t border-line pt-6 md:grid-cols-2">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent-text">What’s included</p>
                      <ul className="mt-4 flex flex-col gap-3">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink-dim">
                            <Doodle name="check" width={13} className="mt-[5px] shrink-0 text-pass" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent-text">Who it’s for</p>
                      <p className="mt-4 text-[13.5px] leading-relaxed text-ink-dim">{tier.forWhom}</p>
                      <div className="mt-5 border-l border-accent-text/40 pl-4">
                        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink-faint">
                          {tier.name === "Enterprise" ? "Stays because" : "Upgrades when"}
                        </p>
                        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-faint">{tier.upgrade}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7">
                    {tier.name === "Enterprise" ? (
                      <Button href={CONTACT_MAILTO} variant="ghost" className="w-full">Talk to us</Button>
                    ) : (
                      <DemoButton variant={tier.accent ? "primary" : "ghost"} className="w-full">
                        {tier.name === "Launch" ? "Start with Launch" : `Talk through ${tier.name}`}
                      </DemoButton>
                    )}
                  </div>
                </div>
              </Panel>
            </div>
          ))}
        </div>
      </SectionFrame>

      <SectionFrame index="02" label="Choose by outcome" motion="reconcile">
        <div data-fx="rise">
          <Heading className="max-w-[21ch] text-[length:var(--text-h2)] leading-[1.05]">
            The question <Accent>each tier answers.</Accent>
          </Heading>
          <div data-fx="seq" className="mt-[var(--space-block)] grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
            {TIER_QUESTIONS.map(([label, question, answer], index) => (
              <article key={label} style={{ ["--i" as string]: index }} className="min-h-[190px] bg-ground-2 p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-pass">{label}</p>
                <h3 className="mt-6 font-display text-[20px] font-semibold leading-tight text-ink">{question}</h3>
                <p className="mt-4 text-[13px] leading-relaxed text-ink-dim">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </SectionFrame>

      <SectionFrame index="03" label="Questions" motion="stack">
        <div data-fx="rise">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            The ones <Accent>that decide it.</Accent>
          </Heading>
          <div className="mt-[var(--space-block)]">
            <Panel label="pricing questions" status={`${questions.length} answered`} tone="none" flush>
              <div data-fx="seq">
                {questions.map((item, index) => (
                  <details key={item.id} style={{ ["--i" as string]: index }} className="group border-b border-line last:border-b-0">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-[16px] font-medium text-ink sm:px-6">
                      <span className="flex items-center gap-3"><StatusDot tone="auto" />{item.q}</span>
                      <span className="shrink-0 text-accent-text transition-transform duration-200 group-open:rotate-45">+</span>
                    </summary>
                    <p className="max-w-[70ch] px-5 pb-5 pl-[38px] text-[14.5px] leading-relaxed text-ink-dim sm:px-6 sm:pl-[46px]">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </SectionFrame>

      <CTASection
        title="Choose the product you need now."
        accent="Keep the next gate visible."
        sub="Start at $9/month or talk to us about a governed deployment for your team."
      />
    </>
  );
}
