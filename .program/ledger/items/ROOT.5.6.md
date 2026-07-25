---
id: ROOT.5.6
parent: ROOT.5
type: Gate
title: Phase 4 Gate — regression floor + full-curriculum content gates
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-02
  - .program/spec/content-pipeline.md#req-cp-06
acceptance_criteria:
  - Every row of .program/interfaces/regression-floor.md passing, per-row evidence in .program/audits/ (a single FAIL fails the gate)
  - All content CI gates green IN HARD STATE across 14 modules (one boss each, skill refs, anchors; variant gate per its recorded staging ADR) — soft/warn gates do not count as green
  - The MS-03 never-delete audit row passes (incl. Workshop dirs, which exist by now)
  - npm run build, npx tsc --noEmit, npm run lint, npm test, npm run verify:e2e pass
depends_on: [ROOT.5.1, ROOT.5.2, ROOT.5.3, ROOT.5.4, ROOT.5.5]
blocks: []
children: []
file_ownership: [".program/audits/gate-phase4-*"]
review: {tier: 1, required_lenses: [checklist-completeness, evidence-authenticity], verdicts: []}
verification: []
artifacts: []
resume_hint: "Final gate before PROGRAM_COMPLETE (ROOT.6 stays parked)."
---
