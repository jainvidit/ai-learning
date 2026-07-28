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
  - Reactive read store over SQLite with subscription/invalidation — dependent queries update without polling (DL-01/02)
  - Optimistic write + server-authoritative rebase path, with the LLM-verdict carve-out (server-truth only) asserted (DL-01)
  - A perf measurement harness demonstrates the <100ms read budget on dashboard queries, its command registered via the standing steward (DL-01)
depends_on: [ROOT.7.3.8]
blocks: [ROOT.4.3]
children: []
file_ownership: ["src/lib/data/**"]
review: {tier: 1, required_lenses: [spec-conformance, simplicity-directive], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned (sizing #22): read store; write/rebase; perf harness. Reads ROOT.2.2's projections — never computes its own (REQ-EL-03). Blocks ROOT.4.3 (coupling #9: the dashboard reads through this store). DL-03 offline deferral is ADR-0003, a scope note, not a criterion (sizing #27)."
---
Consumer conversion (dashboard components reading through the store) is ROOT.4.3's
leaf, not this item's — this item ships the store + one reference query.
