# Demo verification

Scope: public static presentation with fictional data, September 27, 2026. Status: **CONDITIONALLY READY** for that demo scope; not a real candidate intake system.

## Deterministic checks

`npm.cmd run verify` runs 17 tests, including the original intake coverage for full, partial, empty, unrelated, and case-insensitive skill evidence; preferred-role independence; invalid fields and missing acknowledgement; duplicate email normalization without overwrite; new-record content preservation; receipt before processing; failure/retry; and preservation of shortlisted records. It also checks TypeScript, builds the application, and scans source/built output for the demo's no-credentials/no-network-API/no-persistent-storage contract.

The original intake fixtures and assertions are in `tests/domain.test.ts`. The classifier extension adds six tests in `tests/classifier.test.ts`; the canonical verifier now runs 17 tests, all passing locally. No cases were excluded. This is deterministic simulation validation, not a model-quality evaluation. The observed current-site email handoff is the intake comparison baseline; executable keyword and expanded-rule baselines are the classifier walkthrough's comparison. No measured conversion or model-quality improvement is claimed.

## Classifier walkthrough extension

- Verified the fixed synonym case changes from missing to present when expanded rules are enabled, while the context case still differs from the authored interpretation. Missing ownership visibly defers in the authored target.
- Verified default input spend ($6.00 LLM, $3.12 hybrid), 100% escalation ($8.52 hybrid / 42% more), and a 100,000-candidate Sol comparison ($1,200.00 LLM, $145.20 hybrid). Changing comparisons and input length updates the results; reset restores assumptions.
- Inspected 1440×1000 and 390×844 layouts, usable pointer controls, vertically stacked phone content, source disclosure, three-step navigation, restart, inbox entry, direct hash-route refresh, and zero horizontal overflow. This is phone-sized browser inspection, not physical-device testing.
- No browser console errors or warnings observed. Sources and built output pass the no-credentials/no-network-API/no-persistent-storage guard. No added dependencies or paid calls.
- Step navigation returns to the top so a presentation does not land midway down the next section. Existing intake logic is unchanged and its 11 regression tests still pass.
- Model outputs, calibration, real extraction, and total operating savings remain NOT ASSESSED; see [comparison methodology](CLASSIFIER_DEMO.md).

## Browser checklist

- Empty submission produces a visible error.
- A sample profile produces a unique receipt and appears in the recruiter view.
- Submitting the same email again keeps the candidate count unchanged.
- Processing failure retains the record and offers a retry.
- Shortlist actions change status; a follow-up draft is editable and never sent.
- Search supports an empty-result state and clearing filters.
- Inspect desktop and phone-sized layouts, navigation, evidence, comparison, architecture, and reset.
- Confirm direct hash links work after refresh on the deployed Pages site.
- Inspect the live browser console and deployed revision after publication.

## Readiness boundaries

| Area | Assessment |
| --- | --- |
| Synthetic intake and matching logic | Pass: deterministic tests |
| TypeScript / production build | Pass |
| Credential and network/storage contract | Pass: source and built-output guard |
| Production dependency audit | Pass: zero reported vulnerabilities |
| Accessibility | Basic semantic controls/focus/reduced motion; full audit not performed |
| Real uploads, backend, database, AI, Aaron | Not applicable to this simulation; not implemented |
| Real candidate intake | Not ready: no server authorization, storage, or privacy workflow |

The build reports non-blocking Lucide `use client` directive warnings. This is a client-only Vite app with no React Server Components. No runtime impact was observed in the tested flows.

