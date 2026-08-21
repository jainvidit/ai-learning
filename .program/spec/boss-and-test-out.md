# Capability: Boss Challenges & Test-Out

The per-module integrative boss, and the "Prove it" test-out path that treats testing out exactly like completing.

**Depends on:** `mastery-model.md` (Mastered gating, skill seeding), `judge-pipeline.md` (gate-tier verdicts for judged bosses), `content-pipeline.md` (`role: "boss"` flag, boss-per-module CI gate REQ-CP-06), `spaced-review.md` (FSRS seeding as-if-reviewed), `coach-and-hints.md` (hint ladder applies to bosses), `curriculum-content.md` (bosses are authored content).
**Depended on by:** `dashboard-and-wayfinding.md` ("Prove it" popover on Available nodes).
**Contract owner:** Sage (mechanics); Nova ("Prove it" UX, no-stigma treatment).

---

## REQ-BT-01: One boss per module gates Mastered, never Complete {#req-bt-01}

Boss = `role: "boss"` flag on existing exercise types (one per module, CI-enforced); must integrate ≥2 module skills with no per-step scaffolding; instructions must NOT enumerate the rubric (the missing faded-guidance step — Sage). Boss gates **Mastered**, never Complete — a struggling learner is never walled. Unlimited retries; the hint ladder applies. Boss-flagged exercises are excluded from `attempted` credit entirely (lesson-experience REQ-LX-02).

**Source:** DREAM-BLUEPRINT.md §4 "Boss challenges & test-out", §8 aligned decision 1; LEARNING-DESIGN-REVIEW-SAGE.md §3#2; GLOSSARY.md "Boss".
**Current state (docs/origin/CURRENT-STATE.md):** new content role + gating; `specs/_TEMPLATE.md` MODIFIED to carry boss sections before modules are built (curriculum-content REQ-CC-04).

**Scenarios:**
1. Given any built module, when validated, then exactly one exercise carries `role: "boss"` and it maps to ≥2 of the module's skills.
2. Given a boss's instructions, when audited, then they do not enumerate the rubric criteria.
3. Given a learner who completes all lessons but never passes the boss, when module state is computed, then the module is Complete (not Mastered) and nothing downstream that Complete unlocks is withheld.
4. Given repeated boss failures, when the learner retries, then retries are unlimited and the hint ladder is available.

## REQ-BT-02: Test-out ("Prove it") per module {#req-bt-02}

Test-out = boss-equivalent probe (same verifier/rubric, different fixture) + concept quiz sampling each lesson + one hands-on probe where the module has terminal content. Full pass → a single `test_out` event marks lessons complete with identical presentation (no "skipped" badge — no stigma), skills seeded **Practiced (never Fluent — no shortcut past spaced re-demonstration)**, FSRS cards seeded as-if-reviewed. Partial pass loses nothing and seeds what was demonstrated.

**Source:** DREAM-BLUEPRINT.md §4 "Boss challenges & test-out"; LEARNING-DESIGN-REVIEW-SAGE.md §3#2; UX-REVIEW-NOVA.md §2 "'Prove it' test-out" [TEAM]; GLOSSARY.md "Test-out ('Prove it')".
**Current state:** new; addresses Sage §2 "player agency: effectively zero" (no skip/placement today).

**Scenarios:**
1. Given a full test-out pass, when progress renders anywhere, then the module's lessons show as complete with presentation identical to normally-completed lessons (no distinguishing badge or copy).
2. Given a full test-out pass, when skill states are read, then the module's skills are Practiced (never Fluent) and their FSRS cards are scheduled as if just reviewed.
3. Given a partial test-out (some probes passed), when it ends, then no prior progress is lost and the demonstrated skills are seeded accordingly.
4. Given a test-out probe, when compared to the module's boss, then it uses the same verifier/rubric against a different fixture.
5. Given an Available module on the map/module page, when rendered, then the "Prove it" affordance is offered alongside Start (dashboard-and-wayfinding REQ-DW-02).
