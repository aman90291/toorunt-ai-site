import { SHOTS, type ShotName } from "@/lib/shots";

/**
 * A clean browser-chrome frame (our own traffic lights + fake URL) around a
 * real dashboard screenshot served as <picture> AVIF/WebP at two sizes with an
 * LQIP background. Server component — no JS. Explicit dims → zero CLS.
 */
export function BrowserFrame({
  shot,
  url = "app.devagent.dev",
  priority = false,
  className = "",
}: {
  shot: ShotName;
  url?: string;
  priority?: boolean;
  className?: string;
}) {
  const s = SHOTS[shot];
  return (
    <figure
      className={`overflow-hidden rounded-[var(--radius-card)] border border-line-2 bg-ground-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] ${className}`}
    >
      <div className="flex h-9 items-center gap-2 border-b border-line px-4">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c6bfae]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#c6bfae]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#c6bfae]" />
        </span>
        <span className="mx-auto flex items-center gap-1.5 rounded-md bg-ground/60 px-3 py-1 font-mono text-[11px] text-ink-faint">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 10V7a4 4 0 118 0v3" stroke="currentColor" strokeWidth="2" />
          </svg>
          {url}
        </span>
      </div>
      <picture>
        <source type="image/avif" srcSet={`/shots/${shot}-1100.avif 1100w, /shots/${shot}-2200.avif 2200w`} sizes="(max-width: 1100px) 100vw, 1100px" />
        <source type="image/webp" srcSet={`/shots/${shot}-1100.webp 1100w, /shots/${shot}-2200.webp 2200w`} sizes="(max-width: 1100px) 100vw, 1100px" />
        <img
          src={`/shots/${shot}-1100.webp`}
          alt={s.alt}
          width={s.width}
          height={s.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="block w-full"
          style={{ backgroundImage: `url(${s.lqip})`, backgroundSize: "cover" }}
        />
      </picture>
    </figure>
  );
}
