"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * The site's card.
 *
 * Replaces the `border border-line bg-ground-2 shadow-[0_10px_30px...]` triple
 * that was hand-copied at roughly a dozen call sites (story.tsx's `Glass`, the
 * pricing tiers, the security controls, the /book proof panel). Those had
 * already drifted — different shadows, two different radii — which is the
 * usual fate of a pattern that lives in class strings instead of a component.
 *
 * `sheen` adds the pointer-tracked highlight from the dashboard references.
 * It is opt-in rather than automatic for a reason: on a grid of a dozen small
 * cards it reads as noise, and on one large card it reads as depth. Use it on
 * the latter.
 *
 * The pointer handler writes CSS custom properties directly on the node and
 * never touches React state — a `setState` per `pointermove` would re-render
 * the card's whole subtree at pointer frequency for a decorative gradient.
 * With JS off the properties are simply unset and the CSS falls back to a
 * centred highlight, which is static rather than broken.
 */
export function Surface({
  as: As = "div",
  children,
  className = "",
  sheen = false,
  lift = false,
  style,
  ...rest
}: {
  as?: "div" | "article" | "li" | "section";
  children: ReactNode;
  className?: string;
  sheen?: boolean;
  lift?: boolean;
  style?: CSSProperties;
} & Record<string, unknown>) {
  return (
    <As
      className={`surface ${sheen ? "surface-sheen" : ""} ${lift ? "surface-lift" : ""} ${className}`}
      style={style}
      onPointerMove={
        sheen
          ? (e: React.PointerEvent<HTMLElement>) => {
              const el = e.currentTarget;
              const r = el.getBoundingClientRect();
              el.style.setProperty("--mx", `${e.clientX - r.left}px`);
              el.style.setProperty("--my", `${e.clientY - r.top}px`);
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </As>
  );
}
