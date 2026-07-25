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
  - schema.ts extended additively — skillIds, tiers, boss flag, hint rungs, misconception tags, artifact/verifier declarations, requires-preconditions (WA-05 s4), test-out probe declarations (BT-02/CC-04); Module 1 validates unchanged via npm run validate (CP-03 scenario 1)
  - Beat model type (beatId, closed type set per ADR-0005, persistent, completion) published in .program/interfaces/beat-model.md, including the LX-03/TX-01 persistent-beat portal-slot contract
  - Interface docs written for the enumerated Phase-0 seams — beat-model, content-schema, model-router, agent-runner (event types deferred to ROOT.2.1)
  - .program/interfaces/regression-floor.md seeded — the REQ-MS-02 checklist as one row per behavior, plus the MS-03 never-delete audit row and the ADR-0006 intended-change note
depends_on: []
blocks: [ROOT.1.1, ROOT.1.3]
children: []
file_ownership: ["src/lib/schema.ts", ".program/interfaces/beat-model.md", ".program/interfaces/content-schema.md", ".program/interfaces/model-router.md", ".program/interfaces/agent-runner.md", ".program/interfaces/regression-floor.md"]
review: {tier: 2, required_lenses: [spec-conformance, consumer-fit], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned (sizing #9): leaves = schema extension (validate-provable), beat-model doc, one leaf per named seam doc, regression-floor seed. First dispatch of Phase 0 alongside ROOT.1.7/1.9."
---
The schema steward item. Consumers request fields through this item while it is open;
when it closes, stewardship of schema.ts and the interface docs TRANSFERS to ROOT.7.1
(standing steward, ADR-0007) — the "nobody else edits it" rule holds for the whole
program via that succession, closing the dead-steward hole all three genesis lenses
found. Ownership globs are named files, not the whole interfaces/ dir (coupling #7).
