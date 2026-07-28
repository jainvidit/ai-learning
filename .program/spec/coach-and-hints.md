# Capability: Coach & Hint Ladder

The Socratic tutor persona ("Coach"), the server-enforced four-rung hint ladder ending in full guidance, data-plane isolation, and leak checks.

**Depends on:** `model-gateway.md` (tutor model calls; Opus-class for deep rungs), `judge-pipeline.md` (missed-criterion IDs feed the coach context), `mastery-model.md` (struggle-halt trigger REQ-MM-05; rung-4 evidence accounting), `event-log-and-projections.md` (hint_revealed events).
**Depended on by:** `lesson-experience.md` (coach margin-note UI, "Guide me through it" mode).
**Contract owner:** Priya owns ladder mechanics and leak rules; Sage owns rung-4 mastery accounting; Nova owns UI copy (LANE-DEPENDENCIES "Hint-ladder rung semantics" row).

---

## REQ-CH-01: Strict context contract and data-plane isolation {#req-ch-01}

The tutor receives ONLY: objectives, instructions, rubric descriptions (no weights), missed-criterion IDs, the current draft, and the server-held ladder position. It NEVER receives answer keys, verifier sources, exemplar solutions, unrevealed authored hints, or `improvedPromptExample`. It cannot leak what it does not hold.

