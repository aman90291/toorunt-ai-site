/** Document scroll progress 0..1 — polled per-frame (Lenis-friendly). */
export function scrollProgress(): number {
  if (typeof document === "undefined") return 0;
  const el = document.documentElement;
  const max = el.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
}
