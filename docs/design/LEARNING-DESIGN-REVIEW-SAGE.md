# Learning Design Review — AI Mastery Learning App

**Reviewer:** Sage (game-based-learning lane of the dream-team blueprint effort). Curriculum, pedagogy, progression mechanics — review only; no files modified.
Grounded in: `content/curriculum.json`, all 5 lessons of `content/modules/01-how-llms-work/`, `specs/AUTHORING-GUIDE.md`, `specs/_TEMPLATE.md`, module specs 02/03/05/10/12/14 (+ samples of the rest), `src/lib/schema.ts`, `src/lib/content.ts`, `src/lib/progress.ts`, and the exercise API routes.
Constraints honored: non-competitive, intrinsic-motivation-first, effort-unconstrained ideal design. Frozen team decisions are recorded in docs/DREAM-BLUEPRINT.md.

**Verdict up front:** the content craft is unusually good — the quiz explanations, the observe-then-explain experiments, and the challenge/hint design are better than most commercial products. The structural layer around that content is where the design is weak: completion is not mastery, nothing is ever reviewed again, the learner has zero meaningful choice, and the only reward in the entire system is an unlocked next lesson.

**Provenance legend** (added post-hoc for the recovery record):
**[AUDITED]** = checked against this repo's actual code/content/specs at review time — file-referenced, re-verifiable.
**[REASONED]** = design proposal or learning-science argument derived from the audit + blueprint — unbuilt hypothesis; thresholds and mechanics in these sections are principled but empirically unvalidated (see docs/origin/ASSUMPTIONS.md #10).

---

## 1. Learning-science audit
*Provenance: **[AUDITED]** — grounded in the named files (schema.ts, progress.ts, the API routes, Module 1 content, sampled specs). The brute-force and auto-pass mechanics were read from code; the pedagogical judgments layered on them are expert reasoning.*

### What the design gets right
- **Feedback quality is the best thing in this app.** Quiz explanations teach rather than confirm — every explanation states why the right answer is right *and* why the tempting distractor is wrong; distractors are authored as plausible misconceptions. The playground judge returns per-criterion feedback quoting the learner's own words plus an improved example prompt. Elaborative feedback at a level most commercial products don't reach.
- **Rubrics grade the prompt, not the model's reply** — the stable artifact, not the dice roll. Weights sum to 100; passable while missing the lowest-weight criterion. Defensible assessment design.
- **Exercises test application, not just recognition.** Quiz → playground → terminal → challenge is a real transfer ladder. Module 10's needle-in-haystack pair and context-rot script are *experiments the learner runs on the model* — prediction-observation-explanation pedagogy done properly.
- **Cognitive load in Module 1 is well managed.** Concrete-before-abstract everywhere, one big idea per lesson, misconception sections, honest minutes, deliberate seeding of later concepts.

### Where it violates evidence-based practice
- **(a) Mastery is completion in disguise.** `recordExerciseAttempt` marks an exercise passed forever on first pass; nothing ever asks again. Quizzes are brute-forceable: retry re-presents the same fixed questions whose answers were just displayed. The system measures exposure, not durable competence.
- **(b) Zero retrieval practice or spacing — the single largest gap.** Missed quiz questions (the highest-value signal collected) are discarded at write time. Over a weeks-to-months solo journey this is the difference between producing an expert and producing someone who *was briefly right about each topic once*. By module 10, modules 1–4 knowledge will be substantially decayed exactly when the flagship module assumes it.
- **(c) Interleaving: right skeleton, unexploited.** Tracks interleave at module level and the prerequisite DAG genuinely cross-tracks (05←02+03; 10←06+08; 11←09+10 — the convergences are the best structural idea in the curriculum). But within modules practice is fully blocked, the DAG's latent choice is flattened by presentation, and no exercise mixes skills from two modules until module 14.
- **(d) Worked examples exist in prose, absent in exercise flow.** No graded worked example before production; `starterPrompt` scaffolding underused; guidance never fades — even expert-level playgrounds enumerate every rubric element (transcription, not discrimination).
- **(e) Lesson completion is a hidden all-or-nothing gate.** One stubborn exercise (or one judge false-negative) hard-blocks everything downstream. Mastery learning requires eventual gap-closure, not synchronous mastery.
- **(f) Judge noise is unmodeled.** 59 fails, 61 passes; LLM judges wobble ±10 on borderline prompts. Mid-band scores should be "no signal," not verdicts.

---

## 2. Game-design audit
*Provenance: **[AUDITED]** for what the app/specs contain (gating code, module 5/10/12/14 spec contents, hint mechanics); **[REASONED]** for the motivational consequences claimed (wall-vs-ladder, session heartbeat) — no learner behavior was ever observed.*

- **Difficulty curve:** module 5's terminal on-ramp is exemplary (concept → read-only → guarded edit → permissions → verified boss, with safety reassurance). Real spikes: module 10 (earned), module 12→14 (12's lessons 2–5 are concept+quiz only — a trough at the climax — then 14 removes all scaffolding at once). Late modules are quiz-heavy: recognition-testing experts, the inverse of the transfer ladder's promise.
- **Gating:** hard prerequisite locks everywhere; 13 locked modules on day one is a wall, not a ladder. Hard gates are defensible exactly twice (module 5, module 14). The DAG's genuine forks (02 vs 03; 06/07/08) are never surfaced as choices.
- **Pacing & session design:** honest lesson minutes; but no end-of-session beat, no module-completion moment, no return-visit structure. The app has no heartbeat between sessions.
- **Player agency:** effectively zero — no track ordering, no skip/placement, no optional content.
- **Failure design:** safe and informative (sandboxes disposable, hints earned by failure, rich judge feedback) — but failure is *too* cheap where it reveals answers, failures are never used, and beyond hint 3 a stuck learner has nowhere to go.
- **Reward structure:** the learner gets an unlocked next lesson. Full stop. The content already builds proud-making artifacts (CLAUDE.md, skills, hooks) and the mechanics throw them away with each sandbox reset. The biggest missed intrinsic lever: accumulation.

