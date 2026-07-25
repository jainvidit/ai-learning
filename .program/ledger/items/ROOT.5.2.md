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
  - Shelf with live ArtifactHealth badges (WA-04)
  - Cumulative re-verification; non-punitive repair emitting positive debugging evidence (WA-05)
depends_on: [ROOT.5.1]
blocks: []
children: []
file_ownership: ["src/components/workshop/**", "src/app/workshop/**"]
review: {tier: 1, required_lenses: [spec-conformance, non-punitive-copy], verdicts: []}
verification: []
artifacts: []
resume_hint: "Reads ArtifactHealth projection (ROOT.2.2 frame); dock tab from ROOT.4.6."
---
