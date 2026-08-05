import { FEATURES } from "@/content/features";
import { FIELD } from "@/content/home-scenes";
import { GATES } from "@/lib/gates";
import { SHOTS } from "@/lib/shots";
import { ECON } from "@/lib/stats";

export function GapConvergence() {
  return (
    <div className="gap-convergence" aria-label="Two readings that reveal the accountability gap">
      <div className="gap-convergence-line" aria-hidden="true" />
      <article className="gap-reading gap-reading-left">
        <span className="gap-reading-index">01 / adoption</span>
        <strong>75<span>%</span></strong>
        <p>of Google&rsquo;s new code is AI-generated</p>
        <small>Google · Q3 2025 earnings call</small>
      </article>
      <article className="gap-reading gap-reading-right">
        <span className="gap-reading-index">02 / impact</span>
        <strong>95<span>%</span></strong>
        <p>of enterprise GenAI pilots deliver no measurable P&amp;L impact</p>
        <small>MIT NANDA · 2025</small>
      </article>
      <p className="gap-convergence-verdict">
        <span>AI accelerated the writing.</span>
        <strong>Accountability became the bottleneck.</strong>
      </p>
    </div>
  );
}

export function SurfaceStack() {
  return (
    <div className="surface-stack" aria-label="Four surfaces of the tOOrunt control plane">
      {FEATURES.map((feature, i) => {
        const shot = SHOTS[feature.shot];
        return (
          <article
            key={feature.key}
            className={`surface-card surface-card-${feature.key}`}
            style={{
              ["--card" as string]: i,
              ["--card-top" as string]: `${82 + i * 12}px`,
              ["--card-z" as string]: 10 + i,
              ["--tilt" as string]: `${[-0.18, -0.45, 0.35, -0.25][i]}deg`,
              ["--entry-tilt" as string]: `${[-1.1, 0.9, -0.8, 0.7][i]}deg`,
            }}
          >
            <header className="surface-card-head">
              <span>{feature.index} / 04</span>
              <span>{feature.tab}</span>
              <span>Control plane</span>
            </header>
            <div className="surface-card-grid">
              <div className="surface-card-copy">
                <p className="surface-card-kicker">{feature.lead}</p>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                <dl>
                  {feature.readouts.map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="surface-card-screen">
                <div className="surface-card-browser">
                  <i /><i /><i />
                  <span>{feature.url}</span>
                </div>
                <picture>
                  <source type="image/avif" srcSet={`/shots/${feature.shot}-1100.avif 1100w, /shots/${feature.shot}-2200.avif 2200w`} sizes="(max-width: 900px) 100vw, 760px" />
                  <source type="image/webp" srcSet={`/shots/${feature.shot}-1100.webp 1100w, /shots/${feature.shot}-2200.webp 2200w`} sizes="(max-width: 900px) 100vw, 760px" />
                  <img
                    src={`/shots/${feature.shot}-1100.webp`}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </picture>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function GateWorkflow() {
  const humans = GATES.filter((gate) => gate.actor === "human").length;

  return (
    <div className="gate-workflow">
      <div className="gate-workflow-track" aria-hidden="true">
        <span>Ticket in</span>
        <div>
          {GATES.map((gate, i) => (
            <i key={gate.name} className={gate.actor === "human" ? "is-human" : ""} style={{ ["--gate" as string]: i }} />
          ))}
        </div>
        <span>Merged + watched</span>
      </div>
      <div className="gate-workflow-summary">
        <span><strong>{GATES.length - humans}</strong> automatic</span>
        <span className="is-human"><strong>{humans}</strong> human</span>
        <span className="is-pass"><strong>0</strong> skippable</span>
      </div>
      <ol className="gate-workflow-list">
        {GATES.map((gate, i) => (
          <li key={gate.name} className={gate.actor === "human" ? "is-human" : ""} style={{ ["--gate" as string]: i }}>
            <span className="gate-workflow-number">{String(i + 1).padStart(2, "0")}</span>
            <h3>{gate.name}</h3>
            <p>{gate.evidence}</p>
            <span className="gate-workflow-actor">{gate.actor === "human" ? "signature" : "automatic"}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const ERAS = [
  { n: "01", label: "Manual SDLC", team: "4–6 people", cycle: "1–2 weeks", cost: "$500–1,000", width: 100, winner: false },
  { n: "02", label: "+ AI copilots", team: "4–6 · faster typing", cycle: "~1 week", cost: "$400–800", width: 78, winner: false },
  { n: "03", label: "tOOrunt AI", team: "0–1 · approvals only", cycle: "Hours · 2h 36m", cost: `$${ECON.cogsLow}–${ECON.cogsHigh}`, width: 11, winner: true },
] as const;

export function CostLedger() {
  return (
    <div className="cost-ledger">
      <header className="cost-ledger-head">
        <span>Era</span><span>Team</span><span>Cycle</span><span>Cost / merged PR</span>
      </header>
      {ERAS.map((era, i) => (
        <article key={era.label} className={era.winner ? "is-winner" : ""} style={{ ["--era" as string]: i }}>
          <span className="cost-ledger-number">{era.n}</span>
          <h3>{era.label}</h3>
          <p>{era.team}</p>
          <p>{era.cycle}</p>
          <strong>{era.cost}</strong>
          <span className="cost-ledger-bar" aria-hidden="true">
            <i style={{ width: `${era.width}%` }} />
          </span>
        </article>
      ))}
      <footer className="cost-ledger-result">
        <span>Same ticket</span>
        <strong>~90% lower cost</strong>
        <span>10–20× cycle-time compression</span>
      </footer>
    </div>
  );
}

export function FieldScanner() {
  return (
    <div className="field-scanner">
      <header className="field-scanner-head">
        <span>Market category</span>
        <span>Where accountability stops</span>
        <strong>tOOrunt AI</strong>
      </header>
      <div className="field-scanner-beam" aria-hidden="true" />
      {FIELD.rows.map((row, i) => (
        <article key={row[0]} className="field-scanner-row" style={{ ["--row" as string]: i }}>
          <span className="field-axis">{String(i + 1).padStart(2, "0")} · {row[0]}</span>
          <div className="field-alternatives">
            {FIELD.cols.slice(0, 3).map((column, columnIndex) => (
              <div key={column.group}>
                <small>{column.group}</small>
                <p>{row[columnIndex + 1]}</p>
              </div>
            ))}
          </div>
          <div className="field-answer">
            <small>{FIELD.cols[3].names}</small>
            <p>{row[4]}</p>
          </div>
        </article>
      ))}
      <footer className="field-scanner-footer">
        <span>Identity</span><span>Review</span><span>Governance</span><strong>Accountability intact</strong>
      </footer>
    </div>
  );
}
