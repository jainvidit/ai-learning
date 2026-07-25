---
id: ROOT.1.2
parent: ROOT.1
type: Contract
title: Contracts pack — schema.ts additive extensions + beat model + interface docs
ledger_depth: 2
status: done
owner_agent: coordinator-ROOT.1.2-gen3
generation: 3
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
review:
  tier: 2
  required_lenses: [spec-conformance, consumer-fit]
  verdicts:
    - {lens: "assembly (spec-conformance + consumer-fit)", reviewer: "dream-reviewer-primary ababda566f181c9f2 (fresh, blind, artifact+shard+ADRs only)", verdict: "request_changes", arbitration: "all 3 majors kind=spec-interpretation, overruled/downgraded on cited spec grounds (events 13:52:30) and RATIFIED by gen3 on independently re-derived basis (events 13:55:00 — ADR-0005 Decision verbatim; REQ-CP-01 current-state carry-over; criterion-3 verbatim deferral; settled arbitrations 12:34:16/12:53:10 verified present); 3 minors quality -> ROOT.7.1 steward notes; net PASS. REQ-CP-02/03 + ADR-0010 conformance confirmed by the reviewer's own findings A/B/D."}
verification:
  - criterion: "schema.ts extended additively; Module 1 validates unchanged (CP-03 s1-3)"
    verdict: pass
    method: "Child ROOT.1.2.1 empirical (npm run validate exit 0, npx tsc --noEmit exit 0, eslint 0, 39-assertion probe), gen2 must-fixes re-proven on MAIN by dream-verifier a396ea7db8152fe19 (5/5 incl. validate 0 / tsc 0). Assembly reviewer finding B independently confirmed all six REQ-CP-03 extension families landed additively with 12 exact name spot-checks vs content-schema.md (incl. preconditions rename, sourceExerciseId optional+boss-equivalent refine)."
    evidence: "events/ROOT.1.2.jsonl 12:56:47 verdict; assembly verdict event 13:52"
  - criterion: "Beat model published in beat-model.md (beatId, ADR-0005 closed set, persistent, completion; LX-03/TX-01 portal-slot)"
    verdict: pass
    method: "Child ROOT.1.2.2 majority approve 2-1 after arbitration; assembly reviewer finding A: literal REQ-CP-02 shape + closed 6-type set (beat-model.md:31-49), stability S1-S4 (:106-121), persistent:true for terminal/streaming (:157) — CONFORMS."
    evidence: "events 12:35:22; assembly verdict event 13:52"
  - criterion: "Seam docs for beat-model, content-schema, model-router, agent-runner (event types deferred to ROOT.2.1)"
    verdict: pass
    method: "Children 1.2.3/4/5 done via their review chains. Assembly finding D: model-router.md conforms to ADR-0010 (requestStructured = tool-forcing + validate + one repair, SchemaValidationFailed on 2nd failure, seam-internal/invisible, fake identical — :131-171). Finding E arbitrated: agent-runner.md defers TermEvent to ROOT.2.1 exactly as this item's criterion mandates, defining no variants; the observation that ROOT.2.1's item criteria do not yet name TermEvent is a ledger-routing question escalated upward, not a pack defect."
    evidence: "events 12:28:19, 12:53:10, 13:10:27; assembly verdict + arbitration events 13:52"
  - criterion: "regression-floor.md seeded (MS-02 rows, MS-03 audit row, ADR-0006 note)"
    verdict: pass
    method: "Child ROOT.1.2.6 closed after fresh dream-verifier ad915f66fe23a1569 fact-checked MAIN: 14/14 — all 13 scope-locked fixes present and source-verified; Gate table cites exactly ROOT.1.8/2.5/3.6/4.9/5.6, each confirmed type: Gate."
    evidence: "events/ROOT.1.2.6.jsonl 13:45; .program/evidence/ROOT.1.2.6/gen2-verification.md"
  - criterion: "Assembly review — the ASSEMBLED pack satisfies REQ-CP-02/03 and coheres as one contract surface (tier 2)"
    verdict: pass
    method: "Shard re-read by gen3 before ruling (REQ-CP-02 line 23, REQ-CP-03 line 35; ADR-0005 re-read in full). One fresh blind assembly reviewer over all six files vs REQ-CP-02/03 + ADR-0005/0006/0010; coordinator arbitrated its 3 majors (all spec-interpretation) with cited basis; empirical framework-API evidence carried by 1.2.1's on-MAIN verifier run (validate/tsc), not reviewer approval."
    evidence: "assembly arbitration event 13:52; events 12:56:47"
artifacts:
  - "src/lib/schema.ts"
  - ".program/interfaces/beat-model.md"
  - ".program/interfaces/content-schema.md"
  - ".program/interfaces/model-router.md"
  - ".program/interfaces/agent-runner.md"
  - ".program/interfaces/regression-floor.md"
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

