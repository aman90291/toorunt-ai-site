import type { ReactNode } from "react";

/**
 * Premium image reveal — the frame's clip-path wipes up while the inner media
 * counter-scales from 1.18→1 as it crosses the viewport (native CSS scroll-driven;
 * see `.media-reveal` in globals.css). Server component, zero JS, reduced-motion safe.
 */
export function MediaReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`media-reveal ${className}`}>
      {children}
    </div>
  );
}
