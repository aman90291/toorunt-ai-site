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
        className={`text-[14px] text-ink-dim transition-colors hover:text-ink ${className}`}
      >
        {children}
      </button>
    );
  }
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2";
  const styles =
    variant === "primary"
      ? "bg-accent text-ground hover:bg-accent-text hover:-translate-y-px shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]"
      : "border border-line-2 text-ink hover:border-accent hover:bg-accent-wash";
  return (
    <button type="button" data-magnetic onClick={openDemo} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
