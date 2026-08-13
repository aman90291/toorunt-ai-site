import { Container } from "@/components/ui";
import { RECEIPTS, type Receipt } from "@/content/receipts";

/**
 * The closing wall — two counter-scrolling rows of receipt cards.
 *
 * Pure CSS marquee, no client JS: each row renders its cards TWICE and
 * translates -50%, so the second copy is exactly under the first when the
 * animation wraps and the loop is seamless. That is the whole trick, and it
 * is why the duplicate set is `aria-hidden` — a screen reader that read the
 * wall twice would be describing an implementation detail.
 *
 * The rows run at different speeds and in opposite directions. Matched, two
 * parallel rows read as one big moving block; mismatched, they read as depth.
 *
 * Motion stops on hover AND on focus-within (see globals.css) — a keyboard
 * user tabbing into a card should not have to chase it across the screen.
 * Under `prefers-reduced-motion` the global clamp freezes both rows, leaving
 * a static wall, which is still perfectly readable.
 */
export function Receipts() {
  const half = Math.ceil(RECEIPTS.length / 2);
  const rows = [RECEIPTS.slice(0, half), RECEIPTS.slice(half)];

  return (
    <section data-dark className="receipts-section on-dark relative overflow-hidden bg-ground py-[var(--space-section)]">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow inline-flex items-center gap-3">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent-text" />
            Receipts
          </p>
          <h2
            className="mx-auto mt-6 max-w-[18ch] font-display font-semibold tracking-[-0.03em] text-ink"
            style={{ fontSize: "var(--text-h2)", lineHeight: 1.04 }}
          >
            Every claim on this page <span className="text-accent">has a source.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] leading-relaxed text-ink-dim" style={{ fontSize: "var(--text-lead)" }}>
            We sell an audit trail. It would be a strange product to market with numbers you
            can&rsquo;t check. Here they are, with where each one comes from.
          </p>
        </div>
      </Container>

      <div className="marquee-mask mt-[var(--space-block)] flex flex-col gap-4">
        {rows.map((row, i) => (
          <div key={i} className="flex overflow-hidden">
            <ul
              className={`animate-marquee-x flex shrink-0 gap-4 ${i === 1 ? "flex-row-reverse" : ""}`}
              style={{ "--speed": i === 0 ? "78s" : "94s" } as React.CSSProperties}
            >
              {[...row, ...row].map((r, k) => (
                <ReceiptCard key={`${r.value}-${k}`} receipt={r} hidden={k >= row.length} index={i * 3 + k} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

const HUES = ["var(--hue-1)", "var(--hue-2)", "var(--hue-3)", "var(--hue-4)", "var(--hue-5)"];

function ReceiptCard({ receipt: r, hidden, index }: { receipt: Receipt; hidden: boolean; index: number }) {
  const figure = r.kind === "figure";
  const hue = HUES[index % HUES.length];

  return (
    <li
      aria-hidden={hidden || undefined}
      style={{ ["--hue" as string]: hue }}
      className="relative flex w-[clamp(268px,25vw,360px)] shrink-0 flex-col justify-between overflow-hidden rounded-[var(--radius-card)] border border-line bg-ground-2 p-6"
    >
      {/* Each card carries one of the five hues on its top edge. A wall of
          fourteen identically-navy cards is the most monochrome thing on the
          page, and it is the last band before the close — so this is where
          the palette should be most obviously alive. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, var(--hue), color-mix(in srgb, var(--hue) 20%, transparent) 60%, transparent)",
        }}
      />
      <div>
        {figure ? (
          <p
            className="font-display font-semibold leading-none tracking-[-0.03em] tabular-nums text-(--hue)"
            style={{ fontSize: "var(--text-figure)" }}
          >
            {r.value}
          </p>
        ) : (
          <p
            className="font-display text-[17px] font-semibold leading-[1.28] tracking-[-0.015em] text-ink"
          >
            {r.value}
          </p>
        )}
        <p className={`text-[13.5px] leading-relaxed text-ink-dim ${figure ? "mt-3" : "mt-2.5"}`}>
          {r.label}
        </p>
      </div>
      <p className="mt-5 border-t border-line pt-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {r.source}
      </p>
    </li>
  );
}
