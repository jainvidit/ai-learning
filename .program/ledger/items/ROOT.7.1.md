---
id: ROOT.7.1
parent: ROOT.7
type: Contract
title: Standing contract steward — schema.ts, interfaces, package.json (post-Phase-0)
ledger_depth: 2
status: in_progress
owner_agent: director-gen15 (standing item; scheduling container — batches served by fresh dream-implementer-hardened per request)
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-03
  - .program/spec/event-log-and-projections.md#req-el-02
acceptance_criteria:
  - Every post-Phase-0 field request against schema.ts is resolved by this item (additive change + validate evidence) or rejected with a logged reason — no other item edits the file
  - Every interface doc change after its founding item closes goes through this item, additive-only, consumers notified via their parents' views
  - Every post-Phase-0 dependency addition to package.json lands through this item, serialized
  - The regression-floor checklist (.program/interfaces/regression-floor.md) is maintained here after ROOT.1.2 seeds it; ADR-0006's intended quiz-policy change recorded so Gates read it as intended, not regression
depends_on: [ROOT.1.2]
blocks: []
children: []
file_ownership: ["eslint.config.mjs", "src/lib/schema.ts", ".program/interfaces/**", "package.json", "package-lock.json"]
review: {tier: 2, required_lenses: [consumer-fit, additivity], verdicts: []}
verification: []
artifacts: []
resume_hint: "Activates when ROOT.1.2 closes (its globs transfer here — no concurrent overlap by construction). Long-lived: served by a fresh dream-implementer-hardened per request batch, item stays open across generations. Closes only when ROOT.5 closes."
---

# Standing steward

The exception to one-agent-one-item dies-at-terminal: the ITEM persists; each request
batch is served by a fresh agent that reads this file, acts, writes verification, and
returns. Request protocol: a consumer item logs a `field_request` event on ITS OWN
events file and its coordinator notifies the director, who dispatches a steward batch
here. Requests changing an existing field's meaning (non-additive) are rejected —
that is a freeze-challenge requiring an ADR.

## Steward-note backlog (received at ROOT.1.2 stewardship transfer, 2026-07-25)

Inherited from ROOT.1.2 closure (full citations in events/ROOT.1.2.jsonl 13:52:00–13:55:00Z):
1. RF-02 re-anchor duty: regression-floor.md RF-02 cites sanitizeQuiz in
   src/components/lesson/LessonRenderer.tsx, which REQ-CP-01 replaces (BeatRenderer,
   Phase 3). Re-anchor the row RF-11-style when ROOT.4.2 lands; the behavior, not the
   file:line, is the guarantee.
2. Session-end marker: ADR-0005 authored-convention marker has no schema carrier by
   design; if an additive schema field is ever requested, it goes through the
   field-request protocol (assembly arbitration 13:52:30Z overruled it as a blocker).
3. model-router.md: add one-line disclosure that keeping ASSUMPTIONS #12 sampling/cache
   clauses live is a per-clause reading of ADR-0010's whole-assumption retirement.
4. beat-model.md:243 gloss of ROOT.2.1 should be scoped to learning_events/beat
   telemetry (TermEvent families are distinct; agent-runner.md:163-169 is the
   authoritative deferral table).
5. Reviewer minors parked from 1.2.2/1.2.4 review rounds (see events verdict lines):
   playground attempted-vs-scored reconciliation note; BeatType/exercise-type homonym
   mapping note.

## Batch log — steward-batch-1 (2026-07-25, dream-implementer-hardened, worktree agent-aba62312f179e2f56)

**Batch plan (3 lines, tier-2 pre-implementation requirement):**

1. **Contracts touched.** `.program/interfaces/regression-floor.md` (locator text only, no
   row IDs), `.program/interfaces/beat-model.md` (additive clarification note),
   `.program/interfaces/model-router.md` (additive disclosure line), `eslint.config.mjs`
   (additive ignore entry). Requests served: field_request 15:30:00 (prop-shape),
   field_request 15:30:00 (lint), field_request 17:40:03 (beat-model interpretation),
   steward-note backlog 3 + 4.
2. **Who owns the other side.** regression-floor rows are consumed by Gates ROOT.1.8 /
   ROOT.2.5 / ROOT.3.6 / ROOT.4.9 / ROOT.5.6 (no Gate has run, so no row is frozen yet);
   beat-model's producer is ROOT.1.1 (`src/lib/beats.ts`), consumers ROOT.1.3 / ROOT.4.2 /
   ROOT.4.6 / ROOT.4.3; model-router is consumed by ROOT.1.4 (implementation) and ROOT.1.5
   (seam + the open empirical obligations named in the doc); `eslint.config.mjs` is claimed
   by **no** item's `file_ownership` (grep of `.program/ledger/items` for "eslint" returns
   ROOT.1.1.1, ROOT.1.1.2, ROOT.1.2.1, ROOT.1.2, ROOT.7.2 — all prose flagging the gap;
   ROOT.1.1.1 explicitly refers it to "whoever owns eslint.config.mjs — NOT this item").
3. **What I will NOT change.** No RF row ID, no row deleted/renumbered/retired; no `Beat`
   field, no `BeatType` member, no predicate x type row, no `PERSISTENT_BEAT_TYPES` runtime
   entry in `src/lib/beats.ts`; no `src/lib/schema.ts`; no `package.json` /
   `package-lock.json`; no existing eslint rule, plugin, or ignore entry; no git operation.
