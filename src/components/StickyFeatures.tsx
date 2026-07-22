"use client";

import { useEffect, useRef, useState } from "react";
import { FEATURES } from "@/content/features";
import { SHOTS } from "@/lib/shots";
import { Container } from "@/components/ui";
import { Doodle } from "@/components/Doodle";

/**
 * The feature walk — the Vorflux mechanic, all three layers of it.
 *
 * The stage pins. Scroll drives two kinds of motion in the framed box on the
 * right, layered:
 *
 *   1. WITHIN a step, the screenshot is taller than the frame and PANS
 *      upward inside it as you scroll through the step's segment — the "box
 *      that scrolls" in the reference. Continuous, no transition, written
 *      straight to the node each frame.
 *   2. BETWEEN steps, the track slides up by one frame-height on a CSS
 *      transition, so the next screenshot enters from the bottom and rests.
 *
 * The pan needs headroom to exist: the frame's aspect is deliberately WIDER
 * (shorter) than the screenshots', so at equal width the image is taller than
 * the frame and has somewhere to go. Give the frame the image's own ratio and
 * the pan distance is zero — that is why the earlier build could not scroll
 * inside the box.
 *
 * One rAF-throttled scroll handler drives everything: overall progress p,
 * the discrete step index (copy fade, counter, track slide — via state), and
 * the per-image pan offsets (via refs, no re-render). The IntersectionObserver
 * sentinels are gone; segments of p replace them.
 *
 * Perf: all four stage screenshots load EAGERLY. They were lazy, so each
 * arrived and decoded mid-slide the first time it was needed — that decode hitch
 * is what made the section feel slow. Four AVIFs up front is far cheaper than
 * one decode during an animation.
 *
 * Reduced motion: the global clamp makes the slide instant, and the pan is
 * skipped entirely — images rest at their top edge.
 */

const STEP_VH = 82; // scroll distance per step

/* The frame is 15% SHORTER than the image renders at full width — that is
   where the pan headroom comes from now. The previous build made the image
   115% of the frame's HEIGHT instead, which cropped both sides of every
   screenshot; full width has to be visible, so the frame gives up height
   rather than the image giving up edges. */
const PAN = 0.15;

export function StickyFeatures() {
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);
  const stage = useRef<HTMLDivElement | null>(null);
  const frame = useRef<HTMLDivElement | null>(null);
  const imgs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const stageEl = stage.current;
    const frameEl = frame.current;
    if (!stageEl || !frameEl) return;
    setLive(true);

    const n = FEATURES.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    /* All geometry is measured ONCE here and cached — the scroll path below
       does no DOM reads at all. Reading clientHeight/getBoundingClientRect
       inside the rAF forced a synchronous layout on every scrolled frame,
       which is a large part of why fast scrolling stuttered. */
    const m = { top: 0, range: 1, heads: [] as number[] };
    const measure = () => {
      const r = stageEl.getBoundingClientRect();
      m.top = r.top + window.scrollY;
      m.range = Math.max(1, stageEl.offsetHeight - window.innerHeight);
      const slotW = frameEl.clientWidth;
      const slotH = frameEl.clientHeight;
      // headroom per image, from the intrinsic ratios — no <img> reads needed
      m.heads = FEATURES.map((f) => {
        const s = SHOTS[f.shot];
        return Math.max(0, slotW * (s.height / s.width) - slotH);
      });
    };

    const apply = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, (window.scrollY - m.top) / m.range));

      const seg = Math.min(n - 1, Math.floor(p * n));
      const within = Math.min(1, Math.max(0, p * n - seg));

      setActive((prev) => (prev === seg ? prev : seg));

      if (reduce) return;
      // Pan the segment's image; neighbours too, so a slide never reveals a
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

  const total = FEATURES.length;
  const pad = (n: number) => String(n).padStart(2, "0");

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
          style={{ height: `${total * STEP_VH}vh` }}
        >
          <div className="sticky top-[14vh] grid grid-cols-12 items-center gap-x-8">
            {/* copy — absolutely stacked so each fades in the same place */}
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
                  <span className="font-mono text-[11px] tracking-[0.2em] text-ink-faint">
                    {f.index}
                  </span>
                  <h3
                    className="mt-4 font-display font-semibold tracking-[-0.02em] text-ink"
                    style={{ fontSize: "var(--text-h3)", lineHeight: 1.15 }}
                  >
                    {f.title}
                  </h3>
                  <p className="mt-3 text-[var(--text-lead)] leading-[1.5] text-accent-text">
                    {f.lead}
                  </p>
                  <p className="mt-4 max-w-[42ch] text-[var(--text-body)] leading-[1.7] text-ink-dim">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>

            {/* the framed box — outer card, inset window, panning content */}
            <div className="col-span-7">
              <div className="rounded-[calc(var(--radius-card)+10px)] border border-line bg-gradient-to-br from-ground-2 to-ground-3 p-4 shadow-[0_32px_80px_-40px_rgba(0,0,0,0.7)] sm:p-6">
                {/* The window's height comes from the first shot's ratio, cut
                    by the pan factor — so the full WIDTH of every screenshot
                    is visible (nothing cropped at the sides) and the ~15%
                    of image that doesn't fit vertically is what pans. */}
                <div
                  ref={frame}
                  className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-ground-2"
                  style={{
                    aspectRatio: `${SHOTS[FEATURES[0].shot].width} / ${SHOTS[FEATURES[0].shot].height * (1 - PAN)}`,
                  }}
                >
                  {/* the step slide: one frame-height per step */}
                  <div
                    className="absolute inset-x-0 top-0 transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
                    style={{
                      height: `${total * 100}%`,
                      transform: `translateY(-${(active * 100) / total}%)`,
                    }}
                  >
                    {FEATURES.map((f, i) => {
                      const s = SHOTS[f.shot];
                      return (
                        /* each slot clips its own image; the image is taller
                           than the slot and pans inside it */
                        <div
                          key={f.key}
                          className="relative overflow-hidden"
                          style={{ height: `${100 / total}%` }}
                        >
                          {/* 1100w only, no 2x source: the four 2200px bitmaps
                              decoded to ~40MB of GPU layers between them, and
                              compositing those during fast scroll is what was
                              lagging the whole page. At the frame's rendered
                              size 1100w still covers ~1.5x density. Ditto the
                              removed will-change: four permanently-promoted
                              layers cost more than promoting on demand. */}
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
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* index rail */}
            <div className="col-span-1 flex flex-col items-end">
              <span className="font-mono text-[12px] tabular-nums text-ink">{pad(active + 1)}</span>
              <span className="my-3 block h-24 w-px bg-line-2">
                <span
                  className="block w-px bg-accent transition-[height] duration-500"
                  style={{ height: `${((active + 1) / total) * 100}%` }}
                />
              </span>
              <span className="font-mono text-[12px] tabular-nums text-ink-faint">{pad(total)}</span>
            </div>
          </div>
        </div>
      </Container>

      {/* ── mobile: plain stack, each step with its own screen ────── */}
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
    </section>
  );
}
