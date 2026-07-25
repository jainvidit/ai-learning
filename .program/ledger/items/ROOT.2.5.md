---
id: ROOT.2.5
parent: ROOT.2
type: Gate
title: Phase 1 Gate — regression floor + dual-write parity evidence
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-02
  - .program/spec/event-log-and-projections.md#req-el-01
acceptance_criteria:
  - Every REQ-MS-02 baseline behavior exercised and passing, evidence in .program/audits/
  - Dual-write parity demonstrated — legacy store and projections agree on a real profile's progress
  - npm run build, npx tsc --noEmit, npm run lint pass
depends_on: [ROOT.2.1, ROOT.2.2, ROOT.2.3]
blocks: []
children: []
file_ownership: [".program/audits/gate-phase1-*"]
review: {tier: 1, required_lenses: [checklist-completeness, evidence-authenticity], verdicts: []}
verification: []
artifacts: []
resume_hint: "ROOT.2.4 is parked and does NOT gate this — dual-write is the accepted end-state until the owner authorizes cutover."
---
