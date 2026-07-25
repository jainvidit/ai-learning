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
  - Every row of .program/interfaces/regression-floor.md exercised on a non-3000 port with per-row evidence in .program/audits/ (a single FAIL fails the gate)
  - Every REPLACED predecessor's retirement leaf (in ROOT.4.2/4.3) cites gate evidence — this gate VERIFIES citations, never performs retirement (sizing #6)
  - Owner UI [HARD] 26 (active profile), 27 (theme switcher), 28 (independent nav scroll), 29 (per-question quiz cards) re-verified as four separate checklist rows
  - The a11y audit rows (per surface, from ROOT.4.1's late leaves) and the MS-03 never-delete row pass
  - npm run build, npx tsc --noEmit, npm run lint, npm test, npm run verify:e2e pass
depends_on: [ROOT.4.1, ROOT.4.2, ROOT.4.3, ROOT.4.4, ROOT.4.5, ROOT.4.6, ROOT.4.7, ROOT.4.8, ROOT.4.10]
blocks: []
children: []
file_ownership: [".program/audits/gate-phase3-*"]
review: {tier: 1, required_lenses: [checklist-completeness, evidence-authenticity], verdicts: []}
verification: []
artifacts: []
resume_hint: "The riskiest gate — most REPLACED components land this phase."
---
