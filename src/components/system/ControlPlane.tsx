"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FEATURES } from "@/content/features";
import { SHOTS } from "@/lib/shots";
import { Panel, StatusDot } from "./Panel";

/**
 * The four surfaces, as one instrument you tab through.
 *
 * REPLACES the pinned scroll walk (the old `StickyFeatures`). That component
 * was well-built — a memoised stage, imperative scroll writes, zero DOM reads
 * per frame — and it was still the wrong idea for this content, for reasons
 * worth writing down so nobody rebuilds it:
 *
 *   • It cost four viewport-heights of scroll to deliver four paragraphs, and
 *     took the scrollbar hostage to do it. On a product whose pitch is "we
 *     respect your time", that is an odd thing to ask for.
 *   • The reader could not compare surfaces or skip to the one they cared
 *     about. Sequence was imposed, not offered.
 *   • Pinned sections read as *empty* in every state but the middle of a
 *     transition, which is exactly what a static screenshot of the page shows
 *     a prospective customer.
 *
 * Tabs fix all three: one screenful, random access, and the panel is full at
 * rest. The screenshots are the same real product screens as before.
 *
 * Keyboard behaviour is the full WAI-ARIA tab pattern — arrows move and
 * activate, Home/End jump the ends, and only the active tab is in the tab
 * order, so Tab moves you into the panel rather than through four buttons.
 */
