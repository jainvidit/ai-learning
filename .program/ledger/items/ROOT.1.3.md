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
  - oRPC-over-Zod routes emitting OpenAPI/JSON-Schema; the emitted JSON-Schema is publishable as the contract handed to content-authoring agents (API-02, CP-07)
  - Resumable SSE with heartbeats + backoff as shared plumbing (API-03)
  - The Home SSE resume-store decision (OQ #4, default Reading A — in-process/file-backed, no Redis) is ADR'd BEFORE the SSE plumbing leaf dispatches
depends_on: [ROOT.1.2, ROOT.1.6, ROOT.7.3.1]
blocks: []
children: []
file_ownership: ["src/app/api/**", "src/lib/api/**", "src/proxy.ts"]
review: {tier: 2, required_lenses: [spec-conformance, framework-empirical], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned. API-01 (BFF, no credentials in bundle) is already true and lives on the Gate checklist, not here (sizing #26). The resume-store ADR is a blocking first leaf (sizing #12); ROOT.4.4 consumes it."
---
No apps/api per ADR-0002 — routes live in the single Next app. Localhost-only proxy
survives (CURRENT-STATE). Third writer in the Phase-0 package.json chain (after 1.6,
before 1.5).
