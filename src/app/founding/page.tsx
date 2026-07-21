import type { Metadata } from "next";
import { Container, Eyebrow, Accent, Button } from "@/components/ui";

/**
 * Founding Mode — the SELF-SERVE door for non-technical founders.
 * Additive, standalone route (/founding). Does not touch the homepage.
 * Demonstrates the go-to-market flow: pitch -> funnel -> use-anywhere -> pricing.
 */
export const metadata: Metadata = {
  title: "Founding Mode — describe your app, we build it | tOOrunt AI",
  description:
    "For non-technical founders: describe your product and Toorunt builds it, launches it, and runs it. Start building free.",
};

const FLOW: { n: string; t: string; d: string }[] = [
  { n: "01", t: "Land", d: "“I have an idea” brings you here." },
  { n: "02", t: "Start free", d: "Sign up. No card." },
  { n: "03", t: "Describe it", d: "By voice or text — it captures everything." },
  { n: "04", t: "Watch it build", d: "A live preview, with updates." },
  { n: "05", t: "Go live free", d: "yourapp.toorunt.app — the aha moment." },
  { n: "06", t: "Grow", d: "Your own domain, more products, voice." },
];

const CLIENTS: { icon: string; t: string; now: boolean; d: string }[] = [
  { icon: "🌐", t: "Web app", now: true, d: "Instant in the browser — zero install." },
  { icon: "📲", t: "Add to Home Screen", now: true, d: "App icon, fullscreen, push — no store." },
  { icon: "📱", t: "iPhone", now: false, d: "Native app + “Hey Toorunt” voice." },
  { icon: "🤖", t: "Android", now: false, d: "Same code, the same account." },
];

const TIERS: { k: string; price: string; per: string; sub: string; mid: boolean; feats: string[] }[] = [
  { k: "Free", price: "$0", per: "", sub: "the aha", mid: false, feats: ["Describe and build", "Live preview on Stage", "1 product · Toorunt subdomain", "Web + Home Screen"] },
  { k: "Founder", price: "$49", per: "/mo", sub: "most popular", mid: true, feats: ["Everything in Free, plus", "Your own domain", "Up to 5 products", "Voice cofounder · priority build", "Native apps"] },
  { k: "Scale", price: "$199", per: "/mo", sub: "+ usage", mid: false, feats: ["Your own cloud (your bill)", "Higher limits", "On-call and SLAs", "Team seats"] },
];

export default function FoundingPage() {
  return (
    <main className="bg-ground text-ink">
      {/* HERO */}
      <section className="pt-28 pb-20 sm:pt-36">
        <Container>
          <Eyebrow>Founding Mode</Eyebrow>
          <h1 className="mt-6 max-w-4xl text-[clamp(38px,6vw,84px)] font-semibold leading-[0.98] tracking-tight">
            Describe your app. <Accent>We build it, launch it, and run it.</Accent>
          </h1>
          <p className="mt-7 max-w-2xl text-[18px] leading-relaxed text-ink-dim">
            No code, no agency, no DevOps. Talk to Toorunt like a cofounder — it interviews you,
            builds the product, tests it, takes it live on a free stage, and keeps it alive. You
            only make the calls that cost money or carry your name.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="#start" variant="primary">Start building free</Button>
            <Button href="/product/" variant="ghost">See how it works →</Button>
          </div>
        </Container>
      </section>

      {/* FLOW */}
      <section className="border-t border-line bg-ground-2 py-20">
        <Container>
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 max-w-3xl text-[clamp(28px,4vw,52px)] font-semibold leading-[1.04] tracking-tight">
            Free to your first <Accent>live product.</Accent>
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FLOW.map((s) => (
              <div key={s.n} className="rounded-2xl border border-line bg-ground p-6">
                <div className="font-mono text-[12px] tracking-widest text-accent-text">{s.n}</div>
                <div className="mt-3 text-[18px] font-semibold">{s.t}</div>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-dim">{s.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* USE ANYWHERE */}
      <section className="border-t border-line py-20">
        <Container>
          <Eyebrow>Use it anywhere</Eyebrow>
          <h2 className="mt-5 max-w-3xl text-[clamp(28px,4vw,52px)] font-semibold leading-[1.04] tracking-tight">
            One account. <Accent>Every device.</Accent>
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ink-dim">
            Sign up once; the same account and product follow you — start on the laptop, continue on
            your phone, get voice on iPhone. Nothing to set up twice.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CLIENTS.map((c) => (
              <div key={c.t} className="rounded-2xl border border-line bg-ground-2 p-6">
                <div className="flex items-center gap-2">
                  <span className="text-[20px]">{c.icon}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                    {c.now ? "available now" : "coming soon"}
                  </span>
                </div>
                <div className="mt-3 text-[17px] font-semibold">{c.t}</div>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-dim">{c.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PRICING */}
      <section className="border-t border-line bg-ground-2 py-20">
        <Container>
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-5 text-[clamp(28px,4vw,52px)] font-semibold leading-[1.04] tracking-tight">
            Free to wow. <Accent>Paid to grow.</Accent>
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.k}
                className={
                  "rounded-2xl border p-7 " +
                  (t.mid ? "border-accent-text bg-ground" : "border-line bg-ground")
                }
              >
                <div className="font-mono text-[11px] uppercase tracking-widest text-ink-faint">{t.k}</div>
                <div className="mt-2 text-[38px] font-semibold tracking-tight">
                  {t.price}
                  <span className="text-[16px] text-ink-faint">{t.per}</span>
                </div>
                <div className="font-mono text-[11px] text-ink-faint">{t.sub}</div>
                <ul className="mt-5 space-y-2 text-[14px] text-ink-dim">
                  {t.feats.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-accent-text">—</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-ink-faint">
            Illustrative — real numbers after a pricing test. The AI build compute is metered and
            bundled generously into paid tiers, shown in-app so it never silently stalls.
          </p>
        </Container>
      </section>

      {/* CTA */}
      <section id="start" className="border-t border-line py-28 text-center">
        <Container>
          <h2 className="mx-auto max-w-3xl text-[clamp(34px,5.5vw,76px)] font-semibold leading-[0.98] tracking-tight">
            You have the idea. <Accent>We build the company.</Accent>
          </h2>
          <div className="mt-9 flex justify-center gap-3">
            <Button href="#start" variant="primary">Start building free</Button>
          </div>
          <p className="mt-5 font-mono text-[12px] text-ink-faint">No card · live preview in minutes</p>
        </Container>
      </section>
    </main>
  );
}
