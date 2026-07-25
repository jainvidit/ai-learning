---
id: ROOT.1.3
parent: ROOT.1
type: Capability
title: API & streaming — BFF posture, oRPC over Zod, resumable SSE plumbing
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/api-and-streaming.md#req-api-01
  - .program/spec/api-and-streaming.md#req-api-02
  - .program/spec/api-and-streaming.md#req-api-03
acceptance_criteria:
  - Browser talks only to the Next server; credentials never in the client bundle (API-01)
  - oRPC-over-Zod routes emitting OpenAPI/JSON-Schema (API-02)
  - Resumable SSE with heartbeats + backoff as shared plumbing (API-03; Home resume store per OPEN-QUESTIONS #4 Reading A — in-process/file-backed, no Redis)
depends_on: [ROOT.1.2]
blocks: []
children: []
file_ownership: ["src/app/api/**", "src/lib/api/**", "src/proxy.ts"]
review: {tier: 2, required_lenses: [spec-conformance, framework-empirical], verdicts: []}
verification: []
artifacts: []
resume_hint: "OPEN-QUESTIONS #4: Home Edition satisfies the resume contract without Redis — needs an ADR at decomposition; log to DECISIONS-PENDING."
---
No apps/api per ADR-0002 — routes live in the single Next app. Localhost-only proxy
survives (CURRENT-STATE).
