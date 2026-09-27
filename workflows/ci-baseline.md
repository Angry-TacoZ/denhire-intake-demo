---
name: ci-baseline
description: Run repository verification on pull requests and default-branch changes.
---

# GitHub CI Baseline

For a maintained software repository:

1. Configure GitHub Actions for pull requests and pushes to the default branch.
2. Install dependencies using the repository's documented method.
3. Install locked dependencies with `npm ci`, then run `npm run verify` with Node.js 24. The Pages workflow verifies pull requests without deploying them and publishes pushes on `main` or the explicitly authorized demo-preview branch, `codex/intake-demo`.
4. Keep ordinary CI deterministic and non-destructive.
5. Avoid production credentials when tests and builds can run without them.
6. When permissions allow it, require stable CI checks before merging.
7. If CI is not configured or intentionally skipped, document why. The public demo uses GitHub Actions and GitHub Pages. Production Netlify services remain unconfigured.
8. Treat passing CI as evidence, not as an unqualified production-readiness claim.
