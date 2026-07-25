---
id: ROOT.1.2.3
parent: ROOT.1.2
type: Task
title: content-schema.md interface doc — authoring contract seam over src/lib/schema.ts
ledger_depth: 3
status: proposed
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-03
acceptance_criteria:
  - .program/interfaces/content-schema.md exists, names src/lib/schema.ts as the single source file, states the additive-only rule (fields are extended, never replaced/renamed/retyped — REQ-CP-03), and enumerates the Phase-0 extension fields as landed by ROOT.1.2.1 (skillIds, tiers intro|core|stretch, role:"boss", hint rungs, misconception tags on distractors, artifact/verifier declarations, requires-preconditions, test-out probe declarations)
  - The doc records the stewardship rule — only the schema steward edits schema.ts (ROOT.1.2 while open, ROOT.7.1 after close); consumers request fields via field_request events through their coordinator; non-additive requests are rejected pending an ADR
  - Consumers are listed (content build/validate scripts, Velite pipeline ROOT.1.3, curriculum authoring ROOT.5, content-generation, CI gates REQ-CP-06) and the verification commands for schema changes are named (npm run validate, npx tsc --noEmit)
depends_on: [ROOT.1.2.1]
blocks: []
children: []
file_ownership: [".program/interfaces/content-schema.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
resume_hint: "Doc-only leaf; depends on ROOT.1.2.1 so the field list documents what actually landed. Read src/lib/schema.ts (read-only) to enumerate real export names. Write only the one named file."
verification: []
artifacts: []
---

Documents the seam, does not define new fields — the Zod file is normative, this doc is
the discoverable contract for authoring agents (REQ-CP-07 scenario 1 feeds off this).
