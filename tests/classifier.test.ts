import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifierCases,
  inputCostEstimate,
  llmPrices,
  runEvidenceRules,
} from "../src/classifier.ts";

test("keyword baseline exposes both missed context and false evidence on fixed cases", () => {
  assert.deepEqual(
    classifierCases.map((item) => runEvidenceRules(item.text, "keyword")),
    [
      "Evidence present",
      "Not established",
      "Evidence present",
      "Not established",
      "Evidence present",
      "Evidence present",
    ],
  );
});
test("expanded rules fix alias, simple negation and tutorial cases but retain documented limits", () => {
  assert.deepEqual(
    classifierCases.map((item) => runEvidenceRules(item.text, "expanded")),
    [
      "Evidence present",
      "Evidence present",
      "Not established",
      "Not established",
      "Not established",
      "Evidence present",
    ],
  );
});
test("rules handle empty input, word boundaries, case and multiple clauses", () => {
  for (const mode of ["keyword", "expanded"] as const) {
    assert.equal(runEvidenceRules("   ", mode), "Needs clarification");
    assert.equal(
      runEvidenceRules("fragmented ragged work", mode),
      "Not established",
    );
    assert.equal(
      runEvidenceRules("PRODUCTION rag SERVICE", mode),
      "Evidence present",
    );
  }
  assert.equal(
    runEvidenceRules(
      "No RAG experience. Later I built a RAG service.",
      "expanded",
    ),
    "Evidence present",
  );
  assert.equal(
    runEvidenceRules("A retrieval augmented generation service", "expanded"),
    "Evidence present",
  );
});
test("default economics compare equal input volumes and charge both calls for escalation", () => {
  assert.deepEqual(
    llmPrices.map(({ id, input }) => ({ id, input })),
    [
      { id: "fable", input: 10 },
      { id: "sol", input: 2 },
    ],
  );
  for (const model of llmPrices) {
    const result = inputCostEstimate(10000, 3, 2000, model.input, 10);
    assert.equal(result.decisions, 30000);
    assert.equal(result.classifier, 2.52);
    const expected =
      model.id === "fable"
        ? { llm: 600, hybrid: 62.52, savings: 537.48, savingPercent: 89.58 }
        : { llm: 120, hybrid: 14.52, savings: 105.48, savingPercent: 87.9 };
    assert.equal(result.llm, expected.llm);
    assert.equal(result.hybrid, expected.hybrid);
    assert.ok(Math.abs(result.savings - expected.savings) < 1e-10);
    assert.ok(Math.abs(result.savingPercent! - expected.savingPercent) < 1e-10);
  }
});
test("economics preserve zero use, scaling, no escalation and negative savings", () => {
  const zero = inputCostEstimate(0, 3, 2000, 2, 10);
  assert.equal(zero.hybrid, 0);
  assert.equal(zero.savingPercent, null);
  const noFallback = inputCostEstimate(1000, 1, 1000, 2, 0);
  assert.equal(noFallback.hybrid, 0.042);
  const scaled = inputCostEstimate(10000, 1, 1000, 2, 0);
  assert.ok(Math.abs(scaled.hybrid - noFallback.hybrid * 10) < 1e-10);
  const allFallback = inputCostEstimate(10000, 3, 2000, 2, 100);
  assert.ok(allFallback.savings < 0);
  assert.equal(allFallback.hybrid, 122.52);
  assert.ok(Math.abs(allFallback.savingPercent! + 2.1) < 1e-10);
  const fableFallback = inputCostEstimate(10000, 3, 2000, 10, 100);
  assert.equal(fableFallback.hybrid, 602.52);
  assert.ok(Math.abs(fableFallback.savingPercent! + 0.42) < 1e-10);
});
test("economics reject invalid assumptions instead of displaying fictional savings", () => {
  for (const args of [
    [-1, 1, 1000, 0.1, 0],
    [1, NaN, 1000, 0.1, 0],
    [1, 1, Infinity, 0.1, 0],
    [1, 1, 1000, -1, 0],
    [1, 1, 1000, 0.1, 101],
  ]) {
    assert.throws(
      () =>
        inputCostEstimate(
          ...(args as [number, number, number, number, number]),
        ),
      RangeError,
    );
  }
});
