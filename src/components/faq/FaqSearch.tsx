"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FAQ, type FaqEntry } from "@/content/faq";
import { highlight, searchFaq, type Hit } from "@/lib/faq-search";
import { globeSignal } from "@/lib/globe-signal";

/**
 * The hero's question field.
 *
 * The brief was "a search bar that acts as a FAQ", and the distinction that
 * matters is between a search bar and an ANSWER field. A search bar hands
 * back links and makes the visitor do another click to find out anything; the
 * field below resolves to the answer itself, in place, with the page that
 * carries it in full offered underneath. Someone who lands here and types
 * "can it drop my database" should have read the answer before they have
 * decided whether to scroll.
 *
 * Three things are load-bearing and easy to lose in a redesign:
 *
 *  1. The rotating placeholder is not decoration. A blank field with a
 *     magnifier tells nobody what they are allowed to ask it, and an empty
 *     hero search box is one of the more reliable ways to get zero queries.
 *     Cycling real questions through it is the affordance.
 *  2. It reports focus and keystrokes to the globe (`lib/globe-signal`), so
 *     the sphere brightens when the field wakes up and its flow field stirs
 *     faster as you type. That is what ties the canvas to the product instead
 *     of leaving it as a screensaver behind the copy. Note it never changes
 *     the globe's SHAPE — that was tried and it looked like a fault; see
 *     three/globe/ParticleGlobe.tsx.
 *  3. It is a real ARIA combobox — `aria-expanded`, `aria-controls`,
 *     `aria-activedescendant`, roving selection over `role="option"` rows,
 *     arrows/Enter/Escape. A div soup that only works with a mouse would put
 *     the site's primary explanatory surface out of reach of exactly the
 *     enterprise buyers most likely to be running a screen reader.
 */

/** Shown, and cycled through the placeholder, before anything is typed. */
const SUGGESTED = [
  "What are the 14 gates?",
  "What's the worst that can happen?",
  "How much does it cost?",
  "Can it drop my database?",
  "What do humans actually decide?",
  "How is this different from Copilot?",
] as const;

/** Zero-query shortcuts under the field. */
const QUICK: readonly { label: string; id: string }[] = [
  { label: "The 14 gates", id: "the-gates" },
  { label: "Pricing", id: "price" },
  { label: "Security", id: "worst-case" },
  { label: "Human decisions", id: "three-decisions" },
  { label: "vs. Copilot", id: "vs-copilot" },
];

const byId = (id: string) => FAQ.find((f) => f.id === id);

