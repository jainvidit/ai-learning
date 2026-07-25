---
id: ROOT.1.2
parent: ROOT.1
type: Contract
title: Contracts pack — schema.ts additive extensions + beat model + interface docs
ledger_depth: 2
status: in_progress
owner_agent: coordinator-ROOT.1.2-gen1
generation: 1
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
children: [ROOT.1.2.1, ROOT.1.2.2, ROOT.1.2.3, ROOT.1.2.4, ROOT.1.2.5, ROOT.1.2.6]
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

## Decomposition (gen0, sizing #9)

Six leaves, one owned file each (all globs from my front matter; disjoint, so
1/2/4/5/6 may run concurrently; 3 sequenced after 1 so the seam doc records landed
field names, not planned ones):
- ROOT.1.2.1 — schema.ts additive extension (tier 2, dream-implementer-hardened;
  proven by `npm run validate` + `npx tsc --noEmit`) — criterion 1
- ROOT.1.2.2 — beat-model.md (ADR-0005 closed type set + LX-03/TX-01 portal-slot
  contract) — criterion 2
- ROOT.1.2.3 — content-schema.md seam doc (depends_on 1.2.1) — criterion 3 (part)
- ROOT.1.2.4 — model-router.md seam doc — criterion 3 (part)
- ROOT.1.2.5 — agent-runner.md seam doc, event types DEFERRED to ROOT.2.1 —
  criterion 3 (part)
- ROOT.1.2.6 — regression-floor.md seed (MS-02 rows + MS-03 audit row + ADR-0006
  intended-change note) — criterion 4

Rejected decompositions: (a) single doc leaf for all four seams — fails leaf test
point 6 (spans four shard sections) and serializes reviewable units; (b) putting beat
types into schema.ts — beats are compiler OUTPUT (REQ-CP-02), authored schema is
input; conflating them was ruled out by ADR-0005's beatId-stability reasoning.

## What must survive the transfer to ROOT.7.1 on close

1. Additive-only rule on src/lib/schema.ts and every interface doc; non-additive
   requests rejected pending an ADR (freeze challenge).
2. Field-request protocol: consumer logs `field_request` on its own events file;
   coordinator notifies director; steward batch served under ROOT.7.1.
3. regression-floor.md row IDs are append-only once a Gate cites them; the ADR-0006
   intended-change note must never be dropped (Gates would misread policy as
   regression).
4. agent-runner.md's deferral boundary: TermEvent/session event types belong to
   ROOT.2.1's contract; ROOT.7.1 must not accept them into agent-runner.md.
5. beat-model.md's closed type set is ADR-0005-frozen; `recap` addition path is the
   ADR's documented fallback, additive-only.

## Progress log

- gen0: owner set, status in_progress. Spec shard re-read (content-pipeline REQ-CP-02/03
  cited above); ADR-0005/0006, migration-and-sequencing REQ-MS-02/03, model-gateway,
  execution-layer REQ-EX-04/05, lesson-experience REQ-LX-03, terminal-experience
  REQ-TX-01, boss-and-test-out REQ-BT-02, workshop-and-artifacts REQ-WA-05 read for
  child criteria. Verified `npm run validate` exists (package.json scripts:
  `validate: tsx scripts/validate-content.ts`).
- gen0: children 1-6 created with full front matter; dispatch wave 1 = 1.2.1
  (hardened) + 1.2.2/4/5/6 (standard); 1.2.3 held for 1.2.1.
