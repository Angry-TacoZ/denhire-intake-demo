export type EvidenceLabel =
  "Evidence present" | "Not established" | "Needs clarification";
export type RuleMode = "keyword" | "expanded";
export const evidenceQuestion =
  "Does this excerpt establish hands-on delivery of retrieval-augmented generation in a production system?";

// Authored teaching cases, not observations from an AI provider.
export const classifierCases: {
  id: string;
  title: string;
  text: string;
  expected: EvidenceLabel;
  reason: string;
  takeaway: string;
}[] = [
  {
    id: "literal",
    title: "Clear wording",
    text: "I built and operated a production RAG service for our support team.",
    expected: "Evidence present",
    reason:
      "The excerpt explicitly describes building and operating the relevant system.",
    takeaway:
      "For predictable wording, a small rule can be enough. Keep exact checks in code.",
  },
  {
    id: "alias",
    title: "Different wording",
    text: "I built a retrieval-augmented generation service used daily by our customer support team.",
    expected: "Evidence present",
    reason:
      "The full phrase describes the same activity without using the acronym RAG.",
    takeaway:
      "An alias fixes this case. Turn on expanded rules to see that improvement.",
  },
  {
    id: "negation",
    title: "A misleading keyword",
    text: "I have no production RAG experience; my current role is frontend development.",
    expected: "Not established",
    reason:
      "The candidate explicitly says they lack this experience. A keyword alone reverses the meaning.",
    takeaway:
      "Simple negation rules can fix this sentence. A classifier could help with more varied phrasing.",
  },
  {
    id: "context",
    title: "Meaning without the label",
    text: "I shipped our support assistant: it finds relevant passages in the company knowledge base and passes them to the language model to ground each answer. I own the live service.",
    expected: "Evidence present",
    reason:
      "Retrieving source passages to ground generated answers describes the relevant work, despite no matching term.",
    takeaway:
      "This is the classifier opportunity: interpret the described activity without a growing list of phrase combinations.",
  },
  {
    id: "tutorial",
    title: "Learning vs. delivery",
    text: "I completed a RAG tutorial. I have not deployed this work to a production system.",
    expected: "Not established",
    reason:
      "Learning is useful, but this excerpt does not establish production delivery.",
    takeaway:
      "The question is about a specific work activity, not whether someone knows a keyword or should be hired.",
  },
  {
    id: "uncertain",
    title: "Missing ownership",
    text: "Our team runs a RAG service in production. I contributed to the broader support project, but my responsibilities are not described here.",
    expected: "Needs clarification",
    reason:
      "The team has the experience; the candidate’s own contribution is unclear.",
    takeaway:
      "A model must be allowed to defer. Ask what the candidate personally built; never convert missing context into a rejection.",
  },
];

export function runEvidenceRules(text: string, mode: RuleMode): EvidenceLabel {
  if (!text.trim()) return "Needs clarification";
  if (mode === "keyword")
    return /\brag\b/i.test(text) ? "Evidence present" : "Not established";
  const sentences = text
    .split(/[.!?;]+/)
    .filter((sentence) =>
      /\brag\b|\bretrieval[- ]augmented generation\b/i.test(sentence),
    );
  if (!sentences.length) return "Not established";
  const qualifying = sentences.some(
    (sentence) =>
      !/\bno\b|\bnot\b|\bnever\b|\btutorial\b|\bcourse\b/i.test(sentence),
  );
  return qualifying ? "Evidence present" : "Not established";
}

// Public, uncached short-context INPUT prices checked 2026-09-27.
// Input-only comparison: no inference about Jev's other billing components.
export const JEV_INPUT_RATE = 0.042;
export const llmPrices = [
  { id: "fable", label: "Claude Fable 5.1", input: 10.0 },
  { id: "sol", label: "GPT-6 Sol · general purpose", input: 2.0 },
];
export function inputCostEstimate(
  candidates: number,
  comparisons: number,
  tokens: number,
  llmRate: number,
  escalationPercent: number,
) {
  const values = [candidates, comparisons, tokens, llmRate, escalationPercent];
  if (
    values.some((value) => !Number.isFinite(value) || value < 0) ||
    escalationPercent > 100
  )
    throw new RangeError(
      "Cost assumptions must be finite, nonnegative; escalation must be 0–100%.",
    );
  const decisions = candidates * comparisons;
  const millions = (decisions * tokens) / 1_000_000;
  const classifier = millions * JEV_INPUT_RATE;
  const llm = millions * llmRate;
  const hybrid = classifier + (llm * escalationPercent) / 100;
  return {
    decisions,
    classifier,
    llm,
    hybrid,
    savings: llm - hybrid,
    savingPercent: llm === 0 ? null : ((llm - hybrid) / llm) * 100,
  };
}
