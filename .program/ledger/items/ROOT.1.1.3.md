---
id: ROOT.1.1.3
parent: ROOT.1.1
type: Task
title: itemRevision content hashing + migration maps
ledger_depth: 3
status: changes_requested
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
review: {tier: 2, required_lenses: [spec-conformance, adversarial], verdicts: ["primary/spec-conformance: approve-with-notes (independent re-run test+tsc exit 0); 3 should-fix arbitrated by coordinator (events ROOT.1.1.jsonl 18:45:01) -> directed fix cycle applied; dream-verifier confirmed all 4 fixes landed conclusively (npm test 86/86, tsc 0, per-file eslint 0, sync signature, hex examples)", "adversarial (2026-07-27, first execution of role): request_changes — 1 critical (canonicalStringify collapses distinct contents: NaN/Infinity===null, Date/Map/Set==={}, function values embed literal undefined, circular refs bare RangeError — violates CP-05 s1 'content changes in any way -> hash changes'), 2 major (MigrationEntrySchema four bare z.string(): empty/non-hex/self-link/conflicting-duplicate all pass — CP-05 s2; buildRevisionsMap silently drops id __proto__), 1 minor (readdirSync order platform-dependent; explicit-dir ENOENT -> []; >=2/.some test assertions cannot fail). Held under attack: JSON string escaping, sidecar rule, prototype pollution via migration JSON, 16-hex collision bound. All probes executed empirically. Findings: .program/audits/ROOT.1.1.3-adversarial-review.md"]}
verification:
  - criterion: "Every item gets a stable ID plus content-hash itemRevision; any content change flips the hash while the ID stays fixed (CP-05 scenario 1)"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test.txt"
    note: "Tests prove: content change flips hash (test 'CP-05 scenario 1' + new test via buildRevisionsMap), determinism (identical hashes on unchanged content), key-order independence ({a:1,b:2} === {b:2,a:1}), nested object key-order independence, undefined canonicalization"
  - criterion: "Deterministic — recomputing over unchanged content yields identical hashes (no timestamps/counters)"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test.txt"
    note: "Test 'is deterministic' proves identical hashes across multiple computations of the same content"
  - criterion: "Migration map mechanism exists: content/migrations/*.json validated shape linking {itemId, fromRevision, toRevision, note}; loader + validation function exported (CP-05 scenario 2)"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test.txt"
    note: "Tests prove: valid entries load correctly (now synchronous), malformed JSON throws, missing required fields throw, wrong field types throw, array format supported, non-JSON files ignored, empty directory handled gracefully"
  - criterion: "npm test passes; npx tsc --noEmit passes; evidence paths recorded"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test.txt, tsc-noemit.txt, eslint-owned.txt"
    note: "All 86 tests pass including 21 revisions tests; TypeScript compiles without errors; ESLint exits 0 on owned files"
fix_cycle:
  - fix: "CONTRACT FIX: loadMigrationMaps now synchronous returning MigrationEntry[] (was async Promise<MigrationEntry[]>). Uses readdirSync/readFileSync from node:fs."
    proof: "Function signature changed, tests updated to remove await/async, all 86 tests pass including 7 loadMigrationMaps tests"
  - fix: "ESM import: replaced require('crypto') with static import createHash from node:crypto"
    proof: "npx eslint src/lib/revisions.ts tests/revisions.test.ts exits 0"
  - fix: "Added test 'CP-05 scenario 1 via buildRevisionsMap' proving same id with changed content -> map key unchanged, map value (revision) changed"
    proof: "New test passes in npm test output (86 tests total)"
  - fix: "Canonicalization: keys with undefined values now omitted (matching JSON.stringify semantics). Added test proving {a:1,b:undefined} hashes identically to {a:1}"
    proof: "New test 'canonicalization: keys with undefined values are omitted' passes"
  - fix: "Fixed example-migration.json and README.md examples to use valid 16-char lowercase hex strings (replaced invalid hex chars like 'g')"
    proof: "example-migration.json now uses a1b2c3d4e5f60001/b2c3d4e5f6071112; README examples updated; loadMigrationMaps tests with valid hex pass"
artifacts:
  - "src/lib/revisions.ts"
  - "tests/revisions.test.ts"
  - "content/migrations/README.md"
  - "content/migrations/example-migration.json"
fix_cycle_plan_gen1:
  - contract_touched: "src/lib/revisions.ts exports consumed by ROOT.1.1.4 — computeItemRevision(content: unknown): string; buildRevisionsMap(items): Record<string,string>; loadMigrationMaps(dir?): MigrationEntry[] (sync). All three signatures FROZEN; only failure behaviour (new TypeErrors for out-of-domain input) and internal representation change."
  - other_side_owner: "Downstream consumer ROOT.1.1.4. .program/interfaces/beat-model.md declares itemRevision a sidecar and explicitly out of its own scope (line 334) — no interface file owns the revisions surface, so the item-file signature block is the contract of record."
  - will_not_change: "src/lib/schema.ts (steward-owned), 16-hex truncated SHA-256, sorted-key canonicalization, undefined-value-key omission, buildRevisionsMap return type (stays Record<string,string>), and the in-domain canonical output (pinned by a regression test written BEFORE the code change)."
resume_hint: "FIX CYCLE gen1 in progress against adversarial findings F1-F5 (ADR-0017 reading B). Per-criterion state in fix_cycle_gen1 below. Item file is edited in the worktree copy and mirrored to the main checkout after every update."
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
