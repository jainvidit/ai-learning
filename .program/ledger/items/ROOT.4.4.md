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
  - Rubric card + per-criterion feedback + staged gate-verdict states (PG-02, consumes ROOT.2.3's tier/confidence fields)
  - Coach margin note wired, labeled "Coach — not your grade" (CH-05 UI half, consumes ROOT.3.5's no-numerics schema)
depends_on: [ROOT.4.2]
blocks: []
children: []
file_ownership: ["src/components/lesson/Playground.tsx", "src/app/api/playground/run/**"]
review: {tier: 1, required_lenses: [spec-conformance, server-truth], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned or 3-leaf split (sizing #21): run/stop over SSE; rubric+verdict states; coach note. Consumes ROOT.1.3's SSE plumbing (incl. its resume-store ADR), ROOT.2.3's verdict shape, ROOT.3.5's coach, ROOT.4.2's ExerciseFrame (edge added — Playground.tsx carve-out per ADR-0007 item 5). Optimistic client verdicts are REJECTED — server truth only."
---
