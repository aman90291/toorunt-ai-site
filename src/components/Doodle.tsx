/**
 * Hand-drawn marker doodles, in the unDraw Handcrafts idiom.
 *
 * Drawn here rather than exported from handcrafts.undraw.co: that tool is a
 * client-side generator with no per-asset URL, and its licence page does not
 * state commercial terms. These are original paths in the same idiom, so the
 * site owns them outright and they inherit the palette instead of shipping a
 * baked-in stroke colour.
 *
 * They are all `currentColor` + `stroke`, so placement decides the colour via a
 * normal text utility. On light sections use `text-pass` or `text-accent-text`
 * (bronze) — both text-safe on white. Avoid `text-gold` on white while the
 * primary is warm: it measures 1.12:1 against accent-text. The bright accent
 * fill is only used as a stroke inside `.on-dark`, where it reads.
 *
 * Every one is aria-hidden. They decorate; they never carry meaning.
 */

type Name = "underline" | "sparkle" | "arrow" | "circle" | "check" | "burst";

const PATHS: Record<Name, { d: string[]; viewBox: string; fill?: boolean }> = {
  // a marker swipe under a word — two passes, as a real pen would
  underline: {
    viewBox: "0 0 120 14",
    d: [
      "M3 8.5c14-3.2 30-5 46-5.2C67 3 90 5 117 9.2",
      "M8 12c18-2.6 38-3.6 58-3.2 14 .3 28 1.2 41 2.6",
    ],
  },
  /* Four-point sparkle. Both stars are drawn with equal horizontal and
     vertical reach from their centre — the first pass was ~16 units tall by
     ~9 wide, which read as a squashed star rather than a struck one. */
  sparkle: {
    viewBox: "0 0 32 32",
    d: [
      "M13 1c1.3 7 3.9 10.7 12 12-8.1 1.3-10.7 4.9-12 12-1.3-7.1-3.9-10.7-12-12 8.1-1.3 10.7-5 12-12Z",
      "M25.5 18.5c.65 3.5 1.95 5.35 6 6-4.05.65-5.35 2.45-6 6-.65-3.55-1.95-5.35-6-6 4.05-.65 5.35-2.5 6-6Z",
    ],
    fill: true,
  },
  // a curved pointer, the kind scribbled next to a note
  arrow: {
    viewBox: "0 0 40 26",
    d: [
      "M2 20.5C8 8.5 20 3 36 5.5",
      "M28.5 2.5c3.4 1 6 2 7.8 3.1-2 1.6-3.6 3.9-4.8 6.9",
    ],
  },
  // a rough circle for ringing a word — deliberately not closed
  circle: {
    viewBox: "0 0 120 44",
    d: [
      "M96 6.5C80 2.6 58 1.8 38 4.4 16 7.2 4 13.6 4.6 21.4c.7 8.2 16 14.5 40 16.6 24 2.1 46-.9 56-7.2 6.6-4.2 7-9.6.8-14.2",
    ],
  },
  check: {
    viewBox: "0 0 24 20",
    d: ["M2.5 10.5c3 1.4 5.4 3.6 7.2 6.6C13 10.4 16.6 5.2 21.5 2"],
  },
  // three strokes crossing — the "new/important" asterisk
  burst: {
    viewBox: "0 0 22 22",
    d: ["M11 2.5v17", "M3.4 6.3l15.2 9.4", "M18.6 6.3L3.4 15.7"],
  },
};

export function Doodle({
  name,
  className = "",
  width,
  stretch = false,
}: {
  name: Name;
  className?: string;
  /** CSS width; height follows the viewBox. Defaults suit inline use. */
  width?: number | string;
  /**
   * Let the mark distort to fill its box instead of keeping its aspect ratio.
   * Required for `underline` and `circle`, which span a word of arbitrary
   * length: with the ratio locked, a `w-full` underline under a 680px heading
   * computes to ~79px tall and strikes straight through the text.
   */
  stretch?: boolean;
}) {
  const { d, viewBox, fill } = PATHS[name];
  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={width ? { width } : undefined}
      preserveAspectRatio={stretch ? "none" : undefined}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {d.map((p) => (
        <path
          key={p}
          d={p}
          {...(fill
            ? { fill: "currentColor" }
            : {
                stroke: "currentColor",
                strokeWidth: 2,
                strokeLinecap: "round" as const,
                strokeLinejoin: "round" as const,
                // Keeps the stroke an even weight when `stretch` scales the
                // box unevenly — without it a stretched underline thins out.
                vectorEffect: "non-scaling-stroke" as const,
              })}
        />
      ))}
    </svg>
  );
}
