# Denhire Incoming Submission Overhaul

James identified an opportunity to improve Denhire's current `mailto:` submission intake and pitched a broader intake vision. He will provide the proposal details after this repository setup. See [the project brief](docs/PROJECT_BRIEF.md).

## Repository setup

Local Git repository on `main`. No remote, hosted CI, or deployment is configured. Use focused `codex/<change-name>` branches and reviewed pull requests for meaningful implementation once a remote is agreed.

## GitAgent structure

Adapted from James's Test Subject 01 repository, retaining its engineering, review, verification, and security procedures.

- [AGENTS.md](AGENTS.md): agent entry point.
- [agent.yaml](agent.yaml): identity and reusable skill declarations.
- [SOUL.md](SOUL.md): purpose and working values.
- [RULES.md](RULES.md): scope, privacy, verification, and delivery constraints.
- [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md): confirmed context and pending decisions.
- `workflows/`: startup, engineering, evaluation, verification, review, release, and reporting.
- `skills/`: API security, secure changes, interaction usability, and visual diagnosis.
- [.github/pull_request_template.md](.github/pull_request_template.md): review checklist with submission-specific impact.

The game runtime, assets, package manifest, game verifier, and GitHub Pages deployment were not copied. No application dependencies are required for this guidance-only setup.

## Verification

From the repository root, with Node.js 18 or newer, validate the guidance with the version used for this bootstrap:

```powershell
npx.cmd --yes @open-gitagent/opengap@0.5.0 validate
git diff --check
git diff --cached --check
```

The `npx` command may download the validator when it is not cached. OpenGAP validates guidance structure, not application behavior. Application tests, build, browser verification, and production readiness are NOT ASSESSED because no application exists yet. Define a canonical application verifier after James selects the stack.

## Next step

Review James's fuller intake proposal, clarify remaining requirements one question at a time, and compare at least two suitable technology options before implementation.
