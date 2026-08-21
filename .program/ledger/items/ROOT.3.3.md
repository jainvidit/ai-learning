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
  - Reviews serve banked variants/micro-probes via ROOT.3.4's published bank format, deliberate canonical fallback (SR-03)
  - Queue-shaping engine outputs for SR-04 — visible-queue cap value, silent rescheduling of the remainder (display + copy are ROOT.4.2's leaf)
depends_on: [ROOT.3.2, ROOT.3.4]
blocks: []
children: []
file_ownership: ["packages/learning-engine/src/scheduler/**", "src/lib/projections/reviewQueue.ts"]
review: {tier: 1, required_lenses: [spec-conformance, copy-audit], verdicts: []}
verification: []
artifacts: []
resume_hint: "Grade mapping consumes ROOT.3.2's firewall; variant lookup consumes ROOT.3.4's bank format (edge added per coupling #10 — never invent your own bank shape). Owns projections/reviewQueue.ts. Warm-up UI + copy land in Phase 3 (ROOT.4.2); this item ships engine + queue outputs only (sizing #16)."
---
The Scheduler interface (SR-01) is the contract ROOT.3.2 consumes for stability
reads/resets — publish it via a field request to the standing steward before
implementation.
