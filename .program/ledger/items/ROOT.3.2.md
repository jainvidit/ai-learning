---
id: ROOT.3.2
parent: ROOT.3
type: Capability
title: Mastery model — discrete states, firewall, module states, adaptive selection
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/mastery-model.md#req-mm-02
  - .program/spec/mastery-model.md#req-mm-03
  - .program/spec/mastery-model.md#req-mm-04
  - .program/spec/mastery-model.md#req-mm-05
  - .program/spec/mastery-model.md#req-mm-06
acceptance_criteria:
  - Introduced→Practiced→Fluent with evidence-counted promotion; never demote (MM-02 scenarios 1–7)
  - Judge-noise firewall — <0.4 Again, >0.7 Good, 0.4–0.7 scheduler-only; never Easy from judge, never Hard from anything (MM-03)
  - Module states with Mastered = MIN over skills + boss (MM-04)
  - Adaptive selection — ~80% target, step-down + prerequisite probe, struggle-halt, 0.25× propagation; never live rewriting (MM-05)
depends_on: [ROOT.3.1]
blocks: []
children: []
file_ownership: ["packages/learning-engine/src/mastery/**", "src/lib/projections/skillState.ts"]
review: {tier: 2, required_lenses: [spec-conformance, pedagogy-invariants, two-key-firewall], verdicts: []}
verification: []
artifacts: []
resume_hint: "Owns src/lib/projections/skillState.ts outright (one projection, one place, one owner — ADR-0007 item 6). EMA is internal-only — learner-facing continuous mastery is REJECTED (freeze-challenge to reopen). MM-06 (no points/XP fields) moved to the regression-floor checklist as a grep-able Gate row (sizing #30)."
---
BIDIRECTIONAL COUPLING with ROOT.3.3 (sizing #11 of coupling review): MM-02's
Fluent gate reads FSRS stability and failure-resets write scheduler state. The
Scheduler interface (REQ-SR-01) is the contract boundary: this item consumes it,
never implements card storage. The two items' coordinators agree the interface doc
before either implements — factual disputes go to a verifier. Module-state gating
(MM-04) LAYERS ON content.ts's surviving isModuleUnlocked — extend, do not fork, the
gating logic (coupling #24 dual-implementation trap).
