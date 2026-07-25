---
id: ROOT.1.2.2
parent: ROOT.1.2
type: Task
title: beat-model.md interface doc — beat type, stability rules, persistent-beat portal-slot contract
ledger_depth: 3
status: in_review
generation: 1
owner_agent: implementer-ROOT.1.2.2-gen1 # hardened escalation, 2nd attempt after secondary consumer-fit request_changes
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-02
acceptance_criteria:
  - .program/interfaces/beat-model.md exists and defines the beat type — beatId (stable across rebuilds per REQ-CP-02 scenario 2), type from the closed set prose|quiz|playground|terminal|challenge|widget (ADR-0005), optional persistent boolean, completion predicate "passed"|"verified"|"attempted"
  - The doc states persistent:true is REQUIRED for terminal/streaming beats (REQ-CP-02 scenario 3) and records the LX-03/TX-01 portal-slot contract — persistent beats stay mounted across beat transitions, never display:none, never collapsed to zero height, min-height reserved; xterm instance ownership lives with the root-level PersistentTerminalHost which portals instances into beat slots or the dock
  - The doc records ADR-0005's session-end rule — session-end/recap is an authored convention over a prose beat, NOT a schema type
  - Consumers are listed (beat compiler in src/lib/content.ts / ROOT.1.3, lesson-experience ROOT.4, terminal-experience ROOT.4, dashboard resume-to-beat) and the change protocol names the steward (ROOT.1.2 while open, ROOT.7.1 after)
