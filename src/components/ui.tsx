import Link from "next/link";
import type { ReactNode } from "react";

/** Page shell — consistent max width + horizontal gutter. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-6 sm:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow flex items-center gap-3">
      <span className="inline-block h-[6px] w-[6px] rounded-full bg-clay" />
      {children}
    </p>
  );
}

/** Serif section heading with an optional clay-accented fragment. */
export function Heading({
  children,
  as: As = "h2",
  className = "",
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <As
      className={`font-display font-medium tracking-[-0.01em] text-balance text-ink ${className}`}
    >
      {children}
    </As>
  );
}

export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-clay-text">{children}</span>;
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2";
  const styles =
    variant === "primary"
      ? "bg-clay text-[#1a1512] hover:bg-clay-text hover:-translate-y-px shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]"
      : "border border-line-2 text-ink hover:border-clay hover:bg-clay-wash";
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

/** A hairline-topped divider with a mono label — the deck's section grammar. */
export function SectionRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="eyebrow whitespace-nowrap text-clay-text">{label}</span>
      <span className="hairline flex-1" />
    </div>
  );
}
