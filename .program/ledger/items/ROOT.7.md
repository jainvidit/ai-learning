---
id: ROOT.7
parent: ROOT
type: Phase
title: Standing services — stewardship & verification surface (cross-phase)
ledger_depth: 1
status: in_progress
owner_agent: director-gen0 (scheduling container; children flat-dispatched)
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-03
  - .program/spec/content-pipeline.md#req-cp-07
  - .program/spec/testing-and-ci.md#req-tc-03
acceptance_criteria:
  - ROOT.7.2 (verification surface) done before ROOT.1.4 closes
  - ROOT.7.1 (standing steward) active whenever any later phase is in flight; closed only at program end
depends_on: []
blocks: []
children: [ROOT.7.1, ROOT.7.2]
file_ownership: []
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification: []
artifacts: []
resume_hint: "Not a migration wave — a container for services that outlive phases (ADR-0007 items 1–2). Exempt from strict phase ordering; its children carry their own edges."
---

# Standing services

Created by ADR-0007 after genesis review: all three adversarial lenses found that
one-shot Phase-0 ownership of standing seams (schema.ts, interfaces, package.json,
verification commands) leaves later phases with no legal writer. Phase-type item exempt
from the strict ROOT.1→ROOT.5 ordering; glossary records the exemption.
