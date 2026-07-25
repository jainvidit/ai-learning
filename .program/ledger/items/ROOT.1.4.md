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
  - CI runs npm run validate, npx tsc --noEmit, npm run build, npm test, and npm run verify:e2e (Playwright) on every PR (TC-03 in full, via ROOT.7.2's commands)
  - Each CP-06 content gate (schema conformance, anchor integrity, skill refs, one-boss-per-module, ≥2 variants, rubric-change-requires-golden-update) exists in its stated soft-or-hard state for the current phase, with the staging recorded per gate
  - Paired hard-flip leaves exist for the skill-ref gate (depends_on ROOT.3.1) and variant gate (staging per ROOT.3.4's ADR)
depends_on: [ROOT.1.1, ROOT.7.2]
blocks: []
children: []
file_ownership: [".github/**", "scripts/validate-content.ts"]
review: {tier: 1, required_lenses: [spec-conformance, gate-bypass-hunting], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned (sizing #10): one leaf per gate with explicit soft/hard staging. e2e + test runner come from ROOT.7.2 (never invent commands). The WA-02 mapping-rule validation gate (from ROOT.5.1) is also a leaf here."
---
validate-content.ts survives and grows (CURRENT-STATE). Gates whose subject matter
doesn't exist yet ship SOFT (warn) with a named paired leaf that flips them hard when
the subject lands — "all gates green" at ROOT.5.6 means green-in-hard-state (sizing
#10's vacuous-gate trap).
