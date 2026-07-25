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
  - Every REQ-MS-02 baseline behavior passing, evidence in .program/audits/
  - All content CI gates green across 14 modules (one boss each, skill refs, anchors, variants)
  - npm run build, npx tsc --noEmit, npm run lint pass
depends_on: [ROOT.5.1, ROOT.5.2, ROOT.5.3, ROOT.5.4, ROOT.5.5]
blocks: []
children: []
file_ownership: [".program/audits/gate-phase4-*"]
review: {tier: 1, required_lenses: [checklist-completeness, evidence-authenticity], verdicts: []}
verification: []
artifacts: []
resume_hint: "Final gate before PROGRAM_COMPLETE (ROOT.6 stays parked)."
---
