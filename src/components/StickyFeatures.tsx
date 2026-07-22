"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { FEATURES } from "@/content/features";
import { SHOTS } from "@/lib/shots";
import { Container } from "@/components/ui";
import { Doodle } from "@/components/Doodle";

/**
 * The feature walk — the Vorflux mechanic.
 *
 * The stage pins. Scroll drives two kinds of motion in the framed box on the
 * right: WITHIN a step the screenshot pans upward inside the window
 * (continuous, straight to the node), and BETWEEN steps the track slides one
 * frame-height — easing on single steps, snapping on multi-step jumps so a
 * fast wheel flick never leaves the box trailing the page.
 *
 * RENDER ARCHITECTURE — the left and right halves are deliberately decoupled:
 *
 *   • <Stage> (the right half) renders exactly ONCE. It is memoised and every
 *     prop is a stable ref, so React never reconciles it again; all of its
 *     motion is imperative writes from the scroll handler. Before this split,
 *     each step change re-rendered the whole section — four <img>s, the track,
 *     the lot — and that reconciliation landed precisely on the busiest frames
 *     of a fast scroll.
 *   • <CopyColumn> and <Rail> (the left half and the index) are the only
 *     things `active` re-renders, and they are a handful of text nodes.
 *
 * The scroll handler does zero DOM reads: geometry is measured once (and on
 * resize) into a cache, and everything derives from window.scrollY.
 *
 * Stage screenshots load eagerly at 1100w only — lazy 2x sources meant
 * multi-megabyte decodes landing mid-animation.
 *
 * Reduced motion: slides snap, pans are skipped — images rest at their tops.
 */

const STEP_VH = 82; // scroll distance per step

/* The card is 12% shorter than the image renders at full width — that gap
   is the pan. Full width must stay visible (an earlier build sized the image
   by height and cropped both edges); the card gives up height instead. */
const PAN = 0.12;

/* Stage-background gap that opens between cards mid-slide — what makes the
   transition read as one card leaving and another arriving. */
const CARD_GAP = 18;

const pad2 = (n: number) => String(n).padStart(2, "0");

