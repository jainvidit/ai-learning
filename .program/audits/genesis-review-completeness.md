# Genesis review — COMPLETENESS lens

Blind adversarial review of the top-two-levels decomposition. Question: **what in the spec
shards is covered by NO ledger item?**

Read: all 24 files in `.program/spec/` (96 `## REQ-*` sections + 15 OPEN-QUESTIONS entries),
all 41 item files in `.program/ledger/items/`, `.program/glossary.md`, `.program/org.md`,
`docs/origin/CONSTRAINTS.md`. Deliberately NOT read: `.program/decisions/`,
`.program/DECISIONS-PENDING.md`, `.program/handoffs/` (blind review).

## Method

1. Extracted all 96 REQ anchors from `grep '^## REQ-'` across `.program/spec/*.md`.
2. Matched each against the items dir by both anchor form (`#req-cp-01`) and shorthand
   (`CP-01`), across `spec_refs`, `acceptance_criteria`, and body text.
3. Mechanical result: **4 of 96 REQ ids are referenced nowhere by name** — `REQ-CP-07`,
   `REQ-HE-01`, `REQ-HE-02`, `REQ-HE-03`. All 24 shards are named by at least one item's
   `spec_refs` except `OPEN-QUESTIONS.md`.
4. Then hunted below the anchor level: scenarios inside referenced REQs that no acceptance
   criterion could verify; obligations whose implementing files sit outside the claiming
   item's `file_ownership`; and cross-cutting duties (CI gates, a11y, never-delete, owner
   `[HARD]`s) that fall between items.

Per instruction, a REQ inside a Phase/Capability item's *stated scope* counts as covered
even without leaves. `hosted-edition.md` REQ-HE-01/02/03 are therefore **not** findings:
`ROOT.6` carries the shard as a `spec_ref` and is deliberately parked
(`awaiting_human_authorization`), and HE-01's edition-invariance obligation is carried
forward by `ROOT.4.5` ("CloudDriver interface-only") and `ROOT.4.6`'s
`driver-agnosticism` review lens.

---

## Findings

### 1. CRITICAL — `src/lib/schema.ts` has exactly one steward, in Phase 0, with a closed field list; fields that later shards require are not in its acceptance criteria and no later item may write the file

`ROOT.1.2` is the sole schema steward ("nobody else edits schema.ts — ever"). It is the only
item with `src/lib/schema.ts` in `file_ownership` (besides its parent `ROOT.1`). Its
acceptance criterion enumerates a **closed** list: "skillIds, tiers, boss flag, hint rungs,
misconception tags, artifact/verifier declarations."

Shards require schema expressiveness that is not on that list:

- `workshop-and-artifacts.md` REQ-WA-05 scenario 4 — exercises declare preconditions
  `requires: ["artifact:claude-md:healthy"]`. No item's AC covers a `requires` field.
  `ROOT.5.2` (which claims WA-05) owns `src/components/workshop/**` and
  `src/app/workshop/**` only.
- `boss-and-test-out.md` REQ-BT-02 + `curriculum-content.md` REQ-CC-04 scenario 1 — test-out
  probe *definitions*. `ROOT.5.4` amends `specs/**` (template/guide prose) and `ROOT.5.5`
  owns `content/modules/**`; neither can validate a new field, and neither claims schema work.
- `lesson-experience.md` REQ-LX-04 / REQ-CC-04 — the session-end-beat convention. Whether it
  is a beat type or an authored convention is OPEN-QUESTIONS #1; either way, if it becomes a
  type it is a schema/beat-model change with no Phase-4 owner.

Why I believe no item covers it: Phase ordering is strict and `ROOT.1` is terminal before
`ROOT.5` dispatches, so by construction there is no live schema writer when Phase 4 discovers
a missing field. The decomposition has no "schema amendment" item at any level and no item
grants a second writer. This is a structural blocker, not a leaf detail.

### 2. MAJOR — REQ-CP-07 (git as source of truth; spec-driven agent authoring stays first-class) is referenced by no item

