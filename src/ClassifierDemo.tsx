import { useState } from "react";
import {
  ArrowRight,
  CheckCheck,
  Code2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  classifierCases,
  evidenceQuestion,
  inputCostEstimate,
  JEV_INPUT_RATE,
  llmPrices,
  runEvidenceRules,
} from "./classifier";
import type { RuleMode } from "./classifier";
import "./classifier.css";

const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(amount);
export default function ClassifierDemo() {
  const [step, setStep] = useState(0);
  function changeStep(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const [caseIndex, setCaseIndex] = useState(0);
  const [mode, setMode] = useState<RuleMode>("keyword");
  const [volume, setVolume] = useState(10000);
  const [comparisons, setComparisons] = useState(3);
  const [tokens, setTokens] = useState(2000);
  const [modelId, setModelId] = useState("sonnet");
  const [escalation, setEscalation] = useState(10);
  const example = classifierCases[caseIndex];
  const ruleResult = runEvidenceRules(example.text, mode);
  const model = llmPrices.find((item) => item.id === modelId)!;
  const cost = inputCostEstimate(
    volume,
    comparisons,
    tokens,
    model.input,
    escalation,
  );
  const ceiling = Math.max(cost.llm, cost.hybrid, 0.001);
  return (
    <div className="classifier-demo">
      <div className="eyebrow">THE RIGHT TOOL FOR EACH PART OF THE JOB</div>
      <h1>Keep the rules. Add understanding.</h1>
      <p className="classifier-lead">
        A focused classifier could bridge the gap between rigid keyword checks
        and using a generative LLM for every decision.
      </p>
      <div className="classifier-steps" aria-label="Classifier presentation">
        {["Compare decisions", "Explore the cost", "See the workflow"].map(
          (label, index) => (
            <button
              key={label}
              className={step === index ? "selected" : ""}
              aria-pressed={step === index}
              onClick={() => changeStep(index)}
            >
              <span>0{index + 1}</span>
              {label}
            </button>
          ),
        )}
      </div>

      {step === 0 && (
        <section aria-label="Decision comparison">
          <div className="classifier-section-heading">
            <div>
              <h2>Same question. Different tools.</h2>
              <p>Choose an excerpt, then try strengthening the rules.</p>
            </div>
            <span className="tag">Fictional résumé excerpts</span>
          </div>
          <div className="case-picker">
            {classifierCases.map((item, index) => (
              <button
                key={item.id}
                aria-pressed={caseIndex === index}
                className={caseIndex === index ? "selected" : ""}
                onClick={() => setCaseIndex(index)}
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="evidence-stage">
            <span className="eyebrow">ONE NARROW QUESTION</span>
            <h3>{evidenceQuestion}</h3>
            <blockquote>“{example.text}”</blockquote>
          </div>
          <div className="decision-columns">
            <article className="decision-card">
              <div className="decision-title">
                <Code2 size={21} />
                <h3>Deterministic rules</h3>
                <span className="tag">Runs here</span>
              </div>
              <label className="rule-switch">
                <input
                  type="checkbox"
                  checked={mode === "expanded"}
                  onChange={(event) =>
                    setMode(event.target.checked ? "expanded" : "keyword")
                  }
                />{" "}
                Add aliases + simple exclusions
              </label>
              <p className="decision-result">{ruleResult}</p>
              <p>
                {mode === "keyword"
                  ? "Checks for the whole word “RAG”. Any mention counts as evidence."
                  : "Also accepts “retrieval-augmented generation”; excludes matching clauses containing no, not, never, tutorial, or course."}
              </p>
              <div
                className={`result-note ${ruleResult === example.expected ? "agrees" : "differs"}`}
              >
                {ruleResult === example.expected
                  ? "Agrees with the authored interpretation on this case."
                  : "Differs from the authored interpretation on this case."}
              </div>
            </article>
            <article className="decision-card classifier-card">
              <div className="decision-title">
                <Sparkles size={21} />
                <h3>Jev-like classifier</h3>
              </div>
              <span className="illustration-label">
                Illustrative target · no model called
              </span>
              <p className="decision-result">{example.expected}</p>
              <p>{example.reason}</p>
              <div className="result-note">
                Authored explanation. A real Jev call would return a typed
                decision; this prose is part of the demo.
              </div>
            </article>
          </div>
          <div className="presenter-takeaway">
            <CheckCheck size={22} />
            <p>{example.takeaway}</p>
          </div>
          <div className="llm-context">
            <MessageSquare size={21} />
            <div>
              <strong>A generative LLM could make this judgment too.</strong>
              <p>
                It can return structured labels. The classifier proposition is a
                dedicated decision model at a lower input price; use generation
                when Aaron needs original wording.
              </p>
            </div>
          </div>
          <div className="classifier-actions">
            <button
              className="button secondary"
              onClick={() =>
                setCaseIndex((caseIndex + 1) % classifierCases.length)
              }
            >
              Next example <ArrowRight size={16} />
            </button>
            <button className="button primary" onClick={() => changeStep(1)}>
              Compare input costs <ArrowRight size={16} />
            </button>
          </div>
          <p className="classifier-footnote">
            These examples teach the intended use case; they do not establish
            model accuracy. More sophisticated rules can cover additional cases.
            Actual advantage requires testing Jev, an LLM, and rules on the same
            recruiter-reviewed examples. Signals support review, never an
            automatic hiring decision.
          </p>
        </section>
      )}

      {step === 1 && (
        <section aria-label="Input cost calculator">
          <div className="classifier-section-heading">
            <div>
              <h2>Small decisions. Repeated at scale.</h2>
              <p>
                Compare the same semantic workload after shared validation
                rules.
              </p>
            </div>
            <span className="tag">Estimated input costs · USD / month</span>
          </div>
          <div className="cost-layout">
            <div className="cost-controls">
              <label>
                Candidates / month
                <select
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                >
                  <option value={1000}>1,000</option>
                  <option value={10000}>10,000</option>
                  <option value={100000}>100,000</option>
                </select>
              </label>
              <label>
                Role comparisons / candidate
                <select
                  value={comparisons}
                  onChange={(event) =>
                    setComparisons(Number(event.target.value))
                  }
                >
                  {[1, 3, 10].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Input tokens / comparison
                <select
                  value={tokens}
                  onChange={(event) => setTokens(Number(event.target.value))}
                >
                  {[500, 2000, 5000].map((value) => (
                    <option key={value} value={value}>
                      {value.toLocaleString("en-US")}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                LLM comparison
                <select
                  value={modelId}
                  onChange={(event) => setModelId(event.target.value)}
                >
                  {llmPrices.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Classifier cases escalated to LLM: {escalation}%
                <input
                  aria-label="Classifier cases escalated to LLM"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={escalation}
                  onChange={(event) =>
                    setEscalation(Number(event.target.value))
                  }
                />
              </label>
              <small>
                Escalation is an assumption you control, not a measured error
                rate. Each escalated case incurs both calls.
              </small>
            </div>
            <div className="cost-results" aria-live="polite">
              <span className="eyebrow">
                {cost.decisions.toLocaleString("en-US")} COMPARISONS / MONTH
              </span>
              {[
                {
                  label: "Rules alone",
                  value: 0,
                  detail: "No model fee. Only the checks you implement.",
                  tone: "rules",
                },
                {
                  label: "LLM for every comparison",
                  value: cost.llm,
                  detail: `${model.label} · $${model.input.toFixed(2)} / 1M input tokens`,
                  tone: "llm",
                },
                {
                  label: "Classifier + LLM escalation",
                  value: cost.hybrid,
                  detail: `${money(cost.classifier)} classifier input + ${money(cost.hybrid - cost.classifier)} LLM input`,
                  tone: "hybrid",
                },
              ].map((row) => (
                <div className={`cost-row ${row.tone}`} key={row.label}>
                  <div>
                    <strong>{row.label}</strong>
                    <b>{money(row.value)}</b>
                  </div>
                  <div className="cost-track">
                    <span
                      style={{ width: `${(row.value / ceiling) * 100}%` }}
                    />
                  </div>
                  <p>{row.detail}</p>
                </div>
              ))}
              <div className="cost-saving">
                <strong>
                  {Math.abs(cost.savingPercent ?? 0).toFixed(1)}%{" "}
                  {cost.savings >= 0 ? "less" : "more"} input spend
                </strong>
                <p>
                  {money(Math.abs(cost.savings))} / month{" "}
                  {cost.savings >= 0 ? "saved" : "extra"} versus this LLM under
                  these assumptions.
                </p>
              </div>
              <p className="classifier-footnote">
                {cost.savings >= 0
                  ? "At modest volume, the dollar savings may be small. Quality and review effort still matter."
                  : "High escalation can erase the savings. Test quality before choosing a routing policy."}
              </p>
            </div>
          </div>
          <details className="cost-assumptions">
            <summary>Sources, rates & what this estimate excludes</summary>
            <p>
              Pricing checked September 27, 2026.{" "}
              <a href="https://typesafe.ai/" target="_blank" rel="noreferrer">
                TypeSafe publishes $42 / billion input tokens
              </a>{" "}
              (= ${JEV_INPUT_RATE} / million).{" "}
              <a
                href="https://platform.claude.com/docs/en/about-claude/pricing"
                target="_blank"
                rel="noreferrer"
              >
                Anthropic standard input pricing
              </a>
              : Claude Sonnet 5 $2.00 / million.{" "}
              <a
                href="https://developers.openai.com/api/docs/pricing"
                target="_blank"
                rel="noreferrer"
              >
                OpenAI standard short-context input prices
              </a>
              : GPT-6 Sol $2.00 / million. Both estimates are equal at the same
              input-token count; actual token counts can differ by provider.
            </p>
            <p>
              Input cost = candidates × role comparisons × input tokens ÷
              1,000,000 × price. Hybrid adds the selected LLM cost for the
              escalation percentage. Equal input lengths are assumed, including
              résumé, question, and role context; actual provider tokenization
              and question overhead can differ.
            </p>
            <p>
              <strong>
                This is input spend only, not a total operating-cost quote.
              </strong>{" "}
              It excludes all output charges, caching and batch discounts,
              retries, extraction, hosting, storage, outreach, human review, and
              engineering time. No equivalence in accuracy or latency is
              assumed. No model calls or paid services run in this demo.
            </p>
          </details>
          <div className="classifier-actions">
            <button
              className="button secondary"
              onClick={() => {
                setVolume(10000);
                setComparisons(3);
                setTokens(2000);
                setModelId("sonnet");
                setEscalation(10);
              }}
            >
              Reset assumptions
            </button>
            <button className="button primary" onClick={() => changeStep(2)}>
              See where each tool fits <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section aria-label="Hybrid workflow">
          <div className="classifier-section-heading">
            <div>
              <h2>Code controls the workflow.</h2>
              <p>Use a classifier for the narrow judgments inside it.</p>
            </div>
          </div>
          <div className="hybrid-flow">
            <article>
              <Code2 />
              <span className="eyebrow">01 · DETERMINISTIC CODE</span>
              <h3>Validate & preserve</h3>
              <p>
                Validate fields, detect duplicates, store the résumé, and keep
                the submission reference. These exact operations do not need AI.
              </p>
              <span className="tag">Predictable inputs → exact checks</span>
            </article>
            <ArrowRight className="flow-arrow" />
            <article className="classifier-card">
              <Sparkles />
              <span className="eyebrow">02 · CLASSIFIER</span>
              <h3>Interpret the evidence</h3>
              <p>
                After extraction, compare described work with a narrow role
                criterion. Jev’s Choice or Score can return typed signals with
                confidence for application code to evaluate.
              </p>
              <span className="tag">Text + criterion → review signal</span>
            </article>
            <ArrowRight className="flow-arrow" />
            <article>
              <MessageSquare />
              <span className="eyebrow">03 · RECRUITER + GENERATION</span>
              <h3>Review & converse</h3>
              <p>
                Recruiters inspect source evidence. Uncertain or conflicting
                signals go to review; an LLM can help investigate or draft
                Aaron’s follow-up, with approval before sending.
              </p>
              <span className="tag">Context → a better conversation</span>
            </article>
          </div>
          <div className="workflow-point">
            <h3>The opportunity for DenHire</h3>
            <p>
              Structured intake solves the email handoff. A classifier could
              make the resulting records more useful: recognize relevant work
              described in different ways, surface uncertainty, and reserve
              larger generative calls for tasks that need them.
            </p>
            <p>
              <strong>The adoption test:</strong> compare missed evidence, false
              evidence, deferrals, reviewer time, and total cost on the same
              held-out examples. Keep rules where they work well.
            </p>
          </div>
          <p className="classifier-footnote">
            The talent inbox still uses a visible keyword baseline. This page
            illustrates the proposed classifier layer; it does not switch the
            inbox to a live model.{" "}
            <a
              href="https://docs.typesafe.ai/primitives"
              target="_blank"
              rel="noreferrer"
            >
              Read TypeSafe’s typed-decision documentation.
            </a>
          </p>
          <div className="classifier-actions">
            <button
              className="button primary"
              onClick={() => {
                changeStep(0);
                setCaseIndex(0);
                setMode("keyword");
              }}
            >
              Restart the walkthrough <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
