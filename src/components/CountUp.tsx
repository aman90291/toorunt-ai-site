/**
 * A formatted stat number.
 *
 * This used to tween 0 → value on an IntersectionObserver + rAF loop the first
 * time it scrolled into view. The count-up is gone with the rest of the scroll
 * choreography, which also makes it a server component: no "use client", no
 * observer, no rAF, and the real number is in the initial HTML instead of a 0
 * that corrects itself a beat later.
 *
 * The signature is unchanged so callers in story.tsx did not have to move; the
 * `duration` prop is accepted and ignored.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  return (
    <span className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
