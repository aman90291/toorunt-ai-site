import type { Metadata } from "next";
import { Heading } from "@/components/ui";
import { DemoForm } from "@/components/DemoForm";
import { DemoFlow } from "@/components/book/DemoFlow";

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
 * Two columns: the form on the left, and a proof panel on the right — the
 * DemoFlow infographic (the ticket's journey through the live session) on an
 * inset, rounded dark card with a cobalt bloom, so the fixed nav keeps
 * sitting on white. On mobile the form comes first; the panel follows as a
 * closing proof block.
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
            Thirty minutes on a repo you choose — a real ticket from your backlog
            carried to a merged PR, every gate and decision on screen. No slides.
          </p>
          <DemoForm className="mt-8" />
        </div>
      </div>

      {/* ── proof panel ──────────────────────────────────────── */}
      <aside className="px-[var(--gutter)] pb-8 lg:h-full lg:min-h-0 lg:py-4 lg:pl-0 lg:pr-4">
        <div className="on-dark relative flex h-full min-h-[480px] flex-col justify-center overflow-hidden rounded-[calc(var(--radius-card)+12px)] bg-ground p-7 sm:p-10">
          {/* cobalt bloom, in-palette — the depth move without a canvas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 60% at 80% 8%, color-mix(in srgb, var(--color-accent) 20%, transparent) 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10">
            <p className="eyebrow">In a live session</p>
            <blockquote className="mt-4 max-w-[18ch] font-display text-[clamp(24px,2.3vw,32px)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink">
              Watch a ticket become a merged&nbsp;PR.
            </blockquote>
            <div className="mt-8">
              <DemoFlow />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
