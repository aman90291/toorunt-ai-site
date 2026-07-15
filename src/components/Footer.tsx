import Link from "next/link";
import { LogoWordmark } from "./LogoWordmark";
import { LINES } from "@/lib/stats";
import { CONTACTS, DEMO_MAILTO } from "@/lib/contact";

const COLS = [
  {
    title: "Product",
    links: [
      { href: "/product/", label: "How it works" },
      { href: "/security/", label: "Security & governance" },
      { href: "/pricing/", label: "Pricing" },
      { href: DEMO_MAILTO, label: "Book a demo" },
    ],
  },
  {
    title: "Company",
    links: [{ href: "/manifesto/", label: "Manifesto" }],
  },
  {
    title: "Contact",
    links: CONTACTS.map((c) => ({ href: `mailto:${c.email}`, label: c.email })),
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ground">
      <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <LogoWordmark />
            <p className="mt-4 font-display text-[17px] leading-snug text-ink-dim">
              {LINES.worstCase}
            </p>
          </div>
          <div className="flex flex-wrap gap-10 sm:gap-16">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="eyebrow">{c.title}</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-[14px] text-ink-dim transition-colors hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[12px] text-ink-faint sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Toorunt AI. Governed AI engineering teams.</p>
          <p className="font-mono">Built to be inspected.</p>
        </div>
      </div>
    </footer>
  );
}