---

## 3. Five most impactful structural changes (ranked; team-frozen versions)
*Provenance: **[REASONED]** — unbuilt design. All thresholds (evidence counts, 0.4–0.7 dead zone, 21-day stability, FSRS grade mapping) are literature-principled targets, not measurements from this product.*

### #1 — Spaced retrieval engine over a per-skill mastery model
4–6 named skills per module; exercises map to skills with weights. **FSRS-6 with frozen default weights** (ts-fsrs), one card per skill, ±10% fuzz, never per-learner fitted. Grade mapping: deterministic fail→Again, pass→Good, first-attempt-no-hints→Easy; **judge scores <0.4→Again, 0.4–0.7→scheduling only with ZERO mastery evidence (the judge-noise firewall), >0.7→Good; judge never emits Easy; no source emits Hard.** Review items are isomorphic variants, never verbatim. Delivery: skippable 2–3-item warm-up at lesson start + on-demand queue; due-count capped (~6, "9+"); post-lapse "5-minute warm-up"; no "overdue" labels; 21+-day-gap first-miss amnesty.
**Mastery states (learner-facing, discrete):** per-skill **Introduced → Practiced → Fluent** (Practiced = 2 clear positives ≥2 sessions apart; Fluent = 3 clear positives across ≥2 evidence types, ≥1 deterministic, stability ≥21 days). **Never demote**; 45+ idle days + missed probe → "worth a refresh." Per-module: Locked → Available → In progress → Complete → **Mastered** (MIN over skills).
Requires the **append-only event log** — the deep schema change everything else rides on. Also fixes (e): with guaranteed review, allow "continue with this unresolved" after N attempts.

### #2 — Boss finales + test-out per module
One boss per module (`role: "boss"` flag; challenge preferred; instructions must NOT enumerate the rubric — the missing faded-guidance step). Boss gates **Mastered**, never Complete. Test-out = boss-equivalent probe (different fixture) + concept quiz + hands-on probe; full pass marks lessons complete with identical presentation (no stigma), seeds skills at Practiced (never Fluent). Amend `_TEMPLATE.md` now while 13 modules are unbuilt.

