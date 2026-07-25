# Genesis review — SIZING lens

Blind adversarial review of the decomposition in `.program/ledger/items/`, `.program/glossary.md`,
and `.program/org.md`, judged against the six-point leaf test and the AGENTS.md verification
commands. Read-only review; no ledger file was modified.

**Scope reviewed:** 41 item files (ROOT, 6 Phases, 34 depth-2 items). Leaf-typed items:
1 Probe (ROOT.1.7), 5 Gates (ROOT.1.8, 2.5, 3.6, 4.9, 5.6), 2 Tasks (ROOT.2.4, 5.4).
Items designated "direct implementer" in org.md: ROOT.1.2, 1.4, 1.6, 3.1, 3.4, 4.1, 4.4, 4.7, 4.8.

**Leaf-test point numbering used below:** (1) one-sentence acceptance, no "and then";
(2) one ownership boundary, ≤~5 files; (3) crosses no other item's interface; (4) needs no
decision that changes another item's contract; (5) one named AGENTS.md command proves it;
(6) spec basis is one shard section.

---

## CRITICAL

### 1. Point 5 is unsatisfiable program-wide — no AGENTS.md command can prove most leaves, and the glossary's own leaf definitions contradict it
**Severity:** critical · **Items:** every leaf in the program; `.program/glossary.md` rows Task/Probe/Gate

AGENTS.md's verification commands are `npm install`, `npm run build`, `npx tsc --noEmit`,
`npm run lint`, `npm run dev`, with "Unit test / Integration test: _(no test suite configured)_".
Those five commands prove exactly one class of claim: *the code compiles, lints, and boots*.
They cannot prove any behavioral acceptance criterion in this decomposition — and behavioral
criteria are the overwhelming majority. Concrete unprovable examples, all stated as acceptance
criteria today:

- ROOT.2.2 "Replay-from-empty equals incremental state"
- ROOT.2.3 "kappa ≥0.8, flip ≤2%"
- ROOT.3.2 "Introduced→Practiced→Fluent with evidence-counted promotion; never demote" (MM-02 has 7 scenarios)
- ROOT.3.3 "no timing influence anywhere", "no debt/overdue framing"
- ROOT.3.5 "post-response leak check", "rung 4 always reachable"
- ROOT.4.7 "reactive <100ms reads"
- ROOT.4.8 "TermEvent protocol contract tests merge-blocking" (tests are the deliverable, yet no runner exists)
- ROOT.1.7 (Probe) and all five Gates — evidence *documents*, not commands

Worse, the glossary defines two of its three leaf types in terms that fail point 5 by
construction: Probe exit is "Evidence doc written"; Gate exit is "REQ-MS-02 checklist +
build + tsc + lint" (three commands plus a manual checklist). So the leaf test and the level
model disagree at genesis, and every dispatch will silently resolve the disagreement in favor
of "worker invents a check" — the exact failure point 5 exists to prevent.

**Re-scope:** Add a real verification surface before any behavioral leaf is dispatched. Concretely:
(a) promote a new Phase 0 Task that installs a test runner and registers `npm test` (and a
`npm run verify:e2e`) in package.json, then amends AGENTS.md's "Verification commands" block so
the names exist; make it a `blocks:` dependency of ROOT.1.4 and of every behavioral capability;
(b) record an explicit, written exemption in glossary.md for Probe and Gate ("leaf types whose
exit is an evidence artifact, not a command"), so the exemption is a decision rather than drift.
Until (a) lands, no item whose criteria are behavioral can be declared a leaf.

### 2. ROOT.5.5 is a whole program presented as one depth-2 Capability
**Severity:** critical · **Item:** ROOT.5.5 · **Fails:** (1), (2), (6) at parent level; guarantees (2)/(3) failures in children

ROOT.5.5 carries five acceptance criteria covering CC-01, CC-02, CC-03, CC-05, CC-06 and owns
`content/modules/**`, `sandbox/templates/**`, `src/lib/verifiers/**`. Its actual content is the
authoring of 13 unbuilt modules. Measured against the repo: the one existing module
(`content/modules/01-how-llms-work`) is 11 files for 5 lessons. Thirteen modules of comparable
shape is ~140 content files, plus sandbox templates, plus authored verifiers, plus one boss and
one test-out probe set per module, plus the module-12 mitigation ADR. The resume_hint proposes
"~14 Feature items" — but per the glossary a Feature is "one REQ-* requirement (or coherent
sub-slice)", and one module is not one REQ; a single module is itself Capability-sized
(10+ files, its own boss, its own verifiers, its own protected-properties review).

This is the single largest sizing error in the decomposition: roughly half the remaining program
effort sits in one item at the same level as ROOT.4.7 (data layer) and ROOT.5.3 (boss mechanics).

