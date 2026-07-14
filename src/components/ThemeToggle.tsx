"use client";

import { useState } from "react";
import { setThemeMode, type ThemeMode } from "@/lib/theme";

const NEXT: Record<ThemeMode, ThemeMode> = { auto: "night", night: "day", day: "auto" };
const LABEL: Record<ThemeMode, string> = {
  auto: "Theme: auto (follows the scroll journey). Click for night.",
  night: "Theme: night. Click for day.",
  day: "Theme: day. Click for auto.",
};

function Icon({ mode }: { mode: ThemeMode }) {
  if (mode === "night") {
    // crescent
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" fill="currentColor" />
      </svg>
    );
  }
  if (mode === "day") {
    // sun
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3L19 19M19 5l-1.7 1.7M6.7 17.3L5 19" />
        </g>
      </svg>
    );
  }
  // auto — half-filled circle (the journey)
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3.5a8.5 8.5 0 010 17z" fill="currentColor" />
    </svg>
  );
}

/**
 * Instant day/night toggle (Step 3). Cycles auto → night → day. The switch
 * tweens the global theme value (lib/theme.ts), which repaints the CSS custom
 * properties AND the WebGL uniforms on the same frames — one state, two worlds.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const cycle = () => {
    const next = NEXT[mode];
    setMode(next);
    setThemeMode(next);
  };
  return (
    <button
      type="button"
      data-magnetic
      onClick={cycle}
      aria-label={LABEL[mode]}
      title={LABEL[mode]}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-accent hover:text-ink ${className}`}
    >
      <Icon mode={mode} />
    </button>
  );
}
