# Jev's role in the proposed intake system

Researched September 27, 2026 using TypeSafe's official documentation, rather than third-party sites using the Jev name.

Jev is a non-generative System One decision model. Give it state and focused, typed questions; it returns machine-readable judgments. A generative LLM produces language and can also return structured outputs. The distinction is Jev's purpose-built decision interface and training objective, not that LLMs are incapable of structured output. [Introduction](https://docs.typesafe.ai/introduction)

| Primitive | Output | Possible intake use |
| --- | --- | --- |
| Choice | An allowed option, option probabilities, confidence | Classify an experience area, including an explicit fallback |
| Score | A position on ordered rubric levels, probabilities, confidence | Assess the strength of supplied evidence using recruiter-defined criteria |
| Noul | Probability that a specific proposition is true | Assess whether the text explicitly describes a particular work activity |

These are proposed question designs, not live model results. Noul's probability is not a degree of skill or a hiring-success probability. Each independent criterion should be evaluated separately, with application code combining the results only under an agreed policy. [Primitives](https://docs.typesafe.ai/primitives)

## Responsibility split

1. A parser or extraction service turns a document into text. Jev is not being proposed as a free-form field extractor.
2. The application supplies relevant evidence and role requirements to Jev. Identifying details unnecessary to that judgment should be omitted.
3. Jev answers defined questions. Source excerpts are preserved separately; Jev does not generate prose explanations.
4. Application code validates and stores the signals in `candidate_job_matches`, handles uncertainty and errors, and presents evidence to recruiters.
5. Aaron could use a separate generative model or template for wording. Recruiters review decisions and outreach.

The talent inbox uses transparent keyword matching and a follow-up template. The separate **Why a classifier?** walkthrough runs keyword and expanded rules on six fictional excerpts beside explicitly authored semantic targets. It includes adjustable input-price arithmetic using published TypeSafe and OpenAI rates, with exclusions and escalation visible. It is not a live Jev or LLM comparison. No SDK, credentials, requests, measured latency claims, or invented probabilities are included. See [comparison methodology](CLASSIFIER_DEMO.md).

A real integration requires representative cases, a documented human baseline, quality and calibration checks, and agreed cost/privacy controls. Neither lower token prices nor the scripted examples establish production superiority.
