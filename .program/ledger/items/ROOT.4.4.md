---
id: ROOT.4.4
parent: ROOT.4
type: Capability
title: Playground v2 — server-authoritative runs, rubric transparency
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/playground.md#req-pg-01
  - .program/spec/playground.md#req-pg-02
acceptance_criteria:
  - Server-authoritative runs over resumable SSE with stop endpoint (PG-01)
  - Rubric transparency + per-criterion feedback; staged gate-verdict states; coach margin note wired (PG-02)
depends_on: [ROOT.4.1]
blocks: []
children: []
file_ownership: ["src/components/lesson/Playground.tsx", "src/app/api/playground/run/**"]
review: {tier: 1, required_lenses: [spec-conformance, server-truth], verdicts: []}
verification: []
artifacts: []
resume_hint: "Consumes ROOT.1.3's SSE plumbing, ROOT.2.3's verdict shape, ROOT.3.5's coach. Optimistic client verdicts are REJECTED — server truth only."
---
