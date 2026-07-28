---
id: ROOT.7.3.3
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-MM-05 s4 "any struggling learner" — struggle-signal domain (ADR-0021)
ledger_depth: 3
status: proposed
generation: 0
spec_refs:
  - .program/spec/mastery-model.md#req-mm-05
acceptance_criteria:
  - ADR-0021 ratified — the struggle patterns/thresholds that trigger adaptivity enumerated closed-world with per-trigger testable behaviour; additive relaxation path
  - mastery-model.md amended additively so s4 quantifies over the enumerated triggers
  - Consistency with REJECTED.md recorded (EMA learner-facing mastery, timing-based grading remain rejected — no trigger may reintroduce them)
depends_on: []
blocks: [ROOT.3.2]
children: []
file_ownership: [".program/decisions/ADR-0021.md", ".program/spec/mastery-model.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification: []
artifacts: []
resume_hint: "Scheduled by ADR-0018. Must be done before ROOT.3.2 dispatches (early Phase 2). Pattern: ADR-0017. Survey row: mastery-model REQ-MM-05 s4."
---