`content-pipeline.md` REQ-CP-07 appears in no `spec_refs`, no acceptance criterion, and no
item body. `ROOT.1` lists the whole shard (`.program/spec/content-pipeline.md`) but its
stated scope is explicitly "the forced Velite migration, beat compiler, package split, oRPC
layer, the two production seams + fakes, and CI" — CP-07 is outside it. `ROOT.1.1`
(CP-01/02/04/05), `ROOT.1.2` (CP-03/02) and `ROOT.1.4` (CP-06) between them account for six
of the shard's seven REQs; CP-07 is the residue.

Uncovered obligations: scenario 1 ("the complete authoring contract is discoverable from the
repo alone — guide + template + schema + validate command"), scenario 2 ("`npm run validate`
and the CI gates are the *only* approval gates; no out-of-band contract"), and the
CP-07 → REQ-API-02 link that the oRPC JSON-Schema emission "doubles as the contract handed to
content-authoring agents." REQ-CP-07's source is CONSTRAINTS #4 `[HARD]` (self-contained specs
for parallel agents) — an owner hard constraint with no verifying criterion anywhere.
`ROOT.5.4`/`ROOT.5.5` do the dogfood (REQ-CC-04 scenario 2) but claim only `curriculum-content.md`
anchors and assert nothing about repo-alone discoverability or the absence of out-of-band gates.

### 3. MAJOR — REQ-TC-03's Playwright e2e suite and the verifier golden-matrix harness are in no acceptance criterion; `npm run build` is silently substituted for e2e

`testing-and-ci.md` REQ-TC-03 defines Phase-0 CI as four things — content validate, typecheck,
**Playwright e2e**, and the calibration battery gate — plus a **verifier golden-matrix harness
(pristine-must-fail / solution-must-pass, both directions) for every registered verifier**
(TC-03 scenario 2).

The two items that reference TC-03 both narrow it:
- `ROOT.1.4`: "CI runs `npm run validate`, `npx tsc --noEmit`, `npm run build` on every PR (TC-03)"
- `ROOT.1`: "CI runs validate + typecheck + build on PRs (REQ-TC-03)"

