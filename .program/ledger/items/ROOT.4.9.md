---
id: ROOT.4.9
parent: ROOT.4
type: Gate
title: Phase 3 Gate — regression floor + REPLACED-component retirement checks
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-02
acceptance_criteria:
  - Every REQ-MS-02 baseline behavior exercised and passing on a non-3000 port, evidence in .program/audits/
  - Every REPLACED predecessor (dashboard, sidebar, lesson page, LessonRenderer) retired only after its replacement passed the floor
  - Owner UI [HARD]s 26–29 re-verified in the new surfaces
  - npm run build, npx tsc --noEmit, npm run lint pass
depends_on: [ROOT.4.1, ROOT.4.2, ROOT.4.3, ROOT.4.4, ROOT.4.5, ROOT.4.6, ROOT.4.7, ROOT.4.8]
blocks: []
children: []
file_ownership: [".program/audits/gate-phase3-*"]
review: {tier: 1, required_lenses: [checklist-completeness, evidence-authenticity], verdicts: []}
verification: []
artifacts: []
resume_hint: "The riskiest gate — most REPLACED components land this phase."
---
