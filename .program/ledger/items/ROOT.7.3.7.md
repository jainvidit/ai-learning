---
id: ROOT.7.3.7
parent: ROOT.7.3
type: Decision
title: Ratify or enumerate REQ-EX-01 s3 "never branches on driver" (borderline) (ADR-0025)
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.7.3.7-gen0 (dream-implementer-standard, dispatched by director-gen43 2026-07-28 ~00:20Z)
spawned_at: 2026-07-28T00:20:00Z
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
verification:
  - criterion: "ADR-0025 ratified with concrete check"
    method: "Ratified as falsifiable via grep-based check for driver-conditional patterns (instanceof LocalDriver/CloudDriver/ExecutionDriver, driver.type/kind, DRIVER_TYPE env). Baseline dry-run PASS (zero hits in src/ at commit e52164a). Factory exception rule: composition point MAY branch. UI/rendering code: zero tolerance."
    evidence: ".program/decisions/ADR-0025.md"
  - criterion: "No-edit ruling recorded"
    method: "Shard edit NOT needed. REQ-EX-01 s3 falsifiable as written; grep procedure operationalizes 'when audited'. Ruling recorded in ADR per acceptance criterion 2."
    evidence: ".program/decisions/ADR-0025.md section 'Shard edit ruling'"
artifacts: [".program/decisions/ADR-0025.md"]
resume_hint: "Scheduled by ADR-0018. BORDERLINE per survey — likely a short ratification (grep-for-driver-conditionals check), possibly no shard edit. Must be done before ROOT.4.5 dispatches (Phase 3). Survey row: execution-layer REQ-EX-01 s3."
---
