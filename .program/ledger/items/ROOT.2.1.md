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
  - Event types + payload shapes published in .program/interfaces/learning-events.md; additive-only; judge events carry the drift triple (EL-02); INCLUDES the session event-log/TermEvent types that .program/interfaces/agent-runner.md (ROOT.1.2.5) explicitly defers to this item — define them here or record a further deferral target in agent-runner.md via the ROOT.7.1 steward, never leave the deferral dangling
  - Dual-write live behind the existing progress API; reads still legacy-served (EL-01 scenario 4)
  - Migration importer represents existing learner progress in events; data/** untouched (EL-01 scenario 3, REQ-MS-03)
  - Progress GET/PUT re-backed by projections behind the existing API shape, after ROOT.2.2's projections exist (moved from ROOT.2.2 — this item owns the route)
  - Read cutover from legacy JSON to projections, gated on demonstrated dual-write parity evidence (reversible half of former ROOT.2.4; archival stays parked there)
depends_on: []
blocks: [ROOT.2.2, ROOT.2.3]
children: []
file_ownership: ["src/lib/events.ts", "src/lib/progress.ts", "src/app/api/progress/**", ".program/interfaces/learning-events.md"]
review: {tier: 2, required_lenses: [spec-conformance, data-safety, consumer-fit], verdicts: []}
verification: []
artifacts: []
resume_hint: "THE root dependency. Leaf order (sizing #13): driver-selection ADR → contract doc → store impl → dual-write → importer (last, reads real data/**) → GET/PUT re-backing → read cutover (parity-gated). Never delete data/**."
---
Atlas owns event types, Ramesh the storage impl (LANE-DEPENDENCIES). SQLite choice
note: REJECTED.md rejected better-sqlite3 for the *old JSON store* on Windows
native-build friction — EL-01 scenario 2 permits "SQLite or equivalent embedded/file"
store; driver selection is this item's FIRST leaf, an ADR. The learning-events
interface doc is in this item's ownership (coupling #7). Profile deletion semantics
over an append-only log (completeness #6, PI-01 s3) must be ADR'd here before the store
API freezes — deletion of a profile's projections vs event tombstones is a contract
decision.