`build` is not `e2e`. Calibration lands elsewhere (`ROOT.2.3` covers JP-05's CI battery), so
that half is fine. But **no item's acceptance criteria mention Playwright/e2e at all** — a grep
for `playwright|e2e` across `.program/ledger/items/` returns zero hits — and no item mentions
the golden matrix or `pristine` either. `ROOT.4.8` (Testing & CI completion) claims only TC-01
and TC-02.

This hole is load-bearing in three places: TC-03 scenario 2; `curriculum-content.md` REQ-CC-02
protected property 3 + scenario 2 ("Given any challenge verifier, when CI runs, then
pristine-template-fails and solution-passes are both exercised"); and `hosted-edition.md`
REQ-HE-01, which names "verifier golden matrix" as one of the five edition-invariant seams.
`ROOT.5.5`'s "Protected properties preserved per module (CC-02)" is an authoring-time
criterion — it cannot stand in for CI harness construction, and `ROOT.5.5` owns no CI files.

### 4. MAJOR — REQ-MS-03 (never-delete rules) has no active owner; the only non-root item claiming it is parked, and no Gate audits it

`migration-and-sequencing.md` REQ-MS-03 is `spec_ref`'d by exactly two items: `ROOT` (whose
acceptance criteria say nothing about never-delete) and `ROOT.2.4`, which is
`blocked: awaiting_human_authorization` and whose ACs cover only the legacy-JSON archival step.

Consequently:
- MS-03 scenario 1 — "Given any migration or cleanup script in the program, when audited, then
  no code path deletes `data/**` or the Workshop directory" — is a *recurring program-wide
  audit* with no owning AC. It appears only as prose in `resume_hint` fields (`ROOT.2.1`,
  `ROOT.5.1`), which are dispatch hints, not verifiable criteria.
- No Gate item enforces it. All five Gates (`ROOT.1.8`, `ROOT.2.5`, `ROOT.3.6`, `ROOT.4.9`,
  `ROOT.5.6`) list the REQ-MS-02 baseline plus build/typecheck/lint; none includes a
  never-delete or data-safety audit.
- Two MS-03 clauses appear in **no item at all**: `docs/origin/` is append-only, and
  `openspec/` + project-level `.claude/` skills stay deleted (CONSTRAINTS #20 `[HARD]`). Greps
  for `openspec` and for `docs/origin` obligations in the items dir return nothing.

Since `ROOT.2.4` is parked indefinitely ("dual-write continues indefinitely; nothing downstream
blocks on this"), MS-03's live obligations are orphaned for the entire program duration.

### 5. MAJOR — REQ-CC-06 (quiz answer-reveal policy) is assigned to a Phase-4 content item that owns none of the implementing files; its three scenarios have no verifying criterion

`curriculum-content.md` REQ-CC-06 is `spec_ref`'d only by `ROOT.5.5`, whose AC is "Quiz reveal
policy per ADR-0006 (CC-06)" and whose `file_ownership` is
`content/modules/**`, `sandbox/templates/**`, `src/lib/verifiers/**`.

But the shard states the implementation sites are `api/quiz/submit` (MODIFIED) and `Quiz.tsx`
(MODIFIED). Those belong to `ROOT.1.3` (`src/app/api/**`, Phase 0) and `ROOT.4.2`
(`src/components/lesson/**`, Phase 3) — neither of which lists CC-06 in `spec_refs`;
`ROOT.4.2` mentions the policy only in a `resume_hint`.

So no acceptance criterion anywhere verifies:
- scenario 1 — a failed submission teaches without revealing the full answer key;
- scenario 2 — post-pass "Review answers" disclosure exists;
- scenario 3 — per-question results (including misses) land as events (`ROOT.2.1`'s AC lists
  event types generically and does not name quiz per-question results).

Aggravating: the shard flags this as *deliberately contradicting* current behavior, and current
behavior ("server-side quiz grading with teaching explanations") is an explicit REQ-MS-02
regression-floor item that all five Gates assert must still pass. With no item owning the
intentional change, the Gates are set up to read it as a regression.

### 6. MAJOR — REQ-PI-01 scenario 3 (profile deletion) has no acceptance criterion, and `profiles-and-identity.md` is absent from every Phase item's `spec_refs`

The only reference to `profiles-and-identity.md` in the whole ledger is leaf `ROOT.4.3`, whose
AC is "Passwordless local profiles + per-profile isolation **preserved through the
picker/dashboard rework**" — a preservation criterion scoped to UI rework.

REQ-PI-01 scenario 3 is not preservation: "Given a profile deletion, when confirmed, then only
that profile's data is removed, with UI confirmation first (and event-log/never-delete rules
from REQ-EL-01 respected for migration-era data)." No item's ACs address what profile deletion
*means* once progress lives in an append-only event log. `ROOT.2.1`'s AC states the opposite
posture ("no update/delete paths"), and `ROOT.2.2`/`ROOT.2.4` say nothing about it. Profile
delete is a verified-baseline behavior in REQ-MS-02 ("profile create/switch/**delete** with full
isolation"), so this is a floor behavior whose event-log-era semantics nobody owns.

Secondary: no Phase item lists `profiles-and-identity.md`, so the shard has no owning item at
depth 1 — the only shard in that position among the 23 REQ-bearing shards.

### 7. MAJOR — UI surfaces named in shards fall between items' `file_ownership` and acceptance criteria: the module page and the hero shelf teaser

**Module index page (`src/app/learn/[moduleId]/page.tsx`).** The shards require it to gain time
chips, resume emphasis and completion states (REQ-DW-04 scenario 2: "Given any surface where a
learner decides to start a lesson/module, when rendered, then an estimated-minutes chip is
present"; CURRENT-STATE row "module page MODIFIED") and a "Prove it" affordance (REQ-BT-02
scenario 5, REQ-DW-02). Ownership of `src/app/learn/**` sits with `ROOT.4.2`, whose seven ACs are
all `lesson-experience` REQs and mention none of this. `ROOT.4.3` claims DW-04 but owns
`src/app/page.tsx`, `src/app/profiles/**`, `src/components/nav/**`,
`src/components/dashboard/**` — not the module page. `ROOT.5.3` claims BT-02 but owns
`packages/learning-engine/src/boss/**` and `src/components/lesson/Boss*`. The module page
rework therefore has no owner and no criterion.

**Hero artifact-shelf teaser.** REQ-DW-01 lists it as a hero element and REQ-WA-04 states "the
shelf-teaser appears on the dashboard hero." `ROOT.4.3`'s DW-01 AC covers "Hero with
next-best-action; position/next/why within 5s" and does not name it; `ROOT.5.2` claims WA-04 but
owns `src/components/workshop/**` and `src/app/workshop/**`, not `src/app/page.tsx`. Phase 3
closes before Phase 4 opens, so no live item can add it.

### 8. MAJOR — the WCAG 2.2 AA bar has no recurring verification hook; no Gate includes an a11y check

REQ-FP-05 is claimed by `ROOT.4.1` ("WCAG 2.2 AA bar established with audit tooling") — that
covers *establishing* the bar. But FP-05 scenario 3 is a recurring conformance assertion
("automated + manual WCAG 2.2 AA checks **on the key screens** … pass at AA"), and the key
screens are built by five other items across two phases (`ROOT.4.2` lesson page, `ROOT.4.3`
dashboard/map, `ROOT.4.4` playground, `ROOT.4.6` dock, `ROOT.5.2` artifact shelf).

No Gate AC includes an a11y check — `ROOT.4.9` asserts the regression floor, REPLACED-component
retirement, owner UI `[HARD]`s 26–29, and build/typecheck/lint; `ROOT.5.6` asserts the floor and
content gates. Only `ROOT.4.1` carries an `a11y` review lens; `ROOT.5.2` (shelf UI, built after
the bar exists) carries `spec-conformance` + `non-punitive-copy` and no a11y lens. FP-05
scenarios 1 (keyboard-navigable beats) and 2 (off-screen TermEvent transcript) are individually
carried by `ROOT.4.2`/`ROOT.4.6`, but the cross-surface AA assertion is unowned.

### 9. MINOR — REQ-MG-02 exists only inside another item's AC prose, not in any `spec_refs`

`model-gateway.md` REQ-MG-02 (quality-first model assignment; source CONSTRAINTS #14 `[HARD]`)
appears exactly once in the ledger: inside `ROOT.1.5`'s AC text ("quality-first table per
REQ-MG-02 (MG-01/03)"). It is in no `spec_refs` list. Functionally covered; but `ROOT`'s own
acceptance criterion is "Every shipped requirement has verification entries tracing to shard
scenarios," and a trace built from `spec_refs` will report MG-02 as uncovered. MG-02 scenario 2
("any model-selection change cites calibration-battery results, not cost") is a standing
process obligation with no owner once `ROOT.1.5` closes.

### 10. MINOR — `OPEN-QUESTIONS.md` has no owning item, and six of its 15 entries are referenced nowhere

`OPEN-QUESTIONS.md` is the only shard absent from every item's `spec_refs`. Nine entries are
carried by items or ADRs named in items (#1→ADR-0005, #2→ADR-0006, #4→`ROOT.1.3`,
#5→ADR-0003/`ROOT.4.7`, #6→ADR-0001/`ROOT.6`, #7→ADR-0002, #8→`ROOT.5.5`, #9→ADR-0004,
#15→`ROOT.5.5`). Unreferenced: **#3** (`.program/` sanctioned location), **#10** (Velite vs
Content Collections — `ROOT.1.1` allows "recorded runner-up if the tiebreak fired" but no item
owns holding or evaluating the trigger), **#11** (Langfuse vs Braintrust — and with it, JP-06's
Langfuse observability instrumentation, which appears in no AC; grep for
`langfuse|braintrust|observab` across items returns zero), **#12** (first-run cosmetic — nothing
to build, benign), **#13** (learning-integrity carve-out is an inference — items build all four
carve-out features: `ROOT.2.3` JP-03/04, `ROOT.3.5` CH-01, `ROOT.4.5` EX-06, none flags the
unratified status), **#14** (rung-4 method-not-artifact boundary is an inference — `ROOT.3.5`
builds CH-03/04 as settled). Caveat: #13/#14 may be recorded in `.program/DECISIONS-PENDING.md`,
which I was instructed not to read; note however that per AGENTS.md an implementer's read set
does not include that file, so any flag living only there is invisible to the implementer — the
shards' own `[INFERRED]` notes are the only surviving signal.