export function StickyFeatures() {
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);
  const stage = useRef<HTMLDivElement | null>(null);
  const frame = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const imgs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const stageEl = stage.current;
    const frameEl = frame.current;
    if (!stageEl || !frameEl) return;
    setLive(true);

    const n = FEATURES.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const m = { top: 0, range: 1, heads: [] as number[], lastSeg: 0 };
    const measure = () => {
      const r = stageEl.getBoundingClientRect();
      m.top = r.top + window.scrollY;
      m.range = Math.max(1, stageEl.offsetHeight - window.innerHeight);
      const slotW = frameEl.clientWidth;
      // The card is one slide minus the inter-card gap; pan headroom is what
      // the full-width image overhangs the CARD by, not the slide.
      const cardH = frameEl.clientHeight - CARD_GAP;
      m.heads = FEATURES.map((f) => {
        const s = SHOTS[f.shot];
        return Math.max(0, slotW * (s.height / s.width) - cardH);
      });
    };

    const apply = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, (window.scrollY - m.top) / m.range));
      const seg = Math.min(n - 1, Math.floor(p * n));
      const within = Math.min(1, Math.max(0, p * n - seg));

      // Re-renders ONLY CopyColumn and Rail — Stage is memoised out.
      setActive((prev) => (prev === seg ? prev : seg));

      // The slide: ease on ±1, snap on jumps.
      const t = track.current;
      if (t) {
        const jumped = Math.abs(seg - m.lastSeg) > 1;
        t.style.transitionDuration = jumped || reduce ? "0ms" : "550ms";
        t.style.transform = `translateY(-${(seg * 100) / n}%)`;
        m.lastSeg = seg;
      }

      if (reduce) return;
      // The pan: current segment plus neighbours, so a slide never reveals a
      // half-panned frame.
      for (let i = Math.max(0, seg - 1); i <= Math.min(n - 1, seg + 1); i++) {
        const img = imgs.current[i];
        if (!img || m.heads[i] <= 0) continue;
        const w = i < seg ? 1 : i > seg ? 0 : within;
        img.style.transform = `translate3d(0, ${-w * m.heads[i]}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    apply();
    // Late layout shifts (fonts, images above the stage) move the cached top.
    const settle = setTimeout(onResize, 1200);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(settle);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section aria-labelledby="features-heading" className="on-dark relative bg-ground">
      {/* ── heading, centred in the open space above the stage ────── */}
      <Container>
        <div className="pt-[var(--space-section)] pb-[var(--space-block)] text-center">
          <p className="eyebrow inline-flex items-center gap-3">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent-text" />
            What you get
          </p>
          <h2
            id="features-heading"
            className="mx-auto mt-6 max-w-[18ch] font-display font-semibold tracking-[-0.03em] text-ink"
            style={{ fontSize: "var(--text-h2)", lineHeight: 1.03 }}
          >
            Not an agent.{" "}
            <span className="relative inline-block">
              <span className="text-accent">An organization.</span>
              <Doodle
                name="underline"
                stretch
                className="absolute -bottom-[0.24em] left-0 h-[0.16em] w-full text-accent"
              />
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[var(--text-lead)] leading-relaxed text-ink-dim">
            One accountable team — each capability its own bot, its own identity, its own gate.
          </p>
        </div>
      </Container>

      {/* ── desktop: pinned stage ─────────────────────────────────── */}
      <Container wide className="hidden lg:block">
        <div
          ref={stage}
          className="relative pb-[var(--space-section)]"
          style={{ height: `${FEATURES.length * STEP_VH}vh` }}
        >
          <div className="sticky top-[14vh] grid grid-cols-12 items-center gap-x-8">
            <CopyColumn active={active} live={live} />
            <Stage frame={frame} track={track} imgs={imgs} />
            <Rail active={active} />
          </div>
        </div>
      </Container>

      <MobileStack />
    </section>
  );
}

/* ── left half: the only thing a step change re-renders ─────────── */
const CopyColumn = memo(function CopyColumn({ active, live }: { active: number; live: boolean }) {
  return (
    <div className="relative col-span-4 min-h-[300px]">
      {FEATURES.map((f, i) => (
        <div
          key={f.key}
          aria-hidden={live && i !== active}
          className={`absolute inset-x-0 top-0 transition-all duration-500 ease-out ${
            !live || i === active
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          <span className="font-mono text-[11px] tracking-[0.2em] text-ink-faint">{f.index}</span>
          <h3
            className="mt-4 font-display font-semibold tracking-[-0.02em] text-ink"
            style={{ fontSize: "var(--text-h3)", lineHeight: 1.15 }}
          >
            {f.title}
          </h3>
          <p className="mt-3 text-[var(--text-lead)] leading-[1.5] text-accent-text">{f.lead}</p>
          <p className="mt-4 max-w-[42ch] text-[var(--text-body)] leading-[1.7] text-ink-dim">
            {f.body}
          </p>
        </div>
      ))}
    </div>
  );
});

/* ── right half: renders once, then React never touches it again ──
   memo + ref-only props = no reconciliation on step changes; every pixel of
   motion is an imperative write from the scroll handler. */
