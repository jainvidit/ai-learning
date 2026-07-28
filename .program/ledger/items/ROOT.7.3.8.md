---
id: ROOT.7.3.8
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-DL-03 s3 "any offline learner reaching a playground, terminal, or challenge beat" — offline-state domain (ADR-0026)
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.7.3.8-gen1 (dream-implementer-standard, fix cycle, dispatched by director-gen43 2026-07-28 ~02:10Z)
spawned_at: 2026-07-28T02:10:00Z
generation: 1
review_findings_gen0: "request_changes/high — full text .program/audits/ROOT.7.3.8-review.md. BLOCKING: F1 stream-level failure (SSE opens then stalls/errors mid-stream) and spawn-level failure (claude CLI absent, REQ-EX-04 s1 premise) are Home-v1-reachable, unenumerated, and the default's 'caught by State 2' escape hatch is false for them → indefinite spinner violates s3; F2 'onLine=false WITH fakes configured' reachable (EX-04/MG-03 fakes are Phase 0) and State 1 would falsely claim unavailability — needs carve-out or new state. MAJOR: F3 'exactly ONE state' vs two enumerated; F4 State 1 test plan unexecutable under node-env vitest (no jsdom; use Playwright context.setOffline) + line 118 uses the vacuity phrase as proof. MINOR: F5 downed-server rationale wrong; F6 future date."
spec_refs:
  - .program/spec/data-layer-and-offline.md#req-dl-03
acceptance_criteria:
  - ADR-0026 ratified — offline states enumerated closed-world (e.g. fully synced, partial sync, stale bundle, mid-outbox) with the s3 behaviour testable per state; additive relaxation path
  - data-layer-and-offline.md amended additively so s3 quantifies over the enumerated states
  - Consistency with ADR-0003 (offline deferred with hosted) recorded — enumeration must not silently expand Home v1 offline scope
depends_on: []
blocks: [ROOT.4.7]
children: []
file_ownership: [".program/decisions/ADR-0026.md", ".program/spec/data-layer-and-offline.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification:
  - criterion: "ADR-0026 ratified — offline states enumerated closed-world with s3 behaviour testable per state; additive relaxation path"
    method: "Direct inspection of ADR-0026.md gen1: five states enumerated (navigator.onLine=false without fakes, HTTP fetch failure, SSE stream failure, fakes configured, spawn failure), all reachable in Home v1 without deferred machinery; per-state testable predicates with executable Playwright harnesses; closed-world rule; relaxation path for 3 deferred states if ADR-0003 reversed; Amendment gen1 section documents all six review findings fixed"
    evidence: ".program/decisions/ADR-0026.md (full ADR, Amendment gen1 section lines 148-169)"
    status: PASS
  - criterion: "data-layer-and-offline.md amended additively so s3 quantifies over the enumerated states"
    method: "Direct inspection of data-layer-and-offline.md REQ-DL-03 s3: domain clause updated to reference five enumerated states (gen1 additive change vs gen0 two-state clause), quantifying 'offline learner' over expanded enumeration, noting State 4 fakes exception"
    evidence: ".program/spec/data-layer-and-offline.md line 44 (scenario 3 gen1 additive amendment)"
    status: PASS
  - criterion: "Consistency with ADR-0003 recorded — enumeration must not silently expand Home v1 offline scope"
    method: "Direct inspection of ADR-0026.md 'Consistency with ADR-0003' section (gen1): explicit verification that all five enumerated states are reachable WITHOUT deferred machinery (States 3/4/5 are streaming protocol errors, Phase 0 fakes, execution-layer errors — not offline-sync features); 'What is NOT enumerated and why' section unchanged (3 deferred states still NOT reachable in Home v1); Amendment gen1 confirms no silent expansion"
    evidence: ".program/decisions/ADR-0026.md sections 'Consistency with ADR-0003' (lines 75-84) and Amendment gen1 (lines 148-169)"
    status: PASS
artifacts:
  - ".program/decisions/ADR-0026.md (2026-07-27 ratified; Amendment gen1 2026-07-27)"
  - ".program/spec/data-layer-and-offline.md (additive amendment to REQ-DL-03 s3, gen0 + gen1 changes)"
resume_hint: "All acceptance criteria satisfied. ADR-0026 gen1: six review findings fixed — two BLOCKING gaps (States 3/5 stream/spawn failures enumerated), BLOCKING fakes carve-out (State 4), cardinality fixed (ONE→FOUR→five final), test plan corrected (Playwright harness, vacuity phrase deleted, falsifiability restated), downed-server disposition corrected (transport error → State 2), future date fixed. Five-state enumeration, all Home-v1-reachable without deferred machinery, ADR-0003 consistency maintained. Shard amended additively. Awaiting tier-1 spec-conformance review (gen1 re-review)."
---
