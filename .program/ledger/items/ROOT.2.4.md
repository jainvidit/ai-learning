---
id: ROOT.2.4
parent: ROOT.2
type: Task
title: Legacy JSON progress archival (PARKED)
ledger_depth: 2
status: blocked
blocked_reason: awaiting_human_authorization
generation: 0
spec_refs:
  - .program/spec/event-log-and-projections.md#req-el-01
  - .program/spec/migration-and-sequencing.md#req-ms-03
acceptance_criteria:
  - Legacy JSON files moved to an archive location — never deleted (MS-03 scenario 2)
depends_on: [ROOT.2.1]
blocks: []
children: []
file_ownership: ["data/progress/**"]
review: {tier: 3, required_lenses: [data-safety, red-team, rollback-plan], verdicts: []}
verification: []
artifacts: []
resume_hint: "PARKED — moving real learner data files is destructive-adjacent on data this program did not create (PART 9 Rule 2). The reversible read-cutover half moved to ROOT.2.1 (sizing #8); this item is archival only. Nothing downstream blocks on it."
---
Archival touches data/** (standing never-delete flag, files not created by this
program). Parked per PART 9 — the "additive-so-safe" reframe is exactly the flagged
instinct. Logged in DECISIONS-PENDING.md.
