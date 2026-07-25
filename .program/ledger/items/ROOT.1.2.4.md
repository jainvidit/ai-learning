---
id: ROOT.1.2.4
parent: ROOT.1.2
type: Task
title: model-router.md interface doc — ModelRouter/ModelGateway seam contract
ledger_depth: 3
status: changes_requested
owner_agent: null # gen0 dead; takeover logged by coordinator-ROOT.1.2-gen1 — "complete" invalid vocab; secondary request_changes on record; ADR-0010 requestStructured(schema) missing from doc (gen1 direct read) = fail regardless of verdicts
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
verification:
  - criterion: ".program/interfaces/model-router.md exists and defines the seam — injectable per-task ModelRouter over the Bedrock client (task types judge-draft, judge-gate-vote, arbiter, tutor-rung, generation, playground); provider switch is config not code (REQ-MG-01 scenario 2); sampling params stripped per model tier (no seed; temperature removed on newest tiers); explicit cache_control breakpoints on cacheable prefixes"
    verdict: PASS
    evidence: "C:\\Users\\jainv\\workplace\\ai-learning-app\\.program\\interfaces\\model-router.md sections: Purpose, Task Types (6 types listed), Sampling Parameter Stripping (no seed, temp removed on newest tiers), Cache Control Breakpoints (explicit marking), Provider Switch Scenario (config not code)"
    method: doc-leaf-section-mapping
  - criterion: "The doc records the quality-first table constraints (REQ-MG-02 — Sonnet-class default for learner-facing incl. gate-ensemble votes, Opus-class for arbiter/deep tutor rungs/generation, Haiku optional knob never default; justification cites calibration battery, never cost)"
    verdict: PASS
    evidence: "C:\\Users\\jainv\\workplace\\ai-learning-app\\.program\\interfaces\\model-router.md section: Quality-First Model Table (REQ-MG-02) — 7-row table with Sonnet for judge-draft/judge-gate-vote/playground default, Opus for arbiter/deep-tutor/generation, Haiku demoted to optional knob; constraint notes calibration battery justifies changes not cost"
    method: doc-leaf-section-mapping
  - criterion: "The doc states ModelGateway is a production interface with real and fake implementations satisfying the same compile-time-checked interface, fake runs without AWS_BEARER_TOKEN_BEDROCK (REQ-MG-03)"
    verdict: PASS
    evidence: "C:\\Users\\jainv\\workplace\\ai-learning-app\\.program\\interfaces\\model-router.md section: ModelGateway Production Seam (REQ-MG-03) — explicitly states 'production interface (not a test-only mock)', lists Real Implementation (requires AWS token) and Fake Implementation (no AWS_BEARER_TOKEN_BEDROCK required), compile-time interface check noted"
    method: doc-leaf-section-mapping
  - criterion: "Consumers listed (judge-pipeline, coach-and-hints, content-generation, playground, testing-and-ci) with current-state anchor src/lib/bedrock.ts; implementation ownership stays with ROOT.1.4 — this doc is contract only; steward succession noted (ROOT.1.2 -> ROOT.7.1)"
    verdict: PASS
    evidence: "C:\\Users\\jainv\\workplace\\ai-learning-app\\.program\\interfaces\\model-router.md sections: header (current state anchor src/lib/bedrock.ts), Consumers (5 items listed), Implementation Ownership (ROOT.1.4 owns code, ROOT.1.2.4 is contract only), header and Implementation Ownership (steward succession ROOT.1.2 → ROOT.7.1)"
    method: doc-leaf-section-mapping
artifacts: [".program/interfaces/model-router.md"]
---

Contract doc for the ModelRouter/ModelGateway seam ahead of ROOT.1.4's implementation.
Interface doc defines names/shapes/policies; the implementing item may refine internals
but not the published contract without going through the steward.
