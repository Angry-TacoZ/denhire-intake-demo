# Demo verification

Scope: public static presentation with fictional data, September 27, 2026. Status: **CONDITIONALLY READY** for that demo scope; not a real candidate intake system.

## Deterministic checks

`npm.cmd run verify` runs 11 tests covering full, partial, empty, unrelated, and case-insensitive skill evidence; preferred-role independence; invalid fields and missing acknowledgement; duplicate email normalization without overwrite; new-record content preservation; receipt before processing; failure/retry; and preservation of shortlisted records. It also checks TypeScript, builds the application, and scans source/built output for the demo's no-credentials/no-network-API/no-persistent-storage contract.

The fixed fixtures and assertions are in `tests/domain.test.ts`. All 11 passed locally. No cases were excluded. This is deterministic simulation validation, not a model-quality evaluation. There is no previous application baseline in this repository; the observed current-site email handoff is the comparison baseline. No conversion or efficiency improvement is claimed.

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
