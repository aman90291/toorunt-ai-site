"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A stat number that counts up the first time it is seen.
 *
 * This component has been round-tripped once already: it originally tweened,
 * the tween was deleted along with the rest of the scroll choreography, and
 * the file was left as a `<span>{value}</span>` that still took a `duration`
 * prop and ignored it. Which is how the site ended up with meters whose bars
 * animated while the number beside them sat perfectly still.
 *
 * HYDRATION — the initial state is the REAL value, not zero. Server and first
 * client render therefore agree, the correct number is in the HTML for
 * crawlers and for anyone whose JS never runs, and the count only starts once
 * the effect has confirmed it is going to finish. Seeding state at 0 and
 * "fixing it later" is the obvious build and it ships a page that reads 0% to
 * every scraper and every reader on a slow connection.
 *
 * Its own observer rather than MotionRoot's `data-in`: this needs a rAF loop
 * per element, not a CSS class, and the numbers are few enough that a handful
 * of tiny observers is cheaper than teaching the global one to run callbacks.
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
  /** Accepted for call-site compatibility; the easing owns the timing. */
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        const start = performance.now();
        const DURATION = 1100;
        // Decimals only where the value has them — "2.6" must not count
        // through 0, 1, 2 as integers and land on 3.
        const decimals = value % 1 === 0 ? 0 : 1;

        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / DURATION);
          // Matches --ease-out-expo closely enough that the number and the
          // bar beside it feel like one motion.
          const eased = 1 - Math.pow(1 - p, 3);
          setShown(Number((value * eased).toFixed(decimals)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };

        setShown(0);
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px 15% 0px", threshold: 0 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
