"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoWordmark } from "./LogoWordmark";

const LINKS = [
  { href: "/product/", label: "Product" },
  { href: "/security/", label: "Security" },
  { href: "/pricing/", label: "Pricing" },
  { href: "/manifesto/", label: "Manifesto" },
];

const NAV_H = 56; // h-14

/**
 * The header.
 *
 * It overlays rather than sits in flow. The site is dark end to end, so the
 * bar never inverts — `overHero` only decides whether it carries a ground:
 * transparent over the hero so the globe reads edge to edge, translucent
 * with a hairline past it so type stays legible over scrolling content.
 *
 * The blur runs on a 56px-tall strip, not a fullscreen layer, which is why it
 * is affordable here even over the hero's live canvas.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const pathname = usePathname();

  /* The page is dark throughout, so the bar's INK never changes — only
     whether it carries a ground. Over the hero it is fully transparent so the
     globe reads edge to edge; past it, it takes a translucent ground and a
     hairline so type stays legible over scrolling content.

     (An earlier revision tracked every `data-dark` band because the content
     sections were light and the bar had to invert against each one. Those
     bands are gone; tracking them now would be a listener computing a
     constant.)

     Re-keyed by pathname — the bar lives in the layout and survives
     client-side navigation, so a mount-only pass carries one route's answer
     onto the next. */
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    if (!hero) {
      setOverHero(false);
      return;
    }
    const onScroll = () => setOverHero(hero.getBoundingClientRect().bottom > NAV_H);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4"
    >
      <nav
        className={`nav-shell pointer-events-auto mx-auto flex h-12 max-w-[1180px] items-center justify-between rounded-full border px-1.5 transition-all duration-300 ${
          overHero ? "border-line/70 bg-ground/55" : "border-line-2 bg-ground/88 shadow-[0_16px_40px_-24px_rgb(0_0_0/0.9)]"
        }`}
        style={{ paddingInline: "var(--gutter)" }}
      >
        <a href="/" aria-label="tOOrunt AI home" className="-my-2 inline-flex min-h-11 items-center py-2">
          <LogoWordmark />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[14px] text-ink-dim transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/book/"
            /* The logo-spectrum `.btn-ai` treatment (globals.css) — same in the
               transparent-over-hero bar and the solid-below one, since it
               carries its own fixed fill and ink rather than a page token. */
            className="btn-ai inline-flex min-h-9 items-center rounded-full px-4 text-[13.5px] font-semibold"
          >
            <span className="ai-label">Book a demo</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 top-0 h-[1.5px] w-4 bg-current transition-transform ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[5px] h-[1.5px] w-4 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 bottom-0 h-[1.5px] w-4 bg-current transition-transform ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>

      {/* Reading progress. Driven by the document's own scroll timeline in CSS
          (globals.css, "Nav scroll progress") rather than a scroll listener —
          it scrubs on the compositor, costs no JS, and where `scroll()` is
          unsupported it simply never appears. Hidden over the hero, where
          progress is by definition zero and the bar would just be a stray
          line across the artwork. */}
      <span
        aria-hidden="true"
        className={`nav-progress absolute inset-x-0 bottom-0 h-px bg-accent-text transition-opacity duration-300 ${
          overHero ? "opacity-0" : "opacity-100"
        }`}
      />

      {open && (
        /* Opaque so the page never shows through it. It sits inside the
           header, so it follows `overHero` and inverts along with the bar —
           which is what you want: the panel matches whatever the bar is. */
        <div className="pointer-events-auto mx-auto mt-2 max-w-[1180px] overflow-hidden rounded-2xl border border-line bg-ground/95 shadow-2xl backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-[15px] text-ink-dim transition-colors hover:bg-ground-2 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/book/"
              onClick={() => setOpen(false)}
              className="btn-ai mt-2 rounded-full px-4 py-2.5 text-center text-[15px] font-medium"
            >
              <span className="ai-label">Book a demo</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
