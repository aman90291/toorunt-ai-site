import type { Metadata } from "next";
import { Container, Heading, Accent, Eyebrow, SectionRule, Button } from "@/components/ui";
import { PricingCalculator } from "@/components/PricingCalculator";
import { CTASection } from "@/components/CTASection";
import { ECON } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Priced per gate-passed merged PR — a fraction of what a human PR costs, with your compute COGS on the ledger. Per-seat for high-volume teams; enterprise with BYO vault and SSO.",
  openGraph: { images: ["/og/pricing.png"] },
};

const TIERS = [
  {
    name: "Per merged PR",
    price: `$${ECON.price}`,
    unit: "/ gate-passed PR",
    tagline: "Pay for shipped, reviewed, gated work.",
    features: ["Complexity-normalized — small PRs price small", "Per-ticket cost caps enforced in-product", "A rejected PR costs nothing", "Full audit trail included"],
    accent: true,
  },
  {
    name: "Per seat",
    price: "Custom",
    unit: "/ bot / month",
    tagline: "For high-volume teams that dislike per-unit metering.",
    features: ["Flat per-bot pricing with usage caps", "Priced against a $100K+ engineer", "Volume commitments", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "Let's talk",
    unit: "",
    tagline: "Your infra, your keys, your isolation.",
    features: ["Bring-your-own Vault / SSO / SCIM", "Isolated per-tenant deployment", "SOC 2 evidence export", "Security review & custom guardrails"],
  },
];

const FAQ = [
  { q: "What counts as a merged PR?", a: "A pull request that cleared the full gate chain and merged under your branch protection. Complexity-normalized, so a one-line fix and an architectural change don't price the same." },
  { q: "What if the PR is rejected?", a: "You pay nothing. Worst case is a rejected pull request — you're only billed for work that shipped and passed review." },
  { q: "Can spend run away?", a: "No. Every ticket carries a hard cost cap enforced in the product, and the whole thing has a kill switch. Compute is metered on an append-only ledger you can see." },
  { q: "What's your actual compute cost?", a: `$${ECON.cogsLow}–$${ECON.cogsHigh} per merged PR. Only three pipeline layers call a model; the rest is deterministic code. We show you the ledger — the margin isn't a mystery.` },
  { q: "How is our code and data isolated?", a: "Per-tenant state, policy, and keys. Secrets live in a vault the pipeline can't echo. Enterprise brings its own vault and SSO; zero-retention terms with model providers are on the roadmap." },
];

export default function PricingPage() {
  return (
    <>
      <section className="pt-32 pb-16 sm:pt-40">
        <Container>
          <Eyebrow>Pricing</Eyebrow>
          <Heading as="h1" split className="mt-6 max-w-3xl text-[clamp(36px,5.5vw,60px)] leading-[1.06]">
            Priced like labor, <Accent>not like seats.</Accent>
          </Heading>
          <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-ink-dim">
            A merged PR is a resolved ticket is clear value. So that&rsquo;s the unit — and because we meter our own
            compute, the margin is on the dashboard, not in a pitch.
          </p>
        </Container>
      </section>

      {/* Tiers */}
      <section className="pb-20">
        <Container>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`perspective-3d flex flex-col rounded-[var(--radius-card)] border p-7 ${
                  t.accent ? "border-accent/40 bg-accent-wash/40" : "border-line bg-ground-2/50"
                }`}
              >
                <h3 className="text-[15px] font-semibold text-ink">{t.name}</h3>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-display text-[40px] leading-none text-ink">{t.price}</span>
                  {t.unit && <span className="font-mono text-[12px] text-ink-faint">{t.unit}</span>}
                </div>
                <p className="mt-3 text-[14px] text-ink-dim">{t.tagline}</p>
                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink-dim">
                      <span className="mt-[3px] text-accent">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <Button href="mailto:hello@toorunt.ai?subject=Toorunt%20AI" variant={t.accent ? "primary" : "ghost"} className="w-full">
                    {t.accent ? "Book a demo" : "Talk to us"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Calculator */}
      <section className="border-t border-line py-24 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <div>
              <SectionRule label="Do the math" />
              <Heading split className="mt-6 text-[clamp(26px,4vw,40px)] leading-[1.1]">
                What it saves you, <Accent>per month.</Accent>
              </Heading>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-dim">
                Drag the slider to your merged-PR volume. The human column is loaded engineer cost at
                ${ECON.humanLow}&ndash;${ECON.humanHigh} per PR — the comparison that actually matters.
              </p>
            </div>
            <PricingCalculator />
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-line py-24 sm:py-28">
        <Container>
          <SectionRule label="Questions" />
          <div className="mt-10 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[17px] font-medium text-ink">
                  {f.q}
                  <span className="ml-4 text-accent transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-dim">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <CTASection title="Clear the backlog." accent="Watch the ledger." sub="A live demo on a repo you choose — see the cost per PR for yourself." />
    </>
  );
}