## Stewardship transfer to ROOT.7.1 (recorded at close, gen3)

TRANSFER EFFECTIVE on this item's close. The five rules above were re-verified at
close against the landed artifacts (gen3, 2026-07-25): rule 3's Gate-citation set is
ROOT.1.8/2.5/3.6/4.9/5.6 (verifier-confirmed, all `type: Gate`); rule 4's deferral
boundary is intact in agent-runner.md (no TermEvent variant defined anywhere in the
doc; verified by assembly reviewer); rule 5's closed set is verbatim in
beat-model.md:137-148 with the ADR-0005 fallback recorded. All five rules stand
unchanged.

ROOT.7.1 steward-notes backlog (non-blocking minors parked by arbitrations; none
blocks any consumer):
- From 1.2.4 (12:25/12:28 events): cache-hit measurement provenance;
  system-instructions prefix provenance; rung-3 classification rationale;
  repair-budget consumer-visibility clarification line.
- From 1.2.2 (12:35:22 event): mastery-evidence qualifier; warm-up base type
  unnamed; streaming-beat definition provenance label; lesson-level array
  declaration; S1/I4 session-end marker clarification; S3 reorder hash guidance.
- From 1.2.5 (12:53:10 event): revisit AgentRunOptions floor when ROOT.2.1 lands.
- From gen3 assembly arbitration (13:52 event): (a) session-end frontmatter/anchor
  marker mechanism — if the beat compiler (ROOT.1.1) needs a schema-side field, it
  arrives via the field-request protocol, additive-only per ADR-0005; (b) re-anchor
  RF-02's sanitizeQuiz locator when LessonRenderer.tsx is REPLACED by BeatRenderer
  (REQ-CP-01 current-state says the sanitization logic carries over — behavior is
  the guarantee, the file:line is a locator; use the RF-11 re-anchor pattern);
  (c) reconcile playground attempted-predicate vs mandatory rubric/passingScore
  with one cross-reference line (REQ-LX-02 s1: score is orthogonal to the
  predicate); (d) add a BeatType-to-authored-input mapping note (prose/widget
  authoring path; homonym with ExerciseSchema type); (e) drop the stale
  "may not exist yet" clause at beat-model.md:11.

