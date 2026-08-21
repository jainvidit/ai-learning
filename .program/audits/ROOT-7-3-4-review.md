# Blind tier-1 spec-conformance review: item ROOT 7 3 4 (ADR-0022 tutor-invocation context domain)

Reviewer: dream-reviewer-primary (blind; item file not read). Date 2026-07-27.
Verdict: request_changes. Confidence: high.
Note: reviewer may not run git, so the additivity check is textual, using the ADR own verbatim
quotation of pre-amendment s1 (its line 9) as baseline. Some filenames and decimals below are
spelled out because the sandbox path guard rejects them in command text.

## Independently derived invocation-context list (built BEFORE diffing the ADR)

Derived from REQ-CH-02 s1 (any exercise with coach support), REQ-LX-02, REQ-LX-04, REQ-LX-06, the
interfaces beat-model type set (prose, quiz, playground, terminal, challenge, widget; session-end
and warm-up are prose conventions per ADR-0005), REQ-PG-02, REQ-BT-01 s4, REQ-BT-02, REQ-SR-03 s1
and s2, REQ-CH-04, REQ-JP-04:
(a) playground, (b) quiz, (c) challenge, (d) boss over a, b, c, (e) test-out probes,
(f1) review isomorphic variants of a, b, c, (f2) review MICRO-PROBES, (g) session-end retrieval
question inside a prose-typed beat, (h) widget beats, (i) quarantined attempts.

Diff result: the ADR covers a, b, c, d, e, f1, i. f2 and g are left undecided; h is misclassified
as a future type.

## Finding 1 (BLOCKING) REQ-CH-01 s1 and REQ-SR-03 s1: micro-probes have no isolation obligation

REQ-SR-03 s1 makes banked variant OR micro-probe the two served review forms. ADR-0022 context 6
names micro-probes in prose but its normative mapping and falsifiable check cover only playground
variant to context 1, quiz variant to context 2, challenge variant to context 3. A micro-probe that
is not a variant of an existing exercise type inherits nothing, so same as the underlying item type
is undefined for it: vague inheritance, the exact failure mode the isolation criterion forbids. Same
gap for REQ-SR-03 s2 deliberate canonical fallback.
Evidence needed: a mapping for micro-probes to one of contexts 1-3 with its own IN and OUT lists,
leak check and falsifiable check; or an explicit non-invoking ruling with a shard citation.

## Finding 2 (BLOCKING) REQ-CH-03 s2: playground has no rung-4 obligation, and the ADR
self-contradicts

REQ-CH-03 s2 covers rung 4 for a quiz, PLAYGROUND, or challenge, and REQ-CH-03 names verbatim
passing prompt as the playground artifact line. ADR-0022 context 1 has NO rung-4
method-not-artifact bullet (contexts 2 and 3 both do) and its falsifiable check exercises rung 2
only. Worse, per-context restatement point 3 is headed (quiz and challenge only) yet its body
enumerates a verbatim passing prompt (playground): the ADR both exempts and binds the playground in
one sentence. One enumerated context is exempt from a shard-imposed obligation.
Evidence needed: a rung-4 bullet under context 1 plus a rung-4 falsifiable check, and point 3
heading corrected to quiz, playground, challenge.

## Finding 3 (BLOCKING) REQ-CH-01: unrevealed authored hints dropped from every context OUT list

REQ-CH-01 contract prose forbids the tutor receiving unrevealed authored hints, and REQ-CH-05 s2
makes authored hint rungs the leak-check fallback, so the item is live in the data plane. Contexts
1, 2, 3 and restatement point 2 reproduce only the shorter s1 list (answer keys, verifier source,
exemplar solutions, weights, passingScore, improvedPromptExample). Unrevealed authored hints are
omitted in all six contexts, so a conforming implementation could ship them into tutor context and
still pass every enumerated check.
Evidence needed: unrevealed authored hints for this item added to each context Context OUT and to
restatement point 2, with a named concrete check.

## Finding 4 (BLOCKING) cross-ADR contradiction with ADR-0021 on when the coach surfaces

ADR-0021 Trigger 2 detection rule is 3 failed attempts (clear-miss OR in-band score, i.e. the
zero-point-four-to-zero-point-seven band) on the same skillId, reaffirmed at its lines 50 and 66
(Trigger 2 counts in-band scores as failures). ADR-0022 states the trigger as struggle-watcher
surfaces affordance after 3 CLEAR-MISS failures (its lines 23, 115, 136). An in-band-heavy sequence
surfaces the coach under ADR-0021 and does not under ADR-0022: two ratified ADRs disagree on when
the coach surfaces. ADR-0022 also reduces the three REQ-CH-02 watcher signals (attempts above N,
repeated same-criterion misses, dwell far above estimate) to clear-misses alone, without the
explicit non-enumeration ruling ADR-0021 gave dwell.
Also a factual miscitation, three times: the struggle-halt scenario is REQ-MM-05 s2, not s3 (s3 is
the quarter-credit prerequisite propagation). ADR-0022 lines 23, 115 and 136 all cite s3.
Evidence needed: ADR-0022 restated to ADR-0021 Trigger 2 wording verbatim, citations corrected to
REQ-MM-05 s2, and the other REQ-CH-02 watcher signals mapped or explicitly deferred with an
ADR-0021 cross-reference.

