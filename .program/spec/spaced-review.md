# Capability: Spaced Review

FSRS-6 scheduling, grade mapping from all evidence sources, and the review warm-up UX.

**Depends on:** `event-log-and-projections.md` (review_graded events, ReviewQueue projection), `mastery-model.md` (skills, the judge-noise firewall's grade mapping), `content-pipeline.md` (isomorph variant bank — ≥2 variants per review-eligible objective, REQ-CP-06), `content-generation.md` (variant production).
**Depended on by:** `lesson-experience.md` (warm-up beat 0), `dashboard-and-wayfinding.md` (warm-up card, due chip).
**Contract owner:** Sage (scheduler semantics; her own SchedTeam bake-off picked FSRS-6 over Leitner — REJECTED.md).

---

## REQ-SR-01: FSRS-6 via ts-fsrs, frozen default weights, one card per skill {#req-sr-01}

One ts-fsrs card per skill; default FSRS-6 weights, never per-learner-fitted (n=1 is noise-fitting; defensible only with ~400+ reviews — REJECTED.md); ±10% interval fuzz; post-21-day-gap first-failure amnesty (the first miss after a 21+-day gap emits no negative evidence). ts-fsrs pinned major (radar). The engine sits behind an engine-agnostic Scheduler interface.

**Source:** DREAM-BLUEPRINT.md §4 "Spaced review — FSRS-6, frozen weights", §7 radar row "Scheduler"; LEARNING-DESIGN-REVIEW-SAGE.md §3#1; GLOSSARY.md "FSRS-6 frozen weights", "Lapse amnesty".
**Current state (docs/origin/CURRENT-STATE.md):** new; nothing is ever reviewed again today (Sage §1b — "the single largest gap").

**Scenarios:**
1. Given any skill introduced to a learner, when the scheduler state is inspected, then exactly one FSRS card exists for it with default FSRS-6 weights.
2. Given any learner with any review history, when weights are inspected, then they equal the frozen defaults (no per-learner fitting anywhere).
3. Given a computed interval, when the due date is set, then it carries up to ±10% fuzz.
4. Given a skill last reviewed 22+ days ago whose next review fails, when evidence is recorded, then no negative mastery evidence is emitted for that first miss (amnesty), while the scheduler still updates.

## REQ-SR-02: Grade collapse — evidence sources to FSRS grades {#req-sr-02}

Deterministic fail = Again; pass-with-hints = Good (hint count reduces evidence *weight*, not the grade); first-attempt-no-hints = Easy. Judge scores map per the firewall (mastery-model REQ-MM-03): <0.4 Again, 0.4–0.7 scheduler-only, >0.7 Good; judge never emits Easy; no source emits Hard. Timing-based grading ("fast clean = Easy") was explicitly REJECTED — timed pressure by the back door (REJECTED.md; blueprint §8 aligned decision 5).

**Source:** DREAM-BLUEPRINT.md §4 "Spaced review"; LEARNING-DESIGN-REVIEW-SAGE.md §3#1; GLOSSARY.md "Grade collapse".
**Current state:** new.

**Scenarios:**
1. Given a deterministic verifier failure, when graded, then the FSRS grade is Again.
2. Given a deterministic pass achieved with 2 hints, when graded, then the grade is Good and the recorded evidence weight is reduced relative to a hint-free pass.
3. Given a first-attempt deterministic pass with no hints, when graded, then the grade is Easy.
4. Given the grading code, when audited, then response latency/timing influences no grade anywhere.

## REQ-SR-03: Review items are isomorphic variants, never verbatim {#req-sr-03}

Reviews always serve isomorphic banked variants or micro-probes, never the verbatim originally-seen item.

**Source:** DREAM-BLUEPRINT.md §4 "Spaced review"; LEARNING-DESIGN-REVIEW-SAGE.md §3#1; GLOSSARY.md "Isomorphic variant".
**Current state:** new; today retries re-present the same fixed questions whose answers were just displayed (Sage §1a — brute-forceable).

**Scenarios:**
1. Given a due review for a skill, when the item is served, then it is a banked variant or micro-probe whose item ID differs from the item on which the skill was originally evidenced.
2. Given a skill with no available variant, when review is due, then the system's fallback behavior is deliberate (defined fallback to canonical per Sage §3#5) — never silently serving the verbatim item as if it were a variant.

## REQ-SR-04: Review UX — capped due count, ~5-minute warm-up, no debt framing {#req-sr-04}

Due-count display is capped at ~6 with a "9+" chip; a ~5-minute warm-up clears the visible queue; the remainder reschedules silently; no "overdue" labels anywhere; post-lapse framing is "5-minute warm-up," never a backlog. Warm-up is never more than ~5 minutes and never a guilt-wall of overdue counts.

**Source:** DREAM-BLUEPRINT.md §1, §4 "Review UX"; LEARNING-DESIGN-REVIEW-SAGE.md §3#1 "Delivery"; UX-REVIEW-NOVA.md §2 "Spaced review queue" row.
**Current state:** new UI.

**Scenarios:**
1. Given 14 due reviews, when the due chip renders, then it shows "9+" (never the raw count above the cap).
2. Given a completed warm-up session, when the visible queue is checked, then it is clear and the un-served remainder has been rescheduled without any learner-facing debt indicator.
3. Given any review surface, when its copy is audited, then the word "overdue" (and equivalent debt framing) does not appear.
4. Given a learner returning after a long lapse, when the review entry point renders, then it offers a "5-minute warm-up," not the full backlog.