export function ControlPlane({ autoPlay = false }: { autoPlay?: boolean }) {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoRun, setAutoRun] = useState(autoPlay);
  const [inView, setInView] = useState(!autoPlay);
  const [reducedMotion, setReducedMotion] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const shell = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const f = FEATURES[active];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!autoPlay || !shell.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(shell.current);
    return () => observer.disconnect();
  }, [autoPlay]);

  useEffect(() => {
    if (!autoPlay || !autoRun || paused || !inView || reducedMotion) return;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % FEATURES.length);
      setCycle((current) => current + 1);
    }, 5200);
    return () => window.clearTimeout(timer);
  }, [active, autoPlay, autoRun, cycle, inView, paused, reducedMotion]);

  const focusTab = useCallback((i: number) => {
    setActive(i);
    setCycle((current) => current + 1);
    tabs.current[i]?.focus();
  }, []);

  const selectTab = useCallback((i: number) => {
    setActive(i);
    setCycle((current) => current + 1);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = FEATURES.length;
    if (e.key === "ArrowRight") { e.preventDefault(); focusTab((active + 1) % n); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); focusTab((active - 1 + n) % n); }
    else if (e.key === "Home") { e.preventDefault(); focusTab(0); }
    else if (e.key === "End") { e.preventDefault(); focusTab(n - 1); }
  };

  return (
    <div
      ref={shell}
      className={autoPlay ? "control-plane-autoplay" : ""}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => { setPaused(false); setCycle((current) => current + 1); }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
          setCycle((current) => current + 1);
        }
      }}
    >
      <Panel
        label="control plane"
        status={autoPlay ? `${autoRun && !paused ? "live" : "paused"} · 4 surfaces` : "4 surfaces"}
        tone={autoRun && !paused ? "live" : "auto"}
        flush
      >
      {/* ── tab bar ──────────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Product surfaces"
        onKeyDown={onKeyDown}
        className="flex overflow-x-auto border-b border-line"
      >
        {FEATURES.map((feat, i) => {
          const on = i === active;
          return (
            <button
              key={feat.key}
              ref={(el) => { tabs.current[i] = el; }}
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={on ? 0 : -1}
              onClick={() => selectTab(i)}
              className={`control-plane-tab relative flex shrink-0 items-center gap-2.5 overflow-hidden px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors sm:px-5 ${
                on ? "text-ink" : "text-ink-faint hover:text-ink-dim"
              }`}
            >
              <span className="tabular-nums text-accent-text">{feat.index}</span>
              {feat.tab}
              {/* The active marker sits on the panel's own border line, so the
                  selected tab reads as connected to the body below it. */}
              {on && (
                <span
                  key={`${active}-${cycle}`}
                  aria-hidden="true"
                  className={autoPlay ? "control-plane-progress" : "absolute inset-x-0 -bottom-px h-px bg-accent-text"}
                  style={{ animationPlayState: paused || !autoRun ? "paused" : "running" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── body ─────────────────────────────────────────────────── */}
      <div
        role="tabpanel"
        id={`${id}-panel-${active}`}
        aria-labelledby={`${id}-tab-${active}`}
        className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-8"
      >
        <div className="flex min-w-0 flex-col">
          <h3
            className="font-display font-semibold tracking-[-0.02em] text-ink"
            style={{ fontSize: "var(--text-h3)", lineHeight: 1.15 }}
          >
            {f.title}
          </h3>
          <p className="mt-2.5 text-[var(--text-lead)] leading-[1.45] text-accent-text">{f.lead}</p>
          <p className="mt-4 max-w-[46ch] text-[14.5px] leading-[1.65] text-ink-dim">{f.body}</p>

          <dl className="mt-auto pt-6">
            {f.readouts.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-t border-line py-2.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{k}</dt>
                <dd className="text-right font-mono text-[11.5px] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* THE SCREEN.
            These are light-mode product shots on a dark page, and pasted flat
            they read as a hole punched through the panel — a rectangle of
            white with a hard edge and nothing explaining it. A screen is not a
            hole, so it gets the things that make a display read as a display:
            a dark bezel it is inset into, a hairline that catches light along
            the top, and a shadow beneath it. The image then reads as something
            switched ON inside the instrument, which is also why the bright
            white stops fighting the page — it now has a reason to be bright. */}
        <div className="relative min-w-0 self-start rounded-[12px] bg-ground p-1.5 shadow-[0_20px_50px_-24px_rgb(0_0_0/0.9)] ring-1 ring-line">
          <div className="relative overflow-hidden rounded-[8px] bg-ground-3">
            <Shot index={active} />
            {/* Screen-glass: a top highlight only.
                A hue wash across the lower third was tried and removed — over
                a white product UI a 14% teal reads as a stain on the
                screenshot, not as light on glass. Tinting a light image with
                the page's colour is the same mistake as the section blooms,
                just at a smaller size: a wide, low-contrast gradient laid over
                content it does not belong to. The bezel is what makes this a
                screen; the glaze only needs to catch the top edge. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[8px]"
              style={{ background: "linear-gradient(180deg, rgb(255 255 255 / 0.12), transparent 26%)" }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[8px] ring-1 ring-inset"
              style={{ borderColor: "transparent", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.06)" }}
            />
          </div>
        </div>
      </div>

      {/* ── status bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        <span className="flex items-center gap-2 truncate">
          <StatusDot tone="auto" />
          {f.url}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {autoPlay && (
            <button
              type="button"
              aria-label={autoRun ? "Pause automatic surface rotation" : "Play automatic surface rotation"}
              aria-pressed={!autoRun}
              onClick={() => {
                setAutoRun((running) => !running);
                setCycle((current) => current + 1);
              }}
              className="control-plane-toggle rounded-full border border-line-2 px-2.5 py-1 text-ink-dim transition-colors hover:text-ink focus-visible:text-ink"
            >
              {autoRun ? "pause" : "play"}
            </button>
          )}
          <span className="tabular-nums">{f.index} / {String(FEATURES.length).padStart(2, "0")}</span>
        </span>
      </div>
      </Panel>
    </div>
  );
}

/**
 * All four screenshots render; only the active one is visible.
 *
 * Kept mounted rather than swapped, because a `src` change on tab click means
 * a decode on the main thread at the exact moment the reader is looking at
 * the empty space where the image was. Four 1100w AVIFs is ~110KB total, and
 * only the first is eager — the rest arrive during idle after first paint.
 */
function Shot({ index }: { index: number }) {
  return (
    <div className="relative">
      {FEATURES.map((f, i) => {
        const s = SHOTS[f.shot];
        return (
          <picture key={f.key}>
            <source type="image/avif" srcSet={`/shots/${f.shot}-1100.avif 1100w, /shots/${f.shot}-2200.avif 2200w`} sizes="(max-width: 1024px) 100vw, 620px" />
            <source type="image/webp" srcSet={`/shots/${f.shot}-1100.webp 1100w, /shots/${f.shot}-2200.webp 2200w`} sizes="(max-width: 1024px) 100vw, 620px" />
            <img
              src={`/shots/${f.shot}-1100.webp`}
              alt={s.alt}
              width={s.width}
              height={s.height}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              aria-hidden={i !== index}
              className={`control-plane-shot w-full ${
                i === index ? "is-active relative" : "pointer-events-none absolute inset-0"
              }`}
              style={{ backgroundImage: `url(${s.lqip})`, backgroundSize: "cover" }}
            />
          </picture>
        );
      })}
    </div>
  );
}
