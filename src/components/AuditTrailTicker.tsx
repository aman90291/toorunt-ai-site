"use client";

/**
 * A vertically scrolling hash-chained audit log. Pure CSS marquee (duplicated
 * list), pauses on hover; static under reduced-motion via the global clamp.
 */
const ROWS = [
  { t: "03:05:12", actor: "devagent-sam", action: "plan_approved", hash: "9f3a1c" },
  { t: "03:05:04", actor: "founder", action: "approve_prd", hash: "1b77e0" },
  { t: "03:04:51", actor: "devagent-sam", action: "tests_green", hash: "c40d92" },
  { t: "03:04:39", actor: "devagent-tyler", action: "peer_review:approve", hash: "77a5f1" },
  { t: "03:04:22", actor: "devagent-sam", action: "secret_scan:clean", hash: "2e9b04" },
  { t: "03:04:08", actor: "devagent-sam", action: "merge:verified-green", hash: "b81c6d" },
  { t: "03:03:55", actor: "devagent-sam", action: "watchdog:armed", hash: "5d2af8" },
  { t: "03:03:40", actor: "founder", action: "kill_switch:off", hash: "0ac913" },
];

function Row({ r, prev }: { r: (typeof ROWS)[number]; prev: string }) {
  return (
    <li className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-2.5 font-mono text-[11px] sm:text-[12px]">
      <span className="text-ink-faint tabular-nums">{r.t}</span>
      <span className="min-w-0 truncate">
        <span className="text-ink-dim">{r.actor}</span>{" "}
        <span className={r.action.includes("approve") || r.action.includes("kill") ? "text-accent-text" : "text-pass"}>
          {r.action}
        </span>
      </span>
      <span className="whitespace-nowrap text-ink-faint">
        #{r.hash}
        <span className="hidden text-line-2 sm:inline"> ← {prev}</span>
      </span>
    </li>
  );
}

export function AuditTrailTicker() {
  const doubled = [...ROWS, ...ROWS];
  return (
    <div className="relative h-[240px] overflow-hidden rounded-[var(--radius-card)] border border-line bg-ground-2/60 px-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-ground-2 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-ground-2 to-transparent" />
      <ul className="animate-marquee-y">
        {doubled.map((r, i) => (
          <Row key={i} r={r} prev={ROWS[(i + ROWS.length - 1) % ROWS.length].hash} />
        ))}
      </ul>
    </div>
  );
}
