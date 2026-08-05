import type { Metadata } from "next";
import { SectionFrame, Heading, Accent, Button } from "@/components/ui";
import { Doodle } from "@/components/Doodle";
import { PricingCalculator } from "@/components/PricingCalculator";
import { CTASection } from "@/components/CTASection";
import { DemoButton } from "@/components/DemoButton";
import { ECON } from "@/lib/stats";
import { CONTACT_MAILTO } from "@/lib/contact";
import { FAQ } from "@/content/faq";
import { PageHead } from "@/components/system/PageHead";
import { Panel, StatusDot } from "@/components/system/Panel";
import { Ledger } from "@/components/system/blocks";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Priced per gate-passed merged PR — a fraction of what a human PR costs, with your compute COGS on the ledger. Per-seat for high-volume teams; enterprise with BYO vault and SSO.",
  openGraph: { images: ["/og/pricing.png"] },
};

/**
 * /pricing — rebuilt in the instrument language (components/system/*).
 *
 * The questions at the bottom now come from `content/faq.ts` rather than from
 * a local array. That array was a near-duplicate of six entries already in
 * the FAQ set — same claims, slightly different wording — which is exactly
 * how a site ends up quoting two different compute costs. Filtering the
 * shared set to `category === "Pricing"` means the hero's question field and
 * this page can never disagree, and adding an answer in one place adds it to
 * both.
 */

const TIERS = [
  {
    name: "Per merged PR",
    price: `$${ECON.price}`,
    unit: "/ gate-passed PR",
    tagline: "Pay for shipped, reviewed, gated work.",
    features: [
      "Complexity-normalized — small PRs price small",
      "Per-ticket cost caps enforced in-product",
      "A rejected PR costs nothing",
      "Full audit trail included",
    ],
    accent: true,
  },
  {
    name: "Per seat",
    price: "Custom",
    unit: "/ bot / month",
    tagline: "For high-volume teams that dislike per-unit metering.",
    features: [
      "Flat per-bot pricing with usage caps",
      "Priced against a $100K+ engineer",
      "Volume commitments",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Let's talk",
    unit: "",
    tagline: "Your infra, your keys, your isolation.",
    features: [
      "Bring-your-own Vault / SSO / SCIM",
      "Isolated per-tenant deployment",
      "SOC 2 evidence export",
      "Security review & custom guardrails",
    ],
  },
];

export default function PricingPage() {
  const questions = FAQ.filter((f) => f.category === "Pricing");

  return (
    <>
      <PageHead
        flavor="pricing"
        label="Pricing"
        title="Priced like labor,"
        accent="not like seats."
        lead="A merged PR is a resolved ticket is clear value. So that's the unit — and because we meter our own compute, the margin is on the dashboard, not in a pitch."
        readouts={[
          ["per merged pr", `$${ECON.price}`],
          ["our compute", `$${ECON.cogsLow}–${ECON.cogsHigh}`],
          ["a rejected pr", "$0"],
          ["human baseline", `$${ECON.humanLow}–${ECON.humanHigh}`],
        ]}
      />

      <SectionFrame index="01" label="Plans" motion="spread" className="mt-[var(--space-section)]">
        {/* seq, not rise: the three tiers should arrive one after another —
            they are a comparison, and a stagger is what makes the eye read
            them left to right instead of as one block. */}
        <div data-fx="seq" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {TIERS.map((t, i) => (
            <div key={t.name} style={{ ["--i" as string]: i }}>
              <Panel
                label={t.name}
                status={t.accent ? "recommended" : undefined}
                tone={t.accent ? "human" : "none"}
                className={`h-full ${t.accent ? "!border-accent-text/40" : ""}`}
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-[40px] leading-none tabular-nums text-ink">{t.price}</span>
                    {t.unit && <span className="font-mono text-[11px] text-ink-faint">{t.unit}</span>}
                  </div>
                  <p className="mt-3 text-[14px] text-ink-dim">{t.tagline}</p>
                  <ul className="mt-6 flex flex-1 flex-col gap-3">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink-dim">
                        <Doodle name="check" width={13} className="mt-[5px] shrink-0 text-pass" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    {t.accent ? (
                      <DemoButton className="w-full">Book a demo</DemoButton>
                    ) : (
                      <Button href={CONTACT_MAILTO} variant="ghost" className="w-full">Talk to us</Button>
                    )}
                  </div>
                </div>
              </Panel>
            </div>
          ))}
        </div>
      </SectionFrame>

      <SectionFrame index="02" label="The ledger" motion="reconcile">
        <div data-fx="rise">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            Same ticket. <Accent>Three eras of cost.</Accent>
          </Heading>
          <div className="mt-[var(--space-block)]">
            <Ledger />
          </div>
        </div>
      </SectionFrame>

      <SectionFrame index="03" label="Do the math" motion="meter">
        <div data-fx="rise">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            What it saves you, <Accent>per month.</Accent>
          </Heading>
          <p className="mt-5 max-w-[58ch] text-[16.5px] leading-relaxed text-ink-dim">
            Drag the slider to your merged-PR volume. The human column is loaded engineer cost at
            ${ECON.humanLow}&ndash;${ECON.humanHigh} per PR — the comparison that actually matters.
          </p>
          <div className="mt-[var(--space-block)]">
            <Panel label="savings model" status="your volume" tone="live">
              <PricingCalculator />
            </Panel>
          </div>
        </div>
      </SectionFrame>

      <SectionFrame index="04" label="Questions" motion="stack">
        <div data-fx="rise">
          <Heading className="max-w-[20ch] text-[length:var(--text-h2)] leading-[1.05]">
            The ones <Accent>that decide it.</Accent>
          </Heading>
          <div className="mt-[var(--space-block)]">
            <Panel label="pricing questions" status={`${questions.length} answered`} tone="none" flush>
              <div data-fx="seq">
                {questions.map((f, i) => (
                  <details
                    key={f.id}
                    style={{ ["--i" as string]: i }}
                    className="group border-b border-line last:border-b-0"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-[16px] font-medium text-ink sm:px-6">
                      <span className="flex items-center gap-3">
                        <StatusDot tone="auto" />
                        {f.q}
                      </span>
                      <span className="shrink-0 text-accent-text transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="max-w-[70ch] px-5 pb-5 pl-[38px] text-[14.5px] leading-relaxed text-ink-dim sm:px-6 sm:pl-[46px]">
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </SectionFrame>

      <CTASection
        title="Clear the backlog."
        accent="Watch the ledger."
        sub="A live demo on a repo you choose — see the cost per PR for yourself."
      />
    </>
  );
}
