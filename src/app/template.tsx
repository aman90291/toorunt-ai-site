"use client";

import { LazyMotion, domAnimation, m } from "@/components/motion";
import { TextReveals } from "@/components/TextReveals";

/**
 * template.tsx re-mounts on every navigation — a soft enter fade for each route,
 * so page changes feel like a cut rather than a jump. Reduced-motion → instant.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </m.div>
      <TextReveals />
    </LazyMotion>
  );
}
