---
name: project-verification
description: Run safe, scope-appropriate project checks and report their evidence.
---

# Project Verification

1. Identify checks applicable to the changed behavior.
2. Run targeted checks during implementation.
3. Run `npm.cmd run verify`: deterministic domain tests, TypeScript checking, production build, and a source/build scan for recognized credential patterns, network API calls, and persistent browser storage. Inspect changed user flows in a browser on desktop and phone-sized viewports. This is a static demo; never claim these checks verify the proposed backend.
4. Run the full verifier before opening a pull request, deploying, publishing, or making a readiness claim.
5. Do not treat a dry run as evidence.
6. Confirm the run is non-destructive and does not perform unauthorized paid calls, live mutations, deployment, or publishing.
7. Record exit code `0` for passed, `1` for failed, or `2` for not assessed.
8. Fix in-scope failures and rerun verification.
9. Report missing checks as a gap; never convert not assessed into pass.
10. Confirm pre-existing dirty files remain intact and report generated changes.
11. Report checks run, checks omitted, results, and remaining risk.

12. A passing GitAgent check verifies guidance only. Application behavior and production readiness remain NOT ASSESSED until implemented and tested.
13. For submission functionality, verify successful intake, validation errors, duplicates/retries, recovery, access controls where applicable, and the visible result using synthetic data.