**Invocation-context domain (closed-world, ADR-0022):** The data-plane isolation contract applies to exactly six enumerated contexts: (1) playground exercises (lesson-embedded), (2) quiz exercises (lesson-embedded), (3) challenge exercises (lesson-embedded, terminal-paired), (4) boss exercises (module-level integrative, follows underlying type's rules), (5) test-out probes (follows underlying probe type's rules), (6) spaced-review warm-up items (follows underlying variant type's rules). New exercise types or beat types do NOT invoke the tutor until explicitly added via additive ADR (fail-closed default). Each context has defined isolation obligations (context IN/OUT, leak check, rung-4 method-not-artifact constraints where applicable) enumerated in ADR-0022.

**Source:** DREAM-BLUEPRINT.md §3 "Tutor (Coach)"; LEARNING-DESIGN-REVIEW-SAGE.md §3#5 ("Data-plane isolation: the tutor never holds answer keys"); GLOSSARY.md "Data-plane isolation".
**Current state (docs/origin/CURRENT-STATE.md):** new service; no tutor exists today (Sage §2: "beyond hint 3 a stuck learner has nowhere to go").

**Scenarios:**
1. Given any tutor invocation in an enumerated context (ADR-0022: playground/quiz/challenge/boss/test-out/review), when its assembled context is inspected, then none of: answer keys, verifier source code, exemplar solutions, rubric weights, passingScore, or `improvedPromptExample` are present. Per-context isolation obligations (what constitutes an "answer key" or "verifier source" for each context, rung-4 method-not-artifact constraints) are defined in ADR-0022.
2. Given the ladder position, when a tutor call is made, then the position came from server state, not from any client-supplied value.

## REQ-CH-02: On-demand affordance; struggle-watcher surfaces, never auto-opens {#req-ch-02}

An on-demand "Get a hint on my draft" button is always available. The struggle-watcher (attempts > N, repeated same-criterion misses, dwell ≫ estimate; three fails per REQ-MM-05) only surfaces the affordance — it never auto-opens the coach. Always-on critique was REJECTED (destroys desirable difficulty — REJECTED.md).

**Source:** DREAM-BLUEPRINT.md §3 "Tutor (Coach)", §8 aligned decision 6; UX-REVIEW-NOVA.md §3 "Coach (playground)" and "Struggle/rescue".
**Current state:** new UI affordance in the playground/challenge surfaces.

**Scenarios:**
1. Given any exercise with coach support, when rendered at any time, then the on-demand coach button is present regardless of struggle state.
2. Given struggle signals crossing thresholds, when they fire, then the coach affordance is visually surfaced (highlighted/suggested) and the coach panel has NOT opened without a learner click.

## REQ-CH-03: Four-rung ladder ending in full guidance; server-enforced {#req-ch-03}

Ladder (server-held position, sequential): (1) reflective question → (2) micro-explanation of the learner's own attempt → (3) worked example in a different domain → (4) full step-by-step guided walkthrough of the solution method for this exact problem. Rung 4 is always reachable — never a dead end (CONSTRAINTS.md #16 [HARD]) — but stops short of the literal passing artifact (method-not-artifact: never the exact option letter, verbatim passing prompt, or finished diff). Note ASSUMPTIONS.md #33 [INFERRED]: the method-not-artifact line is the team's reconciliation, not owner-itemized.

**Source:** DREAM-BLUEPRINT.md §3 "Tutor (Coach)", §8 user directives; CONSTRAINTS.md #16; LEARNING-DESIGN-REVIEW-SAGE.md §3#5; GLOSSARY.md "Hint ladder / rungs", "Method-not-artifact".
**Current state:** today's per-challenge progressive hints (unlock one per failed verify) survive as authored content; the ladder is the new escalation structure above them.

**Scenarios:**
1. Given a learner at rung 2, when they request more help, then rung 3 is served; the ladder never skips ahead of the server-held position and never refuses to advance to rung 4.
2. Given rung 4 output for a quiz, playground, or challenge, when inspected, then it walks the full method step-by-step yet does not contain the literal correct option ID, a verbatim passing prompt, or a complete passing diff/file.
3. Given a learner who exhausts rung 4, when they ask again, then they are not dead-ended (rung 4 re-explains; the path to completion remains open).

## REQ-CH-04: Rung-4-assisted passes emit reduced/zero mastery evidence; redemption probe {#req-ch-04}

A pass achieved after rung 4 grants completion credit but reduced/zero mastery evidence; the skill stays in review rotation and full credit is restored later via an indistinguishable isomorphic warm-up probe (redemption probe). Rung-4 usage is logged as an authoring-quality signal, never punitively surfaced to the learner.

**Source:** DREAM-BLUEPRINT.md §3 "Tutor (Coach)", §8 user directives; LEARNING-DESIGN-REVIEW-SAGE.md §3#5; GLOSSARY.md "Redemption probe"; UX-REVIEW-NOVA.md §3 ("'Guided' evidence tag with no penalty language").
**Current state:** new accounting on the event log.

**Scenarios:**
1. Given a pass immediately following rung-4 guidance, when evidence is recorded, then completion is credited and mastery evidence is reduced or zero, and the skill remains scheduled for review.
2. Given the later isomorphic redemption probe passes, when evidence is recorded, then full mastery credit flows normally.
3. Given the redemption probe as served, when compared to normal warm-up items, then it is presentationally indistinguishable (no "redemption" labeling to the learner).
4. Given rung-4 usage stats, when surfaced, then they appear in authoring-quality telemetry, never as learner-facing penalty language.

## REQ-CH-05: No-numerics output schema and post-response leak check {#req-ch-05}

The tutor's output schema has no numeric fields (score leaks structurally impossible). Every response passes a post-response leak check (n-gram duplication vs solutions and `judgeCriterion` reuse) → on failure regenerate once → on second failure fall back to the authored hint rung. The coach is visually a margin note explicitly labeled "not your grade."

**Source:** DREAM-BLUEPRINT.md §3 "Tutor (Coach)"; UX-REVIEW-NOVA.md §3 "Coach" ("schema-level guarantee it can never show a score" [TEAM: Priya]); GLOSSARY.md "No-numerics schema".
**Current state:** new; `judgeCriterion` helper survives from today's judge.ts and is reused by the leak check.

**Scenarios:**
1. Given the tutor output JSON schema, when inspected, then it contains no numeric-typed fields.
2. Given a tutor response that duplicates solution n-grams, when the leak check runs, then the response is regenerated once; if the regeneration also fails, the authored hint rung is served instead.
3. Given the coach UI, when rendered, then it is a margin-note treatment labeled "Coach — not your grade" (owner-visible copy per Nova's frozen design).
