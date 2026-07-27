---
id: ROOT.1.1.3
parent: ROOT.1.1
type: Task
title: itemRevision content hashing + migration maps
ledger_depth: 3
status: in_review
generation: 2
owner_agent: implementer-ROOT.1.1.3-gen2 (dream-implementer-critical, owner-authorized third cycle after ADR-0017 Amendment 1, dispatched by director-gen41 2026-07-27)
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
  - "FIX CYCLE (gen2, ADR-0017 Amendment 1 / A1.1): any sparse-array hole (index i in [0,length) with !(i in arr)) throws TypeError naming the path of the first hole (e.g. 'beats[1]: array hole'); hole detection is explicit (index-based `in` checks or key-count equality), NEVER hole-skipping iteration (map/forEach); tests prove new Array(1) throws (no longer collides with []), delete arr[1] throws at [1], and ['a',undefined,'b'] vs ['a',<hole>,'b'] both throw (consistently)"
  - "FIX CYCLE (gen2, A1.2): nesting beyond MAX_HASH_DEPTH = 64 (root = depth 0, objects+arrays counted together) throws TypeError naming the path where the limit was exceeded — explicit depth counter, never a bare RangeError/stack overflow; tests prove depth-64 in-domain content hashes, depth-65 throws with path, and the reviewer's ~5000-deep probe now TypeErrors"
  - "FIX CYCLE (gen2, A1.3): canonicalStringify is structured as a closed-world ALLOWLIST — a switch/dispatch whose default branch throws TypeError naming the path — never a denylist of known-bad cases; test coverage proves the default-reject branch fires for an unlisted value with a path"
  - "FIX CYCLE (gen2): frozen contract held — all three export signatures unchanged; the 10 pinned pre-fix in-domain hashes unchanged; npm test / npx tsc --noEmit / per-file eslint all exit 0 with -gen2 evidence captures incl. EXIT_CODE lines"
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
  - criterion: "FIX CYCLE (gen2, A1.1): sparse-array holes throw TypeError naming the path of the first hole; detection is explicit index-based `in` checks, never hole-skipping iteration"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test-gen2.txt, .program/audits/ROOT.1.1.3-verification/adversarial-probe-replay-gen2.txt"
    note: |
      Array branch of canonicalStringifyContainer iterates by index with an explicit
      `if (!(index in arr))` check BEFORE reading the element -- no map/forEach anywhere in
      the canonicalization path (the gen1 bypass). First hole is named: rejection path uses
      indexPath, e.g. 'beats[1]' / '[0]'. Tests (describe 'A1.1'): new Array(1) throws at [0]
      while [] still returns its pinned 4f53cda18c2baa0c (collision eliminated, baseline
      intact); Reflect.deleteProperty(beats,1) [= delete beats[1]] throws at beats[1];
      leading-holes Array(5) names FIRST hole [0]; explicit-undefined vs hole at the same
      index both throw TypeError naming [1] (consistent); dense [null,null] still admitted
      (density check is not a value check). Reviewer probes 3+5 replayed verbatim against the
      worktree module: every previously-silent sparse case now TypeErrors (probe replay doc,
      sections PROBE 3/3b/5/5b).
  - criterion: "FIX CYCLE (gen2, A1.2): MAX_HASH_DEPTH = 64 explicit depth counter; depth-64 hashes, depth-65 throws TypeError with path; reviewer's ~5000-deep probe now TypeErrors"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test-gen2.txt, .program/audits/ROOT.1.1.3-verification/adversarial-probe-replay-gen2.txt"
    note: |
      MAX_HASH_DEPTH = 64 constant with A1.2 doc comment (policy ceiling, root = depth 0,
      raising later is additive). canonicalStringify takes an explicit depth parameter and
      checks `depth > MAX_HASH_DEPTH` FIRST, before any type dispatch -- deterministic
      TypeError naming the path where the limit was exceeded, never a recursion crash
      reinterpreted (engine stack limits are thousands of frames away at depth 65).
      Tests (describe 'A1.2'): leaf at exactly depth 64 hashes for pure-array, pure-object,
      and mixed 32+32 nestings (objects and arrays counted together); depth-65 throws with
      path and /MAX_HASH_DEPTH 64/ for all three shapes, asserted NOT instanceof RangeError;
      the reviewer's 5000-deep probe replayed as a test AND via verbatim probe4 (which also
      shows 200k-deep -> TypeError with path, 100k-wide object still hashes).
  - criterion: "FIX CYCLE (gen2, A1.3): closed-world allowlist with throwing default branches; default-reject coverage for unlisted values with a path"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test-gen2.txt"
    note: |
      canonicalStringify restructured as an allowlist dispatch: each switch case is exactly
      one HASHABLE shard rule (boolean / finite number / string / typeof-object arm), the
      switch DEFAULT throws via rejectOutOfDomain (catches undefined, function, symbol,
      bigint, and any unknown future typeof). The typeof-object arm delegates to
      canonicalStringifyContainer whose fallthrough default (not-dense-array, not-plain-
      object) also throws. describeRejectedPrimitive/describeObject only DESCRIBE for the
      message -- the default branches throw unconditionally; nothing is admitted implicitly.
      Default-reject coverage (describe 'A1.3'): Promise, WeakMap, ArrayBuffer (none of them
      in the shard's illustrative reject list -- only a closed world catches them) all throw
      TypeError naming the key path; boxed Object(1) via container default; function via
      primitive default. All pass in npm-test-gen2.txt.
  - criterion: "FIX CYCLE (gen2): frozen contract held -- signatures unchanged, 10 pinned hashes unchanged, npm test / tsc / per-file eslint all exit 0 with -gen2 evidence"
    verdict: PASS
    evidence: ".program/audits/ROOT.1.1.3-verification/npm-test-gen2.txt, tsc-noemit-gen2.txt, eslint-owned-gen2.txt, adversarial-probe-replay-gen2.txt"
    note: |
      All three export signatures untouched (tsc --noEmit exit 0 over unchanged call sites).
      The 10 pinned pre-fix in-domain hashes pass UNCHANGED inside npm test (describe 'pinned
      in-domain hashes (pre-fix baseline)' -- no expected value edited; gen2 touched only the
      header comment, MAX_HASH_DEPTH constant, rejectOutOfDomain message,
      describeRejectedPrimitive, and the canonicalStringify/Container restructure -- zero
      changes to number/string/key-sort/undefined-omission emission). npm test 161/161
      (revisions file 96/96, was 80) EXIT_CODE=0; npx tsc --noEmit EXIT_CODE=0; npx eslint on
      the two owned files EXIT_CODE=0. MigrationEntrySchema / loadMigrationMaps /
      buildRevisionsMap / content/migrations/** untouched this cycle.
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
  - "WORKTREE (gen2, agent-a40d03275212d51da): src/lib/revisions.ts (MODIFIED -- A1.1 hole rejection, A1.2 depth guard, A1.3 allowlist restructure; integrator merges from .claude/worktrees/agent-a40d03275212d51da/src/lib/revisions.ts)"
  - "WORKTREE (gen2, agent-a40d03275212d51da): tests/revisions.test.ts (MODIFIED -- +16 tests, 96 total in file; from .claude/worktrees/agent-a40d03275212d51da/tests/revisions.test.ts)"
  - ".program/audits/ROOT.1.1.3-verification/npm-test-gen2.txt (NEW gen2 evidence, EXIT_CODE=0, 161/161)"
  - ".program/audits/ROOT.1.1.3-verification/tsc-noemit-gen2.txt (NEW gen2 evidence, EXIT_CODE=0)"
  - ".program/audits/ROOT.1.1.3-verification/eslint-owned-gen2.txt (NEW gen2 evidence, EXIT_CODE=0)"
  - ".program/audits/ROOT.1.1.3-verification/adversarial-probe-replay-gen2.txt (NEW gen2 evidence -- reviewer probes 3/4/5 replayed verbatim + guarded continuations)"
  - ".program/audits/ROOT.1.1.3-verification/gen2-probe3b-continuation.mjs, gen2-probe5b-continuation.mjs (NEW -- guarded continuations of the reviewer probes past their now-throwing unguarded lines)"
  - "src/lib/revisions.ts (MODIFIED — domain enforcement, schema hardening, defineProperty map, sort, ENOENT policy)"
  - "tests/revisions.test.ts (MODIFIED — 21 -> 80 tests; unfalsifiable assertions replaced)"
  - "content/migrations/README.md (MODIFIED — documents the enforced contract)"
  - "content/migrations/example-migration.json (UNCHANGED this cycle; still valid under the stricter schema)"
  - ".program/audits/ROOT.1.1.3-verification/npm-test-gen1.txt (NEW evidence)"
  - ".program/audits/ROOT.1.1.3-verification/tsc-noemit-gen1.txt (NEW evidence)"
  - ".program/audits/ROOT.1.1.3-verification/eslint-owned-gen1.txt (NEW evidence)"
  - ".program/audits/ROOT.1.1.3-verification/adversarial-probe-replay-gen1.txt (NEW evidence — reviewer F1-F4 probes replayed against the fixed module)"
  - ".program/ledger/items/ROOT.1.1.3.md (this file)"
fix_cycle_gen2:
  - fix: "NEW-1 (major, A1.1): array branch rewritten to index-based iteration with explicit `!(index in arr)` hole detection before element read; first hole rejected with TypeError at its indexPath. Array.prototype.map removed from the canonicalization path entirely."
    proof: "6 new A1.1 tests pass; reviewer probes 3/5 replayed: Array(1) throws at [0] (no longer collides with [] whose pinned hash still returns), delete beats[1] throws at beats[1], hole vs explicit undefined consistent (adversarial-probe-replay-gen2.txt)"
  - fix: "NEW-2 (minor, A1.2): MAX_HASH_DEPTH = 64 constant + explicit depth parameter checked before type dispatch; exceeding it throws TypeError naming the path, never a bare RangeError."
    proof: "5 new A1.2 tests pass incl. depth-64 in-domain (array/object/mixed), depth-65 TypeError-with-path asserted not-RangeError, and the reviewer's 5000-deep probe as a test; verbatim probe4 shows 5000-deep and 200k-deep -> TypeError with path, 100k-wide still hashes"
  - fix: "A1.3: canonicalStringify restructured as a closed-world allowlist -- typeof switch whose cases each match one HASHABLE rule, default throws; container arm (canonicalStringifyContainer) admits only dense arrays and plain objects, fallthrough throws. describeRejectedPrimitive added (describes, never admits)."
    proof: "5 new A1.3 default-reject tests: Promise/WeakMap/ArrayBuffer (unlisted anywhere in the shard) + boxed Object(1) + function all TypeError with a path; npm test 161/161"
rollback_note_gen2: |
  Written BEFORE the first gen2 code edit (dream-implementer-critical obligation).
  All gen2 changes live in worktree .claude/worktrees/agent-a40d03275212d51da (under the
  main checkout root) and touch EXACTLY two code files: src/lib/revisions.ts and
  tests/revisions.test.ts. Nothing is merged into main by this agent (it never runs git);
  the integrator picks the worktree paths up from artifacts. UNDO: discard the worktree
  copies of those two files (git checkout -- src/lib/revisions.ts tests/revisions.test.ts
  in the worktree, or simply do not integrate) -- main is untouched and remains at the
  gen1-merged state (commit 2c36056, 145/145 tests). Evidence files written by gen2 are
  additive new files (.program/audits/ROOT.1.1.3-verification/*-gen2.txt) -- deleting
  them is a full undo. Ledger writes are append-only events plus this item file;
  reverting the item file to its pre-gen2 revision restores the prior record. No data/**
  or sandbox paths are touched; content/migrations/** is in scope by ownership but gen2
  plans NO changes there.
fix_cycle_plan_gen2:
  - contract_touched: "Same surface as gen1 -- the three frozen export signatures of src/lib/revisions.ts. gen2 changes FAILURE BEHAVIOUR ONLY: two new rejection classes (sparse-array holes per A1.1, depth > MAX_HASH_DEPTH=64 per A1.2) and an internal allowlist restructure (A1.3). No in-domain canonical form changes; the 10 pinned pre-fix hashes are the regression guard."
  - other_side_owner: "Downstream consumer ROOT.1.1.4 (unchanged from gen1: no interface file owns this surface; the item-file signature block is the contract of record). New rejections only widen the error domain for inputs that were previously silent collisions (holes) or bare RangeErrors (depth) -- both already build bugs per the amended shard."
  - will_not_change: "Export signatures; 10 pinned hashes; 16-hex truncated SHA-256; sorted-key canonicalization; undefined-value-key omission; -0 -> 0; MigrationEntrySchema; loadMigrationMaps behavior; buildRevisionsMap defineProperty mechanism; src/lib/schema.ts; package.json/package-lock.json; content/migrations/** contents."
fix_cycle_plan_gen1:
  - contract_touched: "src/lib/revisions.ts exports consumed by ROOT.1.1.4 — computeItemRevision(content: unknown): string; buildRevisionsMap(items): Record<string,string>; loadMigrationMaps(dir?): MigrationEntry[] (sync). All three signatures FROZEN; only failure behaviour (new TypeErrors for out-of-domain input) and internal representation change."
  - other_side_owner: "Downstream consumer ROOT.1.1.4. .program/interfaces/beat-model.md declares itemRevision a sidecar and explicitly out of its own scope (line 334) — no interface file owns the revisions surface, so the item-file signature block is the contract of record."
  - will_not_change: "src/lib/schema.ts (steward-owned), 16-hex truncated SHA-256, sorted-key canonicalization, undefined-value-key omission, buildRevisionsMap return type (stays Record<string,string>), and the in-domain canonical output (pinned by a regression test written BEFORE the code change)."
resume_hint: |
  GEN2 FIX CYCLE COMPLETE -- all 4 gen2 criteria PASS (see verification + fix_cycle_gen2);
  status in_review: fix-verify belongs to a FRESH dream-reviewer-adversarial instance, NOT
  this implementer. Scope was the closed ADR-0017 Amendment 1 list (A1.1 holes, A1.2
  depth=64, A1.3 allowlist) and stayed closed -- no third finding class emerged.
  CODE lives in worktree .claude/worktrees/agent-a40d03275212d51da (src/lib/revisions.ts,
  tests/revisions.test.ts) and is NOT merged; integrator picks paths from artifacts. The
  worktree has a node_modules JUNCTION to the main checkout (mklink /J) -- integrator may
  want to remove it before/after merge; it is not a repo file. Main checkout evidence:
  .program/audits/ROOT.1.1.3-verification/{npm-test,tsc-noemit,eslint-owned,
  adversarial-probe-replay}-gen2.txt, all EXIT_CODE=0 semantics (verbatim probes 3/5 exit 1
  AT the new rejections by design -- explained in the replay doc header). npm test 161/161
  (revisions 96/96, was 80). Frozen contract held: 3 signatures, 10 pinned hashes,
  migration schema, migrations dir all untouched. Rollback: see rollback_note_gen2.
  --- prior gen2 dispatch hint below ---
  GEN2 FIX CYCLE dispatch note: scope is EXACTLY the two
  fixverify findings (NEW-1 sparse holes, NEW-2 depth) plus the A1.3 allowlist restructure,
  per ADR-0017 Amendment 1 + amended REQ-CP-05. Re-derive scope from
  .program/audits/ROOT.1.1.3-adversarial-fixverify.md and the shard, NOT from any brief.
  Nothing else changes: frozen signatures, pinned hashes, migration schema all stand.
  On completion -> in_review; fix-verify by a FRESH dream-reviewer-adversarial instance.
  --- prior gen1 hint below ---
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
