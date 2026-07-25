import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A "Book a demo" trigger — a link to /book/, the two-column booking page.
 * Mirrors the visual variants of ui.Button; kept as its own component so the
 * many call sites didn't change when this stopped opening a modal.
 */
export function DemoButton({
  children = "Book a demo",
  variant = "primary",
  className = "",
}: {
  children?: ReactNode;
  variant?: "primary" | "ghost" | "link";
  className?: string;
}) {
  if (variant === "link") {
    return (
      <Link
        href="/book/"
        className={`inline-flex min-h-11 items-center text-[14px] text-ink-dim transition-colors hover:text-ink ${className}`}
      >
        {children}
      </Link>
    );
  }
  /* Kept in lockstep with ui.Button — see the note there on why the hover is
     a single colour change. */
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-[14px] font-medium transition-colors duration-150";
  const styles =
    variant === "primary"
      ? "btn-ai"
      : "border border-line-2 text-ink hover:bg-ground-2";
  return (
    <Link href="/book/" className={`${base} ${styles} ${className}`}>
      {variant === "primary" ? <span className="ai-label">{children}</span> : children}
    </Link>
  );
}
