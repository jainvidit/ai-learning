---
id: ROOT.1.8
parent: ROOT.1
type: Gate
title: Phase 0 Gate — regression floor + verification commands
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-02
acceptance_criteria:
  - Every row of .program/interfaces/regression-floor.md exercised on a non-3000 port with per-row pass/fail/UNVERIFIED evidence in .program/audits/ (a single FAIL fails the gate)
  - The MS-03 never-delete audit row passes — no code path introduced this phase deletes data/** or Workshop dirs; docs/origin/ untouched; no openspec/ or project .claude/ recreated
  - npm run build, npx tsc --noEmit, npm run lint, npm test all pass
depends_on: [ROOT.1.1, ROOT.1.2, ROOT.1.3, ROOT.1.4, ROOT.1.5, ROOT.1.6, ROOT.1.7, ROOT.1.9, ROOT.1.10, ROOT.7.3.10]
blocks: []
children: []
file_ownership: [".program/audits/gate-phase0-*"]
review: {tier: 1, required_lenses: [checklist-completeness, evidence-authenticity], verdicts: []}
verification: []
artifacts: []
resume_hint: "Runs last in Phase 0. A failing baseline behavior halts the phase (REQ-MS-02 scenario 1) — fix forward before ROOT.2 dispatches."
---
