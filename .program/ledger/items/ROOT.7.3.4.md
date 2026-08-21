---
id: ROOT.7.3.4
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-CH-01 s1 "any tutor invocation" — invocation-context domain (ADR-0022)
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.7.3.4-gen1 (dream-implementer-standard, fix cycle, dispatched by director-gen43 2026-07-28 ~02:10Z)
spawned_at: 2026-07-28T02:10:00Z
generation: 1
review_findings_gen0: "request_changes/high — full text .program/audits/ROOT-7-3-4-review.md (reviewer wrote dashed filename, path guard rejected dotted). BLOCKING: SR-03 micro-probe/canonical-fallback inherit nothing; context 1 missing rung-4 bullet + contradictory heading; unrevealed-authored-hints in NEVER list but absent from all six OUT lists; ADR-0021 Trigger 2 disagreement ('3 clear-miss' vs 'clear-miss OR in-band' — arbitration event ROOT.7.3.2 02:05:00Z rules in-band COUNTS, align verbatim) + MM-05 s3-vs-s2 miscites; session-end retrieval question + exploration 'MAY suppress' undecidable hedges. MAJOR: fail-closed default has no named rejection seam; widget beat type misfiled as future; s1 narrowed in place while Consequences claim purely-additive (record as 'replaces' per ADR-0021 precedent or prove no words changed). MINOR: REQ-TX-04 miscredited with snapshot sanitization."
spec_refs:
  - .program/spec/coach-and-hints.md#req-ch-01
acceptance_criteria:
  - ADR-0022 ratified — the contexts/rungs/subjects that invoke the tutor enumerated closed-world with the isolation guarantee testable per context; additive relaxation path
  - coach-and-hints.md amended additively so s1 quantifies over the enumerated contexts
  - Data-plane isolation and leak-check obligations restated per enumerated context (no context exempt)
depends_on: []
blocks: [ROOT.3.5]
children: []
file_ownership: [".program/decisions/ADR-0022.md", ".program/spec/coach-and-hints.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification:
  - criterion: "ADR-0022 ratified — the contexts/rungs/subjects that invoke the tutor enumerated closed-world with the isolation guarantee testable per context; additive relaxation path"
    how: "Gen1 fix cycle: Amended ADR-0022 in place (Amendment gen1 section) addressing all 9 review findings. F1: added micro-probes/canonical fallback mapping (inherit underlying type). F2: added rung-4 constraint + falsifiable check to context 1 (playground). F3: added unrevealed authored hints to all six context OUT lists + restatement point 2 + named check. F4: aligned struggle-halt wording to ADR-0021 Trigger 2 verbatim (clear-miss OR in-band 0.4-0.7); corrected REQ-MM-05 s3→s2 miscites. F5: ruled session-end retrieval non-invoking (prose beat, no coach button); ruled exploration beats definite (zero-evidence affects mastery, not tutor invocations). F6: named fail-closed rejection seam (InvalidContextTypeError at model-gateway tutor-call endpoint) + test assertion form. F7: added widget to explicit non-invoking list with correct beat-model cite. F8: Consequences reworded to 'REPLACES' per ADR-0021 precedent; divergence note recorded (quantifier-narrowing pattern sanctioned for universals). F9: REQ-TX-04 miscitation removed (sanitization retained as implementation detail). ADR-0022 now spec-conformant per all review lenses. Relaxation path unchanged."
    evidence: ".program/decisions/ADR-0022.md (Amendment gen1 section lines 167-279; amended normative sections contexts 1/2/3/6, closed-world rule, unnamed contexts, restatement, cross-shard checks)"
  - criterion: "coach-and-hints.md amended additively so s1 quantifies over the enumerated contexts"
    how: "Gen1 fix cycle: Added unrevealed authored hints to REQ-CH-01 s1 forbidden-fields list per F3 (line 21). Domain quantification unchanged from gen0 (already narrowed to enumerated contexts). Consequences in ADR-0022 now honestly record the amendment as 'REPLACES' per ADR-0021 precedent (in-place quantifier narrowing, not pure addition). Divergence note in Amendment gen1 explains the sanctioned pattern: universal quantifiers over unbounded domains require narrowing (as ADR-0021 did for 'any struggling learner'); recorded as replacement per binding precedent."
    evidence: ".program/spec/coach-and-hints.md line 21 (REQ-CH-01 s1 amended)"
  - criterion: "Data-plane isolation and leak-check obligations restated per enumerated context (no context exempt)"
    how: "Gen1 fix cycle: All obligations remain per-context checkable as in gen0, now with added rigor. F1: micro-probes/canonical fallback now map by underlying type (no undefined inheritance). F2: playground (context 1) gains rung-4 method-not-artifact constraint (REQ-CH-03 s2 compliance). F3: unrevealed authored hints added to all six OUT lists (contexts 1/2/3 explicit; 4/5/6 inherit) + restatement point 2 + named check (authoredHints field absent or only revealed rungs). F6: fail-closed default now has named enforcement seam (InvalidContextTypeError) + test assertion form. No context is exempt: boss/test-out/review inherit underlying type's rules (explicitly stated, now including micro-probes/canonical). All obligations remain checkable by named concrete procedures (spawn invocation, inspect context, assert fields, verify rung-4 output)."
    evidence: ".program/decisions/ADR-0022.md Amendment gen1 (lines 167-279) + amended normative sections (contexts 1-6, restatement points 2-3, enforcement seam)"
artifacts:
  - ".program/decisions/ADR-0022.md"
  - ".program/spec/coach-and-hints.md (amended REQ-CH-01 lines 14-20)"
resume_hint: "Scheduled by ADR-0018. Must be done before ROOT.3.5 dispatches (Phase 2). Pattern: ADR-0017. Survey row: coach-and-hints REQ-CH-01 s1."
notes: |
  Spec shard reading (gen0 2026-07-28):
  - coach-and-hints.md REQ-CH-01 defines tutor's context contract, data-plane isolation
  - REQ-CH-03 defines the 4-rung ladder (reflective, micro-explanation, worked example, full walkthrough)
  - REQ-CH-02 on-demand button always available; struggle-watcher surfaces affordance
  - mastery-model.md REQ-MM-05 s3: 3 clear-miss failures trigger struggle-halt into tutor ladder at reflective rung
  - lesson-experience.md REQ-LX-01–07 describes beat renderer, exercise frames, playground/quiz/challenge/terminal contexts
  - playground.md REQ-PG-02 names coach margin-note UI
  - judge-pipeline.md REQ-JP-04 ungradeable-content path produces zero evidence, excluded from struggle-halt thresholds
  - boss-and-test-out.md REQ-BT-01 s4: hint ladder applies to bosses
  - spaced-review.md REQ-SR-04: review warm-up context (no tutor invocation found)
  
  Invocation-context domain (closed-world enumeration):
  1. Playground exercises (lesson-embedded)
  2. Quiz exercises (lesson-embedded)
  3. Challenge exercises (lesson-embedded, paired with terminal)
  4. Boss exercises (module-level integrative)
  5. Test-out probes (boss-equivalent + concept quiz + hands-on probe)
  6. Spaced-review warm-up items (isomorphic variants)
  
  Contexts verified NOT to invoke tutor:
  - Terminal beats themselves (no coach on terminal output per spec)
  - Prose beats (no exercise, no coach)
  - Session-end beats (recap + retrieval question, no coach)
  - Exploration/demonstrate beats (attempted-only, no mastery evidence per REQ-LX-02)
  
  Default for unenumerated contexts: FAIL-CLOSED — new exercise types must explicitly join via additive ADR
---
