# DenHire intake concept

An interactive, independent concept showing how DenHire could move from an email-app handoff to structured candidate intake and human-led recruiter review.

**[Open the demo](https://angry-tacoz.github.io/denhire-intake-demo/)** | **[Try the candidate form](https://angry-tacoz.github.io/denhire-intake-demo/#/talent)**

All profiles and roles are fictional. The application runs in browser memory. It does not accept real applications, upload resumes, send email, call an AI provider, or connect to DenHire's systems. Refreshing restores the sample data.

## A two-minute walkthrough

1. Open **Before & after** to explain the current email handoff and proposed on-site receipt.
2. Open **Candidate experience**, choose Maya, Jordan, or Sam, and confirm fictional-data use.
3. Submit the demo profile and follow its receipt into the recruiter workspace.
4. Expand a skill to inspect its source evidence, compare another role, and add the candidate to the shortlist.
5. Prepare and edit an Aaron follow-up draft. Nothing is sent.
6. Explore **How it works** for the planned Netlify/Blobs/Postgres/AI architecture. Enable the failure simulation, submit a different sample, then retry processing from the candidate details.

Use **Reset demo** to restart a presentation. Reusing the same email demonstrates duplicate detection.

## Local development

Node.js 24 or newer and npm are required.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the localhost URL printed by Vite. Hash routes (`#/talent`, `#/compare`, `#/architecture`) work on GitHub Pages without server rewrites. The proposed production route is `/talent` on the existing website.

## Verification

```powershell
npm.cmd run verify
```

This runs 11 deterministic domain tests, TypeScript checks, a production build, and a source/bundle guard against recognized credential patterns, network API calls, and persistent browser storage. Fonts are bundled locally. The scan is a narrow demo contract check, not a comprehensive security audit.

Browser verification covers the presentation flows and responsive layouts. See [verification notes](docs/VERIFICATION.md). `npm.cmd audit --omit=dev` checks installed production dependencies separately.

## Matching and simulation

Skill mentions are detected with case-insensitive keyword boundaries against three fixed example role briefs. The interface exposes the exact sample sentence and marks missing evidence as a question. This is neither an AI model nor a measure of ability, suitability, or hiring likelihood. Synonyms, negation, depth, recency, and real resume extraction are not evaluated.

See [Jev research and responsibility split](docs/JEV.md) for the proposed decision-model integration.

Aaron's editable draft is a deterministic template using the selected profile and role. It is not connected to the real Aaron agent. No paid services are used.

## Publishing and review

GitHub Actions runs the canonical verifier before uploading `dist/` to GitHub Pages. Pull requests verify without deploying. The `codex/intake-demo` branch is the authorized public demo preview; `main` is also supported after review and merge. The initial application PR remains a draft for independent review. A live preview does not imply that a PR has merged.

Rollback: revert the faulty commit on the published branch and let the workflow redeploy the verified previous state. Never add real candidate data or provider keys to this repository.

## Engineering guidance

The GitAgent structure is adapted from Test Subject 01. Start with [AGENTS.md](AGENTS.md), [RULES.md](RULES.md), and [the project brief](docs/PROJECT_BRIEF.md). Reusable procedures and capabilities live in `workflows/` and `skills/`.

The source site is [denhire.online](https://denhire.online/#contact). The planned service architecture follows the user-provided proposal; [Netlify Functions](https://docs.netlify.com/build/functions/background-functions/) and [storage documentation](https://docs.netlify.com/build/data-and-storage/overview/) are references for a future implementation, not services deployed by this demo.