depends_on: []
blocks: []
children: []
file_ownership: [".program/interfaces/beat-model.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification:
  - criterion: ".program/interfaces/beat-model.md exists and defines the beat type — beatId (stable across rebuilds per REQ-CP-02 scenario 2), type from the closed set prose|quiz|playground|terminal|challenge|widget (ADR-0005), optional persistent boolean, completion predicate \"passed\"|\"verified\"|\"attempted\""
    verdict: VERIFIED
    evidence: .program/audits/ROOT.1.2.2-gen1-shape-typecheck.txt (empirical) + .program/interfaces/beat-model.md
    method: |
      EMPIRICAL. The doc's single ```typescript block was extracted mechanically (regex, no
      hand-copy) and compiled with tsc 5.9.3 under --strict: `tsc -p tsconfig.beatcheck.json`
      -> exit 0, zero diagnostics. 7 assertions, 3 of them @ts-expect-error NEGATIVE controls
      (tsc fails if the expected error does not occur): persistent absent compiles (optional
      proven), completion omitted is an error (required proven), BeatType="recap" is an error
      (ADR-0005 closed set proven), all 6 types + all 3 predicates are members. Anti-vacuity
      check: an UNSUPPRESSED BeatType="recap" in sanity.ts DID error (TS2322), so exit 0 is a
      real pass. Sections: "Beat Type Shape" (L28-50, fenced block L30-50), "Beat ID Stability"
      (L100-133), "Completion Predicates" (L56-98). No 7th type added.
  - criterion: "The doc states persistent:true is REQUIRED for terminal/streaming beats (REQ-CP-02 scenario 3) and records the LX-03/TX-01 portal-slot contract — persistent beats stay mounted across beat transitions, never display:none, never collapsed to zero height, min-height reserved; xterm instance ownership lives with the root-level PersistentTerminalHost which portals instances into beat slots or the dock"
    verdict: VERIFIED
    evidence: .program/interfaces/beat-model.md (L152-202); shape half in .program/audits/ROOT.1.2.2-gen1-shape-typecheck.txt (assertion A2)
    method: |
      Direct inspection against REQ-CP-02 s3 / REQ-LX-03 s1-s2 / REQ-TX-01. "Persistent Beats"
      (L152-167) states the requirement AND now closes the gen0 gap: default when absent
      (absent === false, undefined and false treated identically) and the enforcer (beat
      compiler ROOT.1.1; a bundle missing the flag is a build failure, not a runtime patch).
      "streaming beat" is now DEFINED (live server stream: terminal sessions, agent runs,
      SSE-fed widgets) so scenario 3's second limb is testable. Portal-Slot Contract
      (L169-202) carries all four invariants verbatim (stays mounted / never display:none /
      never zero height / min-height reserved) plus PersistentTerminalHost root-level
      ownership portaling into beat slots or the bottom dock. Empirical A2 confirms
      {type:"terminal", persistent:true} is expressible in the declared shape.
  - criterion: "The doc records ADR-0005's session-end rule — session-end/recap is an authored convention over a prose beat, NOT a schema type"
    verdict: VERIFIED
    evidence: .program/interfaces/beat-model.md (L146-148); .program/audits/ROOT.1.2.2-gen1-shape-typecheck.txt (assertion A5)
    method: |
      Direct inspection + EMPIRICAL. "Beat Type Vocabulary" L146 states session-end/recap is
      an authored convention over a prose beat (ADR-0005), NOT a distinct schema type, compiled
      type stays "prose"; L148 adds that Nova's coarser taxonomy must not appear in compiled
      output. A5 proves the negative side by compiler: BeatType = "recap" is a type error under
      the doc's own declaration. ADR-0005's additive-recap fallback is recorded as the escape
      hatch (L146) rather than exercised.
  - criterion: "Consumers are listed (beat compiler in src/lib/content.ts / ROOT.1.3, lesson-experience ROOT.4, terminal-experience ROOT.4, dashboard resume-to-beat) and the change protocol names the steward (ROOT.1.2 while open, ROOT.7.1 after)"
    verdict: VERIFIED
    evidence: .program/interfaces/beat-model.md (L204-239)
    method: |
      Direct inspection. All four consumers listed with file paths and item IDs: beat compiler
      src/lib/content.ts (L208-210), lesson-experience BeatRenderer (L212-216), terminal-experience
      PersistentTerminalHost (L218-220), dashboard resume-to-beat (L222-224). Change Protocol L226-228
      names ROOT.1.2 while open and ROOT.7.1 after (ADR-0007 succession), plus the field_request
      protocol and the additive-vs-breaking split.
      DEVIATION, deliberate, flagged for the reviewer: the criterion text attributes the beat
      compiler to ROOT.1.3. Verified against the ledger that this is wrong — ROOT.1.1 is
      "Content pipeline — Velite migration, beat compiler, versioned bundle" and ROOT.1.3 is
      "API & streaming"; ROOT.1.2's own front matter has blocks: [ROOT.1.1, ROOT.1.3]. The doc
      therefore names ROOT.1.1 as the compiler (producer) and ROOT.1.3 as the wire consumer,
      satisfying the criterion's intent (compiler is listed, at its true path) without
      propagating the ID error. Same correction the primary reviewer requested (finding 2).
      ROOT.4 sub-IDs resolved from the ledger: ROOT.4.2 lesson experience, ROOT.4.6 terminal
      experience, ROOT.4.3 dashboard — all children of Phase 3/4 as the criterion's "ROOT.4"
      indicated.
artifacts: [".program/interfaces/beat-model.md", ".program/audits/ROOT.1.2.2-gen1-shape-typecheck.txt"]
resume_hint: "Doc-only leaf. Source texts: content-pipeline REQ-CP-02, ADR-0005 (.program/decisions/ADR-0005.md), lesson-experience REQ-LX-03, terminal-experience REQ-TX-01. Write only the one named file."
---

This doc is the Contract artifact for LANE-DEPENDENCIES "Beat model type". It describes
COMPILED OUTPUT shape (what src/lib/content.ts emits), not authored input — the authored
schema is content-schema.md / src/lib/schema.ts. Event types are explicitly out of scope
(deferred to ROOT.2.1); say so in the doc.

## gen1 plan (tier-2 pre-implementation, required by hardened role)

1. Contract touched: `.program/interfaces/beat-model.md` — the compiled Beat shape
   (beatId / type / persistent / completion) consumed across four lanes. Only this file
   is edited; no code, no schema, no other interface doc.
2. Other side owners: beat compiler = ROOT.1.1 (content pipeline, emits beats) and
   ROOT.1.3 (API/streaming, transports them); lesson-experience = ROOT.4.2; terminal
   experience = ROOT.4.6; dashboard resume-to-beat = ROOT.4.3. Steward is ROOT.1.2 while
   open, ROOT.7.1 after (ADR-0007 succession).
