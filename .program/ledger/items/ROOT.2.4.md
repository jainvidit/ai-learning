---
id: ROOT.2.4
parent: ROOT.2
type: Task
title: Legacy JSON progress store cutover + archival (PARKED)
ledger_depth: 2
status: blocked
blocked_reason: awaiting_human_authorization
generation: 0
spec_refs:
  - .program/spec/event-log-and-projections.md#req-el-01
  - .program/spec/migration-and-sequencing.md#req-ms-03
acceptance_criteria:
  - Reads cut over from legacy JSON to projections after demonstrated dual-write parity
  - Legacy JSON files moved to an archive location — never deleted (MS-03 scenario 2)
depends_on: [ROOT.2.2]
blocks: []
children: []
file_ownership: ["data/progress/**"]
review: {tier: 3, required_lenses: [data-safety, red-team, rollback-plan], verdicts: []}
verification: []
artifacts: []
resume_hint: "PARKED — moving/retiring real learner data files is a destructive-adjacent operation on data this program did not create (PART 9 Rule 2). Dual-write continues indefinitely; nothing downstream blocks on this."
---
The read-path cutover itself is reversible, but the archival step touches data/**
(standing never-delete flag, files not created by this program). Parked whole per
PART 9 — the "additive-so-safe" reframe is exactly the flagged instinct. Logged in
DECISIONS-PENDING.md.
