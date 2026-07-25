---
id: ROOT.2.1
parent: ROOT.2
type: Contract
title: learning_events store — schema contract, SQLite impl, dual-write
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/event-log-and-projections.md#req-el-01
  - .program/spec/event-log-and-projections.md#req-el-02
acceptance_criteria:
  - Append-only local SQLite learning_events store; no update/delete paths (EL-01 scenarios 1–2)
  - Event types + payload shapes published in .program/interfaces/learning-events.md; additive-only; judge events carry the drift triple (EL-02)
  - Dual-write live behind the existing progress API; reads still legacy-served (EL-01 scenario 4)
  - Migration importer represents existing learner progress in events; data/** untouched (EL-01 scenario 3, REQ-MS-03)
depends_on: []
blocks: [ROOT.2.2, ROOT.2.3]
children: []
file_ownership: ["src/lib/events.ts", "src/lib/progress.ts", "src/app/api/progress/**"]
review: {tier: 2, required_lenses: [spec-conformance, data-safety, consumer-fit], verdicts: []}
verification: []
artifacts: []
resume_hint: "THE root dependency of the program. Contract doc before impl. Never delete data/** — never-delete flag, REQ-MS-03."
---
Atlas owns event types, Ramesh the storage impl (LANE-DEPENDENCIES). SQLite choice
note: REJECTED.md rejected better-sqlite3 for the *old JSON store* on Windows
native-build friction — EL-01 scenario 2 permits "SQLite or equivalent embedded/file"
store; driver selection is this item's first decision, ADR'd if it deviates.
