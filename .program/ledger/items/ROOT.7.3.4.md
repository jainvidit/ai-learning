---
id: ROOT.7.3.4
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-CH-01 s1 "any tutor invocation" — invocation-context domain (ADR-0022)
ledger_depth: 3
status: proposed
generation: 0
spec_refs:
  - .program/spec/coach-and-hints.md#req-ch-01
acceptance_criteria:
  - ADR-0022 ratified — the contexts/rungs/subjects that invoke the tutor enumerated closed-world with the isolation guarantee testable per context; additive relaxation path
  - coach-and-hints.md amended additively so s1 quantifies over the enumerated contexts
  - Data-plane isolation and leak-check obligations restated per enumerated context (no context exempt)
depends_on: []
blocks: [ROOT.3.5]
children: []
file_ownership: [".program/decisions/ADR-0022.md", ".program/spec/coach-and-hints.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification: []
artifacts: []
resume_hint: "Scheduled by ADR-0018. Must be done before ROOT.3.5 dispatches (Phase 2). Pattern: ADR-0017. Survey row: coach-and-hints REQ-CH-01 s1."
---
