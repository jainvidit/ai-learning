# Capability: Mastery Model

Per-skill discrete mastery states, evidence-counted promotion, the judge-noise firewall, module states, and adaptive item selection. All thresholds in this shard are literature-principled targets, never measured on this product (docs/origin/ASSUMPTIONS.md #10) — the numbers are binding as shipped defaults, not as validated truths.

**Depends on:** `event-log-and-projections.md` (evidence events, SkillState projection — LANE-DEPENDENCIES block 1), `content-pipeline.md` (skill registry via `skillIds` — block 3), `judge-pipeline.md` (gate-tier verdicts are the only judge events that feed evidence — block 4).
**Depended on by:** `spaced-review.md`, `boss-and-test-out.md`, `dashboard-and-wayfinding.md` (mastery display), `coach-and-hints.md` (rung-4 evidence accounting).
**Contract owner:** Sage owns mastery vocabulary and projection semantics; Nova renders states verbatim, no UI-invented states (LANE-DEPENDENCIES "Mastery vocabulary" row).

---

## REQ-MM-01: Skill registry — 4–6 skills per module, declared in content {#req-mm-01}

Each module declares 4–6 named skills (~60–80 total), mapped from rubric criteria and exercises via `skillIds`. Skills are the unit of mastery tracking; until content carries skills, the engine has nothing to track.

**Source:** DREAM-BLUEPRINT.md §4 "Mastery model"; LEARNING-DESIGN-REVIEW-SAGE.md §3#1; LANE-DEPENDENCIES block 3; GLOSSARY.md "Skill".
**Current state (docs/origin/CURRENT-STATE.md):** `content/curriculum.json` MODIFIED (gains skillIds/boss/gate fields); Module 1 exercises MODIFIED to gain skillIds.

**Scenarios:**
1. Given any built module, when its content is validated, then it declares between 4 and 6 skills and every required exercise maps to ≥1 of them via `skillIds`.
2. Given a `skillId` referenced by an exercise, when CI runs, then the reference resolves against the module's skill registry or the build fails (cross-link: content-pipeline REQ-CP-06).

## REQ-MM-02: Discrete states with evidence-counted promotion; never demote {#req-mm-02}

Per-skill states: `Introduced → Practiced → Fluent`.
- Introduced→Practiced: 2 clear positive evidence events ≥2 sessions apart.
- Practiced→Fluent: 3 clear positives across ≥2 evidence types **including ≥1 deterministic** (verifier/quiz-key) success AND FSRS stability ≥21 days.
- **Never demote.** Failures reset scheduler stability invisibly. The only decay surface is "worth a refresh" after 45+ idle days plus a missed probe (returns Fluent→Practiced through that gentle path only, per GLOSSARY.md).
- The UI shows the literal evidence events, never a fabricated percent. EMA continuous mastery was proposed and KILLED (REJECTED.md — reopening it is a freeze-challenge); a continuous estimator survives only as an internal item-selection signal, never learner-facing.

**Source:** DREAM-BLUEPRINT.md §4 "Mastery model", §8 aligned decision 3; LEARNING-DESIGN-REVIEW-SAGE.md §3#1; REJECTED.md "EMA continuous mastery score".
**Current state:** new; today `recordExerciseAttempt` marks passed-forever on first pass (Sage §1a) — replaced by this model via the event log.

**Scenarios:**
1. Given a skill with 2 clear positives in the same session, when promotion is evaluated, then the skill remains Introduced (≥2 sessions apart not met).
2. Given a skill with 2 clear positives ≥2 sessions apart, when the second lands, then the skill becomes Practiced.
3. Given a Practiced skill with 3 clear positives all from judge verdicts (zero deterministic), when promotion is evaluated, then it does NOT become Fluent.
4. Given a Practiced skill meeting all Fluent conditions except FSRS stability ≥21 days, when promotion is evaluated, then it does NOT become Fluent.
5. Given a Fluent skill and any number of subsequent failures, when state is read, then it is still Fluent (never demote); scheduler stability was reset without UI surface. **Failure-pattern domain (ADR-0020):** "Any number of subsequent failures" quantifies over six enumerated patterns (consecutive clear-misses, scattered failures interleaved with passes, in-band failures 0.4–0.7, cross-skill bursts, long-idle return with probe miss, low-confidence reversions). Each pattern has defined testable behavior; new patterns join via additive ADR. Closed-world: patterns outside the enumeration default to the most similar listed pattern.
6. Given a Fluent skill idle 45+ days that then misses a probe, when state surfaces are read, then "worth a refresh" is shown (and this is the only decay surface).
7. Given any learner-facing mastery surface, when inspected, then no continuous mastery number or percent appears — only discrete states and literal evidence events.

## REQ-MM-03: The judge-noise firewall {#req-mm-03}

Normalized judge score <0.4 = clear-miss (grades Again); >0.7 = clear-pass (grades Good); **0.4–0.7 emits a scheduler grade but ZERO mastery evidence**. The judge never emits Easy; no source emits Hard (REJECTED.md — "Hard-vs-Good is exactly where judge variance lives"). Low ensemble confidence forces in-band treatment — confidence can shrink evidence, never amplify it. Only gate-tier verdicts count toward Fluent, boss, and test-out. Firewall thresholds interpret Priya's normalized score — threshold changes need BOTH Sage's and Priya's sign-offs (LANE-DEPENDENCIES "Judge verdict shape" row).

**Source:** DREAM-BLUEPRINT.md §4 "The judge-noise firewall (frozen)", §8 aligned decision 3; LEARNING-DESIGN-REVIEW-SAGE.md §3#1; GLOSSARY.md "Judge-noise firewall", "Vote-agreement confidence".
**Current state:** new; today judge noise is unmodeled (Sage §1f: 59 fails, 61 passes).

**Scenarios:**
1. Given a gate-tier judge verdict with normalized score 0.55, when it is processed, then a scheduler grade is emitted and zero mastery evidence is recorded.
2. Given a normalized score 0.35, when processed, then it grades Again; given 0.75, then it grades Good.
3. Given any judge verdict, when its scheduler grade is derived, then it is never Easy; given any evidence source whatsoever, then the grade is never Hard.
4. Given a clear-pass verdict with low vote-agreement confidence, when evidence is recorded, then the evidence is shrunk or treated in-band — never amplified.
5. Given a draft-tier verdict of any score, when the learner model is checked, then it received nothing (only gate-tier verdicts touch mastery — cross-link: judge-pipeline REQ-JP-02).

## REQ-MM-04: Module states with Mastered = MIN over skills {#req-mm-04}

Per-module states: `Locked → Available → In progress → Complete → Mastered`. Mastered = MIN over the module's skills (not average) and requires the boss (cross-link: boss-and-test-out REQ-BT-01).

**Source:** LEARNING-DESIGN-REVIEW-SAGE.md §3#1 (module states); UX-REVIEW-NOVA.md §2 mastery-states row [TEAM]; GLOSSARY.md "Module states". (The blueprint text itself does not restate the module-state ladder; the two reviews and glossary agree on it.)
**Current state:** `src/lib/content.ts` gating MODIFIED — `isModuleUnlocked` survives; new states layer on top.

**Scenarios:**
1. Given a module whose skills are all Fluent except one Practiced, when module state is computed, then it is not Mastered (MIN rule).
2. Given a module with all skills Fluent but the boss unpassed, when module state is computed, then it is Complete at most, not Mastered.

## REQ-MM-05: Adaptive difficulty is item selection, never live content rewriting {#req-mm-05}

Items are tagged {skill, tier: intro/core/stretch}; selection targets ~80% success by state + retrievability; two fails step down a tier and inject a prerequisite probe; three fails trigger struggle-halt into the tutor ladder at the reflective rung (cross-link: coach-and-hints REQ-CH-03). Challenge passes propagate 0.25× credit to direct prerequisite skills.

**Struggle-signal domain (ADR-0021):** "Any struggling learner" quantifies over exactly FOUR enumerated triggers: (1) two consecutive clear-misses on the same skill → tier-stepping + prerequisite probe; (2) three failures on a skill → struggle-halt, coach affordance surfaced; (3) attempted-only completion → zero mastery evidence; (4) rung-4-assisted pass → reduced/zero evidence + redemption probe. Patterns outside this enumeration receive standard item selection (state + retrievability, no tier-stepping, no coach-surfacing, evidence per firewall). Timing-based triggers are REJECTED (REJECTED.md line 42: violates non-competitive constraint). Enumeration is closed-world; new triggers require additive ADR. Testable per-trigger behavior and detection rules recorded in ADR-0021.

**Source:** DREAM-BLUEPRINT.md §4 "Adaptive difficulty"; GLOSSARY.md "Struggle-halt"; ADR-0021 (struggle-trigger domain enumeration).
**Current state:** new; no adaptivity exists today.

**Scenarios:**
1. Given a learner failing the same skill twice (consecutive clear-misses), when the next item is selected, then it is one tier lower and a prerequisite probe is injected (Trigger 1 per ADR-0021).
2. Given a third failure on a skill, when it lands, then difficulty escalation stops and the tutor ladder opens at the reflective rung (affordance surfaced, not auto-opened — cross-link: coach-and-hints REQ-CH-02; Trigger 2 per ADR-0021).
3. Given a challenge pass on an item, when evidence propagates, then direct prerequisite skills receive 0.25× credit and non-prerequisites receive none.
4. Given any learner matching an enumerated struggle trigger (ADR-0021 Triggers 1–4), when content is served, then the item text itself is a pre-authored/pre-validated variant — the system never rewrites content live. Given a struggle pattern outside the enumeration (e.g., single isolated failure, cross-skill burst), when the next item is served, then standard selection applies (state + retrievability, no trigger-specific adaptivity).

## REQ-MM-06: Anti-requirements enforced by schema absence {#req-mm-06}

No points, XP, leaderboards, or competitive comparison — these fields do not exist in the data model, so they cannot creep in. CONSTRAINTS.md #12 [HARD].

**Source:** DREAM-BLUEPRINT.md §4 "Anti-requirements", §8 user directives; CONSTRAINTS.md #12; REJECTED.md (XP/levels, leaderboards, badges, bronze/silver/gold all rejected).
**Current state:** already true today; must stay true.

**Scenarios:**
1. Given the full event and projection schemas, when searched, then no field exists for points, XP, levels, leaderboard rank, or cross-learner comparison.
2. Given the UI, when any learner-facing surface is audited, then no competitive comparison against other people appears.
