---
id: ROOT
parent: null
type: Program
title: AI Learning App — dream version build
ledger_depth: 0
status: in_progress
owner_agent: director-gen15
owner_model: fable
generation: 15
spawned_at: 2026-07-25T13:33:30Z
heartbeat_at: 2026-07-25T13:38:00Z
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-01
  - .program/spec/migration-and-sequencing.md#req-ms-02
  - .program/spec/migration-and-sequencing.md#req-ms-03
acceptance_criteria:
  - Every Phase (ROOT.1..ROOT.6) is done, cancelled, or blocked awaiting_human_authorization
  - Every shipped requirement has verification entries tracing to shard scenarios
  - The REQ-MS-02 regression floor passed at every phase gate
depends_on: []
blocks: []
children: [ROOT.1, ROOT.2, ROOT.3, ROOT.4, ROOT.5, ROOT.6, ROOT.7]
file_ownership: [".program/**"]
review: {tier: 3, required_lenses: [completeness, coupling, sizing], verdicts: []}
verification: []
artifacts:
  - .program/glossary.md
  - .program/org.md
  - .program/decisions/ADR-0001.md
  - .program/decisions/ADR-0002.md
  - .program/decisions/ADR-0003.md
  - .program/decisions/ADR-0004.md
  - .program/decisions/ADR-0005.md
  - .program/decisions/ADR-0006.md
  - .program/decisions/ADR-0007.md
  - .program/decisions/ADR-0008.md
resume_hint: "Run PART 10: read HEADLINE.md, org.md, glossary.md, latest handoff and audit; recompute the ready frontier (Phase ordering is strict)."
---

# Program root

Phases ROOT.1–ROOT.5 follow migration-and-sequencing REQ-MS-01 strictly; ordering also
honors the LANE-DEPENDENCIES blocking graph. ROOT.7 (standing services) is exempt from
phase ordering — its children carry their own edges (ADR-0007). Binding:
docs/origin/CONSTRAINTS.md, REJECTED.md. Phase 5 (ROOT.6) is parked per ADR-0001 —
never decomposed or dispatched without owner authorization. Genesis decomposition was
adversarially reviewed (3 blind opus lenses, .program/audits/genesis-review-*.md) and
revised per ADR-0007.