**Re-scope:** Split ROOT.5.5 into (a) a Capability per module (13 of them, each decomposing into
per-lesson Tasks + one boss Task + one verifier Task), and (b) a separate small Capability for
"Module 1 targeted fixes" (CC-03) which is genuinely 3 files and unrelated to authoring 2–14.
Either raise ROOT.5.5 to Phase level or hang the 13 module Capabilities directly under ROOT.5.
Also lift CC-01's "structure/convergences inviolable" and CC-02's protected properties out of
ROOT.5.5's acceptance criteria — they are validation gates belonging to ROOT.1.4, not deliverables.

### 3. ROOT.5.4 is typed `Task` but writes ~15 files and gates all curriculum work
**Severity:** critical · **Item:** ROOT.5.4 · **Fails:** (1), (2), (5)

Acceptance criteria are two sentences joined by an implicit "and then": amend
`_TEMPLATE.md` + `AUTHORING-GUIDE.md` with five new section types, *and* amend + format-normalize
`specs/module-*.md`. The repo has 13 module specs plus the template plus the guide = 15 files in
`specs/`, three times the leaf-test ceiling. Format normalization across two divergent house
styles (02–07 vs 08–14) is independent work from adding boss/test-out sections. No named command
proves either half — `npm run validate` (`scripts/validate-content.ts`) validates `content/**`,
not `specs/**`; `npm run lint` is eslint and does not read markdown. And this item hard-blocks
ROOT.5.5, i.e. all module authoring, so under-sizing it stalls the largest downstream item.

**Re-scope:** Convert ROOT.5.4 to a Capability with leaves: (a) amend `_TEMPLATE.md` +
`AUTHORING-GUIDE.md` (2 files, one sentence, dispatchable now); (b) one leaf per spec batch
(02–07, 08–14) for section amendment; (c) one leaf for format normalization, explicitly last.
Give (a) a real check by extending `scripts/validate-content.ts` (owned by ROOT.1.4) with a
template-section assertion, or accept a reviewer-only exit and say so in the item.

### 4. ROOT.1.6 is called "near-leaf already" but is a full design-system migration
**Severity:** critical · **Item:** ROOT.1.6 · org.md row "ROOT.1.3 / 1.4 / 1.5 / 1.6" · **Fails:** (1), (2), (5), (6)

org.md assigns ROOT.1.6 to a direct implementer on the rationale "1.4/1.6 are near-leaf already".
Its three acceptance criteria span three separate shard sections (FP-01, FP-02, FP-03) and
include: verifying RSC/islands posture against `docs/nextjs-conventions.md`; wiring TanStack Query
plus per-session Zustand factories; and moving to **Tailwind v4 + shadcn/ui on Base UI** with a
new token layer. The last item alone re-authors every component under `src/components/ui/**` and
touches `globals.css`, `tailwind.config.*`, and `layout.tsx`. FP-02's scenarios additionally
require converting existing components off "ad-hoc boolean soup" state — i.e. edits inside
`src/components/**` that ROOT.4.x owns. This is off by an order of magnitude, and the
mis-designation means it will be dispatched to a tier-0/1 implementer with no decomposition step.

**Re-scope:** ROOT.1.6 gets a coordinator. Leaves: (a) Tailwind v4 upgrade + token layer +
Arial→Geist (`globals.css`, `tailwind.config.*`); (b) shadcn-on-Base-UI adoption for the existing
Card/Button/Callout/ProgressBar set; (c) TanStack Query provider + Zustand factory pattern
(pattern + one reference consumer only — leave migration of existing components to their owners);
(d) an RSC/islands posture audit Probe writing to `.program/audits/`, not a code leaf.
Correct the org.md rationale row; "near-leaf" is not defensible for 1.6.

---

## MAJOR

### 5. All five Gates are typed as leaves but require a multi-command, ten-behavior manual checklist
**Severity:** major · **Items:** ROOT.1.8, ROOT.2.5, ROOT.3.6, ROOT.4.9, ROOT.5.6 · **Fails:** (1), (5)

Each Gate's criteria are "every REQ-MS-02 baseline behavior exercised and passing" **and**
"npm run build, npx tsc --noEmit, npm run lint all pass" — two-to-four sentences, three named
commands, plus a checklist that REQ-MS-02 enumerates as ~10 runtime behaviors including live
Bedrock playground streaming, the full agent loop (spawn → fix → verify → reset), profile
isolation with 401-without-cookie, and non-localhost 403. Exercising those requires a running dev
server on a non-3000 port and manual/scripted interaction — not one named command.

**Re-scope:** Either (a) re-level Gates to Capability with one Task per baseline-behavior cluster
(rendering, profiles/isolation, quiz grading, playground streaming, agent loop, security headers,
UI [HARD]s) each with a stated check, or (b) keep Gate as a leaf type and record the point-5
exemption explicitly per finding #1. Option (a) is preferable because a failing behavior must
halt the phase — a single monolithic Gate item cannot express *which* behavior halted it.

### 6. ROOT.4.9 additionally makes cross-item sequencing judgments it does not own
**Severity:** major · **Item:** ROOT.4.9 · **Fails:** (1), (3), (5)

