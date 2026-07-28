# ROOT.7.3.5 review — ADR-0023 (REQ-FP-04 s2 celebration-trigger enumeration)

Reviewer: dream-reviewer-primary, FRESH instance, blind. Date: 2026-07-28.
VERDICT: **request_changes**, confidence **high**.

PROVENANCE: reviewer's write DENIED by path guard (heredoc and printf both) — the FIFTH
in-allowlist denial. Transcribed VERBATIM by director-gen43 from the bounded return.

## Reviewer's independently-derived trigger list (sweep of .program/spec)

1 first quiz pass (REQ-DW-05 s2), 2 lesson completion (REQ-LX-05 s1), 3 module mastery,
4 streak milestone, 5 artifact shelf animation (REQ-WA-04 s2), 6 **module COMPLETION** —
REQ-FP-04's own macro band says "lesson/module/mastery/streak milestones" and
docs/origin/GLOSSARY.md:30 says "the lesson/**module** completion moment"; MM-04 makes
Complete ≠ Mastered, 7 **metro-map earned-color/live-edge reveal** (REQ-DW-02 s2, "color
is earned", fires on a Locked→Available projection transition), 8 dock/Workshop pulse
(REQ-TX-02 s2). No shard names a celebration for boss pass or test-out.

## Findings

- **F1 BLOCKING — module completion in neither list.** ADR enumerates only module
  *mastery*; ruled-OUT never mentions module-Complete. Readings: (a) "lesson/module/
  mastery" = 3 distinct milestones → missing trigger; (b) "module/mastery" collapses to
  `module_mastered`. ADR doesn't choose. Evidence needed: trigger entry with criterion,
  or ruled-OUT bullet citing MM-04 + the macro band + GLOSSARY:30 and defending the
  collapse.
- **F2 BLOCKING — REQ-DW-02 s2 undispositioned.** Spec-normative projection-driven reward
  motion; not enumerated, not ruled out. The bullet "Frontend UI state changes (beat
  transitions, rail advances, Continue clicks)" cannot cover it — unlike those, it *is* a
  server-confirmed projection transition. Same gap for REQ-TX-02 s2. Evidence: enumerate
  or rule OUT each with shard/scenario cited.
- **F3 BLOCKING — closed-world default under-scoped; s2 stays unfalsifiable.** ADR
  §Closed-world rule and the new s2 clause bar only "confetti/macro-motion". But 5 of 7
  triggers are MICRO/MESO, so an unenumerated moment may fire a micro/meso celebration
  and violate nothing — precisely the hole s2 exists to close. Evidence: default barring
  *any* celebration-API invocation (all tiers) outside the enumeration, plus a named
  audit procedure keyed to s1's single API entry point.
- **F4 medium — unreconciled parenthetical.** REQ-FP-04 body (untouched): "Celebrations
  fire only on server-confirmed projection transitions (lesson_completed,
  module_mastered, streak_milestone)"; amended s2 quantifies over 7. Read exhaustively,
  triggers 1/4/5/6 violate their own requirement's body. Pre-existing tension (DW-05/
  WA-04 already fell outside), but the ADR never names it. Evidence: sentence declaring
  the parenthetical illustrative and s2's clause normative.
- **F5 medium — ruled-OUT bullet contradicts trigger 1.** "Individual exercise passes
  (non-boss quiz/playground/challenge)" ruled out, yet trigger 1 *is* an individual quiz
  pass. Evidence: "…other than the first quiz pass per profile (trigger 1)".
- **F6 medium — event types/projection fields untraceable.** REQ-EL-01 names
  `review_graded`, not the ADR's `review_completed`; `quiz_passed`, `session_started`,
  `streak_milestone`, `Streak.active_days`, `ResumePosition.lessonStatus` appear in no
  shard. Atlas owns event types (REQ-EL-01). Trigger 7's "increments to exactly a
  milestone value" is undecidable until the counter's grace-day interaction (REQ-EL-04
  s1) is defined. Evidence: cite each to its shard or flag as needing an additive
  event-log amendment.
- **F7 medium — over-enumeration + streak scope.** Triggers 4/5 and the set
  7/14/30/60/90/180/365 are new normative behaviour no shard specifies; an enumeration
  ADR that *adds* learner-facing behaviour exceeds bounding the domain. ADR-0004 scoped
  the streak to "a projection + one card — trivially reversible" and OPEN-QUESTIONS #9 /
  ASSUMPTIONS #34 keep streaks owner-unratified; ADR-0023 cites neither while adding 7
  macro moments there. No competitive mechanic reintroduced (CONSTRAINTS #12, REJECTED
  51–54 hold; REQ-EL-04 s3 untouched) — hence not blocking. Evidence: cite ADR-0004 +
  OPEN-QUESTIONS #9; drop or justify 4/5 and the milestone set as decisions.
- **F8 limitation.** Reviewer forbidden from running git, so no diff vs 87416c8.
  Textually, REQ-FP-04 body, s1, s3, s4 and the original s2 sentence survive verbatim;
  the domain clause is appended; numbering unchanged. Additivity consistent but must be
  confirmed by read-only diff. [Director: confirmed via `git diff 87416c8 --
  .program/spec/frontend-platform.md` at close of gen43 — additive only.]

## Passed

Cross-shard mapping (LX-05→2, WA-04→6, DW-05→1) all verified accurate, including DW-05's
"no celebration of any kind fired before" preserved in trigger 1. All 7 triggers carry
positive AND negative cases — none vacuous. Ruled-OUT items MM-02 skill transitions,
SR-04 warm-up, WA-05 s3 repair, BT-02 s5 "Prove it", profile/theme/keyboard are nowhere
normatively celebrated, so ruling them out is disposition, not contradiction. No
XP/levels/leaderboards/badges/tiers, no timing trigger, no punitive quota; REJECTED.md:61
honoured by every criterion.
