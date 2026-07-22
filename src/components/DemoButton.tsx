"use client";

import type { ReactNode } from "react";
import { openDemo } from "@/lib/demo";

/**
 * A "Book a demo" trigger that opens the global BookDemoDialog. Mirrors the
 * visual variants of ui.Button, but is a <button> (opens the modal) rather than
 * a link. Usable from server components.
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
      <button
        type="button"
        onClick={openDemo}
        className={`inline-flex min-h-11 items-center text-[14px] text-ink-dim transition-colors hover:text-ink ${className}`}
      >
        {children}
      </button>
    );
  }
  /* Kept in lockstep with ui.Button — see the note there on why the hover is
     a single colour change. */
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-[14px] font-medium transition-colors duration-150";
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-ink hover:brightness-95"
      : "border border-line-2 text-ink hover:bg-ground-2";
  return (
    <button type="button" onClick={openDemo} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
