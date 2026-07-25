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
  - One git-backed Workshop per profile; learner never sees git; no hard reset anywhere (WA-01)
  - Mapping rule enforced — Workshop iff a later module reads/extends/re-verifies (WA-02)
  - Artifact records + capability verifiers (WA-03)
depends_on: []
blocks: [ROOT.5.2]
children: []
file_ownership: ["src/lib/workshop.ts"]
review: {tier: 2, required_lenses: [spec-conformance, no-hard-reset-invariant], verdicts: []}
verification: []
artifacts: []
resume_hint: "Workshop dirs are learner-created data once they exist — never bulk-delete (REQ-MS-03). Note: workshop.ts git operations run inside per-profile workshop repos, NOT the program repo — the director-only git rule applies to the program repo."
---
Ramesh owns git mechanics, Sage artifact semantics.
