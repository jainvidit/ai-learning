---
id: ROOT.1.2.1
parent: ROOT.1.2
type: Task
title: schema.ts additive extension — new authoring fields, Module 1 validates unchanged
ledger_depth: 3
status: proposed
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-03
acceptance_criteria:
  - src/lib/schema.ts gains ALL of, as OPTIONAL fields (additive only, no existing field renamed/retyped/removed) — per-objective skillIds (string[]), difficulty tier enum intro|core|stretch, role:"boss" flag, hint-ladder rungs on authored hints, misconception tag expressible on each quiz distractor (REQ-CP-03 scenario 2), artifact/verifier declarations, requires-preconditions array of strings like "artifact:claude-md:healthy" (workshop-and-artifacts REQ-WA-05 scenario 4), test-out probe declarations (boss-and-test-out REQ-BT-02 — same verifier/rubric, different fixture; curriculum-content REQ-CC-04 scenario 1 lists the authoring surface)
  - npm run validate passes against today's Module 1 content with ZERO content edits (REQ-CP-03 scenario 1 additivity check)
  - npx tsc --noEmit passes
  - Malformed values for the new fields are rejected by the Zod schema (REQ-CP-03 scenario 3 — e.g. tier outside the enum fails parse)
depends_on: []
blocks: [ROOT.1.2.3]
children: []
file_ownership: ["src/lib/schema.ts"]
review: {tier: 2, required_lenses: [spec-conformance, consumer-fit], verdicts: []}
verification: []
artifacts: []
resume_hint: "Tier-2 leaf (interface-crossing shared schema). Verification = npm run validate + npx tsc --noEmit. Do NOT edit content files, validate-content.ts, or any file other than src/lib/schema.ts."
---

Pinned contract decisions (do not re-decide at leaf level):
- Every new field is OPTIONAL so existing content parses unchanged.
- Tier enum is exactly `intro | core | stretch` (REQ-CP-03 text).
- Boss is `role: "boss"` on EXISTING exercise types — not a new exercise type (REQ-BT-01).
- Misconception tags attach to quiz distractors (per-option), not per-question only.
- requires-preconditions is a string array of artifact predicates (WA-05 form
  `"artifact:claude-md:healthy"`); schema validates shape, not registry membership
  (registry checks are REQ-CP-06 CI work, out of scope here).
- Test-out probe declaration references the module boss's verifier/rubric with a
  different fixture (BT-02 scenario 4); shape only, no runtime behavior.
- Beat model types do NOT go in this file — they are compiler output (REQ-CP-02),
  documented in .program/interfaces/beat-model.md.
