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
blocks: []
children: []
file_ownership: ["packages/learning-engine/src/boss/**", "src/components/lesson/Boss*"]
review: {tier: 1, required_lenses: [spec-conformance, mastery-accounting], verdicts: []}
verification: []
artifacts: []
resume_hint: "Mechanics consume ROOT.3.2 (Mastered gating) and ROOT.2.3 (gate verdicts). Boss content itself is authored in ROOT.5.5."
---
