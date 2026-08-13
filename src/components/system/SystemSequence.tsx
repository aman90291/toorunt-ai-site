import { Container } from "@/components/ui";
import { GATES } from "@/lib/gates";

/**
 * The hand-off between the cinematic hero and the evidence-heavy site.
 *
 * The hero shows the model as a living field. This scene then puts a hard
 * interface around it: one ticket enters, fourteen gates resolve in order,
 * three human signatures interrupt the run, and one merge receipt leaves.
 * The screen docks as the reader scrolls so the motion explains the product
 * transition — autonomous energy becoming governed work — rather than acting
 * as a decorative page reveal.
 */
export function SystemSequence() {
  return (
    <section className="system-sequence" aria-labelledby="system-sequence-title">
      <div className="system-sequence-sticky">
        <Container wide className="system-sequence-shell">
          <div className="system-sequence-copy" aria-hidden="true">
            <span>THE MODEL WRITES.</span>
            <span>THE SYSTEM DECIDES.</span>
          </div>

          <div className="system-screen">
            <div className="system-screen-bar">
              <span className="flex items-center gap-2">
                <span className="system-live-dot" />
                live change / founding run
              </span>
              <span>accountability plane</span>
              <span className="hidden sm:inline">append only</span>
            </div>

            <div className="system-screen-grid">
              <article className="system-ticket">
                <p className="system-kicker">Jira in</p>
                <p className="system-ticket-id">RUN 0726</p>
                <h2 id="system-sequence-title">Idea to deployed product</h2>
                <dl>
                  <div><dt>owner</dt><dd>AI engineering team</dd></div>
                  <div><dt>elapsed</dt><dd>2h 36m</dd></div>
                  <div><dt>risk</dt><dd>bounded</dd></div>
                </dl>
              </article>

              <div className="system-chain" aria-label="Fourteen gates, including three human decisions">
                <div className="system-chain-head">
                  <span>verification chain</span>
                  <span>{GATES.length}/{GATES.length}</span>
                </div>
                <ol>
                  {GATES.map((gate, index) => (
                    <li
                      key={gate.name}
                      className={gate.actor === "human" ? "is-human" : "is-auto"}
                      style={{
                        ["--gate-index" as string]: index,
                        ["--gate-start" as string]: `${18 + index * 1.5}%`,
                        ["--gate-end" as string]: `${44 + index * 1.5}%`,
                      }}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span className="system-gate-name">{gate.name}</span>
                      <span className="system-gate-state">
                        {gate.actor === "human" ? "signed" : "pass"}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <article className="system-receipt">
                <div>
                  <p className="system-kicker">Merged PR out</p>
                  <p className="system-verified">VERIFIED</p>
                </div>
                <div className="system-receipt-mark" aria-hidden="true">✓</div>
                <dl>
                  <div><dt>human decisions</dt><dd>3</dd></div>
                  <div><dt>gates skipped</dt><dd>0</dd></div>
                  <div><dt>audit records</dt><dd>sealed</dd></div>
                </dl>
                <p className="system-hash">hash chain / intact</p>
              </article>
            </div>
          </div>

          <p className="system-sequence-caption">
            Autonomy inside a boundary. Evidence at every step.
          </p>
        </Container>
      </div>
    </section>
  );
}
