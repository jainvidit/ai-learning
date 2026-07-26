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
depends_on: [ROOT.1.2, ROOT.1.8]
blocks: []
children: []
file_ownership: ["eslint.config.mjs", ".program/interfaces/**"]
file_ownership_deferred: ["src/lib/schema.ts", "package.json", "package-lock.json"]
file_ownership_note: "Narrowed 2026-07-26 (ADR-0016). ADR-0007 #1 assigned this item schema.ts/package.json/interfaces 'when ROOT.1.2/Phase 0 close', but depends_on encoded only [ROOT.1.2] — so the item activated at ROOT.1.2 closure while Phase 0 was still open, holding package.json and src/lib/schema.ts concurrently with ROOT.1, ROOT.1.1 and ROOT.1.1.4. The three paths above move from file_ownership to file_ownership_deferred and transfer to this item when ROOT.1.8 (Phase 0 Gate) closes; depends_on now encodes that boundary. Until then the Phase-0 chain owns them, serialized by its own depends_on edges. Never exercised: the steward wrote no source file (batch-end 2026-07-25T19:08:00Z verified schema.ts/package.json/package-lock.json mtimes unchanged)."
review: {tier: 2, required_lenses: [consumer-fit, additivity], verdicts: []}
verification:
  - {batch: 2, criterion: "AC2 — interface-doc change is additive, consumers notified via parents' views", check: "beat-model.md persistent ruling ratified NARROW; heading list identical pre/post edit (22 headings, same content and order, only line numbers shifted; see correction event 19:12:00Z), all 6 predicate x type rows intact, no field/default/value-meaning change, LF endings preserved", evidence: ".program/ledger/events/ROOT.7.1.jsonl 2026-07-25T18:52:00Z"}
  - {batch: 2, criterion: "AC2 — additive, grounded in a cited shard/ADR section (backlog 3)", check: "model-router.md ASSUMPTIONS #12 per-clause disclosure re-grounded at source: ASSUMPTIONS.md line 25 bundles 4 clauses; ADR-0010 line 39 retires at whole-assumption granularity; evidence file scoped to structured outputs only. 21 headings intact, 317 CRLF preserved", evidence: ".program/ledger/events/ROOT.7.1.jsonl 2026-07-25T18:58:00Z"}
  - {batch: 2, criterion: "AC2 — additive, grounded in a cited shard section (backlog 4)", check: "beat-model.md Out-of-Scope TermEvent scoping note re-grounded: REQ-EL-01..04 verified at lines 11/24/36/48, TermEvent grep count 0 in event-log-and-projections.md, execution-layer.md REQ-EX-02/03 + Ramesh ownership at lines 5/7, agent-runner deferral table heading line 157 / table 163-167", evidence: ".program/ledger/events/ROOT.7.1.jsonl 2026-07-25T19:04:00Z"}
  - {batch: 2, criterion: "no build/typecheck evidence required", check: "no source file touched this batch — src/lib/beats.ts, src/lib/schema.ts, package.json, package-lock.json mtimes unchanged; all edits are ledger-territory doc prose", evidence: ".program/ledger/events/ROOT.7.1.jsonl 2026-07-25T19:08:00Z"}
artifacts:
  - .program/interfaces/regression-floor.md   # batch 1 (main checkout)
  - eslint.config.mjs                          # batch 1 (edited in worktree agent-aba62312f179e2f56; director records it as integrated to main)
  - .program/interfaces/beat-model.md          # batch 2 (main checkout)
  - .program/interfaces/model-router.md        # batch 2 (main checkout)
resume_hint: "ACTIVE NOW for eslint.config.mjs + .program/interfaces/** only (transferred at ROOT.1.2 closure). src/lib/schema.ts, package.json and package-lock.json are in file_ownership_deferred and transfer here only when ROOT.1.8 (Phase 0 Gate) closes — see ADR-0016; do NOT serve a request against those three before then, park it in the steward backlog instead. Long-lived: served by a fresh dream-implementer-hardened per request batch, item stays open across generations. Closes only when ROOT.5 closes."
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

**Batch 1 outcome:** PARTIAL. Served the lint-scope fix (18:12:00) and the RF anchor audit
(18:25:00), then stopped. See director note 16:13:19.

## Batch log — steward-batch-2 (2026-07-25, dream-implementer-hardened, worktree agent-a672822b36728fa68)

Scope: **only** batch 1's unserved remainder. Did not redo batch 1; did not close the item.

**Batch plan (3 lines, tier-2 pre-implementation requirement):**

