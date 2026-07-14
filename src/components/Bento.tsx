import type { ReactNode } from "react";

export function BentoGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">{children}</div>;
}

/** A bento tile. `span` controls column span at lg. Hover lifts the border to accent. */
export function BentoTile({
  children,
  span = 3,
  className = "",
}: {
  children: ReactNode;
  span?: 2 | 3 | 4 | 6;
  className?: string;
}) {
  const cols = { 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4", 6: "lg:col-span-6" }[span];
  return (
    <div
      className={`group relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-ground-2/50 p-6 transition-colors duration-300 hover:border-accent/40 ${cols} ${className}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/[0.06] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function TileTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-[16px] font-semibold text-ink">{children}</h3>;
}
export function TileBody({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[14px] leading-relaxed text-ink-dim">{children}</p>;
}