Beyond the shared Gate problem, ROOT.4.9 carries "every REPLACED predecessor (dashboard, sidebar,
lesson page, LessonRenderer) retired only after its replacement passed the floor" and "Owner UI
[HARD]s 26–29 re-verified in the new surfaces". Retirement is an edit inside ROOT.4.2/4.3's and
ROOT.1.1's file boundaries; verifying [HARD] 26–29 spans ROOT.4.3 (26, 27, 28) and ROOT.4.2 (29).
A gate-verifier role (org.md: "checklist execution, not decomposition") cannot both audit and
perform retirement.

**Re-scope:** Move predecessor retirement into each replacing item as its own final leaf
("retire `<predecessor>` after floor evidence exists"), and reduce ROOT.4.9 to verifying that each
retirement leaf cites gate evidence. Keep the [HARD] 26–29 re-verification in ROOT.4.9 but as
four separately-recordable checklist rows, not one criterion.

### 7. ROOT.1.7 fuses two unrelated probes into one item, and org.md says it should be two
**Severity:** major · **Item:** ROOT.1.7 · **Fails:** (1), (6)

Two acceptance criteria: re-verify next-mdx-remote's upstream archival status (a web/registry
lookup, spec basis content-pipeline REQ-CP-01 scenario 3) and exercise `output_config json_schema`
against this repo's Bedrock setup with a live call (spec basis model-gateway REQ-MG-01 /
judge-pipeline REQ-JP-01, ASSUMPTIONS #12). Different evidence, different failure modes, different
downstream consumers — #11 blocks ROOT.1.1, #12 blocks ROOT.1.5 and informs ROOT.2.3. Two shard
sections, so point 6 fails too. org.md itself describes this row as "two Probe leaves, direct
dispatch", but the ledger contains one item with `children: []` — org.md and the ledger disagree,
and per AGENTS.md files win, so the dispatchable reality is one fused item.

**Re-scope:** Split into ROOT.1.7.1 (archival re-verification; cheap, dispatch immediately;
`blocks: [ROOT.1.1]`) and ROOT.1.7.2 (Bedrock structured-outputs live call; `blocks: [ROOT.1.5]`).
If ROOT.1.7 is kept as a container, change its type from `Probe` to a non-leaf type — a leaf with
two children is a contradiction.

### 8. ROOT.2.4 fuses a reversible read-cutover with an irreversible archival, and its file ownership excludes the files it must edit
**Severity:** major · **Item:** ROOT.2.4 · **Fails:** (1), (2), (3)

Criteria: "reads cut over from legacy JSON to projections after demonstrated parity" **and**
"legacy JSON files moved to an archive location". These are two leaves with opposite risk
profiles. The read cutover is code in `src/lib/progress.ts` and `src/app/api/progress/**` —
both owned by ROOT.2.1, not by ROOT.2.4, whose `file_ownership` is only `data/progress/**`.
So as written the item cannot perform criterion 1 inside its boundary. Parking the fused item
also parks the reversible half indefinitely.

**Re-scope:** Split. (a) A Task for the read cutover, owned inside ROOT.2.1's boundary,
un-parked, gated on parity evidence from ROOT.2.5. (b) A Task for archival of `data/progress/**`,
which stays parked as `awaiting_human_authorization`. This preserves the PART 9 park exactly where
it belongs and unblocks the reversible work.

### 9. ROOT.1.2 is a direct-implementer item with three criteria and an unbounded ownership glob
**Severity:** major · **Item:** ROOT.1.2 · **Fails:** (1), (2), (4), (6)

Three criteria: seven groups of additive schema fields (skillIds, tiers, boss flag, hint rungs,
misconception tags, artifact declarations, verifier declarations); publish the beat-model type doc;
and "interface docs written for **every** LANE-DEPENDENCIES seam this phase touches". The last is
unbounded by construction — the item cannot know at dispatch how many docs that is — and
`file_ownership` includes `.program/interfaces/**` (the whole directory). Spec basis is two
sections (CP-03 + CP-02) plus a synthesis over LANE-DEPENDENCIES. By design every criterion here
changes other items' contracts, so point 4 fails; that is acceptable for a Contract item but
disqualifies it from single-implementer dispatch.

**Re-scope:** Give ROOT.1.2 a coordinator. Leaves: (a) schema additive extension, verified by
`npm run validate` passing unchanged on Module 1 (CP-03 scenario 1 — this one *does* have a real
command, keep it); (b) beat-model interface doc (`.program/interfaces/beat-model.md`); (c) one leaf
per named seam doc, with the seam list enumerated in the item body at decomposition time rather
than as "every seam". Narrow the ownership glob to the specific interface filenames.

### 10. ROOT.1.4 is a direct-implementer item containing six independent CI gates, and it cannot close in Phase 0
**Severity:** major · **Item:** ROOT.1.4 · **Fails:** (1), (3), (5); acceptance not achievable in phase

