# ROOT.7.3.3 review — ADR-0021 (REQ-MM-05 s4 struggle-trigger enumeration)

Reviewer: dream-reviewer-primary, FRESH instance, blind. Date: 2026-07-28.
VERDICT: **request_changes**, confidence **high**.

PROVENANCE: reviewer write DENIED by path guard (all attempts incl. a minimal probe) —
transcribed VERBATIM by director-gen43.

## Findings

1. **BLOCKING — exhaustiveness.** REQ-CH-02 line 24 names three struggle-watcher signals:
   "attempts > N, repeated same-criterion misses, dwell >> estimate". The ADR's "What was
   NOT enumerated" handles two and is SILENT on "attempts > N". Attempt count != Trigger
   2's "3 failed attempts": draft-tier iterations (REQ-JP-02 s1) never produce gate
   verdicts, so N attempts can accrue without crossing Trigger 2. Also line 85's claim
   that "repeated same-criterion misses" is "covered by Trigger 2" is false: REQ-JP-01 s2
   scores as a weighted sum, so the same low-weight criterion can be missed three times
   inside three clear-passes (>0.7) — Trigger 2 never fires. Also absent from BOTH lists:
   rung-4 exhaustion WITHOUT a pass (REQ-CH-03 s3); Trigger 4 covers only
   pass-after-rung-4. Exclusion rationale non-uniform: dwell excluded because CH-02 "only
   surfaces the affordance visually", yet Trigger 2's own response IS visual surfacing —
   applied consistently the principle deletes Trigger 2. Needs: attempts>N enumerated or
   excluded with a rationale that survives; corrected same-criterion coverage argument;
   rung-4-exhaustion-without-pass classified citing CH-03 s3.
2. **BLOCKING — direct contradiction with ratified ADR-0020.** ADR-0020 line 47:
   "Struggle-halt does NOT trigger (in-band verdicts produce zero evidence, not
   clear-misses — the 3-clear-miss counter is unaffected)"; line 79 same. ADR-0021
   Trigger 2: "3 failed attempts (clear-miss OR in-band 0.4-0.7)" counts in-band. One
   observable input (three consecutive 0.55 gate verdicts) gets opposite answers.
   Double-ownership of the struggle-halt counter. Aggravating: ADR-0021 consistency check
   3 asserts "No overlap in obligations" — false. Secondary: mismatched closed-world
   defaults (ADR-0020 nearest-neighbour vs ADR-0021 fixed default) disagree on unlisted
   sequences. Needs: single owner of the struggle-halt counter; Trigger 2 drops in-band
   OR ADR-0020 pattern 3 is amended (with the Priya+Sage dual-sign-off question
   addressed); check 3 retracted; governing default stated for when both ADRs engage.
3. **PARTIAL FAIL — trigger/default boundary non-computable for two spec-produced
   sequences.** (1) SR-01 s4 lapse amnesty: silent on whether an amnestied miss advances
   Trigger 1's or Trigger 2's counters. (2) JP-04 line 49 + s2 REQUIRE quarantined
   attempts be "excluded from tutor struggle thresholds"; ADR line 87 rules the
   ungradeable path out-of-domain but never writes the exclusion into Trigger 1/2
   detection rules. Needs: amnestied first-miss and quarantined attempts explicitly
   counted or excluded inside Trigger 1/2 detection rules.
4. **RESERVATIONS — falsifiability.** Trigger 2's release condition "until the coach is
   used or a pass is achieved" is sourced in NO shard — invented normative behaviour.
   Trigger 4's "mastery evidence is reduced or zero" has no magnitude for the "reduced"
   branch. Needs: release condition cited or deleted; reduction factor named or deferred
   to a named later ADR.
5. **PASS — never-demote + two-key firewall intact** (details verified; caveat: Trigger
   2's in-band consumption is a new consumer of Priya's band semantics — feeds finding 2).
6. **PASS with scope concern — additivity.** Append-only textually. NON-BLOCKING CONCERN:
   pre-existing s4 obligated never-rewrite-live for ANY struggling learner; the amended
   default clause does not restate it for non-triggered learners. Needs (advisory):
   append "in all cases served content is a pre-authored/pre-validated variant" to the
   default clause.
7. **PASS — REJECTED.md hard check recorded and correct** (line 42 timing, line 43 EMA —
   ADR-0021's numbering is accurate; ADR-0020's line 83 transposes them). No timing
   input, no continuous mastery number, CONSTRAINTS #12/#16 honoured.

Blocking: findings 1-2. Required for decidability: 3-4. Advisory: 6.
