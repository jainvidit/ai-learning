# ROOT.7.3.6 review — ADR-0024 (REQ-LX-07 s3 beat entry-mode enumeration)

Reviewer: dream-reviewer-primary, FRESH instance, blind. Date: 2026-07-28.
VERDICT: **request_changes**, confidence **high**.

PROVENANCE: reviewer write DENIED by path guard (4 forms) — transcribed VERBATIM by
director-gen43.

## Findings

1. **BLOCKING — exhaustiveness.** Independent list yields modes A–K; ADR covers A–G.
   THREE spec-named reachable modes have NO disposition: (H) in-lesson breadcrumb-header
   "Jump to where you left off" chip and (I) header exercise chips — lesson-experience.md
   line 49 REQ-LX-04 places both INSIDE the lesson header, while ADR mode 3 defines
   resume as the DASHBOARD chip only; (J) Verify deep-link back to the challenge beat —
   REQ-TX-02 s3 + lesson-experience line 75, normative; the ADR touches REQ-TX-02 only to
   exclude portal-slot MOVES, a different mechanism. (K) route-change return (REQ-TX-01
   s1) is arguably mode 4 but never said to be. Needs: enumerate H/I/J or disposition as
   aliases with the aliasing rule stated; state whether K is mode 4.
2. **BLOCKING — default direction self-contradictory.** Line 72: unenumerated modes "NOT
   bound by REQ-LX-07 s3". Line 78: "the default is to emit the beat_viewed event". The
   shard amendment hard-codes the contradiction (line 95). If unlisted modes must emit,
   the domain is open and the unfalsifiability returns; if unbound, the emit sentence is
   not normative. (For the record over-emission is behaviourally harmless — REQ-LX-01 s2
   advances the frontier on dwell, REJECTED 58-59 forbid viewport/dwell gates — the
   defect is logical.) Needs: (a) fail-closed per ADR-0017, emit-anyway demoted to
   non-normative guidance, shard clause reworded; or (b) fail-open kept, closed-world
   claim deleted, checkable enumeration procedure over navigation call sites supplied.
3. **BLOCKING — multiplicity undefined.** No rule on whether modes are exclusive or which
   owns an arrival. (1) Mode 4 vs 7: a refresh IS a page load; contradictory obligations
   (event per visible beat vs one possibly-suppressed event). (2) Modes 2/5/6 vs 1:
   default-motion smooth scroll carries intermediate beats across the 50% threshold —
   whether transited beats "enter view" is undefined, so event counts differ by motion
   preference with no rule. Needs: precedence/attribution rule; ruling on transited
   beats; resolution of refresh.
4. **BLOCKING — falsifiability.** Mode 7: "event emitted (or idempotently suppressed)" —
   no falsifiable content. Mode 1: "duplicates idempotent or suppressed". Persistent
   re-entry: "may be suppressed. If not suppressed, a second event is recorded."
   Deferring idempotency to ROOT.2.1 is legitimate but cannot make per-mode checks
   either/or. Needs: policy-independent assertion (e.g. "first viewport entry of a beat
   in a session emits exactly one event") with re-entry counting explicitly out of scope.
5. **MAJOR — additivity violated.** git diff 87416c8: the amendment REWORDS pre-existing
   normative text — original s3 sentence removed, Given-clause narrowed in place, Then
   reworded, deferral sentence subtracts obligation. Sibling precedent (ADR-0026 in
   data-layer-and-offline.md line 44) is properly additive. Needs: restore the original
   sentence verbatim and append a **Domain (ADR-0024):** clause in the ADR-0026 form.
6. **MAJOR — citation drift.** Substance of the persistent-beat consistency section is
   accurate (ruling NARROW, keyed to session identity, ADR claims contradict nothing) but
   citations are wrong: "line 189" is blank (sentence at 185-188); "lines 160-163" quote
   includes text at 164. beat-model line 348 itself asks citers to cite headings. Needs:
   quote-anchored citations re-verified.

## Non-findings

REJECTED.md: no viewport/dwell gate reintroduced. CONSTRAINTS: no contradiction.
Reduced-motion degradation correctly recorded for modes 2/5/6. Mode 6 suppression matches
REQ-LX-04 s5 with a genuinely two-sided check — strongest mode in the ADR.