### 11. MINOR — REQ-EX-01 scenario 4 (the product states the agent runs on your machine) has no criterion

"Given the Home Edition UI around terminal exercises, when rendered, then it states that the
agent runs on the learner's machine." `ROOT.4.5` claims EX-01 but its AC is interface/driver
shape and it owns no UI files; `ROOT.4.6` covers TX-01..04, none of which is this copy. A small
but explicit transparency obligation with no owner.

### 12. MINOR — scheduled/nightly work has no owner outside CI

Three nightly obligations exist: REQ-TC-01/JP-06 nightly live battery (covered — `ROOT.4.8`,
`ROOT.2.3`, `.github/**`), and **REQ-WA-01 scenario 5 — "Given the nightly schedule, when it
runs, then a git-bundle backup of each workshop is produced."** The latter runs on a
single-user desktop app, not CI. `ROOT.5.1`'s AC ("One git-backed Workshop per profile; learner
never sees git; no hard reset anywhere") does not name it, and no item owns a local scheduler.

### 13. MINOR — two content-gate obligations are named but cannot be enforced, or are enforced nowhere

- REQ-CP-06 scenario 4 (≥2 isomorph variants per review-eligible objective fails the build) is
  claimed by `ROOT.1.4`, but `ROOT.3.4`'s own body states the gate "cannot hard-fail until the
  owner reviews the first bank." The soft/hard staging is deferred to a coordinator ADR, so the
  scenario has a claiming AC that is knowingly unsatisfiable at ship time. Flagging as a
  completeness risk, not a defect in the parking decision.
