import type { ReactNode } from "react";
import { Container, Heading, Accent } from "@/components/ui";

/**
 * The masthead every inner page opens with.
 *
 * Deliberately NOT a hero. The home page has the hero — the globe, the
 * question field, the claim — and repeating that energy on /pricing would
 * make the site feel like five landing pages stapled together rather than one
 * console with five screens. This is a header row: channel label, title,
 * one paragraph, and an optional strip of readings.
 *
 * `readouts` is what makes it feel like an instrument rather than a title.
 * Each inner page states its own key numbers up front — 14 gates, 3
 * decisions and the four-tier engineering ladder — so the page has substance above the fold even before
 * anything below it has loaded or been scrolled to.
 */
export function PageHead({
  flavor,
  label,
  title,
  accent,
  lead,
  readouts,
  actions,
}: {
  flavor: "product" | "pricing" | "security";
  label: string;
  title: ReactNode;
  /** The turn of the headline — rendered in the emphasis weight. */
  accent?: ReactNode;
  lead: ReactNode;
  readouts?: readonly (readonly [string, string])[];
  actions?: ReactNode;
}) {
  return (
    <section data-dark data-page-flavor={flavor} className="page-head relative overflow-hidden bg-ground pt-32 sm:pt-36">
      <Container>
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[128px_minmax(0,1fr)]">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-faint lg:sticky lg:top-24 lg:self-start">
            <span className="text-accent-text">·</span> <span className="lg:mt-2 lg:block">{label}</span>
          </p>

          <div>
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.56fr)]">
              <div>
                <Heading as="h1" className="max-w-[19ch] text-[length:var(--text-hero)] leading-[1.03]">
                  {title} {accent && <Accent>{accent}</Accent>}
                </Heading>
                <p className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-ink-dim">{lead}</p>

                {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
              </div>

              <PageSignal flavor={flavor} />
            </div>

            {readouts && (
              <dl data-fx="seq" className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-4">
                {readouts.map(([k, v], i) => (
                  <div key={k} style={{ ["--i" as string]: i }} className="bg-ground-2 p-4">
                    <dt className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">{k}</dt>
                    <dd className="mt-2 font-display text-[clamp(20px,2vw,26px)] font-semibold leading-none tabular-nums text-ink">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function PageSignal({ flavor }: { flavor: "product" | "pricing" | "security" }) {
  if (flavor === "pricing") {
    return (
      <div data-fx="meter" className="page-signal page-signal-pricing" aria-hidden="true">
        <div className="page-signal-meta"><span>engineering ladder</span><span>4 tiers</span></div>
        <div className="page-price-orbit"><span>$9</span><small>launch / month</small></div>
        <div className="page-price-bars">
          <span className="meter-fill" style={{ ["--i" as string]: 0, width: "18%" }} />
          <span className="meter-fill" style={{ ["--i" as string]: 1, width: "42%" }} />
          <span className="meter-fill is-pass" style={{ ["--i" as string]: 2, width: "72%" }} />
          <span className="meter-fill is-pass" style={{ ["--i" as string]: 3, width: "100%" }} />
        </div>
      </div>
    );
  }

  if (flavor === "security") {
    return (
      <div data-fx="chain" className="page-signal page-signal-security" aria-hidden="true">
        <div className="page-signal-meta"><span>chain integrity</span><span>verified</span></div>
        <div className="page-hash-chain">
          {Array.from({ length: 6 }, (_, i) => <span key={i} style={{ ["--i" as string]: i }} />)}
        </div>
        <div className="page-hash-core"><strong>14/14</strong><small>gates sealed</small></div>
        <p>record n → record n+1 → intact</p>
      </div>
    );
  }

  return (
    <div data-fx="seq" className="page-signal page-signal-product" aria-hidden="true">
      <div className="page-signal-meta"><span>ticket route</span><span>5 phases</span></div>
      <div className="page-route">
        {["scope", "plan", "prove", "review", "merge"].map((item, i) => (
          <span key={item} style={{ ["--i" as string]: i }}><i>{String(i + 1).padStart(2, "0")}</i>{item}</span>
        ))}
      </div>
      <p>Jira in <b>→</b> merged PR out</p>
    </div>
  );
}