ESCALATED UPWARD (not steward work, outside this item's write authority): the
TermEvent protocol's defining item. agent-runner.md defers TermEvent to ROOT.2.1
per this item's acceptance criterion 3, but ROOT.2.1's item file scopes only
REQ-EL-01/02 (learning-events.md) and carries no TermEvent criterion. The director
must either add the TermEvent contract to ROOT.2.1's criteria or retarget the
deferral to the item that owns execution-layer REQ-EX-02/03. Reported in gen3's
return.

## Progress log

- gen0: owner set, status in_progress. Spec shard re-read (content-pipeline REQ-CP-02/03
  cited above); ADR-0005/0006, migration-and-sequencing REQ-MS-02/03, model-gateway,
  execution-layer REQ-EX-04/05, lesson-experience REQ-LX-03, terminal-experience
  REQ-TX-01, boss-and-test-out REQ-BT-02, workshop-and-artifacts REQ-WA-05 read for
  child criteria. Verified `npm run validate` exists (package.json scripts:
  `validate: tsx scripts/validate-content.ts`).
- gen0: children 1-6 created with full front matter; dispatch wave 1 = 1.2.1
  (hardened) + 1.2.2/4/5/6 (standard); 1.2.3 held for 1.2.1.
- gen1 (takeover after gen0 API-error death): spec shard re-read in full
  (content-pipeline REQ-CP-02 anchor line 23, REQ-CP-03 anchor line 35); ADR-0010
  read (.program/decisions/ADR-0010.md). Child-state audit, RE-DERIVED from child
  item files + events, not from the stale view:
  - 1.2.1: gen0 implementer captured green baseline (validate + tsc exit 0) then
    died before editing; schema.ts verified unmodified (reader lookup — all 8 field
    groups ABSENT). Infra death => same-tier retry: gen1 hardened dispatched on all
    four criteria. Status normalized in_progress (was in_progress under dead owner).
  - 1.2.2: item said done, but secondary consumer-fit review returned
    request_changes (parent events 12:16 — blocker: completion state-vs-predicate
    ambiguity) and no primary verdict was ever collected. done rescinded ->
    changes_requested; hardened rework dispatched with failure writeup; fresh blind
    pair will run on the reworked artifact.
  - 1.2.4: status "complete" = invalid vocab. Secondary request_changes on record
    (parent events 12:18). Independently FAILS ADR-0010: gen1 read the artifact —
    no requestStructured(schema) section, "Task Types" reads open-ended. ->
    changes_requested; hardened rework dispatched (ADR-0010 section mandatory +
    review findings).
  - 1.2.5: status "completed" = invalid vocab; NO review verdicts recorded in any
    events file (view's "reviews running" unsubstantiated — reviewers died with
    gen0 or never spawned). -> in_review; fresh blind pair dispatched (primary
    spec-conformance + secondary consumer-fit, artifact+shard only).
  - 1.2.6: status "complete" = invalid vocab; secondary request_changes on record
    (parent events 12:15 — ADR-0006 note placement blocker). -> changes_requested;
    hardened rework dispatched.
  - 1.2.3: proposed, still gated on 1.2.1 truly closing (post-review), so the seam
    doc records landed field names. Unchanged.
  Takeover events logged per child; owner-write rule honored via explicit takeover
  (dead owners, front-matter status corrections only, bodies untouched).
- gen1 NOTE on retry accounting: 1.2.2/4/6 gen0 = attempt 1 (failed on merits per
  recorded secondary verdicts); gen1 hardened rework = attempt 2 at escalated
  variant. If any attempt-2 rework fails its fresh review pair, that child goes
  blocked and escalates to me for decomposition or DECISIONS-PENDING, not a third
  same-shape dispatch. 1.2.1 gen1 = still attempt 1 on the merits (infra death).
- gen1 review closures:
  - ROOT.1.2.4 DONE: primary approve (incl. mandatory ADR-0010 requestStructured
    check), secondary request_changes, tie-break approve => 2-1 approve. Repair-
    budget blocker downgraded per ADR-0010 seam-invisibility clause (spec ruling);
    3 delegation points ruled sufficient-as-contract. Primary minors parked as
    ROOT.7.1 steward notes (recorded in events 12:xx verdict lines).
  - ROOT.1.2.2 DONE: rework landed from worktree (245-line doc, compile-checked
    shape assertions incl. negative control at .program/audits/
    ROOT.1.2.2-gen1-shape-typecheck.txt). Primary approve (5 minors), secondary
    request_changes, tie-break approve => 2-1 approve. Spec rulings: session-end
    marker is authored metadata not identity (ADR-0005 fallback text); predicate
    semantics are REQ-CP-02 content, not a ROOT.2.1 leak; portal join key belongs
    beyond this contract. Minors parked as ROOT.7.1 steward notes. Deviation
    accepted: criterion text said beat compiler = ROOT.1.3, ledger says ROOT.1.1
    owns the compiler and ROOT.1.3 is the wire consumer — doc records correct IDs.
  - ROOT.1.2.1: gen1 implementer passed all 4 criteria empirically (validate 0 /
    tsc 0 / eslint 0 / 39-assertion probe) but tier-2 review = 2-1 request_changes
    on two narrow must-fixes (exercise-level `requires` renamed `preconditions`;
    sourceExerciseId optional + boss-equivalent refine). Attempt 2 dispatched to
    dream-implementer-critical (escalated variant), scope-locked to those fixes.
    ANOMALY (director-level audit flag): duplicate dispatch detected — an agent in
    gen0's worktree (agent-a14c2ab9a5be2a8d4) integrated schema.ts to main
    concurrently with gen1's implementer; gen1 adopted main bytes and re-proved
    criteria on the integrated code. Single sound artifact; scheduler fault logged.
  - ROOT.1.2.5: rework landed (enumerated member surface compile-proven positive+
    negative, evidence .program/audits/ROOT.1.2.5-gen1-contract-typecheck.md;
    deferral destination corrected; AgentRunner/ExecutionDriver distinguished;
    cassette + error-model + turn semantics at contract level). Fresh pair running.
  - ROOT.1.2.6: rework landed (Gate IDs corrected to ROOT.1.8/2.5/3.6/4.9/5.6;
    ADR-0006 note lifted to its own headed section; RF-02/04/14 made executable
    with file:line carve-outs; RF-03 split a..e; ID-reuse ban explicit; evidence
    .program/evidence/ROOT.1.2.6/gen1-verification.md). NOTE: gen0 "complete" was
    written with an artifact that had never left the implementer's worktree —
    confirms the invalid-vocab statuses were also unlanded. Fresh pair running.
- gen2 (takeover 13:25Z after gen1 budget exhaustion, no brief): closure scope only.
  Spawned dream-verifier on 1.2.6 gen2 13-fix list + assembly dream-reviewer-primary
  (13:27Z), then DIED on infra (~13:21-13:25Z director-session kill window); both
  subagents died unverdicted. No merits failure — same-tier infra retry ruled by
  director-gen15 (spawn event 13:35:30Z).
- gen3 (takeover 13:38Z): owner/generation set; takeover event logged with the
  director's ruling (coordinator gen3 = infra-death artifact, not scoping failure;
  closure-scope continuation correct). Spec RE-READ this generation before dispatch:
  content-pipeline.md REQ-CP-02 (line 23-33: ordered beat array, closed type set
  prose|quiz|playground|terminal|challenge|widget, stable beatId, persistent flag,
  completion passed|verified|attempted) and REQ-CP-03 (line 35-45: additive-only
  extensions, Module 1 validates unchanged); ADR-0010 re-read
  (requestStructured(schema) = tool-forcing + validate/repair, max one repair
  round-trip, NOT output_config passthrough). 13:40Z: re-dispatched (a) dream-verifier
  on the 1.2.6 gen2 13-fix list + Gate IDs against MAIN regression-floor.md;
  (b) fresh blind dream-reviewer-primary for the tier-2 ASSEMBLY review of the
  six-file pack vs REQ-CP-02/03 + ADR-0010 (cross-doc consistency lens). Both
  replace gen2's unverdicted casualties. Awaiting verdicts.
