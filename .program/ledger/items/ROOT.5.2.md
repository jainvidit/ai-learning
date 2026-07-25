---
id: ROOT.5.2
parent: ROOT.5
type: Capability
title: Artifact shelf + cumulative re-verification + regression repair
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/workshop-and-artifacts.md#req-wa-04
  - .program/spec/workshop-and-artifacts.md#req-wa-05
acceptance_criteria:
  - Shelf with live ArtifactHealth badges; shelf-teaser rendered into ROOT.4.3's reserved hero slot; Workshop dock tab populated via ROOT.4.6's tab registration (WA-04)
  - Shelf animation fires through ROOT.4.1's celebration API registration surface — no second animation primitive (WA-04 s2, FP-04 s1)
  - Cumulative re-verification; non-punitive repair emitting positive debugging evidence (WA-05, incl. requires-precondition support from the schema)
depends_on: [ROOT.5.1]
blocks: []
children: []
file_ownership: ["src/components/workshop/**", "src/app/workshop/**"]
review: {tier: 1, required_lenses: [spec-conformance, non-punitive-copy], verdicts: []}
verification: []
artifacts: []
resume_hint: "Reads ArtifactHealth projection (ROOT.5.1's module). Integration points were pre-built as extension surfaces (hero slot, dock tab registration, celebration registration) — if any is missing, that is a blocker on the owning item, never an edit to Phase-3 files (coupling #20/#26)."
---
