---
id: ROOT.5.3
parent: ROOT.5
type: Capability
title: Boss challenges & test-out
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/boss-and-test-out.md#req-bt-01
  - .program/spec/boss-and-test-out.md#req-bt-02
acceptance_criteria:
  - One boss per module gates Mastered, never Complete (BT-01)
  - "Prove it" test-out treats testing out exactly like completing — FSRS seeded as-if-reviewed, no stigma (BT-02)
depends_on: []
blocks: [ROOT.5.4]
children: []
file_ownership: ["packages/learning-engine/src/boss/**", "src/components/lesson/Boss*"]
review: {tier: 1, required_lenses: [spec-conformance, mastery-accounting], verdicts: []}
verification: []
artifacts: []
resume_hint: "Runs FIRST in Phase 4 (coupling #12): its boss/test-out declaration shapes feed ROOT.5.4's template sections, which feed ROOT.5.5's 13 modules — a mismatch discovered after authoring costs 13 parallel content repairs. Mechanics consume ROOT.3.2 (Mastered gating) and ROOT.2.3 (gate verdicts). Boss content itself is authored in ROOT.5.5. Schema fields for probe declarations exist from ROOT.1.2; gaps go to ROOT.7.1."
---