3. What I will NOT change: the ADR-0005 closed type set (no `recap` type added), the
   field names/optionality already in REQ-CP-02's literal shape, the ROOT.2.1 event-type
   deferral boundary, and the four acceptance criteria's required content. Rework is
   ADDITIVE clarification only — predicate-vs-state disambiguation, testable beatId
   stability rules, `persistent` default + enforcer, predicate×type mapping closure.

## gen1 rework log (what changed and why)

Reworked against the secondary (consumer-fit) review. ADDITIVE only — no acceptance-criteria
content removed, no type added, REQ-CP-02's field shape untouched.

- BLOCKER predicate-vs-state: new normative subsection "`completion` is a predicate, not a
  state" — same value for every learner, never written at runtime, answers "how is this beat
  completed?" not "is it complete?"; per-learner state lives in ROOT.2.1 projections joined by
  beatId. Backed by a "Read this before consuming the shape" disambiguation table at the top
  (4 rows: learner state / rail state / content-changed / event names) and by compiler-enforced
  assertion A7 (CompletionPredicate = "complete" is a type error), so the fix is not prose-only.
- MAJOR 1 beatId testability: stability restated as 4 PRESERVE invariants (S1 prose edits w/o
  structural change per REQ-CP-02 s2, S2 deterministic rebuild, S3 edits elsewhere don't move
  this ID, S4 non-identity metadata) + 4 INVALIDATE rules (I1 new beat, I2 deletion retires the
  ID with a stated degradation path, I3 identity-key rename, I4 type change) + a 4-step
  assertion-shaped test recipe. Derivation is explicitly NOT part of the contract; ordinal
  derivation is called out as non-conforming (fails S3) — this also closes primary finding 1.
- MAJOR 2 persistent optionality: default stated (absent === false, undefined/false identical),
  "streaming beat" defined, enforcer named (beat compiler ROOT.1.1; missing flag = build
  failure, consumers must fail loudly rather than patch at runtime).
- MAJOR 3 predicate x type closure: full 6-row mapping table with valid/invalid per type and
  rationale, explicitly labelled compiler-enforced convention (not type-expressible). Rows
  traceable to REQ-LX-02 are separated from the three that are this contract's convention
  (prose/terminal/widget) — provenance stated rather than implied. "verified on prose" is
  answered directly: no rubric, no judge, so the pair has no satisfaction condition.
- Also corrected while in scope (primary reviewer findings, no criteria impact): compiler
  attributed to ROOT.1.1 not ROOT.1.3; TX-02 material cited to TX-02; session-survival scope
  raised to route changes per TX-01 s1; blanket breaking-change rule split into
  additive-allowed vs breaking-requires-migration so ADR-0005's recap path is not blocked;
  ROOT.2.1 event NAMES no longer enumerated (namespace left to its owner).

### For the integrator

Exactly ONE file changed, in worktree .claude/worktrees/agent-a03dab8f1eeaa9953:
  .program/interfaces/beat-model.md   (rewritten in place; 245 lines)
Written directly to the MAIN checkout (already there, no merge needed):
  .program/audits/ROOT.1.2.2-gen1-shape-typecheck.txt
  .program/ledger/items/ROOT.1.2.2.md
  .program/ledger/events/ROOT.1.2.2.jsonl
Verification scratch files were created in the worktree and then DELETED; nothing else in
the worktree is modified. No code, schema, or other interface doc was touched.

### Flagged for the coordinator (not mine to fix)

This item's front matter says `review: {tier: 1, required_lenses: [spec-conformance]}`, but the
item was actually reviewed by two lenses (primary spec-conformance + secondary consumer-fit,
which is what produced this rework) and parent ROOT.1.2 is `tier: 2, [spec-conformance,
consumer-fit]`. The tier-1 line looks like a gen0 transcription error against the parent. I did
not change it — review routing is the coordinator's call, not the implementer's. Re-review
should use the consumer-fit lens again, since that is the lens whose BLOCKER this rework answers.
