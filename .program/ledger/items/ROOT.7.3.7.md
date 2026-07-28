---
id: ROOT.7.3.7
parent: ROOT.7.3
type: Decision
title: Ratify or enumerate REQ-EX-01 s3 "never branches on driver" (borderline) (ADR-0025)
ledger_depth: 3
status: proposed
generation: 0
spec_refs:
  - .program/spec/execution-layer.md#req-ex-01
acceptance_criteria:
  - ADR-0025 ratified — either a recorded ruling that s3 is falsifiable as written (driver count fixed at 2 and named, per survey borderline note) with the concrete check named, or an enumeration of the call sites the no-branching guarantee covers
  - If a shard edit is needed it is additive; if none is needed, the no-edit ruling is recorded in the ADR
depends_on: []
blocks: [ROOT.4.5]
children: []
file_ownership: [".program/decisions/ADR-0025.md", ".program/spec/execution-layer.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification: []
artifacts: []
resume_hint: "Scheduled by ADR-0018. BORDERLINE per survey — likely a short ratification (grep-for-driver-conditionals check), possibly no shard edit. Must be done before ROOT.4.5 dispatches (Phase 3). Survey row: execution-layer REQ-EX-01 s3."
---
