---
id: ROOT.5.1
parent: ROOT.5
type: Capability
title: Workshop plumbing — git-backed per-profile project, checkpoint/restore-forward
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/workshop-and-artifacts.md#req-wa-01
  - .program/spec/workshop-and-artifacts.md#req-wa-02
  - .program/spec/workshop-and-artifacts.md#req-wa-03
acceptance_criteria:
  - One git-backed Workshop per profile; learner never sees git; no hard reset anywhere in plumbing or UI (WA-01)
  - Artifact record model + verifier interface published; ArtifactHealth projection implemented in src/lib/projections/artifactHealth.ts (WA-03)
  - The WA-02 mapping-rule validation gate is delivered as a ROOT.1.4-pattern leaf against scripts/validate-content.ts via the gate owner (WA-02)
  - Nightly workshop git-bundle backup (WA-01 s5) — designed and flagged for park-review before implementation (scheduled job touching learner data)
depends_on: [ROOT.7.3.9]
blocks: [ROOT.5.2]
children: []
file_ownership: ["src/lib/workshop.ts", "src/lib/projections/artifactHealth.ts"]
review: {tier: 2, required_lenses: [spec-conformance, no-hard-reset-invariant], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned (sizing #24). Workshop dirs are learner-created data once they exist — never bulk-delete (REQ-MS-03). workshop.ts git operations run inside per-profile workshop repos, NOT the program repo — the director-only git rule applies to the program repo. The sandbox bulk-cleanup Workshop-exclusion guard is ROOT.4.5's deliverable (coupling #19) — verify it exists before creating the first Workshop dir; if absent, blocked on a fix there, never patch sandbox.ts from here."
---
Ramesh owns git mechanics, Sage artifact semantics. Owns projections/artifactHealth.ts
(one projection, one place — ADR-0007 item 6).
