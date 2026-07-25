---
id: ROOT.1.2
parent: ROOT.1
type: Contract
title: Contracts pack — schema.ts additive extensions + beat model + interface docs
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-03
  - .program/spec/content-pipeline.md#req-cp-02
acceptance_criteria:
  - schema.ts extended additively — skillIds, tiers, boss flag, hint rungs, misconception tags, artifact/verifier declarations; Module 1 validates unchanged (CP-03 scenario 1)
  - Beat model type (beatId, closed type set per ADR-0005, persistent, completion) published in .program/interfaces/beat-model.md
  - Interface docs written for every LANE-DEPENDENCIES seam this phase touches (event types deferred to ROOT.2.1)
depends_on: []
blocks: [ROOT.1.1, ROOT.1.3]
children: []
file_ownership: ["src/lib/schema.ts", ".program/interfaces/**"]
review: {tier: 2, required_lenses: [spec-conformance, consumer-fit], verdicts: []}
verification: []
artifacts: []
resume_hint: "First dispatch of Phase 0 alongside ROOT.1.7. Single steward (Atlas role) — schema.ts has exactly one writer."
---
The schema steward item. Consumers (Sage fields, Nova rendering, content agents)
request fields through this item; nobody else edits schema.ts — ever
(LANE-DEPENDENCIES "Content schema" row).
