---
id: ROOT.3.6
parent: ROOT.3
type: Gate
title: Phase 2 Gate — regression floor + engine invariants
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-02
acceptance_criteria:
  - Every row of .program/interfaces/regression-floor.md exercised with per-row evidence in .program/audits/ (a single FAIL fails the gate)
  - Engine invariant spot-checks — never-demote, no learner-facing percent, no timing in grades, firewall band emits zero evidence, no points/XP/leaderboard fields in any schema (MM-06)
  - The MS-03 never-delete audit row passes
  - npm run build, npx tsc --noEmit, npm run lint, npm test pass
depends_on: [ROOT.3.1, ROOT.3.2, ROOT.3.3, ROOT.3.4, ROOT.3.5]
blocks: []
children: []
file_ownership: [".program/audits/gate-phase2-*"]
review: {tier: 1, required_lenses: [checklist-completeness, evidence-authenticity], verdicts: []}
verification: []
artifacts: []
resume_hint: "Runs last in Phase 2."
---
