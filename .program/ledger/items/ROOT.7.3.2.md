---
id: ROOT.7.3.2
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-JP-04 s2 "any number of subsequent failures" — failure-pattern domain (ADR-0020)
ledger_depth: 3
status: proposed
generation: 0
spec_refs:
  - .program/spec/judge-pipeline.md#req-jp-04
acceptance_criteria:
  - ADR-0020 ratified — the failure patterns bound by JP-04 s2 enumerated (e.g. consecutive, scattered, timing-clustered) with per-pattern testable behaviour; closed-world with additive relaxation path
  - judge-pipeline.md amended additively so s2 quantifies over the enumerated patterns
  - Consistency with mastery-model firewall semantics recorded (two-key contract untouched)
depends_on: []
blocks: [ROOT.2.3]
children: []
file_ownership: [".program/decisions/ADR-0020.md", ".program/spec/judge-pipeline.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification: []
artifacts: []
resume_hint: "Scheduled by ADR-0018. Must be done before ROOT.2.3 (Judge v2) dispatches — i.e. early Phase 1. Pattern: ADR-0017. Survey row: judge-pipeline REQ-JP-04 s2."
---
