---
id: ROOT.7.3.4
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-CH-01 s1 "any tutor invocation" — invocation-context domain (ADR-0022)
ledger_depth: 3
status: in_progress
owner_agent: implementer-ROOT.7.3.4-gen0 (dream-implementer-standard, dispatched by director-gen43 2026-07-28 ~00:35Z)
spawned_at: 2026-07-28T00:35:00Z
generation: 0
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
verification: []
artifacts: []
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
