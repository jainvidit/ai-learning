---
id: ROOT.7.3.3
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-MM-05 s4 "any struggling learner" — struggle-signal domain (ADR-0021)
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.7.3.3-gen0 (dream-implementer-standard, dispatched by director-gen43 2026-07-28 ~00:20Z)
spawned_at: 2026-07-28T00:20:00Z
generation: 0
spec_refs:
  - .program/spec/mastery-model.md#req-mm-05
acceptance_criteria:
  - ADR-0021 ratified — the struggle patterns/thresholds that trigger adaptivity enumerated closed-world with per-trigger testable behaviour; additive relaxation path
  - mastery-model.md amended additively so s4 quantifies over the enumerated triggers
  - Consistency with REJECTED.md recorded (EMA learner-facing mastery, timing-based grading remain rejected — no trigger may reintroduce them)
depends_on: []
blocks: [ROOT.3.2]
children: []
file_ownership: [".program/decisions/ADR-0021.md", ".program/spec/mastery-model.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification:
  - criterion: "ADR-0021 ratified — struggle patterns/thresholds enumerated closed-world with per-trigger testable behaviour; additive relaxation path"
    method: "Drafted ADR-0021 following ADR-0017/0019/0028 pattern. Enumerated 4 triggers with detection rules + adaptive responses + testable behavior per trigger. Closed-world rule stated. Relaxation path defined (additive ADR for new triggers). Default behavior for unenumerated patterns specified."
    evidence: ".program/decisions/ADR-0021.md"
    verdict: "SATISFIED"
  - criterion: "mastery-model.md amended additively so s4 quantifies over the enumerated triggers"
    method: "Amended REQ-MM-05 s4 additively: replaced 'any struggling learner' with quantification over ADR-0021 Triggers 1-4. Added domain clause citing ADR-0021. Restated s4 scenarios to cite trigger numbers. No deletion or rewording of existing obligations outside s4."
    evidence: ".program/spec/mastery-model.md#req-mm-05 lines 67-88"
    verdict: "SATISFIED"
  - criterion: "Consistency with REJECTED.md recorded (EMA learner-facing mastery, timing-based grading remain rejected — no trigger may reintroduce them)"
    method: "Hard consistency check recorded in ADR-0021 'Consistency checks' section. Verified against REJECTED.md line 42 (timing-based grading) and line 43 (EMA learner-facing mastery). No enumerated trigger keys on response timing (explicit rejection of dwell-based adaptivity as distinct trigger without new ADR). No trigger produces continuous mastery percentages (all operate on discrete states + count thresholds). Citations recorded."
    evidence: ".program/decisions/ADR-0021.md lines 116-133 (REJECTED.md verification subsection)"
    verdict: "SATISFIED"
artifacts:
  - .program/decisions/ADR-0021.md
  - .program/spec/mastery-model.md (amended additively, REQ-MM-05 domain clause + s4)
resume_hint: "Scheduled by ADR-0018. Must be done before ROOT.3.2 dispatches (early Phase 2). Pattern: ADR-0017. Survey row: mastery-model REQ-MM-05 s4."
readings:
  - mastery-model.md REQ-MM-05 (struggle-halt trigger + adaptivity rules)
  - mastery-model.md REQ-MM-02 (never-demote invariant context)
  - mastery-model.md REQ-MM-03 (evidence firewall — judge verdicts)
  - coach-and-hints.md REQ-CH-02 (struggle-watcher surfaces affordance)
  - coach-and-hints.md REQ-CH-03 (tutor ladder triggered by 3 fails)
  - lesson-experience.md REQ-LX-02 (attempted-only completion emits zero evidence)
  - judge-pipeline.md REQ-JP-04 (ADR-0020 failure-pattern domain reference)
  - REJECTED.md line 42 (timing-based grading REJECTED — "violates non-competitive constraint")
  - REJECTED.md line 43 (EMA learner-facing mastery REJECTED)
  - ADR-0017 pattern (enumerate-and-reject, closed-world, additive relaxation)
  - ADR-0019 pattern (SSE-endpoint domain enumeration precedent)
  - ADR-0028 pattern (delete-verb canonical list precedent)
---
