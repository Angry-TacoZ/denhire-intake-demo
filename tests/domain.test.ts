import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advanceCandidate,
  createCandidate,
  matchRole,
  matchesFor,
  roles,
  samples,
  seedCandidates,
  validateSubmission,
} from "../src/domain.ts";

test("AI fixture has evidence for every example AI requirement", () => {
  const result = matchRole(samples[0].resumeText, roles[0]);
  assert.equal(result.covered, 4);
  assert.ok(
    result.evidence.every((item) => item.sentence.includes(item.skill)),
  );
});
test("partial profile leaves unsupported skills as questions", () => {
  const result = matchRole(seedCandidates()[3].resumeText, roles[0]);
  assert.equal(result.covered, 2);
  assert.deepEqual(
    result.evidence.filter((item) => !item.found).map((item) => item.skill),
    ["LLMs", "RAG"],
  );
});
test("empty and unrelated text provide no matching evidence", () => {
  for (const text of [
    "",
    "A project manager with communication skills.",
    "reactive postgresque",
  ]) {
    assert.equal(matchRole(text, roles[1]).covered, 0);
  }
});
test("matching is case insensitive and keeps source text as evidence", () => {
  const result = matchRole("Built python APIs.", roles[0]);
  assert.equal(result.covered, 2);
  assert.equal(result.evidence[0].sentence, "Built python APIs.");
});
test("best role reflects sample skills rather than preferred role alone", () => {
  assert.equal(
    matchesFor({ ...seedCandidates()[1], roleId: "ai" })[0].role.id,
    "fullstack",
  );
});
test("submission validates fields, resume, and demo acknowledgement", () => {
  const valid = {
    name: "Demo Person",
    email: "demo@example.com",
    location: "London",
    resumeText: "Sample résumé",
    consent: true,
  };
  assert.equal(validateSubmission(valid), "");
  for (const change of [
    { name: "" },
    { name: "x".repeat(101) },
    { email: "invalid" },
    { location: "" },
    { resumeText: "" },
    { consent: false },
  ]) {
    assert.notEqual(validateSubmission({ ...valid, ...change }), "");
  }
});
test("duplicate emails resolve to one record and do not overwrite a resume", () => {
  const existing = seedCandidates();
  const result = createCandidate(
    {
      ...samples[0],
      email: "  MAYA.CHEN@EXAMPLE.COM ",
      resumeText: "New text",
    },
    existing,
  );
  assert.equal(result.duplicate, true);
  assert.equal(result.candidate.id, "DH-1001");
  assert.equal(result.candidate.resumeText, samples[0].resumeText);
  assert.equal(existing.length, 4);
});
test("new submissions preserve content and normalize identification", () => {
  const result = createCandidate(
    {
      ...samples[0],
      name: "  Demo Person ",
      email: " DEMO@EXAMPLE.COM ",
      note: "Specific context",
    },
    seedCandidates(),
  );
  assert.equal(result.duplicate, false);
  assert.equal(result.candidate.id, "DH-1005");
  assert.equal(result.candidate.email, "demo@example.com");
  assert.equal(result.candidate.name, "Demo Person");
  assert.equal(result.candidate.resumeText, samples[0].resumeText);
  assert.equal(result.candidate.note, "Specific context");
});
test("receipt exists before processing finishes", () => {
  let candidate = createCandidate(
    { ...samples[0], email: "new@example.com" },
    seedCandidates(),
  ).candidate;
  assert.equal(candidate.status, "processing");
  assert.equal(candidate.stage, 0);
  for (let i = 0; i < 4; i++) candidate = advanceCandidate(candidate, false);
  assert.equal(candidate.status, "review");
  assert.equal(candidate.stage, 4);
});
test("processing failure retains candidate and retry reaches review once", () => {
  let candidate = createCandidate(
    { ...samples[0], email: "new@example.com" },
    seedCandidates(),
  ).candidate;
  for (let i = 0; i < 3; i++) candidate = advanceCandidate(candidate, true);
  assert.equal(candidate.status, "error");
  assert.equal(candidate.stage, 2);
  assert.equal(candidate.resumeText, samples[0].resumeText);
  assert.deepEqual(advanceCandidate(candidate, false), candidate);
  candidate = advanceCandidate({ ...candidate, status: "processing" }, false);
  candidate = advanceCandidate(candidate, false);
  assert.equal(candidate.status, "review");
  assert.equal(candidate.id, "DH-1005");
});
test("shortlisted candidates are never modified by background processing", () => {
  const candidate = seedCandidates()[1];
  assert.deepEqual(advanceCandidate(candidate, false), candidate);
});
