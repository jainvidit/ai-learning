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
  - Celebration API with a typed event contract fires only on server-confirmed events (FP-04; consumes ROOT.2.2 projections + ROOT.2.3 gate verdicts)
  - A11y audit tooling installed with its command registered via the standing steward; per-surface WCAG 2.2 AA audit leaves run LATE in Phase 3, one per shipped surface (FP-05, sizing #18)
depends_on: [ROOT.7.3.5]
blocks: [ROOT.4.2, ROOT.4.3, ROOT.4.6]
children: []
file_ownership: ["src/components/ui/motion/**", "src/components/ui/celebration/**", "src/lib/motion/**"]
review: {tier: 1, required_lenses: [spec-conformance, a11y], verdicts: []}
resume_hint: "COORDINATOR-owned (sizing #18): three sibling leaves — motion tokens; celebration API; a11y tooling+late audits. Builds on ROOT.1.6's substrate (ui/primitives stay 1.6's; this item owns ui/motion + ui/celebration per sizing #25). Nova owns tokens; Ramesh holds the perf budget."
verification: []
artifacts: []
---
The celebration API must be extensible enough for ROOT.5.2's shelf animation without
a Phase-4 edit to this item's files (coupling #26) — expose a registration surface,
not a closed trigger list.