### #3 — Persistent Workshop sandbox + artifact shelf
One git-backed workshop per profile alongside throwaway drill sandboxes. App-owned checkpoints (auto-commit before workshop exercises, `good/<exerciseId>` tags, restore-forward only, no hard reset, nightly bundle backup — learner never sees git). Mapping rule: an exercise lives in the Workshop iff a later module reads/extends/re-verifies its artifact (m5 founds it → m7 CLAUDE.md → m9 skill+hook → m10 restructure *your own* bloat → m11 subagent audit → m14 capstone graduates inside it). **Artifact shelf**: capability-verified records with live health; regressions = non-blocking banner + one-click repair session; repairing emits positive evidence. Converts the reward layer from checkmarks to accumulation.

### #4 — Session beats: lesson closure + module celebration + frontier choice
Every lesson ends with recap ("you can now…" mapped to objectives) + one retrieval question + a curiosity hook. Module completion names what was mastered and *offers the frontier* as an explicit choice. Soften the 12 "coming soon" cards into a horizon view. Lowest cost; do first if sequencing by effort.

### #5 — Tutor escalation + validated item variants
**AI tutor of last resort**: triggers on 3rd same-criterion failure/hint exhaustion/rapid low-edit retries — never first failure. Four-rung ladder: reflective question → micro-explanation of the learner's own attempt → worked example in a different domain → **full step-by-step guided walkthrough of the method (user directive: always reachable, never a dead end; stops short of the literal passing artifact)**. Rung-4-assisted pass = completion credit, zero mastery evidence; redeemed later via an indistinguishable isomorphic warm-up probe; rung-4 usage logged as an authoring-quality signal, never learner-punitive. Data-plane isolation: the tutor never holds answer keys.
**Isomorphic variants**: template slots + invariants, LLM-generated into a pre-validated bank (blind-solve gate, rubric lint, fallback to canonical). Terminal/challenge fixtures stay 100% authored.
**Rejected:** mistake journal (subsumed by review queue), micro-sessions, dual-path lessons, bronze/silver/gold (competitive framing + converts judge variance into visible status loss).

---

## 4. Curriculum-specific notes
*Provenance: **[AUDITED]** — read directly from curriculum.json, Module 1 lesson files, and the named specs (h1 nits, module 12 lesson inventory, capstone verifier logic are all re-verifiable in-file).*
- The 14-module map is fundamentally sound; the cross-track convergences must never be "simplified" away.
- Module 1 is the strongest single artifact reviewed. Nits: lessons 04/05 open with an `# h1` duplicating the title (violates the guide); first playground could arrive a lesson earlier.
- **Module 12 is the weak link**: lessons 2–5 are unpracticeable feature tours right before the scaffold-free capstone. Mitigate: make 12-L1's goal-lab the module boss; demote survey content to optional reading; or merge into 11.
- Module 13→14 gate is loose the other way (13 requires only 10); harmless but add a vocabulary check.
- **Capstone genuinely integrates** (stage 5 re-grading stage 1's CLAUDE.md is the best assessment idea in the course) — but stages 3–4 verify existence, not use: make Claude *use* the skill and make the hook observably fire. Resolve the persistent-sandbox assumption before building (the Workshop resolves it exactly).

## 5. What NOT to change
*Provenance: **[AUDITED]** — each protected item is an existing, verifiable property of the repo.*
1. Explanation-first quiz authoring and misconception-based distractors.
2. Judge-the-prompt rubric design + weights-sum-to-100 + assessment transparency (module 06 shows learners the rubric).
3. The spec-driven authoring pipeline (verbatim fixtures, pristine-fails/solution-passes verifier contracts, `npm run validate`).
4. Module 5's terminal on-ramp shape — reuse for every new interaction type.
5. Deterministic verifiers preferred over LLM judges; progressive hints; least-privilege allowedTools.
6. Cross-track prerequisite convergences in curriculum.json.
7. Honest minutes, vocabulary contracts, and the meta-pedagogy thread (the app teaching how the app itself works) — extend, never flatten.
8. The absence of points/streak-shaming/leaderboards — the reward fix is artifacts and visible capability, not slot machines.

**Suggested sequencing by cost/benefit:** #4 → #1's event log, then scheduler → #2 → #5 → #3.
