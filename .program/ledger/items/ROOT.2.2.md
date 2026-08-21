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
depends_on: [ROOT.2.1]
blocks: []
children: []
file_ownership: ["src/lib/projections/index.ts", "src/lib/projections/streak.ts", "src/lib/projections/resumePosition.ts", "src/lib/projections/frame.ts"]
review: {tier: 2, required_lenses: [spec-conformance, derivability], verdicts: []}
verification: []
artifacts: []
resume_hint: "Sage owns semantics, Ramesh the SQL impl. One module per projection (ADR-0007 item 6 / sizing #14): this item builds the frame + Streak + ResumePosition; skillState.ts is ROOT.3.2's file, reviewQueue.ts ROOT.3.3's, artifactHealth.ts ROOT.5.1's — each computed in exactly one place (REQ-EL-03 s2), later items own their module files without touching this item's. GET/PUT re-backing moved to ROOT.2.1."
---
The replay-derivability criterion (EL-03 s3) is provable once ROOT.7.2's npm test
exists — write it as a test, not a claim.
