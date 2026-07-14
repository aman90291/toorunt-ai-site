/**
 * The gate-node wordmark: a pipeline of warm-white dots + hairline links with
 * one accent-stroked ring holding a solid accent dot — the human gate on the chain.
 */
export function LogoWordmark({
  className = "",
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="86" height="18" viewBox="0 0 86 18" fill="none" aria-hidden="true" className="shrink-0">
        <line x1="7" y1="9" x2="24" y2="9" stroke="#c6bfae" strokeWidth="1.5" />
        <line x1="42" y1="9" x2="59" y2="9" stroke="#c6bfae" strokeWidth="1.5" />
        <line x1="60" y1="9" x2="79" y2="9" stroke="#c6bfae" strokeWidth="1.5" />
        <circle cx="7" cy="9" r="3.2" fill="#1a1b1e" />
        <circle cx="24" cy="9" r="3.2" fill="#1a1b1e" />
        <circle cx="42" cy="9" r="8" fill="none" stroke="#8a7856" strokeWidth="2.4" />
        <circle cx="42" cy="9" r="3.4" fill="#8a7856" />
        <circle cx="60" cy="9" r="3.2" fill="#1a1b1e" />
        <circle cx="79" cy="9" r="3.2" fill="#1a1b1e" />
      </svg>
      {showText && (
        <span className="font-display text-[19px] font-semibold tracking-[-0.01em] text-ink">
          DevAgent
        </span>
      )}
    </span>
  );
}
