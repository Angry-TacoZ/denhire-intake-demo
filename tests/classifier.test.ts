import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifierCases,
  inputCostEstimate,
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
  const result = inputCostEstimate(10000, 3, 2000, 0.1, 10);
  assert.equal(result.decisions, 30000);
  assert.equal(result.classifier, 2.52);
  assert.equal(result.llm, 6);
  assert.equal(result.hybrid, 3.12);
  assert.ok(Math.abs(result.savingPercent! - 48) < 1e-10);
});
test("economics preserve zero use, scaling, no escalation and negative savings", () => {
  const zero = inputCostEstimate(0, 3, 2000, 0.1, 10);
  assert.equal(zero.hybrid, 0);
  assert.equal(zero.savingPercent, null);
  const noFallback = inputCostEstimate(1000, 1, 1000, 0.1, 0);
  assert.equal(noFallback.hybrid, 0.042);
  const scaled = inputCostEstimate(10000, 1, 1000, 0.1, 0);
  assert.ok(Math.abs(scaled.hybrid - noFallback.hybrid * 10) < 1e-10);
  const allFallback = inputCostEstimate(1000, 1, 1000, 0.1, 100);
  assert.ok(allFallback.savings < 0);
  assert.ok(Math.abs(allFallback.savingPercent! + 42) < 1e-10);
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
