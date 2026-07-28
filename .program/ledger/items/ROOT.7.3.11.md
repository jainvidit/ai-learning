---
id: ROOT.7.3.11
parent: ROOT.7.3
type: Decision
title: Ratify REQ-CP-05 s3 disposition — "outside an enumerated inside" accepted as-is (ADR-0029)
ledger_depth: 3
status: in_progress
owner_agent: implementer-ROOT.7.3.11-gen0 (dream-implementer-standard, dispatched by director-gen43 2026-07-28 ~00:55Z)
spawned_at: 2026-07-28T00:55:00Z
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-05
acceptance_criteria:
  - ADR-0029 ratified — records that CP-05 s3's rejection clause is the standard falsifiable shape (testable per named rejected type) per the survey disposition and ADR-0017 Amendment 1's closed-world restatement; no shard edit unless a gap is found
  - If a gap IS found, it is routed as a new scoped item, not fixed here (content-pipeline items are in flight/closed)
depends_on: []
blocks: []
children: []
file_ownership: [".program/decisions/ADR-0029.md"]
review: {tier: 0, required_lenses: [spec-conformance], verdicts: []}
verification: []
artifacts: []
resume_hint: "Scheduled by ADR-0018. Ratification-only; blocks nothing (CP decomposition already occurred under ADR-0017). Owns ONLY its ADR file — content-pipeline.md is not in its globs by design (ROOT.1.1.4 era). Lowest priority of the eleven."
---
