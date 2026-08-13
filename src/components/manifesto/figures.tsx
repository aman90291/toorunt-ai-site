import type { ReactNode } from "react";
import { ECON } from "@/lib/stats";

/**
 * The manifesto's conceptual figures — Vorflux-style inline diagrams, one per
 * idea, drawn as abstract geometry (boxes, arrows, zones; never screenshots).
 *
 * One shared grammar so the nine figures read as one hand:
 *   • stroke 1.5, corner radius 8, mono 11px uppercase labels;
 *   • every colour is a CSS token (currentColor / var(--color-*)), so the
 *     same figure is light- and dark-band ready — `.on-dark` re-points the
 *     tokens and the SVG follows;
 *   • semantic roles are fixed page-wide: accent = the governed machine,
 *     danger = a human decision, pass = a verified state. A coloured mark
 *     always carries a label or glyph — never colour alone.
 *
 * Figures scale with the text column (width 100%, viewBox-driven), and each
 * ships with a caption slot so the label travels with the drawing.
 */

/* ── shared primitives ─────────────────────────────────────── */

export function Figure({
  caption,
  children,
  wide = false,
}: {
  caption: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    // lg, not md: at 768–860px the 720px column plus the negative margin
    // would overflow the viewport and clip against body's overflow-x hidden.
    <figure className={`my-12 ${wide ? "lg:-mx-24" : ""}`}>
      {children}
      <figcaption className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
        {caption}
      </figcaption>
    </figure>
  );
}

const MONO = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

function Label({
  x,
  y,
  children,
  anchor = "middle",
  tone = "dim",
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  tone?: "ink" | "dim" | "faint" | "danger" | "accent" | "pass";
}) {
  const fill =
    tone === "ink"
      ? "var(--color-ink)"
      : tone === "danger"
        ? "var(--color-danger)"
        : tone === "accent"
          ? "var(--color-accent-text)"
          : tone === "pass"
            ? "var(--color-pass)"
            : tone === "faint"
              ? "var(--color-ink-faint)"
              : "var(--color-ink-dim)";
  return (
    <text x={x} y={y} textAnchor={anchor} style={MONO} fill={fill}>
      {children}
    </text>
  );
}

function Box({
  x,
  y,
  w,
  h,
  tone = "dim",
  dashed = false,
  fill = "none",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: "ink" | "dim" | "faint" | "danger" | "accent";
  dashed?: boolean;
  fill?: string;
}) {
  const stroke =
    tone === "ink"
      ? "var(--color-ink)"
      : tone === "danger"
        ? "var(--color-danger)"
        : tone === "accent"
          ? "var(--color-accent-text)"
          : tone === "faint"
            ? "var(--color-line-2)"
            : "var(--color-ink-dim)";
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={8}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.5}
      strokeDasharray={dashed ? "5 5" : undefined}
    />
  );
}

function Arrow({ x1, y1, x2, y2, dashed = false }: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean }) {
  // simple line + open head, all hairline-toned
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = (a: number) => x2 - 8 * Math.cos(ang - a);
  const hy = (a: number) => y2 - 8 * Math.sin(ang - a);
  return (
    <g stroke="var(--color-ink-faint)" strokeWidth={1.5} fill="none" strokeLinecap="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={dashed ? "5 5" : undefined} />
      <polyline points={`${hx(0.45)},${hy(0.45)} ${x2},${y2} ${hx(-0.45)},${hy(-0.45)}`} />
    </g>
  );
}

/** The recurring human mark: an 8px filled square in the danger tone. It is
 *  pixel-identical everywhere it appears — the page's visual through-line. */
function HumanSquare({ x, y }: { x: number; y: number }) {
  return <rect x={x - 4} y={y - 4} width={8} height={8} fill="var(--color-danger)" />;
}

