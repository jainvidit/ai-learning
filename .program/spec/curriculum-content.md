# Capability: Curriculum Content

The 14-module curriculum itself: what survives, the protected properties, the spec amendments required before building modules 2–14, module-specific fixes, and the authored artifact chain.

**Depends on:** `content-pipeline.md` (authoring contract, CI gates), `mastery-model.md` (skills to declare), `boss-and-test-out.md` (boss authoring rules), `workshop-and-artifacts.md` (mapping rule), `lesson-experience.md` (beat/session-end conventions), `playground.md` / `terminal-experience.md` (exercise surfaces).
**Depended on by:** everything learner-facing, ultimately.
**Contract owner:** content agents author per module; Atlas stewards the schema; the specs are the authoring source (CONSTRAINTS.md #4 [HARD]: self-contained specs for parallel agents).

---

## REQ-CC-01: The 14-module structure and cross-track convergences are inviolable {#req-cc-01}

The 14-module map (3 tracks: fundamentals, prompting, claude-code) is fundamentally sound; the cross-track prerequisite convergences (05←02+03; 10←06+08; 11←09+10) must never be "simplified" away. Context-engineering depth (module 10: context rot, attention budget, progressive disclosure, compaction, subagent isolation) and autonomous/remote coverage (module 12: /goal, /loop, ultracode, remote tiers, OpenClaw concept-only) are owner [HARD] curriculum requirements (CONSTRAINTS.md #7, #8). OpenClaw is NEVER exercised hands-on (CONSTRAINTS.md #9 [HARD]).

**Source:** LEARNING-DESIGN-REVIEW-SAGE.md §4, §5 item 6; INITIAL-BUILD-PLAN.md curriculum table; CONSTRAINTS.md #7–9.
**Current state (docs/origin/CURRENT-STATE.md):** `content/curriculum.json` MODIFIED — gains skillIds/boss/gate fields; the 14-module structure and prerequisites survive untouched.

**Scenarios:**
1. Given the curriculum DAG after any change, when validated, then modules 05, 10, and 11 retain their recorded cross-track prerequisite edges.
2. Given module 12's built content, when audited, then OpenClaw appears only in concept/quiz material — no exercise invokes any OpenClaw install.
3. Given modules 10 and 12, when built, then their lesson inventories cover the owner-required topics (module 10: attention budget, context rot, progressive disclosure, compaction/memory, subagent isolation; module 12: /goal, /loop, ultracode, remote tiers, ecosystem survey).

## REQ-CC-02: Protected content properties (Sage's "What NOT to change") {#req-cc-02}

Protected, verbatim: (1) explanation-first quiz authoring + misconception-based distractors; (2) judge-the-prompt rubrics, weights-sum-to-100, assessment transparency; (3) the spec-driven authoring pipeline (verbatim fixtures, pristine-must-fail / solution-must-pass verifier contracts, `npm run validate`); (4) module 5's terminal on-ramp shape — reuse for every new interaction type; (5) deterministic verifiers preferred over LLM judges, progressive hints, least-privilege allowedTools; (6) honest minutes, vocabulary contracts (banned-vocabulary lists), and the meta-pedagogy thread — extend, never flatten; (7) the absence of points/streak-shaming/leaderboards.

**Source:** LEARNING-DESIGN-REVIEW-SAGE.md §5; DREAM-BLUEPRINT.md §6 keep-list; GLOSSARY.md "Pristine-must-fail", "Banned vocabulary", "Meta-pedagogy thread".
**Current state:** these are existing, verifiable repo properties [AUDITED] — regression floor for content work.

**Scenarios:**
1. Given any new or modified quiz, when validated, then every explanation states why the right answer is right AND why the tempting distractor is wrong.
2. Given any challenge verifier, when CI runs, then pristine-template-fails and solution-passes are both exercised.
3. Given any new module's first interaction type, when designed, then it follows the module-5 on-ramp shape (concept → read-only → guarded → verified).
4. Given a criterion checkable deterministically, when the exercise is authored, then a deterministic verifier is used rather than an LLM judge.

## REQ-CC-03: Module 1 survives with targeted fixes {#req-cc-03}

Module 1 content survives lightly modified: fix the `# h1` duplication in lessons 04/05 (violates the authoring guide); exercises gain `skillIds`; beat delimiters may be added. Widgets (`NextWordGame.tsx`, `TokenVisualizer.tsx`) survive untouched.

**Source:** LEARNING-DESIGN-REVIEW-SAGE.md §4 (nits); UX-REVIEW-NOVA.md §1 problem 11; CURRENT-STATE.md Module 1 row.
**Current state:** MODIFIED (lightly) per CURRENT-STATE.md. (Sage's "first playground could arrive a lesson earlier" is a noted nit, not a committed change — leave unless a shard owner proposes it explicitly.)

**Scenarios:**
1. Given lessons 01-04 and 01-05, when rendered, then no duplicate `# h1` precedes the page title.
2. Given Module 1 exercises post-migration, when validated, then each carries `skillIds` and all pre-existing prose/exercise content is preserved.

## REQ-CC-04: Spec amendments before building modules 2–14 {#req-cc-04}

Before any module is built from its spec: amend `specs/_TEMPLATE.md` (and `AUTHORING-GUIDE.md`) with boss-finale + test-out sections (Sage #2 — "amend now while 13 modules are unbuilt"), skills declarations, misconception tags, session-end-beat convention, difficulty tiers, and workshop/artifact declarations. Spec format normalization (02–07 vs 08–14 styles) is pending. NOTE ASSUMPTIONS.md #8: no module has ever been built from a spec — self-containedness is untested; the first spec-built module is the dogfood test.

**Source:** LEARNING-DESIGN-REVIEW-SAGE.md §3#2; CURRENT-STATE.md specs rows; ASSUMPTIONS.md #8.
**Current state:** `specs/module-*.md`, `_TEMPLATE.md`, `AUTHORING-GUIDE.md` all MODIFIED (extended, never replaced).

**Scenarios:**
1. Given the amended template, when inspected, then it requires: skills (4–6), a boss definition, test-out probe definitions, misconception tags, session-end beat, difficulty tiers, and workshop/artifact declarations where applicable.
2. Given the first module built from an amended spec, when completed, then the build required only the spec + guide + schema (self-containedness dogfood), and any gaps found were fed back into the template.

## REQ-CC-05: Module-specific commitments — module 12 weakness, module 13 gate, capstone {#req-cc-05}

- **Module 12** is the identified weak link (lessons 2–5 are concept tours right before the scaffold-free capstone). Mitigation options recorded by Sage: make 12-L1's goal-lab the module boss; demote survey content to optional reading; or merge into 11. The choice among them is NOT settled — see OPEN-QUESTIONS.md #8.
- **Module 13→14 gate**: 13 requires only 10 (loose the other way; harmless) — add a vocabulary check per Sage.
- **Capstone (module 14)**: genuinely integrates (stage 5 re-grading stage 1's CLAUDE.md is the best assessment idea in the course — protect it); but stages 3–4 must verify USE, not existence: make Claude *use* the skill and make the hook observably fire. The Workshop resolves the capstone's persistent-sandbox assumption exactly.

**Source:** LEARNING-DESIGN-REVIEW-SAGE.md §4.
**Current state:** module 12/13/14 exist as specs only; amendments land in the specs before build.

**Scenarios:**
1. Given the module 14 spec/build, when stages 3–4 verify, then the skill is demonstrated in use and the hook observably fires (not mere file existence).
2. Given the module 14 spec/build, when stage 5 runs, then it re-grades stage 1's CLAUDE.md (integration preserved).
3. Given module 13's spec/build, when its entry is validated, then a vocabulary check covering prerequisite terms exists.
4. Given module 12's build, when it starts, then the recorded weakness has a chosen mitigation (from OPEN-QUESTIONS #8 resolution) applied — building it as-is with no decision is non-compliant.

## REQ-CC-06: Quiz answer-reveal policy change {#req-cc-06}

Answer keys are withheld until pass (Sage #1: quizzes are brute-forceable today because retry re-presents the same questions whose answers were just displayed); Nova's collapsed-passed "Review answers" appears only post-pass; per-question misses start being recorded as events. CURRENT-STATE.md explicitly notes this CONTRADICTS current behavior (which returns all answers on any submission) — it is a deliberate change, not an accident.

**Source:** CURRENT-STATE.md quiz-submit row; LEARNING-DESIGN-REVIEW-SAGE.md §1a, §2 ("failure is *too* cheap where it reveals answers"). Interaction with review variants: REQ-SR-03 (retries/reviews serve variants, not the just-revealed item).
**Current state:** `api/quiz/submit` MODIFIED; `Quiz.tsx` MODIFIED (retry-preserves-correct already done, survives).

**Scenarios:**
1. Given a failed quiz submission, when the response renders, then explanations for the learner's answered questions teach, but the full answer key is not revealed for retry-gaming.
2. Given a passed quiz, when revisited, then a "Review answers" disclosure is available.
3. Given any quiz submission, when recorded, then per-question results (including misses) land as events (no longer discarded at write time).
