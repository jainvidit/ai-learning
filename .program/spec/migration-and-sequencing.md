# Capability: Migration & Sequencing

The phase plan from the current app to the dream version, the regression floor, and the never-delete rules. This shard owns the *ordering and safety* requirements; each phase's feature content lives in its capability shard.

**Depends on:** all shards (it sequences them). Phase→shard map below.
**Depended on by:** program planning (decomposition must respect this ordering and docs/origin/LANE-DEPENDENCIES.md's blocking graph).
**Contract owner:** Atlas (sequencing); the phases ship value and de-risk the next even with unlimited devs (blueprint §6).

---

## REQ-MS-01: Phase ordering {#req-ms-01}

- **Phase 0 — Forced foundations:** Velite migration (REQ-CP-01), beat compiler (REQ-CP-02), workspace split — **packages only** (`packages/content-schema`, `packages/learning-engine`, seam packages) behind **exactly one Next.js app and one process; no `apps/api`** — oRPC layer (REQ-API-02), AgentRunner/ModelGateway seams + fakes (REQ-EX-04, REQ-MG-03), CI (REQ-TC-03). RESOLVED by ADR-0002 (OPEN-QUESTIONS #7 closed): the blueprint's `apps/web` + `apps/api` split is a second deployable, which is the production-service shape CONSTRAINTS.md #15 [HARD] rejects. Package extraction is additive and reversible; a second deployable reshapes run/ops/docs. An `apps/api` can be added later by moving the already-extracted packages behind it — the package boundaries are the hard part and they get built either way.
- **Phase 1 — Event log under the floorboards:** `learning_events` + projections behind the existing progress API; dual-write, then cutover (REQ-EL-01/03); Judge v2 (REQ-JP-01/02/03/04).
- **Phase 2 — Learning engine:** skill registry (REQ-MM-01), FSRS + review warm-up (spaced-review), mastery states (mastery-model), adaptive selection (REQ-MM-05), variant bank + human review (content-generation), Coach with ladder enforcement (coach-and-hints).
- **Phase 3 — Experience layer:** hero dashboard, metro map (dashboard-and-wayfinding), beat pacing (lesson-experience), motion/celebrations (REQ-FP-04), terminal dock with durable seq-log sessions, LocalDriver first (terminal-experience, execution-layer).
- **Phase 4 — Workshop era:** Workshop + shelf + re-verification (workshop-and-artifacts), boss flags + test-out (boss-and-test-out); author modules 2–14 against the enriched schema in parallel (curriculum-content).
- **Phase 5 — Hosted Edition (optional):** hosted-edition — gated on OPEN-QUESTIONS #6.

Ordering must also respect the LANE-DEPENDENCIES blocking graph (event log before everything; beat compiler before lesson experience; skill registry before the engine; gate verdicts before judge-fed evidence and celebrations; seams before testability).

**Source:** DREAM-BLUEPRINT.md §6 "Migration phases"; docs/origin/LANE-DEPENDENCIES.md "The blocking graph".
**Current state (docs/origin/CURRENT-STATE.md):** package.json MODIFIED (monorepo split relocates scripts); nothing built yet (ASSUMPTIONS.md #17 — Phase 0 not started).

**Scenarios** (each states the check that decides it — a scenario whose verb is "audited",
"checked" or "exercised" without a named procedure cannot fail, and six of these were in that
shape until 2026-07-27):
1. **Ordering respected.** CHECK: for every `ready`/`in_progress` item, read its
   `depends_on` and the phase of each dependency in `.program/ledger/`. PASS = no item's
   phase number is lower than the phase of any contract it consumes (event log, beat arrays,
   skill registry, gate verdicts, seams). FAIL = one such pair exists; name both IDs.
   Mechanized by `.program/audits/ownership-overlap-scan/scan-globs.py`'s sibling check at
   each phase boundary.
2. **Cutover follows demonstrated parity.** CHECK: before ROOT.2's read-cutover item may
   move to `done`, its `verification:` block must cite a parity artifact under
   `.program/audits/` that names a row/record count for both the JSON store and the event
   projection. PASS = counts equal, artifact path recorded. FAIL = artifact absent, or
   counts differ by any amount. "Parity was observed" without the two numbers is a FAIL.

## REQ-MS-02: The regression floor — verified baseline halts {#req-ms-02}

The CURRENT-STATE.md [OBSERVED] verified-working baseline is the regression floor; any migration step that breaks one of these behaviors halts: dashboard/module/lesson rendering with sanitized quiz payloads; profile create/switch/delete with full isolation (401 without cookie); server-side quiz grading with teaching explanations; live Bedrock playground streaming; judge with score-in-code; the full agent loop (spawn → fix → verify → reset); non-localhost 403 + no secrets in client bundle; theme switcher, active-profile indicator, independent nav scroll, per-question quiz cards.

**Source:** docs/origin/CURRENT-STATE.md "Verified-working baseline"; CONSTRAINTS.md #26–29.
**Current state:** this IS the current state; the requirement is that it survives every step.

**Scenarios:**
1. **Baseline survives the phase.** CHECK: at every phase gate, `dream-gate-verifier` runs
   the 11-item checklist above and writes one evidence doc under `.program/audits/` recording,
   per item, `PASS` / `FAIL` / `UNVERIFIED` plus the command or URL exercised. PASS = 11 PASS,
   0 FAIL, 0 UNVERIFIED. FAIL = any FAIL. **`UNVERIFIED` is not a pass** — it means the check
   did not run, and the gate is not green until it does. Any FAIL halts the phase: roll back
   or fix before the next item is dispatched.
2. **Predecessor retired only after the replacement passes.** CHECK: for each REPLACED
   component (dashboard, sidebar, lesson page, LessonRenderer, progress store), the commit
   that deletes the predecessor must be later than the gate evidence doc in which that
   component's baseline item reads PASS. PASS = deletion commit timestamp is after that
   doc's, and the doc says PASS for that specific item. FAIL = predecessor deleted with the
   item UNVERIFIED or FAIL, or with no gate doc naming it.

## REQ-MS-03: Never-delete rules {#req-ms-03}

`data/**` (learner progress, profiles) is NEVER deleted; storage migrations import it; JSON files are retired only after verified import, and then archived, not deleted. The future Workshop directory is never bulk-deleted once it exists. `docs/origin/` is append-only. openspec/ and project-level `.claude/` skills stay deleted (owner directive; do not recreate — CONSTRAINTS.md #20 [HARD]).

**Source:** docs/origin/CURRENT-STATE.md "Deletions summary"; CONSTRAINTS.md #19–20.
**Current state:** standing flags.

**Scenarios:**
1. **No delete path reaches protected trees.** CHECK: grep every script the program adds
   (`.program/**/*.py`, `scripts/**`, `src/**` migration code, any `package.json` script) for
   the delete verbs `rm`, `rmdir`, `unlink`, `rmtree`, `Remove-Item`, `fs.rm`, `fs.unlink`,
   `del`, `truncate`, and for each hit resolve the target path. PASS = zero hits whose target
   is under `data/**`, the Workshop directory, or `docs/origin/**`. FAIL = one or more; quote
   the file, line and resolved target. A hit whose target is a variable or glob that *could*
   resolve into a protected tree is a FAIL, not a pass — this fails closed, matching the hook.
   **AMENDED 2026-07-27 per ADR-0028:** the canonical closed-world verb list is `rm`, `rmdir`,
   `unlink`, `rmtree`, `Remove-Item`, `fs.rm`, `fs.rmSync`, `fs.rmdir`, `fs.rmdirSync`,
   `fs.unlink`, `fs.unlinkSync`, `del`, `truncate`, `rimraf`. Additions require an additive
   ADR. The exact grep procedure, exclusions (node_modules, .program/ledger/, test files), and
   hit classification rules are in ADR-0028. Allowed exceptions (e.g., .program/ledger/append-
   event.py temp-file cleanup) are named in the ADR and recorded in each Gate evidence doc.
2. **Legacy JSON archived, not deleted.** CHECK: after the ROOT.2 cutover, count files
   matching `data/progress/*.json` at their original path plus the archive path. PASS =
   `original_count == archive_count` and every original filename appears in the archive, with
   both counts recorded in the item's `verification:` block. FAIL = any file present in
   neither location, or counts unequal. NOTE: the archival move itself is PARKED
   (`DECISIONS-PENDING.md`, ROOT.2.4) and requires owner authorization, so until then the
   PASS condition is `original_count > 0 and archive_count == 0` — files untouched in place.
