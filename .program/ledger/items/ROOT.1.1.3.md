---
id: ROOT.1.1.3
parent: ROOT.1.1
type: Task
title: itemRevision content hashing + migration maps
ledger_depth: 3
status: review
generation: 0
owner_agent: implementer-ROOT.1.1.3-gen0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-05
acceptance_criteria:
  - Every item (exercise, and every compiled beat) gets a stable ID plus content-hash itemRevision; any content change flips the hash while the ID stays fixed (CP-05 scenario 1) — proven by vitest test
  - Deterministic — recomputing over unchanged content yields identical hashes (no timestamps/counters)
  - Migration map mechanism exists: content/migrations/*.json validated shape linking {itemId, fromRevision, toRevision, note}; loader + validation function exported (CP-05 scenario 2)
  - npm test passes; npx tsc --noEmit passes; evidence paths recorded
depends_on: [ROOT.1.1.2]
blocks: [ROOT.1.1.4]
children: []
file_ownership: ["src/lib/revisions.ts", "tests/revisions.test.ts", "content/migrations/**"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification:
  - criterion: "Every item gets a stable ID plus content-hash itemRevision; any content change flips the hash while the ID stays fixed (CP-05 scenario 1)"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test.txt"
    note: "Tests prove: content change flips hash (test 'CP-05 scenario 1'), determinism (identical hashes on unchanged content), key-order independence ({a:1,b:2} === {b:2,a:1}), nested object key-order independence"
  - criterion: "Deterministic — recomputing over unchanged content yields identical hashes (no timestamps/counters)"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test.txt"
    note: "Test 'is deterministic' proves identical hashes across multiple computations of the same content"
  - criterion: "Migration map mechanism exists: content/migrations/*.json validated shape linking {itemId, fromRevision, toRevision, note}; loader + validation function exported (CP-05 scenario 2)"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test.txt"
    note: "Tests prove: valid entries load correctly, malformed JSON throws, missing required fields throw, wrong field types throw, array format supported, non-JSON files ignored, empty directory handled gracefully"
  - criterion: "npm test passes; npx tsc --noEmit passes; evidence paths recorded"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test.txt and tsc-noemit.txt"
    note: "All 84 tests pass including 19 revisions tests; TypeScript compiles without errors"
artifacts:
  - "src/lib/revisions.ts"
  - "tests/revisions.test.ts"
  - "content/migrations/README.md"
  - "content/migrations/example-migration.json"
resume_hint: "Implementation complete, all acceptance criteria verified. Ready for review."
---
New pure library module src/lib/revisions.ts (no framework surface). Required exports —
this signature is fixed by the coordinator so ROOT.1.1.4 can consume it:

- `computeItemRevision(content: unknown): string` — canonical-JSON (sorted keys) SHA-256,
  truncated to 16 hex chars.
- `buildRevisionsMap(items: Array<{id: string; content: unknown}>): Record<string,string>`
  — id -> itemRevision; throws on duplicate ids.
- `loadMigrationMaps(dir?: string): MigrationEntry[]` with
  `type MigrationEntry = { itemId: string; fromRevision: string; toRevision: string; note: string }`
  — reads content/migrations/*.json, validates shape, throws on malformed entries.

itemRevision is a SIDECAR value, never a field on the compiled Beat shape (ADR-0011 #6;
beat-model.md declares it out of scope). Create content/migrations/ with a README-style
example entry file. src/lib/schema.ts is steward-owned — never edit it (validate the
migration shape locally in revisions.ts, e.g. with zod imported directly).
NEVER touch port 3000 / npm run dev (CONSTRAINTS #17).
