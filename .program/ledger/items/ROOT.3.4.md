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
  - Offline-only generation pipeline (generator → schema validation → blind solver → discrimination check → quality judge → pending queue) built; no item enters the served bank without a recorded approval record — generated items accumulate in the pending-review queue (CG-01, binary form per sizing #17)
  - Zero generated fixtures/verifiers — 100% authored (CG-02)
  - Template slots + invariants; deliberate fallback to canonical when no variant exists; the bank format is published as an interface before ROOT.3.3 consumes it (CG-03)
depends_on: [ROOT.3.1]
blocks: []
children: []
file_ownership: ["scripts/generate-variants*", "content/variants/**"]
review: {tier: 1, required_lenses: [spec-conformance, generation-integrity], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned (sizing #17): leaves per pipeline stage. Owner-review request is the PARK (DECISIONS-PENDING), not an acceptance criterion. Publish the bank format first — ROOT.3.3 depends on this item for it (coupling #10)."
---
The ≥2-variant CI gate (CP-06) cannot hard-fail until the owner reviews the first
bank — the gate's soft/hard staging ADR feeds ROOT.1.4's paired leaf.