1. **Contracts touched.** `.program/interfaces/beat-model.md` (the `### Steward ruling`
   subsection under `## Persistent Beats`, plus the scoping note at the end of
   `## Out of Scope`) and `.program/interfaces/model-router.md` (the ASSUMPTIONS #12
   disclosure section). Prose only. Requests served: field_request 17:40:03 (beat-model
   persistent interpretation), steward-note backlog 3, steward-note backlog 4.
2. **Who owns the other side.** beat-model's producer is ROOT.1.1 (`src/lib/beats.ts`),
   consumers ROOT.1.3 / ROOT.4.2 / ROOT.4.6 / ROOT.4.3; model-router is consumed by ROOT.1.4
   (implementation) and ROOT.1.5 (seam code + the two open empirical obligations named in the
   doc). No Gate has run, so no row or section is frozen yet.
3. **What I will NOT change.** No `Beat` field, no `BeatType` member, no predicate x type row,
   no `PERSISTENT_BEAT_TYPES` runtime entry, no task-type enum / model-table row /
   error-union member; no `src/lib/schema.ts`; no `package.json` / `package-lock.json`; no
   section heading renamed, renumbered, or removed; no git operation.

**Finding at batch open (important for anyone auditing the gap).** Batch 1 had already
**written** all three prose blocks into the main checkout before it stopped, but logged
**none** of them — the doc text existed with no `request_served` event. Batch 2 therefore
**re-derived** each ruling from the shards independently instead of inheriting batch 1's
conclusion, then ratified, and appended attestations recording which lines were re-read.

**Requests served (3 of 3):**

1. **field_request 17:40:03 — beat-model persistent interpretation → NARROW RATIFIED.**
   A playground beat does **not** fall under the streaming-beat `persistent: true` clause.
   `PERSISTENT_BEAT_TYPES = { terminal }` stands; ROOT.1.1 needs no change and no rebuild.
   Deciding test: **session identity, not transport** — REQ-LX-03's obligations are
   session-survival obligations and it vests instance ownership in the
   PersistentTerminalHost, which REQ-TX-01 scopes to **xterm** instances. Confirmed
   empirically that `src/app/api/playground/run/route.ts` returns a per-request
   `ReadableStream` with **no session identifier**. Residual ambiguity documented honestly
   ("streaming beat" is defined in no shard; the second limb is vacuous in the corpus for
   lack of members, not by denial), and the **widening path** recorded as pre-authorized in
   shape but not in effect (one `PERSISTENT_BEAT_TYPES` entry + one doc line; no `beatId`
   churn). Also corrected one imprecision in batch 1's draft: the persistent-beat glossary
   entry exists only in `docs/origin/GLOSSARY.md` line 23 — `.program/GLOSSARY.md` has zero
   occurrences — so the citation now names file and line.
2. **Steward-note backlog 3 — model-router ASSUMPTIONS #12 per-clause disclosure → APPLIED.**
   Grounded at source: ASSUMPTIONS.md line 25 is one numbered assumption bundling four
   clauses; ADR-0010 retires it at whole-assumption granularity (line 39) on evidence scoped
   to structured outputs alone. Structured-outputs clause discharged negative; sampling-param
   and cache-minimum clauses stay open with owner ROOT.1.5. Labelled as this contract's
   interpretation, with a removal condition.
3. **Steward-note backlog 4 — beat-model ROOT.2.1 gloss scoping → APPLIED.**
   The Out-of-Scope deferral is about `learning_events` beat telemetry (REQ-EL-01…04) and
   completion projections, not `TermEvent`. Grounded: zero `TermEvent` occurrences in
   `event-log-and-projections.md`; requirements live in `execution-layer.md` REQ-EX-02/03
   (Ramesh owns the protocol); authoritative deferral table is `agent-runner.md`'s
   "Event payload — DEFERRED" section. Citation re-anchored to the **section heading** (line
   numbers parenthetical, flagged as drifting) after verifying the backlog's
   "agent-runner.md:163-169" against the real span (heading 157, table 163–167).

**Backlog status after batch 2:** 1 OPEN (RF-02 re-anchor, waits on ROOT.4.2 / REQ-CP-01),
2 OPEN by design (session-end marker has no schema carrier; acts only if a field is
requested), **3 SERVED**, **4 SERVED**, 5 OPEN (reviewer minors: playground
attempted-vs-scored reconciliation note; BeatType/exercise-type homonym mapping note) —
a future batch should serve 5.

**Integrator note:** batch 2 changed **only main-checkout ledger files**; there is nothing
to carry from this worktree. This steward ran no git.