function Check({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x - 5} ${y} l3.5 3.5 L${x + 5.5} ${y - 4}`}
      stroke="var(--color-pass)"
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/* ── FIG 1 · the bottleneck pipeline, then and now ─────────── */

function Pipe({
  y,
  era,
  neckAt,
}: {
  y: number;
  era: string;
  /** which of the three stations carries the pinch */
  neckAt: "write" | "answer";
}) {
  const write = neckAt === "write";
  return (
    <g>
      <Label x={0} y={y + 5} anchor="start" tone="faint">
        {era}
      </Label>
      <Box x={130} y={y - 18} w={90} h={36} />
      <Label x={175} y={y + 4}>
        Idea
      </Label>
      <Arrow x1={220} y1={y} x2={296} y2={y} />
      {/* WRITE CODE station */}
      <Box
        x={300}
        y={write ? y - 12 : y - 22}
        w={write ? 118 : 168}
        h={write ? 24 : 44}
        tone={write ? "ink" : "accent"}
        fill={write ? "none" : "color-mix(in srgb, var(--color-accent) 8%, transparent)"}
      />
      <Label x={write ? 359 : 384} y={y + 4} tone={write ? "ink" : "accent"}>
        Write code
      </Label>
      <Arrow x1={write ? 418 : 468} y1={y} x2={write ? 546 : 540} y2={y} />
      {/* ANSWER FOR IT station */}
      {write ? (
        <>
          <Box x={550} y={y - 22} w={168} h={44} />
          <Label x={634} y={y + 4}>
            Answer for it
          </Label>
        </>
      ) : (
        <>
          <Box x={544} y={y - 12} w={150} h={24} tone="danger" />
          <HumanSquare x={556} y={y} />
          <Label x={626} y={y + 4} tone="danger">
            Answer for it
          </Label>
        </>
      )}
      <Arrow x1={write ? 718 : 694} y1={y} x2={790} y2={y} />
      <Box x={794} y={y - 18} w={106} h={36} />
      <Label x={847} y={y + 4}>
        Shipped
      </Label>
    </g>
  );
}

export function FigBottleneck() {
  return (
    <Figure caption="The constraint moved right." wide>
      <svg viewBox="0 0 900 170" className="w-full" role="img" aria-label="Two pipelines from idea to shipped: before, the narrow point is writing code; now, the narrow point is answering for it.">
        <Pipe y={45} era="1974 to 2023" neckAt="write" />
        <Pipe y={130} era="Now" neckAt="answer" />
      </svg>
    </Figure>
  );
}

/* ── FIG 2a · the 95/5 share bar ───────────────────────────── */

export function FigShareBar() {
  return (
    <Figure caption="Enterprise AI pilots · measurable bottom line impact, MIT NANDA, 2025">
      <svg viewBox="0 0 900 64" className="w-full" role="img" aria-label="A bar split 95 to 5: 95 percent of enterprise AI pilots show no P&L impact.">
        <defs>
          <pattern id="hatch95" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="7" stroke="var(--color-line-2)" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect x={0} y={14} width={851} height={28} rx={4} fill="url(#hatch95)" stroke="var(--color-line-2)" strokeWidth={1.5} />
        <rect x={857} y={14} width={43} height={28} rx={4} fill="var(--color-accent)" />
        <Label x={14} y={32} anchor="start" tone="ink">
          No P&amp;L impact: 95%
        </Label>
        <Label x={878} y={60} tone="accent">
          5%
        </Label>
      </svg>
    </Figure>
  );
}

/* ── FIG 2b · clean repo vs real organization ──────────────── */

function Lane({ y, nodes }: { y: number; nodes: string[] }) {
  return (
    <g>
      {nodes.map((n, i) => {
        const x = 130 + i * 190;
        return (
          <g key={n}>
            <Box x={x} y={y - 18} w={120} h={36} />
            <Label x={x + 60} y={y + 4}>
              {n}
            </Label>
            {i < nodes.length - 1 && <Arrow x1={x + 120} y1={y} x2={x + 186} y2={y} />}
          </g>
        );
      })}
    </g>
  );
}

export function FigDemoVsOrg() {
  return (
    <Figure caption="The pilot doesn't fail in the repo. It fails in the org chart." wide>
      <svg viewBox="0 0 900 240" className="w-full" role="img" aria-label="Two lanes: on a clean repo the path from prompt to shipped completes; in a real organization the path stops at a wall of unanswered questions: who approved, who reviewed, who is on the hook.">
        <Label x={0} y={40} anchor="start" tone="faint">
          Clean repo
        </Label>
        <Lane y={62} nodes={["Prompt", "Code", "Demo", "Shipped"]} />
        {[130 + 3 * 190 + 60].map((x) => (
          <Check key={x} x={x + 44} y={62 - 24} />
        ))}

        <Label x={0} y={150} anchor="start" tone="faint">
          Real org
        </Label>
        <Lane y={172} nodes={["Prompt", "Code"]} />
        <Arrow x1={440} y1={172} x2={506} y2={172} />
        {/* the wall */}
        {["Who approved?", "Who reviewed?", "Who's on the hook?"].map((q, i) => (
          <g key={q}>
            <Box x={512} y={128 + i * 32} w={172} h={26} tone="dim" />
            <Label x={598} y={145 + i * 32}>
              {q}
            </Label>
          </g>
        ))}
        <Arrow x1={684} y1={172} x2={760} y2={172} dashed />
        <Label x={766} y={176} anchor="start" tone="danger">
          No answer
        </Label>
      </svg>
    </Figure>
  );
}

/* ── FIG 3 · ten agents, one reviewer ──────────────────────── */

export function FigConvergence() {
  const agents = Array.from({ length: 10 });
  return (
    <Figure caption="More agents, same neck." wide>
      <svg viewBox="0 0 900 282" className="w-full" role="img" aria-label="Ten agents converge on one reviewer with a queue piling above; a thin dashed line trickles out to merge.">
        {agents.map((_, i) => {
          const y = 22 + i * 22;
          return (
            <g key={i}>
              <rect x={60} y={y} width={110} height={14} rx={7} fill="none" stroke="var(--color-line-2)" strokeWidth={1.5} />
              {/* full ink-faint, no opacity: the fan IS the figure's subject
                  and has to clear the 3:1 non-text minimum on white */}
              <line x1={170} y1={y + 7} x2={430} y2={128} stroke="var(--color-ink-faint)" strokeWidth={1} />
            </g>
          );
        })}
        <Label x={115} y={272} tone="faint">
          10 agents
        </Label>
        {/* queue pile */}
        {Array.from({ length: 6 }).map((_, i) => (
          <rect
            key={i}
            x={452 - i * 5}
            y={78 - i * 9}
            width={64}
            height={12}
            rx={4}
            fill="color-mix(in srgb, var(--color-ink-faint) 22%, transparent)"
            stroke="var(--color-line-2)"
            strokeWidth={1}
          />
        ))}
        <Label x={478} y={20} tone="faint">
          Queue
        </Label>
        <Box x={432} y={110} w={140} h={40} tone="ink" />
        <Label x={502} y={134} tone="ink">
          1 reviewer
        </Label>
        <Arrow x1={572} y1={130} x2={760} y2={130} dashed />
        <Box x={766} y={112} w={98} h={36} />
        <Label x={815} y={134}>
          Merge
        </Label>
      </svg>
    </Figure>
  );
}

/* ── FIG 4 · the human boundary (dark band) ────────────────── */

export function FigBoundary() {
  const rings = [
    { s: 560, label: "Human boundary: 3 decisions · kill switch", tone: "danger" as const },
    { s: 420, label: "Hash chained record" },
    { s: 290, label: "14 gates" },
    // one word: the label plate must stay narrower than the ring's straight
    // top edge, or it erases the ring instead of cutting a gap into it
    { s: 165, label: "Identity" },
  ];
  return (
    <Figure caption="Accountability is a structure, not a feeling." wide>
      <svg viewBox="0 0 900 640" className="mx-auto w-full max-w-[640px]" role="img" aria-label="Concentric zones around the model: identity, fourteen gates, a hash chained record, and an outer human boundary carrying three decision marks and the kill switch.">
        {rings.map((r, i) => {
          const x = (900 - r.s) / 2;
          const y = 320 - r.s / 2 + 8;
          const danger = r.tone === "danger";
          return (
            <g key={r.label}>
              <rect
                x={x}
                y={y}
                width={r.s}
                height={r.s}
                rx={8 + (rings.length - i) * 7}
                fill="none"
                stroke={danger ? "var(--color-danger)" : "var(--color-ink-dim)"}
                strokeWidth={danger ? 2.5 : 1.5}
                /* 0.8, not 0.55 — the rings are the structure; on the dark
                   band they must hold the 3:1 non-text minimum */
                opacity={danger ? 1 : 0.8}
              />
              {/* label gap: a ground-toned plate under the text, on the top edge */}
              <rect x={450 - r.label.length * 3.6 - 10} y={y - 9} width={r.label.length * 7.2 + 20} height={18} fill="var(--color-ground)" />
              <Label x={450} y={y + 4} tone={danger ? "danger" : "dim"}>
                {r.label}
              </Label>
            </g>
          );
        })}
        {/* three human squares ON the boundary ring */}
        <HumanSquare x={170} y={470} />
        <HumanSquare x={730} y={470} />
        <HumanSquare x={450} y={608} />
        {/* the model chip at centre — sunglow, the one dark-only accent */}
        <rect x={402} y={296} width={96} height={44} rx={8} fill="none" stroke="var(--color-gold)" strokeWidth={1.5} />
        <Label x={450} y={322} tone="ink">
          Model
        </Label>
      </svg>
    </Figure>
  );
}

/* ── FIG 6 · intact / altered hash chain (dark band) ───────── */

function ChainRow({
  y,
  label,
  altered,
}: {
  y: number;
  label: string;
  altered: boolean;
}) {
  const blocks = Array.from({ length: 5 });
  return (
    <g>
      <Label x={0} y={y - 34} anchor="start" tone={altered ? "danger" : "faint"}>
        {label}
      </Label>
      {blocks.map((_, i) => {
        const x = 0 + i * 186;
        const isAlteredBlock = altered && i === 1;
        const downstream = altered && i > 1;
        return (
          <g key={i}>
            <Box x={x} y={y - 22} w={140} h={52} tone={downstream ? "danger" : "dim"} dashed={isAlteredBlock} />
            <Label x={x + 70} y={y - 2} tone={isAlteredBlock ? "danger" : "ink"}>
              Rec 0{i + 1}
              {isAlteredBlock ? " Δ" : ""}
            </Label>
            <Label x={x + 70} y={y + 18} tone="faint">
              prev #{["a3f2", "9c41", "e08d", "77b0", "42c9"][i]}…
            </Label>
            {i < 4 &&
              (altered && i >= 1 ? (
                /* broken link: a visible gap */
                <g stroke="var(--color-danger)" strokeWidth={1.5}>
                  <line x1={x + 140} y1={y + 4} x2={x + 156} y2={y + 4} />
                  <line x1={x + 170} y1={y + 4} x2={x + 186} y2={y + 4} />
                </g>
              ) : (
                <Arrow x1={x + 140} y1={y + 4} x2={x + 184} y2={y + 4} />
              ))}
          </g>
        );
      })}
      {altered ? (
        <g stroke="var(--color-danger)" strokeWidth={2} strokeLinecap="round">
          <line x1={906} y1={y - 4} x2={920} y2={y + 10} />
          <line x1={920} y1={y - 4} x2={906} y2={y + 10} />
        </g>
      ) : (
        <Check x={913} y={y + 6} />
      )}
    </g>
  );
}

export function FigHashChain() {
  return (
    <Figure caption="No third state between intact and tampered." wide>
      <svg viewBox="0 0 930 230" className="w-full" role="img" aria-label="Two hash chains of five records: one intact, one with record two altered and every downstream link visibly breaks.">
        <ChainRow y={58} label="Intact" altered={false} />
        <ChainRow y={180} label="Altered, provably" altered={true} />
      </svg>
    </Figure>
  );
}

/* ── FIG 8 · the economics, on one scale ───────────────────── */

export function FigCostTable() {
  // shared $0–1000 scale mapped to x ∈ [320, 880]
  const X = (v: number) => 320 + (v / 1000) * 560;
  const rows = [
    { label: "Senior engineer, all in", lo: ECON.humanLow, hi: ECON.humanHigh, tone: "neutral" as const, text: `$${ECON.humanLow} to ${ECON.humanHigh.toLocaleString()}` },
    { label: "tOOrunt compute", lo: ECON.cogsLow, hi: ECON.cogsHigh, tone: "accent" as const, text: `$${ECON.cogsLow} to ${ECON.cogsHigh}` },
    { label: "tOOrunt price", lo: ECON.price, hi: ECON.price, tone: "tick" as const, text: `$${ECON.price} flat` },
  ];
  return (
    <Figure caption="Per merged, gate passed pull request. One scale." wide>
      {/* 990 wide, not 900: the top row's "$500–1,000" label starts at
          x≈892 and needs the headroom or it clips to a lone "$". */}
      <svg viewBox="0 0 990 190" className="w-full" role="img" aria-label="Cost ranges on one shared scale from zero to a thousand dollars: senior engineer 500 to 1000, tOOrunt compute 20 to 150, tOOrunt price a single tick at 150.">
        {/* the axis is the chart's measurement reference, so it wears
            ink-faint (3:1-safe), not the decorative hairline tone */}
        <line x1={320} y1={150} x2={880} y2={150} stroke="var(--color-ink-faint)" strokeWidth={1} />
        {[0, 500, 1000].map((v) => (
          <g key={v}>
            <line x1={X(v)} y1={146} x2={X(v)} y2={154} stroke="var(--color-ink-faint)" strokeWidth={1} />
            <Label x={X(v)} y={172} tone="faint">
              ${v.toLocaleString()}
            </Label>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = 26 + i * 42;
          return (
            <g key={r.label}>
              <Label x={0} y={y + 5} anchor="start" tone={r.tone === "accent" ? "accent" : "dim"}>
                {r.label}
              </Label>
              {r.tone === "tick" ? (
                <line x1={X(r.lo)} y1={y - 10} x2={X(r.lo)} y2={y + 10} stroke="var(--color-ink)" strokeWidth={2.5} />
              ) : (
                <rect
                  x={X(r.lo)}
                  y={y - 8}
                  width={Math.max(6, X(r.hi) - X(r.lo))}
                  height={16}
                  rx={4}
                  fill={
                    r.tone === "accent"
                      ? "var(--color-accent)"
                      : "color-mix(in srgb, var(--color-ink-faint) 25%, transparent)"
                  }
                  stroke={r.tone === "accent" ? "none" : "var(--color-line-2)"}
                  strokeWidth={1}
                />
              )}
              <Label x={X(r.hi) + 12} y={y + 5} anchor="start" tone="ink">
                {r.text}
              </Label>
            </g>
          );
        })}
      </svg>
    </Figure>
  );
}

/* ── FIG 9 · the pyramid flattens ──────────────────────────── */

export function FigPyramid() {
  const tiers = [
    { n: 1, label: "VP" },
    { n: 2, label: "Leads" },
    { n: 4, label: "Seniors" },
    { n: 8, label: "Engineers" },
  ];
  return (
    <Figure caption="Same throughput question, different shape." wide>
      <svg viewBox="0 0 900 250" className="w-full" role="img" aria-label="Before: a four-tier pyramid of people with a backlog leaning on it. After: one wide governed-agents slab with a thin human boundary bar on top carrying three decision marks.">
        {/* BEFORE — pyramid */}
        {tiers.map((t, ti) => {
          const w = 34;
          const rowW = t.n * w + (t.n - 1) * 4;
          const x0 = 170 - rowW / 2;
          const y = 30 + ti * 42;
          return (
            <g key={t.label}>
              {Array.from({ length: t.n }).map((_, i) => (
                <rect key={i} x={x0 + i * (w + 4)} y={y} width={w} height={34} rx={6} fill="none" stroke="var(--color-ink-dim)" strokeWidth={1.5} opacity={0.7} />
              ))}
              <Label x={330} y={y + 22} anchor="start" tone="faint">
                {t.label}
              </Label>
            </g>
          );
        })}
        {/* backlog pile */}
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={i} x={16 - i * 3} y={168 - i * 10} width={52} height={10} rx={3} fill="color-mix(in srgb, var(--color-ink-faint) 22%, transparent)" stroke="var(--color-line-2)" strokeWidth={1} />
        ))}
        <Label x={42} y={200} tone="faint">
          Backlog
        </Label>
        <Label x={170} y={232} tone="faint">
          Before
        </Label>

        <Arrow x1={410} y1={120} x2={490} y2={120} />
        <Label x={450} y={104} tone="faint">
          The yes got structured
        </Label>

        {/* AFTER — flat slab + boundary bar */}
        <rect x={520} y={80} width={360} height={16} rx={6} fill="none" stroke="var(--color-danger)" strokeWidth={1.5} />
        <HumanSquare x={560} y={88} />
        <HumanSquare x={700} y={88} />
        <HumanSquare x={840} y={88} />
        <Label x={700} y={68} tone="danger">
          Human boundary: decides &amp; signs
        </Label>
        <rect
          x={520}
          y={106}
          width={360}
          height={64}
          rx={8}
          fill="color-mix(in srgb, var(--color-accent) 8%, transparent)"
          stroke="var(--color-accent-text)"
          strokeWidth={1.5}
        />
        <Label x={700} y={143} tone="accent">
          Governed agents
        </Label>
        <Label x={700} y={232} tone="faint">
          After
        </Label>
      </svg>
    </Figure>
  );
}