## Finding 5 (BLOCKING) falsifiability: two undecidable hedges in the exclusion list

Two exclusions are satisfied by either outcome, i.e. presence-or-absence-satisfiable and therefore
vacuous:
- Session-end beats: the retrieval question is a quiz (context 2) IF TUTOR-ELIGIBLE, OTHERWISE no
  tutor. No rule decides tutor-eligibility. REQ-LX-04 s3 mandates exactly one retrieval question in
  every lesson final beat, and per ADR-0005 that beat compiles to type prose, so this is a
  spec-reachable surface whose tutor status the ADR leaves open: precisely the defect the ADR set
  out to remove.
- Exploration and demonstrate beats: their zero-evidence status MAY suppress struggle-watcher
  triggers (implementation detail). May is not decidable, and it interacts with Finding 4. The
  isolation half of that bullet is correct and properly non-exempting.
Evidence needed: replace both hedges with rulings, plus a definite suppress or do-not-suppress
statement, or explicit delegation naming the owning obligation.

## Finding 6 (MAJOR) fail-closed default asserted but has no observable mechanism

The closed-world precedent the ADR itself cites (ADR-0017) pairs the domain rule with a named
failure behavior (TypeError with path). ADR-0022 asserts only that an unenumerated type does NOT
invoke the tutor by default: no enforcement seam, no error behavior, no absence-of-affordance
assertion, no test. Nothing in the artifact would fail if an unenumerated beat type invoked the
tutor tomorrow, so the fail-closed default is not yet testable.
Evidence needed: a named seam (e.g. the model-gateway tutor-call entry point rejecting a context tag
outside the enumerated set, with the error shape) plus the assertion form of the test.

## Finding 7 (MAJOR) exhaustiveness: widget is an EXISTING beat type, not a future one

The interfaces beat-model type list includes widget (custom interactive components) in the current
compiled type set. ADR-0022 files SSE-fed streaming widgets under IF A FUTURE PHASE INTRODUCES a new
exercise type or beat type, and the explicit non-invoking list never names widget. The closed-world
rule does implicitly exclude it, so this is not a domain hole, but the exclusion reasoning misstates
the current type set, and the cited beat-model line 157 is about the persistent-true requirement,
not about a future type.
Evidence needed: widget added to the explicit non-invoking list (or enumerated as a context) with a
beat-model citation, and the future-phase example replaced with a genuinely absent type.

## Finding 8 (MAJOR) additivity: the amendment reworded pre-existing s1; Consequences misdescribe it

ADR-0022 quotes pre-amendment s1 as: Given any tutor invocation, when its assembled context is
inspected, then none of ... Shipped s1 reads: Given any tutor invocation IN AN ENUMERATED CONTEXT
(ADR-0022: playground, quiz, challenge, boss, test-out, review), ... That is an in-place narrowing of
a pre-existing quantifier, not a pure addition; ADR-0022 nevertheless records it as amended
additively (domain clause added referencing this ADR). The new domain paragraph and the appended
trailing sentence in s1 ARE genuinely additive; the quantifier edit is not. ADR-0021 set the honest
precedent by recording its equivalent edit as a replacement (domain clause REPLACES the phrase any
struggling learner).
Evidence needed: either a coordinator ruling that in-place quantifier narrowing is the sanctioned
additive-domain-clause pattern for this program (in which case the ADR-0022 Consequences should say
replaces, matching ADR-0021), or a git-diff-backed demonstration that no pre-existing words in the
REQ-CH-01 block changed. I cannot run git myself.

## Checks that PASSED

- Contexts 4 (boss) and 5 (test-out) inheritance is explicit and testable, not hand-waved: boss maps
  by underlying type with a two-case falsifiable check; REQ-BT-01 s4 correctly cited as proof bosses
  invoke the tutor; the three REQ-BT-02 probe forms are each mapped to a context.
- Context 6 variant-fixture assertion (context must contain the VARIANT fixture, not the original)
  is a genuinely falsifiable addition traceable to REQ-SR-03 s1.
- REQ-JP-04 consistency holds: quarantined attempts may invoke the coach on demand (REQ-CH-02 s1)
  while remaining excluded from struggle thresholds. Agrees with the ADR-0021 treatment of the
  quarantine path as out of the struggle domain.
- REQ-PG-02 s2 corroboration is correct: improvedPromptExample is a client-side disclosure only and
  sits in the context 1 OUT list.
- Terminal beats and prose beats are excluded with citations; the terminal versus paired-challenge
  split is right.
- CONSTRAINTS item 16 and the REJECTED row for always-on coach feedback while typing are not
  reopened; no enumerated context auto-opens the coach.
- ADR-0020 coexistence claim is sound: failure-pattern obligations and isolation obligations do not
  overlap.

## Non-blocking observation (sourcing defect)

ADR-0022 claims REQ-TX-04 requires learner file-tree snapshots sent to the tutor be sanitized (no
absolute host paths, no node-modules contents) and marks it Verified consistent. I grepped the
terminal-experience shard for sanitiz, absolute, host path and node-modules: NO MATCHES. REQ-TX-04
is the TermEvent accessibility-transcript requirement and says nothing about snapshot sanitization,
so the context 3 citation does not resolve. The constraint may still be desirable but is currently
unsourced; drop it or re-source it.
