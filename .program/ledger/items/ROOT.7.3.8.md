---
id: ROOT.7.3.8
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-DL-03 s3 "any offline learner reaching a playground, terminal, or challenge beat" — offline-state domain (ADR-0026)
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.7.3.8-gen0 (dream-implementer-standard, dispatched by director-gen43 2026-07-28 ~00:35Z)
spawned_at: 2026-07-28T00:35:00Z
generation: 0
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
    method: "Direct inspection of ADR-0026.md: two states enumerated (navigator.onLine=false, model-gateway fetch failure), both reachable in Home v1 without deferred machinery; per-state testable predicates; closed-world rule; relaxation path for 3 deferred states if ADR-0003 reversed"
    evidence: ".program/decisions/ADR-0026.md (full ADR)"
    status: PASS
  - criterion: "data-layer-and-offline.md amended additively so s3 quantifies over the enumerated states"
    method: "Direct inspection of data-layer-and-offline.md REQ-DL-03 s3: domain clause added referencing ADR-0026, quantifying 'offline learner' over enumerated states"
    evidence: ".program/spec/data-layer-and-offline.md lines 41-44 (scenario 3 amended)"
    status: PASS
  - criterion: "Consistency with ADR-0003 recorded — enumeration must not silently expand Home v1 offline scope"
    method: "Direct inspection of ADR-0026.md 'Consistency with ADR-0003' section: explicit verification that enumeration reflects ADR-0003's constrained scope (no precache/outbox states enumerated for Home v1); 'What is NOT enumerated and why' section calls out 3 deferred states as NOT reachable in Home v1"
    evidence: ".program/decisions/ADR-0026.md sections 'Consistency with ADR-0003' and 'What is NOT enumerated and why'"
    status: PASS
artifacts:
  - ".program/decisions/ADR-0026.md (2026-07-28, gen0)"
  - ".program/spec/data-layer-and-offline.md (additive amendment to REQ-DL-03 s3, 2026-07-28)"
resume_hint: "All acceptance criteria satisfied. ADR-0026 ratified with 2-state enumeration (Home v1: navigator offline + fetch failure), ADR-0003 consistency verified, shard amended. Awaiting tier-1 spec-conformance review."
---