export function FaqSearch({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [answer, setAnswer] = useState<FaqEntry | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const hits: Hit[] = useMemo(() => (query.trim() ? searchFaq(query) : []), [query]);
  const showPanel = open && (answer !== null || hits.length > 0 || query.trim().length > 0);

  /* ── panel placement ───────────────────────────────────────────────
     The field sits low in the hero — roughly three-quarters down — which
     leaves under 250px beneath it on a laptop. A fixed 460px panel simply
     ran off the bottom of the screen, and the answer view (the whole point
     of the component) was the part that got cut. So the panel measures the
     room it actually has and either fits itself to the space below or flips
     above the field, whichever gives the reader more.
     Flipping covers the globe, and that is the correct trade: someone
     reading an answer is not looking at the artwork. */
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [panelMax, setPanelMax] = useState(440);

  useLayoutEffect(() => {
    if (!showPanel) return;

    const measure = () => {
      const el = fieldRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const GAP = 10;
      const EDGE = 16;
      const NAV = 64;
      const below = window.innerHeight - r.bottom - GAP - EDGE;
      const above = r.top - NAV - GAP;
      const flip = below < 300 && above > below;
      setPlacement(flip ? "top" : "bottom");
      setPanelMax(Math.round(Math.max(170, Math.min(440, flip ? above : below))));
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [showPanel, answer, hits.length]);

  /* ── rotating placeholder ──────────────────────────────────────────
     Typed out, held, deleted, next. Mount-gated so the server and the first
     client render agree on an empty string — a placeholder that differs
     between them is a hydration mismatch. */
  const [typed, setTyped] = useState("");
  const idle = !query && !open;

  useEffect(() => {
    if (!idle) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(SUGGESTED[0]);
      return;
    }

    let i = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const full = SUGGESTED[i];
      char += deleting ? -1 : 1;
      setTyped(full.slice(0, char));

      let next = deleting ? 26 : 42;
      if (!deleting && char === full.length) {
        next = 2100; // hold, so it is readable rather than a flicker
        deleting = true;
      } else if (deleting && char === 0) {
        deleting = false;
        i = (i + 1) % SUGGESTED.length;
        next = 320;
      }
      timer = setTimeout(tick, next);
    };

    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [idle]);

  /* ── globe coupling ────────────────────────────────────────────── */
  useEffect(() => {
    globeSignal.setFocus(open);
    return () => globeSignal.setFocus(false);
  }, [open]);

  /* ── dismissal ─────────────────────────────────────────────────── */
  const close = useCallback(() => {
    setOpen(false);
    setAnswer(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  /* "/" focuses the field from anywhere on the page — the convention for a
     search-first surface, and free discoverability via the visible hint. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (t?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const choose = useCallback((entry: FaqEntry) => {
    setAnswer(entry);
    setActive(0);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (answer) setAnswer(null);
      else if (query) setQuery("");
      else {
        close();
        inputRef.current?.blur();
      }
      return;
    }
    if (answer) return; // the answer view has nothing to arrow through
    if (!hits.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + hits.length) % hits.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = hits[active];
      if (pick) choose(pick.entry);
    }
  };

  return (
    <div ref={rootRef} className={`faq-search relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const pick = hits[active];
          if (pick) choose(pick.entry);
        }}
      >
        <div
          ref={fieldRef}
          className="faq-field"
          data-open={showPanel || undefined}
          data-placement={showPanel ? placement : undefined}
        >
          <SearchGlyph />

          <input
            ref={inputRef}
            type="text"
            value={query}
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              showPanel && !answer && hits[active] ? `${listId}-${hits[active].entry.id}` : undefined
            }
            aria-label="Ask a question about tOOrunt AI"
            autoComplete="off"
            spellCheck={false}
            className="faq-input"
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              setAnswer(null);
              setOpen(true);
              globeSignal.ping();
            }}
          />

          {/* The typed placeholder rides behind the input rather than in its
              `placeholder` attribute — an attribute cannot carry a caret, and
              the caret is what reads as "this is being typed for you". */}
          {!query && (
            <span aria-hidden="true" className="faq-ghost">
              {open ? "Ask anything about tOOrunt AI…" : typed}
              {!open && <i className="faq-caret" />}
            </span>
          )}

          {query ? (
            <button
              type="button"
              className="faq-clear"
              aria-label="Clear the question"
              onClick={() => {
                setQuery("");
                setAnswer(null);
                inputRef.current?.focus();
              }}
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : (
            <kbd className="faq-kbd" aria-hidden="true">
              /
            </kbd>
          )}
        </div>
      </form>

      {/* ── zero-query shortcuts ─────────────────────────────────── */}
      <div className="faq-quick" data-hidden={showPanel || undefined}>
        {QUICK.map((q) => {
          const entry = byId(q.id);
          if (!entry) return null;
          return (
            <button
              key={q.id}
              type="button"
              className="faq-chip"
              onClick={() => {
                setOpen(true);
                choose(entry);
                globeSignal.ping();
              }}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* ── results / answer ─────────────────────────────────────── */}
      {showPanel && (
        <div
          className="faq-panel"
          id={listId}
          role={answer ? undefined : "listbox"}
          aria-label="Answers"
          data-placement={placement}
          style={{ maxHeight: panelMax }}
        >
          {answer ? (
            <AnswerView entry={answer} onBack={hits.length ? () => setAnswer(null) : undefined} />
          ) : hits.length ? (
            <ul className="faq-list">
              {hits.map((hit, i) => (
                <li key={hit.entry.id}>
                  <button
                    type="button"
                    id={`${listId}-${hit.entry.id}`}
                    role="option"
                    aria-selected={i === active}
                    className="faq-row"
                    data-active={i === active || undefined}
                    // pointerdown, not click: the root's outside-pointerdown
                    // listener would otherwise close the panel before click
                    // ever fires.
                    onPointerDown={(e) => {
                      e.preventDefault();
                      choose(hit.entry);
                    }}
                    onMouseEnter={() => setActive(i)}
                  >
                    <span className="faq-row-q">
                      {highlight(hit.entry.q, hit.matched).map((part, k) =>
                        part.hit ? <mark key={k}>{part.text}</mark> : <span key={k}>{part.text}</span>,
                      )}
                    </span>
                    <span className="faq-row-cat">{hit.entry.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="faq-empty">
              <p>
                Nothing matched <strong>“{query.trim()}”</strong>.
              </p>
              <p className="faq-empty-sub">
                Try “gates”, “pricing”, “security”, or{" "}
                <Link href="/book/" className="faq-empty-link">
                  book a demo
                </Link>{" "}
                and ask us directly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnswerView({ entry, onBack }: { entry: FaqEntry; onBack?: () => void }) {
  return (
    <div className="faq-answer">
      <div className="faq-answer-head">
        <span className="faq-row-cat">{entry.category}</span>
        {onBack && (
          <button type="button" className="faq-back" onPointerDown={(e) => { e.preventDefault(); onBack(); }}>
            ← All results
          </button>
        )}
      </div>
      <h3 className="faq-answer-q">{entry.q}</h3>
      <p className="faq-answer-a">{entry.a}</p>
      <Link href={entry.href} className="faq-answer-link">
        Read it in full
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg className="faq-glyph" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="5.75" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.4 13.4 17.5 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
