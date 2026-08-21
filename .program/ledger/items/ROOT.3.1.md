---
id: ROOT.3.1
parent: ROOT.3
type: Contract
title: Skill registry — 4–6 skills per module declared in content
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/mastery-model.md#req-mm-01
acceptance_criteria:
  - Module 1 (and curriculum.json) declares 4–6 skills with exercises mapped via skillIds, verified by npm run validate (MM-01 scenario 1)
depends_on: []
blocks: [ROOT.3.2, ROOT.3.3]
children: []
file_ownership: ["content/curriculum.json", "content/modules/01-how-llms-work/**"]
review: {tier: 1, required_lenses: [spec-conformance, pedagogy-fit], verdicts: []}
verification: []
artifacts: []
resume_hint: "LANE-DEPENDENCIES block 3 — until content carries skills the engine has nothing to track. Schema fields already exist from ROOT.1.2; this item populates them for Module 1 + curriculum map. The CI hard-flip of the skill-ref gate (MM-01 s2) is ROOT.1.4's paired leaf, depends_on this item (sizing #15)."
---
Skills for modules 2–14 are declared during Phase 4 authoring against this registry
pattern; this item establishes the pattern + Module 1's registry. curriculum.json
ownership transfers to ROOT.5.5's coordinator at Phase 4 (ADR-0007 item 8).