- REQ-CC-02 protected properties 6 — honest minutes, **banned-vocabulary lists**, the
  meta-pedagogy thread ("extend, never flatten"). REQ-CP-06's gate list (and `ROOT.1.4`'s AC
  restating it) omits any vocabulary/minutes check, and `ROOT.5.5`'s "Protected properties
  preserved per module (CC-02)" is the only carrier — a per-module authoring criterion with no
  mechanical gate, for a property the shard calls "existing, verifiable repo properties
  [AUDITED] — regression floor for content work."

---

## What I checked and found genuinely covered

For the record, these were hunted and are covered (so they are not findings): all 5
`event-log-and-projections` REQs incl. the streak grace day; all 6 `mastery-model` REQs incl.
the 0.4/0.7 firewall and the schema-absence anti-requirements; all 4 `spaced-review` REQs; all
6 `judge-pipeline` REQs; all 5 `coach-and-hints` REQs; all 3 `content-generation` REQs; all 7
`lesson-experience` REQs; all 5 `dashboard-and-wayfinding` REQs; all 4 `terminal-experience`
REQs; all 6 `execution-layer` REQs (except EX-01 s4, finding 11); both `playground` REQs; both
`boss-and-test-out` REQs at the mechanics level; all 5 `workshop-and-artifacts` REQs (except
WA-05 s4 schema support, finding 1, and WA-01 s5, finding 12); `frontend-platform` FP-01..05
split across `ROOT.1.6`/`ROOT.4.1`; `data-layer-and-offline` DL-01/02 with DL-03 explicitly
deferred rather than dropped; REQ-MS-01 phase ordering; REQ-MS-02 regression floor carried by
all five Gates; owner UI `[HARD]`s 26–29 carried explicitly by `ROOT.4.3`/`ROOT.4.9`/`ROOT.4.2`;
CONSTRAINTS #7–9 curriculum `[HARD]`s carried by `ROOT.5.5`; CONSTRAINTS #17 (port 3000) carried
by `ROOT.1.8`/`ROOT.4.9`/`ROOT.4`; CONSTRAINTS #12 (non-competitive) by `ROOT.3.2` MM-06 and
`ROOT.4.3` DW-04; CONSTRAINTS #16 (hint ladder ends in full guidance) by `ROOT.3.5` CH-03.
