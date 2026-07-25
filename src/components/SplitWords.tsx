import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

/**
 * Word-splitter for the on-scroll typography reveals (globals.css, "On-scroll
 * typography") — the server-side stand-in for the Splitting.js pass in
 * Codrops' OnScrollTypographyAnimations, split per WORD rather than per char:
 * words keep real whitespace text nodes between them, so selection, copy and
 * screen-reader order stay intact, which per-char splitting breaks.
 *
 * Each word becomes `.tw > .tw-in` (mask > riser) carrying `--wi`, its index
 * across the WHOLE heading — the walk recurses through element children
 * (<Accent>, <Hot>, nested spans) with one running counter, so the stagger
 * reads left to right regardless of markup boundaries.
 *
 * Splits on ASCII whitespace only: words joined by &nbsp; stay one unit, or
 * the split would re-introduce the line breaks the &nbsp; was there to stop.
 */
export function SplitWords({ children }: { children: ReactNode }) {
  const counter = { i: 0 };
  return <>{walk(children, counter)}</>;
}

function walk(node: ReactNode, counter: { i: number }): ReactNode {
  if (typeof node === "string") return splitString(node, counter);
  if (Array.isArray(node)) return Children.map(node, (child) => walk(child, counter));
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    // Childless elements (icons, <br/>) pass through untouched.
    if (el.props.children == null) return el;
    return cloneElement(el, undefined, walk(el.props.children, counter));
  }
  return node;
}

function splitString(text: string, counter: { i: number }): ReactNode {
  return text.split(/([ \t\n]+)/).map((part, key) => {
    if (part === "" || /^[ \t\n]+$/.test(part)) return part;
    return (
      <span key={key} className="tw" style={{ "--wi": counter.i++ } as React.CSSProperties}>
        <span className="tw-in">{part}</span>
      </span>
    );
  });
}
