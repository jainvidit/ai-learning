---
id: ROOT.7.3.1
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-API-03 s3 "any SSE response" — SSE endpoint domain (ADR-0019)
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.7.3.1-gen0 (dream-implementer-standard, dispatched by director-gen42 2026-07-27 ~22:25Z)
spawned_at: 2026-07-27T22:25:00Z
generation: 0
spec_refs:
  - .program/spec/api-and-streaming.md#req-api-03
acceptance_criteria:
  - ADR-0019 ratified — exhaustive enumeration of the SSE-emitting endpoints bound by REQ-API-03 s3 (closed-world; new endpoints join via additive ADR), consistent with adjacent shards (execution-layer, coach-and-hints)
  - api-and-streaming.md amended additively so s3 quantifies over the enumerated list; per-endpoint criterion is falsifiable
  - Divergence check recorded — no enumerated endpoint contradicts an existing interface doc or CONSTRAINTS/REJECTED
depends_on: []
blocks: [ROOT.1.3]
children: []
file_ownership: [".program/decisions/ADR-0019.md", ".program/spec/api-and-streaming.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification:
  - criterion: "ADR-0019 ratified — exhaustive enumeration of the SSE-emitting endpoints bound by REQ-API-03 s3 (closed-world; new endpoints join via additive ADR), consistent with adjacent shards (execution-layer, coach-and-hints)"
    method: "Manual spec cross-reference + route audit + consistency check"
    evidence: ".program/decisions/ADR-0019.md (enumeration: playground /api/playground/run, terminal /api/claude-code/exec; closed-world rule; relaxation path); consistency verified vs execution-layer REQ-EX-02/03/05, coach-and-hints REQ-CH-01 (excluded: request/response), judge-pipeline (excluded: request/response), CONSTRAINTS.md, REJECTED.md"
    result: "PASS"
  - criterion: "api-and-streaming.md amended additively so s3 quantifies over the enumerated list; per-endpoint criterion is falsifiable"
    method: "Additive edit to scenario 3 text"
    evidence: ".program/spec/api-and-streaming.md line 43 (s3 now references 'the enumerated SSE-endpoint domain (see ADR-0019: playground streaming endpoint `/api/playground/run`, terminal/execution streaming endpoint `/api/claude-code/exec`)'); no deletion, only additive clarification; per-endpoint headers+heartbeats checks now testable"
    result: "PASS"
  - criterion: "Divergence check recorded — no enumerated endpoint contradicts an existing interface doc or CONSTRAINTS/REJECTED"
    method: "Grep + manual read of interfaces/*, CONSTRAINTS.md, REJECTED.md"
    evidence: "ADR-0019 'Consistency check' section: no SSE-specific interface contract exists; coach/judge excluded (not SSE); CONSTRAINTS #17 (port 3000) not touched; REJECTED line 78 (raw PTY) consistent with exec endpoint prompt-based design"
    result: "PASS"
artifacts: []
notes: |
  Spec corpus reading complete. REQ-API-03 s3 universal phrase: "Given any SSE response".
  Domain established from spec cross-references:
  - api-and-streaming.md REQ-API-03: playground/terminal SSE
  - execution-layer.md REQ-EX-02/03: terminal session streams (SSE-down + POST-up)
  - coach-and-hints.md: tutor invocations (not SSE; request/response)
  - judge-pipeline.md: judge verdicts (not SSE; request/response)
  Existing route audit (src/app/api/**):
  - api/playground/run/route.ts: SSE streaming (text/event-stream)
  - api/claude-code/exec/route.ts: SSE streaming (text/event-stream)
  Survey row 1 domain "playground/terminal/unspecified" confirmed.
  Pattern: ADR-0017 closed-world enumeration + additive relaxation path.
resume_hint: "Scheduled by ADR-0018 (mapping table). NEAR-TERM: ROOT.1.3 is Phase 0 and cannot dispatch until this is done. Pattern: ADR-0017 (enumerate closed-world, reject/fail outside, relax additively). Survey basis: .program/audits/2026-07-27T0540-unfalsifiable-criteria-survey.md row 1."
---
