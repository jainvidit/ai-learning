---
id: ROOT.1.4
parent: ROOT.1
type: Capability
title: CI pipeline + content gates
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/testing-and-ci.md#req-tc-03
  - .program/spec/content-pipeline.md#req-cp-06
acceptance_criteria:
  - CI runs npm run validate, npx tsc --noEmit, npm run build on every PR (TC-03)
  - Content gates enforce schema conformance, anchor integrity, skill refs, one-boss-per-module, ≥2 variants, rubric-change-requires-golden-update (CP-06 scenarios 1–5)
depends_on: [ROOT.1.1]
blocks: []
children: []
file_ownership: [".github/**", "scripts/validate-content.ts"]
review: {tier: 1, required_lenses: [spec-conformance, gate-bypass-hunting], verdicts: []}
verification: []
artifacts: []
resume_hint: "validate-content.ts survives and grows (CURRENT-STATE); gates that depend on skill registry content activate fully in Phase 2."
---
