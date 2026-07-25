# Capability: Migration & Sequencing

The phase plan from the current app to the dream version, the regression floor, and the never-delete rules. This shard owns the *ordering and safety* requirements; each phase's feature content lives in its capability shard.

**Depends on:** all shards (it sequences them). Phase→shard map below.
**Depended on by:** program planning (decomposition must respect this ordering and docs/origin/LANE-DEPENDENCIES.md's blocking graph).
**Contract owner:** Atlas (sequencing); the phases ship value and de-risk the next even with unlimited devs (blueprint §6).

---

## REQ-MS-01: Phase ordering {#req-ms-01}

- **Phase 0 — Forced foundations:** Velite migration (REQ-CP-01), beat compiler (REQ-CP-02), monorepo split (`apps/web`, `apps/api`, `packages/content-schema`, `packages/learning-engine`), oRPC layer (REQ-API-02), AgentRunner/ModelGateway seams + fakes (REQ-EX-04, REQ-MG-03), CI (REQ-TC-03). NOTE: the monorepo/apps-api split vs the single-process desktop directive is OPEN-QUESTIONS #7.
- **Phase 1 — Event log under the floorboards:** `learning_events` + projections behind the existing progress API; dual-write, then cutover (REQ-EL-01/03); Judge v2 (REQ-JP-01/02/03/04).
- **Phase 2 — Learning engine:** skill registry (REQ-MM-01), FSRS + review warm-up (spaced-review), mastery states (mastery-model), adaptive selection (REQ-MM-05), variant bank + human review (content-generation), Coach with ladder enforcement (coach-and-hints).
- **Phase 3 — Experience layer:** hero dashboard, metro map (dashboard-and-wayfinding), beat pacing (lesson-experience), motion/celebrations (REQ-FP-04), terminal dock with durable seq-log sessions, LocalDriver first (terminal-experience, execution-layer).
- **Phase 4 — Workshop era:** Workshop + shelf + re-verification (workshop-and-artifacts), boss flags + test-out (boss-and-test-out); author modules 2–14 against the enriched schema in parallel (curriculum-content).
- **Phase 5 — Hosted Edition (optional):** hosted-edition — gated on OPEN-QUESTIONS #6.

Ordering must also respect the LANE-DEPENDENCIES blocking graph (event log before everything; beat compiler before lesson experience; skill registry before the engine; gate verdicts before judge-fed evidence and celebrations; seams before testability).

**Source:** DREAM-BLUEPRINT.md §6 "Migration phases"; docs/origin/LANE-DEPENDENCIES.md "The blocking graph".
**Current state (docs/origin/CURRENT-STATE.md):** package.json MODIFIED (monorepo split relocates scripts); nothing built yet (ASSUMPTIONS.md #17 — Phase 0 not started).

**Scenarios:**
1. Given any work item in the program, when scheduled, then no item consumes a contract (event log, beat arrays, skill registry, gate verdicts, seams) whose producing phase has not shipped.
2. Given Phase 1's cutover, when it happens, then the dual-write period demonstrated parity first (REQ-EL-01 scenario 4).

## REQ-MS-02: The regression floor — verified baseline halts {#req-ms-02}

The CURRENT-STATE.md [OBSERVED] verified-working baseline is the regression floor; any migration step that breaks one of these behaviors halts: dashboard/module/lesson rendering with sanitized quiz payloads; profile create/switch/delete with full isolation (401 without cookie); server-side quiz grading with teaching explanations; live Bedrock playground streaming; judge with score-in-code; the full agent loop (spawn → fix → verify → reset); non-localhost 403 + no secrets in client bundle; theme switcher, active-profile indicator, independent nav scroll, per-question quiz cards.

**Source:** docs/origin/CURRENT-STATE.md "Verified-working baseline"; CONSTRAINTS.md #26–29.
**Current state:** this IS the current state; the requirement is that it survives every step.

**Scenarios:**
1. Given any phase's completion, when the baseline checklist is exercised, then every listed behavior still works, or the migration step is halted and rolled back/fixed before proceeding.
2. Given a REPLACED component (dashboard, sidebar, lesson page, LessonRenderer, progress store), when its replacement lands, then the predecessor is retired only after the replacement passes the baseline.

## REQ-MS-03: Never-delete rules {#req-ms-03}

`data/**` (learner progress, profiles) is NEVER deleted; storage migrations import it; JSON files are retired only after verified import, and then archived, not deleted. The future Workshop directory is never bulk-deleted once it exists. `docs/origin/` is append-only. openspec/ and project-level `.claude/` skills stay deleted (owner directive; do not recreate — CONSTRAINTS.md #20 [HARD]).

**Source:** docs/origin/CURRENT-STATE.md "Deletions summary"; CONSTRAINTS.md #19–20.
**Current state:** standing flags.

**Scenarios:**
1. Given any migration or cleanup script in the program, when audited, then no code path deletes `data/**` or the Workshop directory.
2. Given the post-cutover progress store, when checked, then the legacy JSON files exist in an archived location.
