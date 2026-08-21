---
id: ROOT.1.2.3
parent: ROOT.1.2
type: Task
title: content-schema.md interface doc — authoring contract seam over src/lib/schema.ts
ledger_depth: 3
status: done
generation: 1
owner_agent: implementer-ROOT.1.2.3-gen1 # closed by coordinator-ROOT.1.2-gen1: gen1 fixes verified on main (dream-verifier 3/3, events ROOT.1.2.3.jsonl)
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
resume_hint: "gen1 fix pass COMPLETE. Both review findings fixed in .program/interfaces/content-schema.md 'Skill references' block; evidence .program/evidence/ROOT.1.2.3/objectiveskills-conformance.md; tsc --noEmit exit 0. CODE edit lives in worktree agent-a0d93ad2300952fb1 (integrator must merge that path); ledger mirrored to main. Nothing left to do but re-review."
tier2_plan:
  contract_touched: "The authoring contract documented by .program/interfaces/content-schema.md over src/lib/schema.ts. Documentation side only — the Zod file itself is NOT edited."
  other_side_owner: "ROOT.1.2 is schema steward of src/lib/schema.ts while open (ROOT.7.1 after). Consumers of this doc: ROOT.1.3 Velite, ROOT.5 curriculum authoring, content-generation, REQ-CP-06 CI gates."
  will_not_change: "src/lib/schema.ts (read-only), any other .program/interfaces/* file, and every already-verified section of content-schema.md outside the 'Skill references' block."
verification:
  - criterion: "AC1: .program/interfaces/content-schema.md exists, names src/lib/schema.ts as single source, states additive-only rule (REQ-CP-03), enumerates Phase-0 extensions as landed (skillIds, tiers intro|core|stretch, role:boss, hint rungs, misconception tags, artifact/verifier declarations, preconditions, test-out probes)"
    method: "Manual inspection of created file against src/lib/schema.ts landed exports"
    evidence: ".program/interfaces/content-schema.md"
    verdict: "PASS"
  - criterion: "AC2: Doc records stewardship rule (ROOT.1.2 while open, ROOT.7.1 after close; consumers request via field_request events; non-additive rejected pending ADR)"
    method: "Manual inspection of 'Schema stewardship rule' section"
    evidence: ".program/interfaces/content-schema.md"
    verdict: "PASS"
  - criterion: "AC3: Consumers listed (content build/validate scripts, Velite ROOT.1.3, curriculum authoring ROOT.5, content-generation, CI gates REQ-CP-06) and verification commands named (npm run validate, npx tsc --noEmit)"
    method: "Manual inspection of 'Consumers' and 'Verification commands' sections"
    evidence: ".program/interfaces/content-schema.md"
    verdict: "PASS"
  - criterion: "AC1 gen1 REVIEW FIX (MAJOR): the per-objective sidecar is reachable by an authoring agent — doc names the carrier field `objectiveSkills` with its `.min(1).max(6).optional()` constraints on LessonFrontmatterSchema, and names the `objective` member of ObjectiveSkillsSchema"
    method: "Added `ObjectiveSkillsSchema` and `objectiveSkills` as first-class entries in the 'Skill references' use-site list. Every cited name/constraint grep-verified verbatim against src/lib/schema.ts (read-only): objectiveSkills at schema.ts:234, objective at :220, skillIds at :221, objectives .min(1).max(6) at :229. Empirical: npx tsc --noEmit exit 0, no output."
    evidence: ".program/evidence/ROOT.1.2.3/objectiveskills-conformance.md"
    verdict: "PASS"
  - criterion: "AC1 gen1 REVIEW FIX (MINOR): doc no longer implies universal optionality — explicit note that `objective` and `skillIds` are REQUIRED within ObjectiveSkillsSchema (schema.ts:219-222 has no .optional() on either)"
    method: "Two statements added: 'REQUIRED within the sidecar object' on the ObjectiveSkillsSchema entry, plus an 'Optionality note' scoping the blanket 'all extensions are optional' claim to use sites on existing schemas. Verified schema.ts:220-221 carry no .optional()."
    evidence: ".program/evidence/ROOT.1.2.3/objectiveskills-conformance.md"
    verdict: "PASS"
  - criterion: "gen1 SCOPE CONTAINMENT: no verified content outside the 'Skill references' block was altered, and src/lib/schema.ts was not edited (no contract-shape change)"
    method: "CRLF-normalized content diff of main vs worktree copy: only region changed is the 'Skill references' block (1 line removed, 6 added). All other sections byte-identical to the gen0 reviewed text. src/lib/schema.ts read-only throughout."
    evidence: ".program/evidence/ROOT.1.2.3/objectiveskills-conformance.md"
    verdict: "PASS"
artifacts:
  - ".program/interfaces/content-schema.md"   # EDITED in worktree agent-a0d93ad2300952fb1 — integrator merges from there
  - ".program/evidence/ROOT.1.2.3/objectiveskills-conformance.md"
---

Documents the seam, does not define new fields — the Zod file is normative, this doc is
the discoverable contract for authoring agents (REQ-CP-07 scenario 1 feeds off this).
