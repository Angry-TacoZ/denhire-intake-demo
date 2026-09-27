# DenHire incoming submission demo

## Purpose

Show DenHire how structured candidate intake could improve its current email-app handoff. This is James's independent presentation concept, not DenHire's live recruiting service.

James also wants to demonstrate how a focused decision model could augment deterministic rules at a lower input price than generative LLMs. The classifier walkthrough must make this potential easy to present while distinguishing working rules, authored semantic targets, estimated costs, and actual model evidence (not yet collected).

The current site was inspected on September 27, 2026. It has an inquiry form whose explanation says it prepares an email for the visitor to review and send. James reported that this handoff opened Chrome but never reached Gmail. The demo distinguishes that individual experience from claims about all visitors; conversion improvements and time savings have not been measured.

## User-provided direction

React/TypeScript candidate form at a future `/talent` route -> TypeScript `submit-candidate` Netlify Function -> resume in Netlify Blobs and candidate in Postgres -> background extraction and job-requirement comparison -> inexpensive classifier, with Jev offered as an example -> `candidate_job_matches` -> recruiter dashboard and Aaron AI recruiter.

James requested a public GitHub repository and GitHub Pages hosting, following the Best Buy Blue demo approach. Mouse and mobile touch are the requested interaction scope. Semantic controls and focus styles also provide basic keyboard access, without claiming a full keyboard or accessibility audit.

## Demo boundary

- Real: editable candidate form, validation, receipt, session-only records, duplicate handling, progress state, retry, search, filters, evidence display, shortlist, editable follow-up template, before/after comparison, and clickable architecture explanation.
- Simulated: file upload/storage, PDF extraction, backend requests, database, background jobs, AI classification, and Aaron integration.
- Fictional: every candidate, email address, resume excerpt, and example role.
- No outgoing email, persistent browser storage, provider calls, credentials, or connection to DenHire.
- Refresh or reset restores seed data. The app never claims a real submission was delivered.
- GitHub Pages uses `#/talent` for shared links and refreshes without server rewrites; `/talent` remains the proposed production path.

## Acceptance criteria

1. A visitor can submit a sample candidate, get a receipt, and find that exact reference in the recruiter view.
2. Repeating the same email returns the existing record without overwriting it or creating a duplicate.
3. A simulated processing failure preserves the record and can be retried.
4. Recruiters can inspect source evidence and missing context, shortlist a candidate, and edit a draft without sending it.
5. The comparison accurately separates the current email handoff from proposed capabilities.
6. The demo is usable at desktop and phone widths and publicly accessible through Pages.
7. A presenter can compare fixed evidence cases, strengthen the deterministic baseline, change cost assumptions including LLM escalation, and explain the proposed division of work. Model results remain visibly illustrative and prices include sources and exclusions.

## Future implementation decisions

Production requires agreement on access control, upload validation and private storage, transactional recovery, idempotency, data retention/consent, job-brief management, provider choice and budget, model evaluation, Aaron integration, and outreach authorization. These are outside the public demo scope.
