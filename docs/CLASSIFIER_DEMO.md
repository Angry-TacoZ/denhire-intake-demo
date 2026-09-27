# Classifier presentation and evaluation boundary

The `#/classifier` walkthrough demonstrates a proposed decision-model use case. It does not evaluate a model. All excerpts and expected interpretations are authored, fictional teaching material. Do not present them as measured Jev accuracy, confidence, speed, or savings in total operating cost.

## Reproducible baseline

`src/classifier.ts` contains the fixed cases and both executable rule baselines. The question is whether an excerpt establishes hands-on production delivery of retrieval-augmented generation. The keyword rule tests the whole word RAG. The expanded rule also accepts its full phrase and excludes matching clauses containing no/not/never/tutorial/course. These are deliberately small, inspectable heuristics, not a claim about the best possible deterministic system.

| Case | Keyword | Expanded | Authored interpretation |
| --- | --- | --- | --- |
| Clear wording | Evidence present | Evidence present | Evidence present |
| Different wording | Not established | Evidence present | Evidence present |
| Misleading keyword | Evidence present | Not established | Not established |
| Meaning without the label | Not established | Not established | Evidence present |
| Learning vs. delivery | Evidence present | Not established | Not established |
| Missing ownership | Evidence present | Evidence present | Needs clarification |

The expanded rule demonstrates a real improvement and retains known failures. It does not reliably determine production use, ownership, negation scope, chronology, or conflicting evidence. For example, a positive clause overrides an earlier negative one. The tests preserve this limitation rather than silently treating it as semantic understanding. No aggregate model accuracy score is shown. A real model might also fail any of these cases.

## Cost arithmetic

Prices checked September 27, 2026: [TypeSafe](https://typesafe.ai/) advertises $42 per billion input tokens, or $0.042 per million. [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing) lists Claude Fable 5.1 standard uncached input at $10.00/million. [OpenAI](https://developers.openai.com/api/docs/pricing) lists GPT-6 Sol standard short-context uncached input at $2.00/million. Fable 5.1 is the default for the presentation. Its higher price illustrates a possible routing comparison, not a claim that it is the optimal generative model for this narrow question. These models can tokenize identical text differently; neither rate implies a quality result.

Compare the same workload remaining after shared deterministic validation. All comparisons go to the classifier in the hybrid path, with a user-selected proportion also going to the LLM. A comparison includes all decision-question overhead in the assumed token count. Equal token counts across providers are an estimate, not measured usage.

```
decisions = candidates * role comparisons
million input tokens = decisions * tokens per comparison / 1,000,000
LLM input cost = million input tokens * LLM input rate
classifier input cost = million input tokens * 0.042
hybrid input cost = classifier input cost + LLM input cost * escalation fraction
saving = LLM input cost - hybrid input cost
```

Defaults: 10,000 candidates, 3 comparisons, 2,000 tokens, Claude Fable 5.1, 10% escalation. Results: $600 LLM input versus $62.52 hybrid input ($2.52 + $60.00), a $537.48 / 89.6% reduction. GPT-6 Sol gives $120 versus $14.52 ($2.52 + $12.00), a $105.48 / 87.9% reduction. At 100% escalation Fable's hybrid costs $602.52 (0.42% more) and Sol's costs $122.52 (2.1% more). Negative savings are intentionally displayed. Rules-only model fees are zero but do not imply equivalent semantic coverage or free engineering/compute.

Output charges, caches, batch discounts, retries, extraction, infrastructure, outreach, reviewer labor, and development costs are excluded. We did not confirm a total Jev billing formula or make paid calls. The UI explicitly labels this **input spend only**. Prices can change; verify them before using this as a budget.

## Verification and remaining evaluation

`npm.cmd run verify` includes `tests/classifier.test.ts`: full fixed baseline outputs, empty input, word boundaries, case, contradictory clauses, alias behavior, exact default arithmetic, scaling, zero workload, full escalation, and invalid assumptions. These validate deterministic implementation, not candidate-model quality.

Before adoption, create a separate held-out set of consented/redacted excerpts labeled by recruiters. Give each baseline and model the same evidence, criterion, and allowed labels. Measure false evidence, missed evidence, deferrals, reviewer agreement/time, measured token charges, retries, and latency. Evaluate calibration and choose escalation thresholds using held-out evidence; include malformed input, missing evidence, conflicting claims, prompt injection, timeouts and provider failures. Keep the raw outputs and versions. No real candidate model has been assessed yet; quality/calibration and end-to-end operating savings remain NOT ASSESSED.

The inbox's current keyword logic and template outreach remain unchanged. A future backend would preserve source excerpts separately, validate typed model results, route uncertainty to review, and require recruiter approval for employment decisions and outreach.

