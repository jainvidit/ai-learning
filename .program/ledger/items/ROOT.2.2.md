---
id: ROOT.2.2
parent: ROOT.2
type: Capability
title: Projections — SkillState, ReviewQueue, Streak, ResumePosition, ArtifactHealth
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/event-log-and-projections.md#req-el-03
  - .program/spec/event-log-and-projections.md#req-el-04
acceptance_criteria:
  - Each projection computed in exactly one place; UI reads projections only (EL-03 scenarios 1–2)
  - Replay-from-empty equals incremental state (EL-03 scenario 3)
  - Streak uses server time + declared timezone + grace day; no loss-threat copy (EL-04; ADR-0004)
  - Progress GET/PUT re-backed by projections behind the existing API shape
depends_on: [ROOT.2.1]
blocks: []
children: []
file_ownership: ["src/lib/projections.ts"]
review: {tier: 2, required_lenses: [spec-conformance, derivability], verdicts: []}
verification: []
artifacts: []
resume_hint: "Sage owns semantics, Ramesh the SQL impl. SkillState/ReviewQueue semantics finalize in Phase 2 — build the projection frame + Streak/ResumePosition now, mastery semantics as consumers of ROOT.3.2."
---
