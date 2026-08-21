---
id: ROOT.5.4
parent: ROOT.5
type: Capability
title: Spec amendments before modules 2–14 — template + guide + format normalization
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/curriculum-content.md#req-cc-04
  - .program/spec/content-pipeline.md#req-cp-07
acceptance_criteria:
  - _TEMPLATE.md and AUTHORING-GUIDE.md extended (boss finale + test-out sections matching ROOT.5.3's declaration shapes, skills, misconception tags, session-end convention) — never replaced
  - specs/module-*.md amended per Sage #2 (one leaf per spec batch 02–07 and 08–14)
  - Format normalization across the two house styles (separate leaf, explicitly last)
  - CP-07 discoverability holds — the complete authoring contract (guide + template + schema + validate command + oRPC JSON-Schema) is derivable from the repo alone; npm run validate + CI gates are the only approval gates (CP-07 scenarios 1–2)
depends_on: [ROOT.5.3]
blocks: [ROOT.5.5]
children: []
file_ownership: ["specs/**"]
review: {tier: 1, required_lenses: [spec-conformance, authoring-usability], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned (sizing #3 — Task was wrong for ~15 files). Hard precondition for ROOT.5.5 (REQ-CC-04). Template sections must match ROOT.5.3's shipped declaration shapes — read the interface doc, never invent. CC-04 s2's feedback loop (gaps found while authoring feed the template) runs through this item staying open until ROOT.5.5's first module validates; schema gaps go to ROOT.7.1."
---
