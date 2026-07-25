---
id: ROOT.3.4
parent: ROOT.3
type: Capability
title: Content generation — variant bank pipeline with gauntlet + human-review queue
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/content-generation.md#req-cg-01
  - .program/spec/content-generation.md#req-cg-02
  - .program/spec/content-generation.md#req-cg-03
acceptance_criteria:
  - Offline-only generation with validation gauntlet; nothing publishes without human review (CG-01)
  - Zero generated fixtures/verifiers — 100% authored (CG-02)
  - Template slots + invariants; deliberate fallback to canonical when no variant exists (CG-03)
depends_on: [ROOT.3.1]
blocks: []
children: []
file_ownership: ["scripts/generate-variants*", "content/variants/**"]
review: {tier: 1, required_lenses: [spec-conformance, generation-integrity], verdicts: []}
verification: []
artifacts: []
resume_hint: "Human review has no human in this loop: generated variants accumulate in a pending-review queue; SR-03's canonical fallback covers the gap. Owner review request logged in DECISIONS-PENDING."
---
The ≥2-variant CI gate (CP-06) cannot hard-fail until the owner reviews the first
bank — the phase coordinator ADRs the gate's soft/hard staging.
