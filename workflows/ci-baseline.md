---
name: ci-baseline
description: Run repository verification on pull requests and default-branch changes.
---

# GitHub CI Baseline

For a maintained software repository:

1. Configure GitHub Actions for pull requests and pushes to the default branch.
2. Install dependencies using the repository's documented method.
3. Use the application verifier documented in README once a stack and verifier exist. Include applicable lint, tests, type checks, build, and submission-flow smoke checks. This guidance-only bootstrap has no application verifier; do not copy the game build or deployment pipeline.
4. Keep ordinary CI deterministic and non-destructive.
5. Avoid production credentials when tests and builds can run without them.
6. When permissions allow it, require stable CI checks before merging.
7. If CI is not configured or intentionally skipped, document why. This bootstrap has no remote or application stack, so hosted CI is unconfigured.
8. Treat passing CI as evidence, not as an unqualified production-readiness claim.
