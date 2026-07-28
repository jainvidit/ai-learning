---
id: ROOT.7.3.10
parent: ROOT.7.3
type: Decision
title: Ratify REQ-MS-03 s1 delete-verb list as canonical (borderline) (ADR-0028)
ledger_depth: 3
status: in_progress
owner_agent: implementer-ROOT.7.3.10-gen0 (dream-implementer-standard, dispatched by director-gen42 2026-07-27 ~22:25Z)
spawned_at: 2026-07-27T22:25:00Z
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-03
acceptance_criteria:
  - ADR-0028 ratified — either the delete-verb list in REQ-MS-03 s1 is ruled CANONICAL (the "zero hits" audit greps exactly that list, closed-world, additions via additive ADR), or the list is completed and the shard amended additively
  - The Gate audit row's exact grep procedure named in the ADR so every phase Gate (ROOT.1.8, 2.5, 3.6, 4.9, 5.6) runs the same falsifiable check
depends_on: []
blocks: [ROOT.1.8]
children: []
file_ownership: [".program/decisions/ADR-0028.md", ".program/spec/migration-and-sequencing.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification: []
artifacts: []
resume_hint: "Scheduled by ADR-0018. NEAR-TERM: blocks ROOT.1.8 (Phase 0 Gate) — the Gate's MS-03 never-delete row needs a canonical verb list to be falsifiable. Likely a short ratification. Survey row: migration-and-sequencing REQ-MS-03 s1 (borderline)."
---