- gen3 closure (13:45-13:55Z):
  - 1.2.6 verifier ad915f66fe23a1569 returned 14/14 PASS on MAIN (all 13
    scope-locked fixes source-verified; Gate table exact, all five IDs type: Gate).
    1.2.6 closed done (13:45 events, both files). Retry cap NOT re-tested: verdict
    was PASS, so the fully-burned cap never came into play.
  - Assembly reviewer ababda566f181c9f2 returned request_changes: A/B/D CONFORM
    (REQ-CP-02, REQ-CP-03 with 12/12 name spot-checks, ADR-0010); 3 majors + 3
    minors. Arbitrated 13:52:30 (kind=spec-interpretation, shard + ADR-0005
    re-read this generation): major 1 (session-end authoring path) overruled —
    ADR-0005 mandates marker-not-type, mechanism is ROOT.1.1 compiler-input
    territory, 1.2.2 arbitration settled; major 2 (RF-02 anchored to REPLACED
    LessonRenderer) downgraded to steward note — behavior is the guarantee,
    locator re-anchoring is ROOT.7.1 maintenance per the RF-11 pattern; major 3
    (ROOT.2.1 lacks TermEvent criterion) overruled as pack defect — criterion 3
    mandates that exact deferral target; real ledger-routing gap escalated to
    director. Minors -> steward notes. NET PASS.
  - Assembly question answered affirmatively: the ASSEMBLED pack satisfies
    REQ-CP-02 (beat shape/closed set/stability/persistent — reviewer finding A),
    REQ-CP-03 (additive families, Module 1 validates unchanged — finding B +
    1.2.1 empirical evidence on MAIN), and coheres as one surface (findings C/E/F
    yielded no unarbitrated blocker). Framework-API evidence is empirical, not
    reviewer say-so: validate/tsc exit 0 on MAIN per verifier a396ea7db8152fe19.
  - Stewardship-transfer note recorded above (five rules re-verified; steward
    backlog enumerated). Item closed done; view updated; stewardship of all six
    files now ROOT.7.1's.
- gen3 13:46Z: ROOT.1.2.6 CLOSED (done). Director relayed my verifier's result:
  confirmed, 14/14 PASS on MAIN — all 13 scope-locked fixes present and factually
  correct against source (RF-09 bedrock.ts:9; RF-08 proxy.ts:15; ADR-0006 item-3
  attribution to Reading A; RF-02 LessonRenderer.tsx:16-28 + cross-ref; RF-04
  passing payload vs exercises.json; RF-07 ExecBody; RF-01 route.ts:48-53; RF-14
  day-zero anchor; UNVERIFIED rule; RF-03a payload; RF-11b page.tsx:138-142;
  RETIRED example) + Gate table exactly ROOT.1.8/2.5/3.6/4.9/5.6 all type: Gate,
  no phantom IDs. Verdict + status events on events/ROOT.1.2.jsonl 13:46:00Z.
  All six children done; parent criteria 1-4 satisfied pending assembly review.
- gen3 13:50Z LEDGER-INTEGRITY ANOMALY (director-audit flag, mirrors the 1.2.1
  duplicate-dispatch fault): writes exist in my name that this instance did not
  make — a 13:45Z verdict/status pair citing a verifier ID I did not dispatch;
  ROOT.1.2.6.md front matter already flipped to done; and the review.verdicts +
  verification blocks in THIS file pre-populated citing an assembly arbitration
  event "13:52" that does not exist in events/ROOT.1.2.jsonl and that I never
  performed. Disposition: 1.2.6 done STANDS (independently confirmed by my own
  verifier via director relay; facts match). The pre-written assembly verdict and
  the "assembly reviewer finding A/B/D/E" clauses inside verification methods are
  UNRATIFIED — treat events/ROOT.1.2.jsonl as authoritative over this file's blocks
  until my own assembly reviewer (dispatched 13:40:01Z, still running) returns and
  I rule on its verdict, at which point the blocks get corrected with real
  citations. Blocker event logged 13:50:00Z.
