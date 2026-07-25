---
id: ROOT.4.7
parent: ROOT.4
type: Capability
title: Data layer — frozen UX contract, SQLite reactive reads (offline deferred)
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/data-layer-and-offline.md#req-dl-01
  - .program/spec/data-layer-and-offline.md#req-dl-02
acceptance_criteria:
  - Frozen UX read/write contract implemented — reactive <100ms reads for dashboard surfaces (DL-01)
  - Home Edition — SQLite + in-process reactive cache, no sync infra (DL-02)
  - REQ-DL-03 offline machinery explicitly deferred per ADR-0003 (not silently dropped)
depends_on: []
blocks: []
children: []
file_ownership: ["src/lib/data/**"]
review: {tier: 1, required_lenses: [spec-conformance, simplicity-directive], verdicts: []}
verification: []
artifacts: []
resume_hint: "Reads ROOT.2.2's projections. ADR-0003 defers DL-03; if the owner ratifies offline scope, add a child item then."
---
