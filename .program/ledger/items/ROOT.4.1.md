---
id: ROOT.4.1
parent: ROOT.4
type: Capability
title: Frontend platform completion — motion tokens, celebration API, a11y bar
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/frontend-platform.md#req-fp-04
  - .program/spec/frontend-platform.md#req-fp-05
acceptance_criteria:
  - Motion 12 tokens + native View Transitions with feature detection; never both on one element (FP-04)
  - Celebration API fires only on server-confirmed events (FP-04; LANE-DEPENDENCIES block 5)
  - WCAG 2.2 AA bar established with audit tooling (FP-05)
depends_on: []
blocks: [ROOT.4.2, ROOT.4.3]
children: []
file_ownership: ["src/components/ui/**", "src/lib/motion/**"]
review: {tier: 1, required_lenses: [spec-conformance, a11y], verdicts: []}
resume_hint: "Builds on ROOT.1.6's substrate. Nova owns tokens; Ramesh holds the perf budget."
verification: []
artifacts: []
---
