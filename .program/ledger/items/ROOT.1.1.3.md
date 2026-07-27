---
id: ROOT.1.1.3
parent: ROOT.1.1
type: Task
title: itemRevision content hashing + migration maps
ledger_depth: 3
status: blocked
blocked_reason: failed_twice
generation: 1
owner_agent: implementer-ROOT.1.1.3-gen1 (dream-implementer-hardened, fix cycle vs adversarial findings, dispatched by director-gen40 2026-07-27T05:30Z)
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-05
acceptance_criteria:
  - Every item (exercise, and every compiled beat) gets a stable ID plus content-hash itemRevision; any content change flips the hash while the ID stays fixed (CP-05 scenario 1) — proven by vitest test
  - Deterministic — recomputing over unchanged content yields identical hashes (no timestamps/counters)
  - Migration map mechanism exists: content/migrations/*.json validated shape linking {itemId, fromRevision, toRevision, note}; loader + validation function exported (CP-05 scenario 2)
  - npm test passes; npx tsc --noEmit passes; evidence paths recorded
  - "FIX CYCLE (gen1, ADR-0017): canonicalStringify enforces the CP-05 hash-input domain — JSON data model only; every out-of-domain type in the shard enumeration (undefined/function/symbol/BigInt/NaN/±Infinity/Date/Map/Set/RegExp/typed arrays/non-plain instances/cycles) throws TypeError naming the JSON path; -0 normalizes to 0; cycles reported as cycles — each rejected type has a test (CP-05 scenario 3)"
  - "FIX CYCLE (gen1): MigrationEntrySchema validates content — itemId nonempty, fromRevision/toRevision exactly 16 lowercase hex and unequal, note nonempty; loadMigrationMaps rejects conflicting duplicate {itemId,fromRevision} pairs, sorts entries deterministically (never readdirSync order), and throws on an explicitly-passed nonexistent dir (default dir absent may return [])"
  - "FIX CYCLE (gen1): buildRevisionsMap handles id __proto__ without prototype-accessor loss (null-prototype object or Map) — proven by test; unfalsifiable >=2/.some assertions in existing tests replaced with exact expectations"
depends_on: [ROOT.1.1.2]
blocks: [ROOT.1.1.4]
children: []
file_ownership: ["src/lib/revisions.ts", "tests/revisions.test.ts", "content/migrations/**"]
review: {tier: 2, required_lenses: [spec-conformance, adversarial], verdicts: ["primary/spec-conformance: approve-with-notes (independent re-run test+tsc exit 0); 3 should-fix arbitrated by coordinator (events ROOT.1.1.jsonl 18:45:01) -> directed fix cycle applied; dream-verifier confirmed all 4 fixes landed conclusively (npm test 86/86, tsc 0, per-file eslint 0, sync signature, hex examples)", "adversarial (2026-07-27, first execution of role): request_changes — 1 critical (canonicalStringify collapses distinct contents: NaN/Infinity===null, Date/Map/Set==={}, function values embed literal undefined, circular refs bare RangeError — violates CP-05 s1 'content changes in any way -> hash changes'), 2 major (MigrationEntrySchema four bare z.string(): empty/non-hex/self-link/conflicting-duplicate all pass — CP-05 s2; buildRevisionsMap silently drops id __proto__), 1 minor (readdirSync order platform-dependent; explicit-dir ENOENT -> []; >=2/.some test assertions cannot fail). Held under attack: JSON string escaping, sidecar rule, prototype pollution via migration JSON, 16-hex collision bound. All probes executed empirically. Findings: .program/audits/ROOT.1.1.3-adversarial-review.md", "adversarial fix-verify (2026-07-27, gen1 fix): request_changes — all six ORIGINAL findings FIXED (every out-of-domain type throws TypeError with exact JSON path; cycles named; migration validation rejects fx1-fx10; __proto__ round-trips; ENOENT throws; sorts deterministic; frozen contract held — 10 pinned pre-fix hashes independently re-derived from scratch and match; 145/145, tsc 0, eslint 0). NEW: 1 major (sparse-array holes bypass domain check — new Array(1) hashes identical to []; delete beats[1] silently produces non-JSON canonical form while explicit undefined throws; Array.prototype.map skips holes so they never reach rejection — the exact silent-collapse class scenario 3 bans), 1 minor (~5000-deep in-domain nesting crashes with bare RangeError, the opaque failure mode the spec bans for cycles; needs depth guard or documented limit). Proxy/non-enumerable/null-prototype/boxed-primitive probes held. Verdict doc: .program/audits/ROOT.1.1.3-adversarial-fixverify.md"]}
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
    note: "gen1 fix cycle re-ran all three named commands after the fix: npm test 145/145 (revisions file 80/80, was 21), tsc 0, per-file eslint 0. Evidence: npm-test-gen1.txt, tsc-noemit-gen1.txt, eslint-owned-gen1.txt"
  - criterion: "FIX CYCLE (gen1, ADR-0017): canonicalStringify enforces the CP-05 hash-input domain; out-of-domain types throw TypeError naming the JSON path; -0 normalizes to 0; cycles reported as cycles (CP-05 scenario 3)"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test-gen1.txt, .program/audits/ROOT.1.1.3-verification/adversarial-probe-replay-gen1.txt"
    note: |
      canonicalStringify rewritten as an exhaustive typeof switch + plain-object gate; every non-domain
      branch calls rejectOutOfDomain(path, description) -> TypeError. Path builder: keys join with '.',
      array indices append '[n]', top level is '(root)'; deep-path test asserts the literal string
      'beats[3].meta.createdAt'. Cycle detection uses an ancestors Set on the OPEN recursion stack
      (added before recursing, removed in a finally), so a cycle throws a TypeError saying "circular
      reference detected at <path> ... (cycle)" while a shared/DAG reference stays legal (test:
      'admits repeated (shared, non-circular) references').
      One test per rejected type (18 tests in describe 'CP-05 hash-input domain enforcement'):
      top-level undefined, undefined-in-array, function, symbol value, symbol KEY, BigInt, NaN,
      +Infinity, -Infinity, Date, Map, Set, RegExp, Uint8Array, class instance, cycle (indirect),
      cycle (direct self), cycle (array self), plus deep-path naming and no-toJSON-invocation.
      Admission tests: Object.create(null) hashes as plain, JSON.parse output hashes as plain.
      -0: normalized via Object.is(value,-0)?0:value; test asserts -0===0, {delta:-0}==={delta:0},
      [-0,1]===[0,1] AND the pinned hash 5feceb66ffc86f38 (identical to 0) is unchanged from pre-fix.
      Distinctness: table of 34 distinct in-domain values (incl. null vs "null", {} vs [], [0] vs ["0"],
      {"a.b":1} vs nesting, and a key containing a quote+comma+brace injection string) asserted to
      produce 34 distinct hashes with a collision-naming message.
      Independent replay of the reviewer's own F1 probes against the fixed module recorded in
      adversarial-probe-replay-gen1.txt: all 16 previously-silent probes now TypeError, the circular
      case reports "(cycle)" not RangeError, and the reviewer's misleading-crypto-error and
      literal-'undefined'-token paths are gone.
  - criterion: "FIX CYCLE (gen1): MigrationEntrySchema validates content; loadMigrationMaps rejects conflicting duplicate {itemId,fromRevision}, sorts deterministically, throws on explicit nonexistent dir"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test-gen1.txt, .program/audits/ROOT.1.1.3-verification/adversarial-probe-replay-gen1.txt"
    note: |
      Schema (local zod, src/lib/schema.ts untouched): itemId/note .min(1); fromRevision/toRevision
      .regex(/^[0-9a-f]{16}$/); .refine(from !== to) with path ['toRevision'] and message
      "fromRevision and toRevision must differ (a self-link migrates nothing)". Because .refine wraps
      the object, MigrationEntry is now declared as an explicit type alias (not z.infer) so the exported
      shape stays exactly {itemId,fromRevision,toRevision,note} — signature FROZEN, verified by tsc.
      Rejection tests (9 table cases + self-link): empty itemId/note/fromRevision/toRevision, non-hex
      from, non-hex to, too-short, too-long, UPPERCASE hex, from===to. A companion test asserts the
      baseline entry those cases are derived from is ACCEPTED, so the table cannot pass vacuously.
      Duplicates: a seenLinks Map keyed `${itemId} ${fromRevision}` throws "Conflicting migration
      entries" (differing toRevision) or "Duplicate migration entry" (identical) — tested cross-file,
      same-file, and exact-duplicate; a legal revision CHAIN (entry2.from === entry1.to) still loads.
      Determinism: .json files sorted by name, then entries sorted by (itemId, fromRevision, toRevision)
      with a locale-independent comparator (not localeCompare). Test writes files whose name order AND
      in-file order both differ from the expected result and asserts exact array equality, twice.
      ENOENT: explicit dir -> Error "Migration directory not found: <dir> (an explicitly-passed
      directory must exist)"; default dir absent -> [] (usingDefaultDir flag). Replay probe confirms
      the explicit-dir throw that previously returned [].
      Also re-held the reviewer's prototype-pollution probe as a test: a __proto__ key in migration JSON
      leaves Object.prototype clean and the returned entry has exactly the 4 expected own keys.
      content/migrations/README.md updated so the documented contract now matches the enforced one
      (hex regex, self-link ban, duplicate ban, sort order, explicit-dir ENOENT throw, hash domain).
  - criterion: "FIX CYCLE (gen1): buildRevisionsMap handles id __proto__ without prototype-accessor loss; unfalsifiable >=2/.some assertions replaced with exact expectations"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test-gen1.txt, .program/audits/ROOT.1.1.3-verification/adversarial-probe-replay-gen1.txt"
    note: |
      buildRevisionsMap accumulates into a Map internally, then materializes the Record with
      Object.defineProperty(map, id, {value, enumerable, writable, configurable}) — bypassing the
      Object.prototype __proto__ SETTER that silently swallowed the entry before. RETURN TYPE unchanged
      (Record<string,string>), verified by tsc and by the unchanged call sites in tests.
      Round-trip test proves for ids ['__proto__','constructor','toString']: Object.keys equals that
      exact array, hasOwnProperty('__proto__') true, map['__proto__'] equals the expected hash, the
      property DESCRIPTOR value matches, Object.entries matches exactly, JSON.parse(JSON.stringify(map))
      preserves it, and Object.getPrototypeOf(map) is still Object.prototype with no pollution of {}.
      Duplicate detection still fires for a repeated __proto__ id (moved to the Map, so it cannot be
      defeated by the accessor either). Domain TypeError propagation through buildRevisionsMap tested.
      Unfalsifiable assertions removed: the batch-load test's toBeGreaterThanOrEqual(2)+.some(...) is now
      toEqual([first, second]) with the file written in REVERSE order (so it also proves the sort);
      'builds a map of id to itemRevision' and the scenario-1-via-buildRevisionsMap test now assert
      Object.keys(map) toEqual exact arrays instead of toHaveLength/toHaveProperty; the in-repo
      content/migrations test asserts the exact single expected entry instead of a per-entry regex loop.
      Grep of tests/revisions.test.ts for toBeGreaterThanOrEqual|\.some\(|toBeGreaterThan\( returns zero
      matches.
  - criterion: "CONTRACT REGRESSION GUARD (self-imposed): in-domain content hashes IDENTICALLY to before the fix"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test-gen1.txt"
    note: |
      Before editing revisions.ts, the pre-fix module was executed to capture hashes for 10 in-domain
      inputs (scalars incl. -0, empty object/array, nested object, a representative compiled beat,
      undefined-valued-key object). Those literals are pinned in describe 'pinned in-domain hashes
      (pre-fix baseline)' and were re-run after the change: all 10 identical
      (null 74234e98afe7498f, true b5bea41b6c623f7c, 42 73475cb40a568e8d, -0 5feceb66ffc86f38,
      'hello' 5aa762ae383fbb72, {} 44136fa355b3678a, [] 4f53cda18c2baa0c, nested 90d6116c9bd77072,
      beat 5ac6a2295c26fb46, undef-omit 015abd7f5cc57a2d). The describe block carries a comment
      forbidding future agents from "updating the expected value" without a migration map + new ADR.
      This is the guard that proves the fix is failure-behaviour-only for ROOT.1.1.4.
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
fix_cycle_gen1:
  - fix: "F1 (BLOCKING): canonicalStringify now enforces the CP-05 hash-input domain (ADR-0017 reading B). Exhaustive typeof switch + plain-prototype gate; every out-of-domain value throws TypeError naming its JSON path. -0 normalized to 0. Cycles detected via an open-stack ancestors Set and reported as cycles."
    proof: "18 per-type rejection tests + 34-value distinctness table pass; reviewer's own F1 probes replayed and all now TypeError (adversarial-probe-replay-gen1.txt)"
  - fix: "F2 (should-fix): MigrationEntrySchema validates content — min(1) ids/notes, /^[0-9a-f]{16}$/ on both revisions, refine(from !== to). loadMigrationMaps throws on conflicting or exact-duplicate {itemId,fromRevision}."
    proof: "10 rejection tests + baseline-accepted test + 3 duplicate/conflict tests + revision-chain-allowed test pass"
  - fix: "F3 (should-fix): buildRevisionsMap accumulates in a Map and materializes via Object.defineProperty; id '__proto__' round-trips. Return type still Record<string,string>."
    proof: "Round-trip test asserts exact Object.keys, hasOwnProperty, descriptor, entries, JSON round-trip, no pollution; replay probe shows own keys [__proto__, constructor]"
  - fix: "F4 (minor): explicit .json file-name sort plus (itemId, fromRevision, toRevision) entry sort with a locale-independent comparator; explicitly-passed nonexistent dir now throws, default dir absent still returns []."
    proof: "Order test writes reversed file+in-file order and asserts exact array equality twice; explicit-dir throw test asserts message and path"
  - fix: "F5 (note): unfalsifiable assertions removed — toBeGreaterThanOrEqual(2)/.some(...) replaced with toEqual on exact arrays; Object.keys toEqual instead of toHaveLength/toHaveProperty; in-repo migrations test pinned to its exact single entry."
    proof: "grep toBeGreaterThanOrEqual|\\.some\\(|toBeGreaterThan\\( over tests/revisions.test.ts -> zero matches; npm test 145/145"
  - fix: "F6 (note): accepted-risk comment added on the REVISION_HEX_LENGTH constant (64-bit truncation, ~2.7e-10 birthday probability at 100k items) as the reviewer suggested."
    proof: "src/lib/revisions.ts REVISION_HEX_LENGTH doc comment; eslint exit 0"
  - fix: "Regression guard: pre-fix hashes for 10 in-domain inputs captured BEFORE the code change and pinned as a test; all 10 unchanged after."
    proof: "describe 'pinned in-domain hashes (pre-fix baseline)' passes; see the CONTRACT REGRESSION GUARD verification entry"
  - fix: "content/migrations/README.md aligned with the now-enforced rules (hex regex, self-link ban, duplicate ban, deterministic sort, explicit-dir ENOENT throw, hash-input domain)."
    proof: "README Format/Usage sections rewritten; example-migration.json unchanged and still loads (exact-equality test)"
artifacts:
  - "src/lib/revisions.ts (MODIFIED — domain enforcement, schema hardening, defineProperty map, sort, ENOENT policy)"
  - "tests/revisions.test.ts (MODIFIED — 21 -> 80 tests; unfalsifiable assertions replaced)"
  - "content/migrations/README.md (MODIFIED — documents the enforced contract)"
  - "content/migrations/example-migration.json (UNCHANGED this cycle; still valid under the stricter schema)"
  - ".program/audits/ROOT.1.1.3-verification/npm-test-gen1.txt (NEW evidence)"
  - ".program/audits/ROOT.1.1.3-verification/tsc-noemit-gen1.txt (NEW evidence)"
  - ".program/audits/ROOT.1.1.3-verification/eslint-owned-gen1.txt (NEW evidence)"
  - ".program/audits/ROOT.1.1.3-verification/adversarial-probe-replay-gen1.txt (NEW evidence — reviewer F1-F4 probes replayed against the fixed module)"
  - ".program/ledger/items/ROOT.1.1.3.md (this file)"
fix_cycle_plan_gen1:
  - contract_touched: "src/lib/revisions.ts exports consumed by ROOT.1.1.4 — computeItemRevision(content: unknown): string; buildRevisionsMap(items): Record<string,string>; loadMigrationMaps(dir?): MigrationEntry[] (sync). All three signatures FROZEN; only failure behaviour (new TypeErrors for out-of-domain input) and internal representation change."
  - other_side_owner: "Downstream consumer ROOT.1.1.4. .program/interfaces/beat-model.md declares itemRevision a sidecar and explicitly out of its own scope (line 334) — no interface file owns the revisions surface, so the item-file signature block is the contract of record."
  - will_not_change: "src/lib/schema.ts (steward-owned), 16-hex truncated SHA-256, sorted-key canonicalization, undefined-value-key omission, buildRevisionsMap return type (stays Record<string,string>), and the in-domain canonical output (pinned by a regression test written BEFORE the code change)."
resume_hint: |
  FIX CYCLE gen1 COMPLETE — all 3 fix criteria PASS plus a self-imposed regression guard; status
  in_review (the adversarial reviewer owns fix verification, NOT this implementer). Nothing left to do
  unless the reviewer reopens. Adversarial findings F1-F6 all addressed (see fix_cycle_gen1).
  Named commands, all exit 0, evidence under .program/audits/ROOT.1.1.3-verification/*-gen1.txt:
  npm test 145/145 (revisions 80/80); npx tsc --noEmit; npx eslint on the two owned files.
  Code changes live in the worktree C:\Users\jainv\workplace\ai-learning-app\.claude\worktrees\agent-a4cf181fb3d5672a6
  and are NOT yet merged — an integrator must pick up the paths listed in artifacts.
  NOTE for whoever reconciles the ledger: this worktree was created from a commit predating the gen1
  header, so the mirror of this item file to the main checkout at 01:29 briefly reverted the header to
  gen0/changes_requested; it was restored in the same session from the pre-mirror read (header fields +
  the 3 FIX CYCLE acceptance criteria re-added verbatim). No other field differed between the two copies.
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
