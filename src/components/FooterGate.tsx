"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Hides the global footer on routes that are app-like screens rather than
 * pages — currently just /book, which pins itself to one viewport with no
 * scroll. The footer stays server-rendered; this only decides whether the
 * already-rendered tree shows.
 */
export function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/book" || pathname === "/book/") return null;
  return <>{children}</>;
}