const Stage = memo(function Stage({
  frame,
  track,
  imgs,
}: {
  frame: RefObject<HTMLDivElement | null>;
  track: RefObject<HTMLDivElement | null>;
  imgs: RefObject<(HTMLImageElement | null)[]>;
}) {
  const total = FEATURES.length;
  return (
    <div className="col-span-7">
      {/* The backdrop is sized by VIEWPORT height, not by its content — it
          stands most of the window tall, with the card carousel centred in
          it, so the gradient ground reads as a real stage. */}
      <div
        className="flex items-center rounded-[calc(var(--radius-card)+12px)] border border-line bg-gradient-to-br from-ground-2 via-ground-2 to-ground-3 px-8 shadow-[0_32px_80px_-40px_rgba(0,0,0,0.7)] sm:px-12 xl:px-14"
        style={{ height: "min(74vh, 780px)" }}
      >
        {/* The carousel viewport — pure clip, no chrome of its own. The
            chrome (border, ground, shadow, radius) lives on each CARD, so
            the frame travels WITH its screenshot: mid-slide you see one
            bordered card exiting the top and the next entering from the
            bottom with stage background between them, instead of pixels
            swapping behind one fixed window. */}
        <div
          ref={frame}
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: `${SHOTS[FEATURES[0].shot].width} / ${SHOTS[FEATURES[0].shot].height * (1 - PAN)}`,
          }}
        >
          <div
            ref={track}
            className="absolute inset-x-0 top-0 transition-transform ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
            style={{ height: `${total * 100}%` }}
          >
            {FEATURES.map((f, i) => {
              const s = SHOTS[f.shot];
              return (
                /* slide = card + the gap that shows mid-transition */
                <div
                  key={f.key}
                  style={{ height: `${100 / total}%`, paddingBottom: CARD_GAP }}
                >
                  <div className="relative h-full overflow-hidden rounded-[var(--radius-card)] border border-line bg-ground-2 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.65)]">
                    {/* 1100w only, eager: 2x sources decoded ~40MB of bitmaps
                        mid-animation, which was most of the original lag */}
                    <img
                      ref={(el) => { imgs.current[i] = el; }}
                      src={`/shots/${f.shot}-1100.webp`}
                      width={s.width}
                      height={s.height}
                      alt={s.alt}
                      loading="eager"
                      decoding="async"
                      className="absolute left-0 top-0 h-auto w-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

const Rail = memo(function Rail({ active }: { active: number }) {
  const total = FEATURES.length;
  return (
    <div className="col-span-1 flex flex-col items-end">
      <span className="font-mono text-[12px] tabular-nums text-ink">{pad2(active + 1)}</span>
      <span className="my-3 block h-24 w-px bg-line-2">
        <span
          className="block w-px bg-accent transition-[height] duration-500"
          style={{ height: `${((active + 1) / total) * 100}%` }}
        />
      </span>
      <span className="font-mono text-[12px] tabular-nums text-ink-faint">{pad2(total)}</span>
    </div>
  );
});

/* ── mobile: a plain stack, stateless, rendered once ────────────── */
const MobileStack = memo(function MobileStack() {
  return (
    <Container className="lg:hidden">
      <div className="divide-y divide-line border-t border-line pb-[var(--space-section)]">
        {FEATURES.map((f, i) => {
          const s = SHOTS[f.shot];
          return (
            <article key={f.key} className="py-10">
              <span className="font-mono text-[11px] tracking-[0.2em] text-ink-faint">{f.index}</span>
              <h3
                className="mt-3 font-display font-semibold tracking-[-0.02em] text-ink"
                style={{ fontSize: "var(--text-h3)", lineHeight: 1.15 }}
              >
                {f.title}
              </h3>
              <p className="mt-3 text-[var(--text-lead)] leading-[1.5] text-accent-text">{f.lead}</p>
              <p className="mt-4 text-[var(--text-body)] leading-[1.7] text-ink-dim">{f.body}</p>
              <figure className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ground-2">
                <picture>
                  <source type="image/avif" srcSet={`/shots/${f.shot}-1100.avif 1x, /shots/${f.shot}-2200.avif 2x`} />
                  <img
                    src={`/shots/${f.shot}-1100.webp`}
                    srcSet={`/shots/${f.shot}-1100.webp 1x, /shots/${f.shot}-2200.webp 2x`}
                    width={s.width}
                    height={s.height}
                    alt={s.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="block h-auto w-full"
                  />
                </picture>
              </figure>
            </article>
          );
        })}
      </div>
    </Container>
  );
});
