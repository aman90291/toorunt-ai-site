import type { Metadata } from "next";
import { Heading } from "@/components/ui";
import { DemoForm } from "@/components/DemoForm";
import { HeroBackground } from "@/components/HeroBackground";
import { RECEIPT, LINES } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Book a demo",
  description:
    "A live run on a repo you choose — watch a governed AI engineering team carry a ticket to a reviewed, merged pull request.",
};

/**
 * /book — the demo-request page. Replaces the BookDemoDialog modal: every
 * "Book a demo" CTA routes here instead of opening an overlay, so the form
 * gets a real URL (linkable, back-button-able, measurable in analytics).
 *
 * Two columns: the form on the left, and a hero-echo panel on the right —
 * the wave-grid canvas under the receipt numbers, inset and rounded rather
 * than full-bleed so the fixed nav keeps sitting on white. On mobile the
 * form comes first; the panel follows as a closing proof block.
 *
 * An app-like screen, not a page: on desktop it is EXACTLY one viewport —
 * no footer (FooterGate) and no document scroll. The form column scrolls
 * internally on short laptop screens so the submit button stays reachable;
 * `m-auto` instead of items-center keeps the top edge reachable when it
 * does overflow. Mobile stacks and scrolls naturally — two full columns
 * can't share one phone screen.
 */
export default function BookPage() {
  return (
    <div className="mx-auto grid min-h-svh w-full max-w-[1560px] grid-cols-1 pt-14 lg:h-svh lg:grid-cols-2 lg:overflow-hidden">
      {/* ── form ─────────────────────────────────────────────── */}
      <div className="flex px-[var(--gutter)] py-12 lg:h-full lg:overflow-y-auto lg:py-10">
        <div className="m-auto w-full max-w-[26.5rem]">
          <p className="eyebrow">Book a demo</p>
          <Heading as="h1" className="mt-5 text-[clamp(28px,3vw,38px)] leading-[1.08]">
            A live run on a repo you choose.
          </Heading>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-dim">
            Tell us where to reach you. We&rsquo;ll set up a working session on your
            backlog — real tickets, real gates, the ledger on screen.
          </p>
          <DemoForm className="mt-8" />
        </div>
      </div>

      {/* ── hero echo ────────────────────────────────────────── */}
      <aside className="px-[var(--gutter)] pb-8 lg:h-full lg:min-h-0 lg:py-4 lg:pl-0 lg:pr-4">
        <div className="on-dark relative flex h-full min-h-[480px] flex-col justify-end overflow-hidden rounded-[calc(var(--radius-card)+12px)] bg-ground p-7 sm:p-10">
          <HeroBackground />
          <div className="relative z-10">
            <blockquote className="max-w-[20ch] font-display text-[clamp(26px,2.6vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
              {LINES.worstCase}
            </blockquote>
            <p className="mt-4 max-w-[46ch] text-[14px] leading-relaxed text-ink-dim">
              Every change waits behind fourteen hard gates, and nothing merges
              without a decision you can replay from the audit trail.
            </p>
            <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-line pt-7">
              {RECEIPT.map((r) => (
                <div key={r.label}>
                  <dd className="font-display text-[clamp(22px,2vw,30px)] font-semibold tabular-nums tracking-[-0.02em] text-accent-text">
                    {r.value}
                  </dd>
                  <dt className="mt-1 text-[12.5px] leading-snug text-ink-dim">{r.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </aside>
    </div>
  );
}
