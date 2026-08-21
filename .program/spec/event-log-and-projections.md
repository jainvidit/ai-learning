# Capability: Event Log & Projections

The append-only `learning_events` store and the server-side projections derived from it. THE root dependency of the program: Sage's mastery model, Nova's hero/resume/streak reads, and Priya's drift monitoring all read from it (docs/origin/LANE-DEPENDENCIES.md block 1).

**Depends on:** none (root capability).
**Depended on by:** `mastery-model.md`, `spaced-review.md`, `dashboard-and-wayfinding.md`, `lesson-experience.md` (resume-to-beat, celebrations), `judge-pipeline.md` (drift monitoring reads), `workshop-and-artifacts.md` (ArtifactHealth), `data-layer-and-offline.md` (reads/writes ride the sync contract).
**Contract owner:** Atlas owns event types + payload shapes (additive-only changes); Ramesh owns storage impl; Sage owns projection semantics, Ramesh the SQL impl (LANE-DEPENDENCIES shared-contract rows).

---

## REQ-EL-01: Append-only learning_events store {#req-el-01}

All learner activity is recorded as append-only `learning_events` (beat_viewed, exercise_attempted, hint_revealed, review_graded, boss_passed, test_out, artifact_created, …). SQLite in the Home Edition, Postgres in the Hosted Edition. Per the personal-desktop-tool directive (CONSTRAINTS.md #15 [HARD]), the Home Edition log is a local append-only store, not infrastructure.

**Source:** DREAM-BLUEPRINT.md §3 "Progress & learner-model storage", §3 "Personal-desktop-tool directive"; LEARNING-DESIGN-REVIEW-SAGE.md §3#1 ("the deep schema change everything else rides on").
**Current state (docs/origin/CURRENT-STATE.md):** `src/lib/progress.ts` + `data/progress/*.json` REPLACED (Phase 1) — dual-write then cutover; the JSON store is NOT deleted until the event log is verified; a migration importer converts existing progress; **DO NOT delete user progress data at any point** (`data/**` is a standing never-delete flag).

**Scenarios:**
1. Given any learner action of a recorded type, when it occurs, then exactly one event is appended and no existing event is ever updated or deleted.
2. Given the Home Edition, when the event store is inspected, then it is a local SQLite (or equivalent embedded/file) store requiring no external service.
3. Given the migration from the JSON progress store, when cutover completes, then every learner's prior progress is represented in projections and the original JSON files still exist (archived, not deleted).
4. Given the dual-write phase, when a write lands, then both the legacy JSON store and the event log record it, and reads still serve from the legacy path until cutover is verified.

## REQ-EL-02: Events carry itemRevision; judge events carry the drift triple {#req-el-02}

Every attempt event records the `itemRevision` (content hash) it ran against. Every judge event additionally carries `judgeModel + judgePromptVersion` (Priya's drift hooks) — LANE-DEPENDENCIES rule: "every judge event MUST carry Priya's triple."

**Source:** DREAM-BLUEPRINT.md §3 "Progress & learner-model storage"; LANE-DEPENDENCIES "learning_events" row; GLOSSARY.md "itemRevision".
**Current state:** new; today's progress store discards per-question results entirely (LANE-DEPENDENCIES block 1).

**Scenarios:**
1. Given any attempt event, when it is written, then it includes the `itemRevision` of the item as served.
2. Given any judge-verdict event, when it is written, then it includes `judgeModel` and `judgePromptVersion` alongside `itemRevision`.
3. Given an event write missing a required field for its type, when validation runs, then the write is rejected (schema-enforced payload shapes).

## REQ-EL-03: Projections are the only readable truth, each computed in exactly one place {#req-el-03}

Server-side SQL projections derive: SkillState, ReviewQueue, Streak, ResumePosition, ArtifactHealth. Projections are the only readable truth; the log is the audit trail. Nova's frozen UX contract: every projection is computed in exactly one place — UI code never computes its own.

**Source:** DREAM-BLUEPRINT.md §2 "Data layer" (UX contract, frozen), §3 "Progress & learner-model storage"; UX-REVIEW-NOVA.md §5 P0-1; LANE-DEPENDENCIES "Projections" row.
**Current state:** new (`src/lib/projections.ts` planned per Nova §5); `api/progress` route MODIFIED — GET/PUT re-backed by projections behind the existing API during Phase 1.

**Scenarios:**
1. Given any UI surface showing streak, mastery, review-due, resume position, or artifact health, when its data source is traced, then it reads a named projection, never raw events and never a locally recomputed value.
2. Given each projection (SkillState, ReviewQueue, Streak, ResumePosition, ArtifactHealth), when the codebase is searched, then exactly one implementation computes it.
3. Given a replay of the full event log from empty, when projections are rebuilt, then they reach the same state as incrementally maintained ones (derivability).

## REQ-EL-04: Streak projection semantics {#req-el-04}

Streak is computed on server time with the learner-declared timezone and a grace day. Framing is continuity, never threatened loss (no punitive quota — REJECTED.md: "punitive daily minute quotas" rejected; a gentle, self-chosen, invitational daily goal WAS adopted). Note ASSUMPTIONS.md #34 [INFERRED]: the owner banned competition, never mentioned streaks either way.

**Source:** DREAM-BLUEPRINT.md §3 (Streak projection), §5 "Daily return"; UX-REVIEW-NOVA.md §2 "Streak + gentle daily goal" (local-timezone days, streak-freeze grace, invitational copy).
**Current state:** new; no streak exists today (Nova §1 problem 9).

**Scenarios:**
1. Given a learner active on day N and inactive on day N+1 only, when day N+2 activity occurs, then the streak is preserved via the grace day.
2. Given the learner's declared timezone, when day boundaries are computed, then they use that timezone on server time (not client clock).
3. Given any streak UI copy, when reviewed, then it contains no loss-threat framing (no "you'll lose your streak" style messaging).
