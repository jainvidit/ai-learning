---
id: ROOT.3.3
parent: ROOT.3
type: Capability
title: Spaced review — FSRS-6, grade collapse, isomorph serving, warm-up UX
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/spaced-review.md#req-sr-01
  - .program/spec/spaced-review.md#req-sr-02
  - .program/spec/spaced-review.md#req-sr-03
  - .program/spec/spaced-review.md#req-sr-04
acceptance_criteria:
  - ts-fsrs pinned major, one card per skill, frozen default weights, ±10% fuzz, 21-day lapse amnesty, Scheduler interface (SR-01)
  - Grade collapse per source; no timing influence anywhere (SR-02)
  - Reviews serve banked variants/micro-probes, deliberate canonical fallback (SR-03)
  - Due cap "9+", ~5-min warm-up, no debt/overdue framing (SR-04)
depends_on: [ROOT.3.2]
blocks: []
children: []
file_ownership: ["packages/learning-engine/src/scheduler/**"]
review: {tier: 1, required_lenses: [spec-conformance, copy-audit], verdicts: []}
verification: []
artifacts: []
resume_hint: "Grade mapping consumes ROOT.3.2's firewall. Warm-up UI beat lands in Phase 3 (lesson-experience REQ-LX-04); this item ships the engine + queue."
---
