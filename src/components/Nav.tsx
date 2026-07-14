"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoWordmark } from "./LogoWordmark";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/product/", label: "Product" },
  { href: "/security/", label: "Security" },
  { href: "/pricing/", label: "Pricing" },
  { href: "/manifesto/", label: "Manifesto" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line bg-ground/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 sm:px-8">
        <Link href="/" aria-label="Toorunt AI home" className="-my-2 py-2">
          <LogoWordmark />
        </Link>

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
          <ThemeToggle />
          <Link
            href="/#demo"
            data-magnetic
            className="rounded-full bg-accent px-4 py-2 text-[14px] font-medium text-ground transition-all hover:bg-accent-text hover:-translate-y-px"
          >
            Book a demo
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle />
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink"
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
        <div className="border-t border-line bg-ground/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-[15px] text-ink-dim hover:bg-ground-2 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/#demo"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-accent px-4 py-2.5 text-center text-[15px] font-medium text-ground"
            >
              Book a demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
