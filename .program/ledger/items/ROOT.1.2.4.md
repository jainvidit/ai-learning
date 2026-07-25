---
id: ROOT.1.2.4
parent: ROOT.1.2
type: Task
title: model-router.md interface doc — ModelRouter/ModelGateway seam contract
ledger_depth: 3
status: in_progress
owner_agent: implementer-ROOT.1.2.4-gen0
generation: 0
spec_refs:
  - .program/spec/model-gateway.md#req-mg-01
  - .program/spec/model-gateway.md#req-mg-03
acceptance_criteria:
  - .program/interfaces/model-router.md exists and defines the seam — injectable per-task ModelRouter over the Bedrock client (task types judge-draft, judge-gate-vote, arbiter, tutor-rung, generation, playground); provider switch is config not code (REQ-MG-01 scenario 2); sampling params stripped per model tier (no seed; temperature removed on newest tiers); explicit cache_control breakpoints on cacheable prefixes
  - The doc records the quality-first table constraints (REQ-MG-02 — Sonnet-class default for learner-facing incl. gate-ensemble votes, Opus-class for arbiter/deep tutor rungs/generation, Haiku optional knob never default; justification cites calibration battery, never cost)
  - The doc states ModelGateway is a production interface with real and fake implementations satisfying the same compile-time-checked interface, fake runs without AWS_BEARER_TOKEN_BEDROCK (REQ-MG-03)
  - Consumers listed (judge-pipeline, coach-and-hints, content-generation, playground, testing-and-ci) with current-state anchor src/lib/bedrock.ts; implementation ownership stays with ROOT.1.4 — this doc is contract only; steward succession noted (ROOT.1.2 -> ROOT.7.1)
depends_on: []
blocks: []
children: []
file_ownership: [".program/interfaces/model-router.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
resume_hint: "Doc-only leaf. Source: model-gateway.md whole shard. Contract doc, no code. ASSUMPTIONS #12 discharge belongs to ROOT.1.9 (probe) — cite it as pending if its evidence doc is absent, do not re-verify."
verification: []
artifacts: []
---

Contract doc for the ModelRouter/ModelGateway seam ahead of ROOT.1.4's implementation.
Interface doc defines names/shapes/policies; the implementing item may refine internals
but not the published contract without going through the steward.