Criterion 2 alone enumerates six gates (schema conformance, anchor integrity, skill refs,
one-boss-per-module, ≥2 variants, rubric-change-requires-golden-update) — CP-06 lists them as five
distinct scenarios plus a sixth. Two of them cannot pass in Phase 0: skill-ref resolution needs
ROOT.3.1's registry (Phase 2) and the ≥2-variant gate needs ROOT.3.4's bank (Phase 2, and per
ROOT.3.4's own note it "cannot hard-fail until the owner reviews the first bank"). So the item's
acceptance criteria are unsatisfiable at its scheduled position, which makes ROOT.1.8's dependency
on it unsatisfiable too. Its own resume_hint admits this ("gates that depend on skill registry
content activate fully in Phase 2") — but the acceptance criteria were not softened to match.

**Re-scope:** Coordinator. Leaves: one per gate, each with an explicit soft/hard staging flag; the
skill-ref and variant gates ship as soft (warn) leaves in Phase 0 with a paired Phase-2 leaf that
flips them hard. Rewrite criterion 2 as "each CP-06 gate exists in the stated soft-or-hard state
for its phase". Separately, ROOT.1.4's criterion 1 restates TC-03 partially — the shard also
requires Playwright e2e, the calibration gate, and the verifier golden matrix, which are silently
absent from this item's criteria (also see finding #23).

### 11. ROOT.1.5 fuses the workspace restructure with two seams, and names a pnpm workspace file in an npm repo
**Severity:** major · **Item:** ROOT.1.5 · **Fails:** (1), (2), (3), (5), (6)

Three criteria over three shard sections: AgentRunner seam + fakes (EX-04), ModelGateway seam +
fake + quality-first table (MG-01/MG-03), and "workspace packages extracted per ADR-0002". The
third is a repo-wide restructure: moving code into `packages/**` rewrites import paths across
`src/**`, which is owned by ROOT.1.1, ROOT.1.3, ROOT.1.6, and all of ROOT.4 — so any leaf beneath
this item breaks point 3 immediately. `file_ownership` lists `pnpm-workspace.yaml`, but the repo
has `package-lock.json`, no `packageManager` field, and AGENTS.md's install command is
`npm install`; a pnpm workspace would invalidate the one named command that could prove this leaf.
The item also already carries a recorded `package.json` overlap with ROOT.1.1.

**Re-scope:** Split into three siblings: (a) AgentRunner seam + cassette fake
(`src/lib/claudeSpawn.ts` + new seam file); (b) ModelGateway seam + fake + router table
(`src/lib/bedrock.ts` + new seam file); (c) a separate workspace-split item that owns the
restructure, is sequenced alone with no concurrent siblings, and whose first act is deciding
npm workspaces vs pnpm — that decision changes AGENTS.md's install command and therefore every
other item's point-5 check, so it must be an ADR, not an implementer choice.

### 12. ROOT.1.3 bundles a no-op, a full API layer, and an unresolved infrastructure decision
**Severity:** major · **Item:** ROOT.1.3 · **Fails:** (1), (4), (6)

Three criteria over API-01/02/03. Criterion 1 (BFF posture, no credentials in bundle) is described
by the shard as "already true today — kept" and is regression-floor behavior. Criterion 2 (oRPC
over Zod with OpenAPI emission across the route surface) is a capability in its own right.
Criterion 3 embeds an unresolved decision: the item body itself says "Home resume store per
OPEN-QUESTIONS #4 Reading A" and the resume_hint says it "needs an ADR at decomposition". A leaf
may not carry an unmade decision that other items consume — ROOT.4.4's playground resume rides on
it — so point 4 fails at the parent level and will fail again in any child dispatched before the ADR.

**Re-scope:** (a) Drop criterion 1 as a deliverable; it is a Gate checklist row (REQ-MS-02 already
lists "non-localhost 403 + no secrets in client bundle"). (b) Keep oRPC/OpenAPI as its own
Capability with per-route-group leaves. (c) Make the resumable-SSE store an explicit ADR item that
`blocks` the SSE plumbing leaf, rather than a parenthetical inside an acceptance criterion.

### 13. ROOT.2.1's own title admits four items
**Severity:** major · **Item:** ROOT.2.1 · **Fails:** (1), (6)

Title: "learning_events store — schema contract, SQLite impl, dual-write". Four criteria: append-only
store; publish event types + payload shapes as an interface doc; dual-write behind the existing
progress API; and a migration importer for existing learner progress. Four separable deliverables
across two shard sections (EL-01, EL-02) plus REQ-MS-03. The importer is also the one piece that
reads real `data/**`, which is a different risk class from the other three, and the item body notes
the SQLite driver choice may need an ADR (better-sqlite3 was rejected for the old store on Windows
friction) — an unmade decision inside the program's root dependency.

**Re-scope:** Coordinator (already assigned) with these four leaves explicitly named in the item
body, plus a fifth: a driver-selection ADR leaf that runs first and `blocks` the impl leaf.
Sequence the importer last, after dual-write parity has an evidence path.

### 14. ROOT.2.2 puts five projections plus cross-phase consumers into a single file
**Severity:** major · **Item:** ROOT.2.2 · **Fails:** (2) in spirit, (3) for its downstream writers

`file_ownership: ["src/lib/projections.ts"]` — one file — for SkillState, ReviewQueue, Streak,
ResumePosition, and ArtifactHealth, plus "Progress GET/PUT re-backed by projections" (which lives
in `src/app/api/progress/**`, owned by ROOT.2.1). Any decomposition produces leaves that all write
the same file, so they can never run concurrently and each one's diff is entangled with its
siblings'. Worse, the item's own resume_hint defers SkillState/ReviewQueue semantics to Phase 2
consumers — meaning ROOT.3.2, ROOT.3.3, and ROOT.5.2 will all need to write into a file owned by a
completed Phase 1 item, which is exactly the ownership violation the org.md overlap table exists
to prevent, and this pair is not in that table.

**Re-scope:** Change the ownership to a directory (`src/lib/projections/**`), one module per
projection, with a thin index. Then each projection is a genuine leaf inside its own file, and
Phase 2/4 items can own `projections/skillState.ts` and `projections/artifactHealth.ts`
respectively without touching Phase 1's files. Move the progress GET/PUT re-backing criterion to
ROOT.2.1, which owns that route.

### 15. ROOT.3.1 is a direct-implementer item whose second criterion is inside ROOT.1.4's boundary
**Severity:** major · **Item:** ROOT.3.1 · **Fails:** (3)

Criterion 2: "CI resolves every skillId reference or fails the build (MM-01 scenario 2, activates
ROOT.1.4's gate)". The word "activates" is the tell — the code that must change is
`scripts/validate-content.ts` and `.github/**`, both owned by ROOT.1.4. ROOT.3.1's ownership is
`content/curriculum.json` and `content/modules/01-how-llms-work/**`. Criterion 1 (declare 4–6 skills
across Module 1's 11 content files + curriculum.json) is itself right at the file ceiling.

**Re-scope:** Keep ROOT.3.1 as the content-declaration leaf only (criterion 1), verified by
`npm run validate`. Move criterion 2 to ROOT.1.4 as its paired "flip the skill-ref gate hard" leaf
(see finding #10), with `depends_on: [ROOT.3.1]`.

### 16. ROOT.3.3 and ROOT.3.5 carry UX acceptance criteria that cannot be satisfied inside their declared file ownership
**Severity:** major · **Items:** ROOT.3.3, ROOT.3.5 · **Fails:** (2), (3)

ROOT.3.3 owns `packages/learning-engine/src/scheduler/**` but criterion 4 is SR-04:
"Due cap '9+', ~5-min warm-up, no debt/overdue framing" — display caps and copy, which live in
Phase 3 surfaces. Its own resume_hint says "Warm-up UI beat lands in Phase 3… this item ships the
engine + queue", contradicting its own criterion. ROOT.3.5 owns `src/lib/tutor/**` and
`src/app/api/tutor/**` but criterion 5 includes CH-05's margin-note treatment labeled
"not your grade" — a component. Both items therefore have criteria that can never be marked done,
which blocks their phase Gates (ROOT.3.6 depends on both).

**Re-scope:** Split each shard section at the engine/UI line. ROOT.3.3 keeps SR-01/02/03 plus the
*queue-shaping* half of SR-04 (cap value and rescheduling logic as engine outputs); the display and
copy half becomes a ROOT.4.2 leaf. Same treatment for CH-05: schema + leak check stay in ROOT.3.5;
the margin-note component becomes a ROOT.4.4 leaf. Restate both items' criteria so every one is
achievable inside the item's own globs.

### 17. ROOT.3.4 is a direct-implementer item containing a six-stage pipeline, with one criterion that can never be marked done
**Severity:** major · **Item:** ROOT.3.4 · **Fails:** (1), (2), (3), (6); non-binary criterion

CG-01's pipeline is generator → schema validation → blind solver → discrimination check → quality
judge → human review → bank: six stages, three of which call models through ROOT.1.5's gateway and
one of which invokes ROOT.2.3's real judge. Ownership is `scripts/generate-variants*` and
`content/variants/**`. Criterion 1 ends "nothing publishes without human review" — and the item's
own resume_hint states "Human review has no human in this loop". An acceptance criterion whose
satisfying condition is known at genesis to be absent is not binary; the item can be built but
never closed, and ROOT.3.6 depends on it.

**Re-scope:** Coordinator. Leaves: generator harness; schema-validation stage; blind-solve gate;
discrimination check against the real judge; quality-judge stage; pending-review queue store.
Rewrite criterion 1 as the testable invariant actually available — "no item can enter the served
bank without a recorded approval record; generated items accumulate in the pending queue" — and
record the owner-review request as the park, not as an acceptance criterion.

### 18. ROOT.4.1 is a direct-implementer item that includes a program-wide accessibility bar
**Severity:** major · **Item:** ROOT.4.1 · **Fails:** (1), (3), (5), (6)

Three criteria over FP-04 and FP-05: motion tokens plus native View Transitions with feature
detection; the celebration API (which must consume server-confirmed projection events from
ROOT.2.2 and gate verdicts from ROOT.2.3); and "WCAG 2.2 AA bar established with audit tooling".
FP-05's scenarios are "every beat and its controls are reachable" and "automated + manual WCAG 2.2
AA checks on the key screens" — that is an audit across ROOT.4.2, 4.3, 4.4, and 4.6's surfaces,
none of which exist when ROOT.4.1 runs (it has `depends_on: []` and blocks 4.2/4.3). "Audit tooling"
also implies a new command not present in AGENTS.md.

**Re-scope:** Three siblings. (a) Motion tokens + View Transitions (files under `src/lib/motion/**`);
(b) celebration API with its typed event contract, `depends_on: [ROOT.2.2, ROOT.2.3]`; (c) the a11y
bar becomes a *late* Phase 3 item after the surfaces exist, decomposed as one audit leaf per
surface plus one leaf to install the audit tool and register its command in AGENTS.md.

### 19. ROOT.4.2's ownership glob collides with three other items, so its leaves fail point 2/3 by construction
**Severity:** major · **Item:** ROOT.4.2 (with ROOT.1.1, ROOT.4.4, ROOT.5.3) · **Fails:** (2), (3) for children

ROOT.4.2 owns `src/components/lesson/**`. But ROOT.1.1 owns
`src/components/lesson/LessonRenderer.tsx`, ROOT.4.4 owns `src/components/lesson/Playground.tsx`,
ROOT.4.6 owns `src/components/lesson/Terminal.tsx`, and ROOT.5.3 owns
`src/components/lesson/Boss*`. Two of those (4.4, 4.6) are *in the same phase* as 4.2. org.md's
overlap table records `package.json`, `.github/**`, `layout.tsx` (4.1 vs 4.6), and `claudeSpawn.ts`
— but not this four-way collision inside `src/components/lesson/**`. Separately, ROOT.4.2 has seven
acceptance criteria over seven shard sections, the largest single item in Phase 3.

**Re-scope:** Narrow ROOT.4.2's glob to the files it actually authors (BeatRenderer, rail,
warm-up beat, session-end beat, ExerciseFrame, celebration interstitial) and enumerate them, or
restructure to `src/components/lesson/beats/**`. Then decompose its seven criteria into seven
leaves (LX-01…LX-07 map cleanly one-to-one, which is the one place in this decomposition where a
Feature-per-REQ split is obviously right).

### 20. ROOT.4.3 imports a criterion from a different shard, mixing profile-picker work into the dashboard
**Severity:** major · **Item:** ROOT.4.3 · **Fails:** (1), (6); parent-level basis is a synthesis

Six criteria: five from dashboard-and-wayfinding (DW-01…DW-05) plus one from
profiles-and-identity (PI-01, "passwordless local profiles + per-profile isolation preserved
through the picker/dashboard rework"). PI-01 is regression-preservation over `src/app/profiles/**`
and `src/lib/profiles.ts` — a different shard, a different risk class (it guards owner [HARD] #10
and #26), and the only reason it is here is that the picker page is being restyled. Note also that
`src/lib/profiles.ts` is not in ROOT.4.3's ownership even though PI-01 concerns it.

**Re-scope:** Give profiles its own small Capability under ROOT.4 owning `src/app/profiles/**`
(per-track completion display, Active badge, isolation regression evidence), leaving ROOT.4.3 with
DW-01…DW-05 and the nav/dashboard globs. Then DW-01…DW-05 decompose one-per-REQ, except DW-02
(metro map) which needs its own sub-split for the (col,lane) layout math versus the list-view parity.

### 21. ROOT.4.4 is a direct-implementer item that crosses three other items' interfaces
**Severity:** major · **Item:** ROOT.4.4 · **Fails:** (1), (3), (6)

Two criteria over PG-01 and PG-02, but the second one bundles rubric transparency, per-criterion
feedback, "staged gate-verdict states", and "coach margin note wired". Staged verdict states
consume ROOT.2.3's tier/confidence fields; the margin note consumes ROOT.3.5's tutor service and
its no-numerics schema; the resumable-run behavior consumes ROOT.1.3's SSE plumbing (whose store
decision is still open per finding #12). A tier-0/1 implementer dispatched here will be making
integration decisions against three unfinished contracts.

**Re-scope:** Coordinator, or at minimum split into (a) server-authoritative run + stop endpoint
over the SSE plumbing, (b) rubric card + per-criterion feedback + staged verdict states, (c) coach
margin-note wiring, with (b) and (c) each `depends_on` the item that owns the contract they consume.

### 22. ROOT.4.7 is a direct-implementer item that is secretly a reactive query engine
**Severity:** major · **Item:** ROOT.4.7 · **Fails:** (1), (2), (5)

DL-01 requires "every dashboard/navigation read is a reactive local query (<100ms, zero network on
nav)" plus "writes are optimistic with server-authoritative rebase"; DL-02 requires "SQLite +
in-process reactive cache" with "dependent reactive queries update without polling". That is an
invalidation/subscription layer plus an optimistic-write rebase path plus a perf budget — three
leaves minimum, none provable by build/tsc/lint, and the <100ms figure needs a measurement harness
that does not exist. `file_ownership: ["src/lib/data/**"]` is also too narrow: "zero network on
nav" requires changes in the consuming components owned by ROOT.4.3.

**Re-scope:** Coordinator. Leaves: (a) reactive read store + subscription/invalidation over SQLite;
(b) optimistic write + server rebase path, with the LLM-verdict carve-out asserted; (c) a perf
measurement leaf that also registers its command in AGENTS.md. Move the "consumers read through
the store" conversion into ROOT.4.3 as a leaf there.

### 23. ROOT.4.8 is a direct-implementer item whose deliverable presupposes a test runner nobody owns
**Severity:** major · **Item:** ROOT.4.8 · **Fails:** (1), (2), (5)

Criteria: "deterministic cassettes on PRs, live battery nightly" and "TermEvent protocol contract
tests merge-blocking". Delivering these means choosing and installing a test framework, authoring
cassette infrastructure, authoring the contract suite, adding two CI workflows, and adding a
nightly schedule — five-plus leaves across `tests/**` and `.github/**`. And the framework choice
changes AGENTS.md's verification-commands block, which every other item's point-5 check depends
on, so it is a contract-changing decision (point 4) sitting inside a Phase 3 direct-implementer
item. TC-03 also assigns Playwright e2e and the calibration gate to *Phase 0* CI, which no item
currently claims (ROOT.1.4's criteria omit them).

**Re-scope:** Pull the runner/framework decision forward into the Phase 0 item proposed in
finding #1 and make it an ADR. Then ROOT.4.8 gets a coordinator with leaves: cassette recorder,
cassette replay in CI, TermEvent contract suite, nightly workflow. Reconcile which of TC-03's four
elements land in ROOT.1.4 versus ROOT.4.8 — right now Playwright and the calibration gate are in
neither.

### 24. ROOT.5.1 declares one file of ownership for three REQs that reach into three other items' files
**Severity:** major · **Item:** ROOT.5.1 · **Fails:** (2), (3), (5)

`file_ownership: ["src/lib/workshop.ts"]`, but its criteria include: WA-02's mapping rule
"enforced" (a validation gate — `scripts/validate-content.ts`, owned by ROOT.1.4), WA-03's
"artifact records + capability verifiers" (verifiers live in `src/lib/verifiers/**`, owned by
ROOT.5.5), the ArtifactHealth projection surface (ROOT.2.2's file), and WA-01's nightly git-bundle
backup (a scheduled job, i.e. `.github/**` or a new script, plus a real question about whether a
scheduled backup is an infrastructure action). Three shard sections in one item.

**Re-scope:** Split: (a) workshop git plumbing — checkpoint, restore-forward, no-hard-reset,
per-profile dirs (`src/lib/workshop.ts`); (b) artifact record model + verifier interface, owning
the verifier-registry index file explicitly; (c) mapping-rule validation gate, dispatched as a
ROOT.1.4 leaf; (d) nightly backup as its own item, flagged for the park review since a scheduled
job touching learner data is adjacent to PART 9.

### 25. `src/components/ui/**` and `src/app/layout.tsx` are owned by two items each and the second pair is missing from org.md's overlap table
**Severity:** major · **Items:** ROOT.1.6 vs ROOT.4.1; ROOT.1.6 vs ROOT.4.1 vs ROOT.4.6 · phantom/duplicated ownership

ROOT.1.6 owns `src/components/ui/**` and `src/app/layout.tsx`; ROOT.4.1 also owns
`src/components/ui/**`; ROOT.4.6 also owns `src/app/layout.tsx`. org.md's overlap table records
only "layout.tsx (4.1 vs 4.6)" — it names the wrong pair for layout.tsx (4.1's globs are
`src/components/ui/**` and `src/lib/motion/**`; it is 1.6 that owns layout.tsx) and omits the
`ui/**` overlap entirely. The cross-phase rule ("ownership is active only while an item is
non-terminal") papers over it, but the recorded table is factually wrong, which is how concurrent
edits get authorized by mistake.

**Re-scope:** Correct the org.md table to list: `src/components/ui/**` (1.6 → 4.1, cross-phase),
`src/app/layout.tsx` (1.6 → 4.6, cross-phase), and re-check the claimed 4.1-vs-4.6 pair against the
item files. Better: split `src/components/ui/**` into `ui/primitives/**` (ROOT.1.6) and
`ui/motion/**` + `ui/celebration/**` (ROOT.4.1) so the glob overlap disappears.

---

## MINOR

### 26. ROOT.1.3 criterion 1 is phantom work
**Severity:** minor · **Item:** ROOT.1.3

"Browser talks only to the Next server; credentials never in the client bundle (API-01)" is
described by the shard as already true and is listed verbatim in REQ-MS-02's baseline. As an
acceptance criterion it creates an item that can be "completed" with zero diff.
**Re-scope:** delete the criterion; it is a Gate checklist row.

### 27. ROOT.4.7 criterion 3 is a documentation artifact, not work
**Severity:** minor · **Item:** ROOT.4.7

"REQ-DL-03 offline machinery explicitly deferred per ADR-0003 (not silently dropped)" is satisfied
the moment ADR-0003 exists — which it does, per ROOT.md's artifacts list. Tracking it as an
acceptance criterion of an implementation item creates phantom ownership of a decision.
**Re-scope:** move to the item body as a scope note; keep the ADR link.

### 28. Five Gates duplicate the same checklist with no single owning artifact
**Severity:** minor · **Items:** ROOT.1.8, 2.5, 3.6, 4.9, 5.6

Each Gate re-derives the REQ-MS-02 baseline list from the shard independently. Five independent
transcriptions of a ~10-row checklist will drift, and a drifted checklist is a silently weakened
halting condition.
**Re-scope:** author the checklist once as a Contract-level artifact (e.g.
`.program/interfaces/regression-floor.md`) with one steward; each Gate then cites it and records
per-row evidence. Cheap, and it makes "which row failed" expressible.

### 29. ROOT.2.3 is two capabilities under one item
**Severity:** minor · **Item:** ROOT.2.3

Six criteria over JP-01…JP-06. JP-01–04 are the grading engine; JP-05–06 are calibration goldens,
a CI battery, a nightly live battery, a z-test drift monitor, and paging — observability
infrastructure that depends on the test runner from finding #1 and belongs with testing-and-ci.
Also "nightly battery" + "page" are scheduled/notification actions worth a park check.
**Re-scope:** keep JP-01–04 in ROOT.2.3; move JP-05–06 into a sibling item sequenced with
ROOT.4.8, or into ROOT.4.8 itself.

### 30. ROOT.3.2 criterion 5 is a repo-wide negative audit outside its boundary
**Severity:** minor · **Item:** ROOT.3.2

"No points/XP/leaderboard fields anywhere in schemas (MM-06)" spans `src/lib/schema.ts`
(ROOT.1.2), the event payload shapes (ROOT.2.1), and the projections (ROOT.2.2). ROOT.3.2 owns only
`packages/learning-engine/src/mastery/**`.
**Re-scope:** make MM-06 a standing check in each Gate's checklist (a grep-able assertion), not an
acceptance criterion of one engine item.

### 31. Non-binary acceptance criteria roundup
**Severity:** minor · **Items:** ROOT.1.1, ROOT.1.6, ROOT.4.3, ROOT.2.3

- ROOT.1.1: "Velite (**or recorded runner-up if the tiebreak fired**) compiles MDX" — a disjunctive
  criterion whose truth depends on an event outside the item. Restate as "MDX compiles at build
  time via the framework named in the tiebreak record; `next-mdx-remote` absent from package.json"
  (the second half is genuinely checkable and is the only part `npm run build` can prove).
- ROOT.1.1: CP-04's "served from a CDN/static route so content releases are decoupled from app
  deploys" / "no app redeploy required" is not meaningful for a single-process local desktop tool
  (CONSTRAINTS #15). Restate as bundle-immutability + versioned-static-route, or record the
  divergence.
- ROOT.1.6: "RSC + islands posture **verified** against docs/nextjs-conventions.md" — no stated
  verifier. Restate as the two FP-01 scenarios (prose beats ship no hydration JS; exercise beats
  hydrate inside Suspense), each checkable against build output.
- ROOT.4.3: "position/next/why within 5s" is a human-perception target. Restate as the structural
  facts that produce it (hero renders resume chip + due count + next-lesson CTA above the fold from
  one reactive query).
- ROOT.2.3: "kappa ≥0.8, flip ≤2%" are targets, not observations (ASSUMPTIONS #9/#10). Keep the
  numbers, but state the binary form: "the battery runs and reports kappa/flip-rate; values below
  target block the PR" — otherwise a first measurement below target makes the item unclosable.

---

## Coverage note

Items judged adequately sized as presented, given a coordinator: ROOT.1.1 (4 named leaves in its
resume_hint), ROOT.3.2 (5 REQs, coordinator assigned, one clean glob), ROOT.4.5 (5 REQs, coordinator,
one interface + one impl split already indicated), ROOT.4.6 (4 REQs, coordinator), ROOT.5.2
(2 REQs, plausible 2–3 leaves), ROOT.5.3 (2 REQs, narrow globs). ROOT.6 is correctly parked with a
deliberately non-decomposable placeholder criterion. No item in the decomposition was found to be
over-decomposed in the sense of splitting real work too finely; the errors run entirely in the
other direction, plus the four phantom-work criteria in findings #26, #27, #30, and #31.
