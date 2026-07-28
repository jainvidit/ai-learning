---
id: ROOT.7.3.6
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-LX-07 s3 "any beat entering view" — beat entry-mode domain (ADR-0024)
ledger_depth: 3
status: proposed
generation: 0
spec_refs:
  - .program/spec/lesson-experience.md#req-lx-07
acceptance_criteria:
  - ADR-0024 ratified — beat entry modes enumerated closed-world (e.g. scroll, jump, resume, restore) with the s3 obligation testable per mode; additive relaxation path
  - lesson-experience.md amended additively so s3 quantifies over the enumerated modes
  - Consistency with beat-model.md persistent-beat ruling (steward NARROW ratification) recorded
depends_on: []
blocks: [ROOT.4.2]
children: []
file_ownership: [".program/decisions/ADR-0024.md", ".program/spec/lesson-experience.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification: []
artifacts: []
resume_hint: "Scheduled by ADR-0018. Must be done before ROOT.4.2 (BeatRenderer) dispatches (Phase 3). Pattern: ADR-0017. Survey row: lesson-experience REQ-LX-07 s3."
---
