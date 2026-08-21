# ROOT.7.3.2 review — ADR-0020 (REQ-JP-04 s2 failure-pattern enumeration)

Reviewer: dream-reviewer-primary, FRESH instance, blind. Date: 2026-07-28.
VERDICT: **request_changes**, confidence **high**.

PROVENANCE: reviewer write DENIED by path guard on every form (redirect/tee) — transcribed
VERBATIM by director-gen43.

## Findings

1. **BLOCKING — exhaustiveness: deterministic failures scoreless.** Patterns 1,2,3,4,6 are
   each defined as gate-tier judge verdicts with a normalized score (ADR lines 36,41,46,
   51,61). Deterministic verifier/quiz-key failures carry no normalized score, so the
   firewall trichotomy anchoring those definitions never applies — yet they are
   first-class evidence (mastery-model line 26 requires >=1 deterministic success for
   Fluent; spaced-review line 26 "Deterministic fail = Again"). ADR line 100 asserts
   patterns 1-6 exhaust the space but no pattern text admits a scoreless failure. Needs: a
   normative pattern for deterministic failures with its own falsifiable check, OR an
   explicit normative clause stating deterministic failures read as clear-misses and are
   covered verbatim by patterns 1/2/4 — inside the enumeration, not in "Readings
   considered".
2. **BLOCKING — timing axis missing; default answers it wrongly.** spaced-review REQ-SR-01
   s4 (line 22): a skill last reviewed 22+ days ago whose next review fails emits NO
   negative mastery evidence (amnesty). ADR pattern 1 (line 37) grades every clear-miss
   Again with no amnesty carve-out. A Fluent skill idle 30 days is not pattern 5 (needs
   45+), so "most similar" = pattern 1 → negative evidence → contradicts SR-01 s4. Needs:
   a normative amnesty-window pattern (or explicit exception inside patterns 1/2/5) whose
   check asserts zero negative evidence for the first post-gap miss, plus a stated
   ordering rule for the 21-day amnesty vs 45-day decay windows.
3. **BLOCKING — scope discipline: shard clause names a demotion surface.**
   judge-pipeline.md line 51 (authored here): "(5) long-idle return with probe misses
   (gentle decay path, the ONLY demotion surface)". mastery-model.md line 27: "Never
   demote. ... The only DECAY surface is worth a refresh"; s6 line 39 "the only decay
   surface". ADR line 77 says pattern 5 "is NOT a demotion" yet also that it "bypasses the
   never-demote invariant" — an exception to REQ-MM-02 asserted from a judge-pipeline
   item, in Sage's normative territory (mastery-model line 7); no dual sign-off note.
   Needs: reword line 51 into mastery-model's vocabulary (decay surface,
   Fluent→Practiced via the gentle path, never-demote verbally intact); drop or requalify
   "bypasses the never-demote invariant".
4. **BLOCKING — closed-world default undecidable.** judge-pipeline line 51 and ADR line 67
   default unenumerated patterns to "the most similar listed pattern" with no metric,
   tie-break, or procedure. Undecidable, therefore vacuous — every precedent gives a
   decidable default (ADR-0017 A1.3 throwing default; ADR-0019 "NOT bound until explicitly
   added"; ADR-0028 implicit-allow; ADR-0024 emit-by-default). The 30-day idle-miss case
   resolves to pattern 1 OR pattern 5 at implementer discretion. Needs: decidable default,
   e.g. "an unenumerated failure pattern is bound by never-demote and MUST NOT change
   mastery state; shipping one without an additive ADR is a spec violation" — identical in
   shard and ADR.
5. **BLOCKING — declared consequence not delivered.** ADR line 106 declares
   "mastery-model.md REQ-MM-02 s5 amended additively to quantify over the enumerated
   patterns (cite ADR-0020)". It was not: git diff shows only the REQ-MM-05/ADR-0021
   change; s5 (line 38) still reads bare "any number of subsequent failures". The survey
   mis-attributed the phrase to judge-pipeline; the unfalsifiable quantifier survives in
   its own shard. Needs: either the additive REQ-MM-02 s5 cross-reference lands (owner
   note — mastery-model.md is ROOT.7.3.3's glob, coordinate via director), or ADR line
   106 corrected to say mastery-model.md is deliberately untouched and name the item that
   will amend it.
6. **MINOR — invented normative rule.** ADR line 42: "the 3-fail counter resets on a pass
   per REQ-MM-05 s2-s3" — no such reset rule exists in the shard; ADR-0021 rules the same
   question ("two CONSECUTIVE clear-misses"). Cite ADR-0021 or drop.
7. **MINOR — citation off-by-ones.** s3 vs s2 for struggle-halt; MM-02 s5/s6 line refs
   swapped; REJECTED.md 43/44 and 42/43 off by one. Load-bearing citations — correct them.
8. **MINOR — pattern 1/5 checks not executable.** "no demotion event exists in the log" —
   REQ-EL-01 enumerates no demotion/state-transition event type and Atlas owns event
   types. Restate both checks against projection state or defer event shape to ROOT.2.1.
9. **MINOR — pattern 3 units; header date.** score=0.55 vs "60% passing threshold" without
   conversion; ADR dated 2026-07-28/ratified prematurely.

## Passes

ADDITIVITY PASS (judge-pipeline.md diff is pure insertion). TWO-KEY FIREWALL UNTOUCHED
PASS (REQ-MM-03 byte-identical; ADR restates accurately). REJECTED/CONSTRAINTS PASS (no
timing grading, no continuous mastery, no Easy/Hard emission).

## Flips to approve

F1–F5 addressed: deterministic-failure pattern or absorption clause; amnesty-window
pattern with ordering rule vs 45-day window; line 51 reworded into decay vocabulary;
decidable closed-world default mirrored in shard and ADR; ADR line 106 fulfilled or
corrected.
