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
 * It overlays rather than sits in flow, and it is transparent — so on the home
 * page the dark hero shows straight through it, and on every other page the
 * white body does. That creates the one problem this component has to solve:
 * the bar's own ink has to invert depending on what is underneath it.
 *
 * `overHero` tracks exactly that — whether the hero still occupies the strip
 * the bar covers — and toggles `.on-dark`, which re-points the colour tokens so
 * the links, the logo type and the CTA all flip together. Off the hero the bar
 * picks up a translucent ground so text stays legible over scrolling content.
 *
 * The blur runs on a 56px-tall strip, not a fullscreen layer, which is why it
 * is affordable here even over the hero's live canvas.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const pathname = usePathname();

  // Re-keyed by pathname: the bar lives in the layout and survives client-side
  // navigation, so a mount-only check would carry the hero's dark scope onto
  // hero-less routes (navigate from the hero to /book and the bar stayed
  // inverted over white).
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    // No hero on this route: the bar is over white from the first pixel.
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
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-colors duration-200 ${
        overHero ? "on-dark bg-transparent" : "bg-ground/80"
      }`}
    >
      <nav
        className="mx-auto flex h-14 max-w-[1240px] items-center justify-between"
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
            className="btn-ai inline-flex min-h-9 items-center rounded-md px-4 text-[13.5px] font-semibold"
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

      {open && (
        /* Opaque so the page never shows through it. It sits inside the
           header, so it follows `overHero` and inverts along with the bar —
           which is what you want: the panel matches whatever the bar is. */
        <div className="border-t border-line bg-ground md:hidden">
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
              className="btn-ai mt-2 rounded-md px-4 py-2.5 text-center text-[15px] font-medium"
            >
              <span className="ai-label">Book a demo</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
