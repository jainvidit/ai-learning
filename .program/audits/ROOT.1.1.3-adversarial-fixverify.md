# Adversarial Fix Verification: ROOT.1.1.3 (REQ-CP-05, gen1 fix cycle)

Artifact: src/lib/revisions.ts, tests/revisions.test.ts, content/migrations/README.md,
content/migrations/example-migration.json (MAIN checkout).
Spec basis: content-pipeline.md REQ-CP-05 as REVISED (hash-input domain clause + scenario 3),
ADR-0017 reading B (enumerate-and-reject).
Reviewer: dream-reviewer-adversarial (fresh instance). Date: 2026-07-27.
Probe scripts/outputs: .program/audits/ROOT.1.1.3-verification/reviewer-*fixverify*.

## Disposition of original findings

- F1 (BLOCKING, canonicalization collapse): FIXED. Empirical replay
  (reviewer-probe-fixverify.txt): NaN, +/-Infinity, Date, Map, Set, function values,
  top-level function, BigInt, symbol values, symbol keys, top-level undefined,
  undefined-in-array, RegExp, Uint8Array, class instances all throw TypeError naming the
  exact JSON path (incl. deep paths like beats[2].meta.score and meta.createdAt).
  toJSON is NOT invoked (function-valued key rejected at path toJSON). Cycles report as
  TypeError naming the cycle path (a[0].b.back), never a bare RangeError. -0 normalizes
  to 0. 1e21 vs the string form stays distinct. Boxed Number/String rejected.
- F2 (migration validation): FIXED. fx1-fx7 replay (reviewer-probe2-fixverify.txt):
  empty strings, non-hex, wrong length, uppercase, self-link, and conflicting
  {itemId, fromRevision} across files all throw with clear messages. New probes: exact
  duplicate with a DIFFERENT note across files also throws (fx8); non-string note (fx9)
  and nested arrays (fx10) rejected. linkKey ambiguity checked: fromRevision is exactly
  16 hex (no spaces) so the composite key cannot alias. README now documents
  the enforced rules and matches the code.
- F3 (__proto__ id dropped): FIXED. Map + defineProperty; own key present alongside
  constructor/toString, readable four ways, no Object.prototype pollution, duplicate
  __proto__ ids still throw. Verified empirically.
- F4 (readdirSync order / explicit-dir ENOENT): FIXED. Explicit missing dir throws
  naming the path; default dir returns entries; entries sorted by
  (itemId, fromRevision, toRevision) with code-unit comparison; test proves order is
  independent of both file order and in-file position.
- F5 (unfalsifiable assertions): FIXED. Batch test now exact toEqual; distinctness
  matrix over 35 in-domain values; pinned-hash suite anchors cross-process stability.
- F6 (16-hex truncation, note): FIXED. Accepted-risk comment now on REVISION_HEX_LENGTH.

## Frozen contract

Signatures unchanged (computeItemRevision(content: unknown): string;
buildRevisionsMap(items): Record<string,string>; loadMigrationMaps(dir?): MigrationEntry[]).
16-hex truncated SHA-256 confirmed. Pinned regression suite (10 pre-fix hashes) exists and
is MEANINGFUL, not tautological: I re-derived every pinned hash with an independent
canonicalizer written in the probe (sorted keys, undefined-omission, -0 to 0, sha256/16hex)
and all 10 match both the pin and the live module (reviewer-probe-fixverify.txt, section
"pinned-hash independent reproduction"). In-domain hashes are unchanged.

## NEW findings (adversarial pass on the new code)

### NEW-1 (major) - Sparse-array holes bypass the domain check and silently collapse

Spec passage violated: REQ-CP-05 scenario 3 ("never silently coerces, collapses") and the
domain enumeration (undefined outside an omitted OBJECT value must be rejected; array
elements are not object values).

Empirical (reviewer-probe3/probe5-fixverify.txt):
- computeItemRevision(new Array(1)) RETURNS 4f53cda18c2baa0c == hash of [] . Distinct
  values, identical hash: an in-domain-looking collision of exactly the class the fix was
  meant to eliminate.
- const beats=["intro","quiz","outro"]; delete beats[1]; hashes silently (canonical form
  embeds a bare hole), while ["intro",undefined,"outro"] at the same index correctly
  throws TypeError. Inconsistent: a hole IS undefined when read.
- Mechanism: Array.prototype.map skips holes, join renders them as empty string, so the
  hole never reaches the typeof-undefined rejection. Canonical output for holey arrays is
  not even valid JSON (e.g. a bare "[1,,3]").
- Fix direction: in the array branch, iterate by index and route any hole (index not in
  array, or simply the read value undefined) into the existing undefined rejection with
  the correct [i] path.
- Blast radius: moderate - JSON.parse never yields holes, but the beat compiler assembles
  arrays in JS where delete arr[i] / new Array(n) are ordinary accidents; today the result
  is a silent hash collision published into an immutable CP-04 bundle.

### NEW-2 (minor) - Deeply nested in-domain content crashes with a bare RangeError

A ~5000-level nested array (all in-domain values) throws "RangeError: Maximum call stack
size exceeded" (reviewer-probe4-fixverify.txt). The spec forbids bare RangeError only for
cycles, so this is not a scenario violation, and real content is orders of magnitude
shallower; but the failure mode is indistinguishable from the pre-fix cycle crash the spec
now bans. Worth a depth guard or documented limit. 100k-key wide objects are fine.

## Searched and held

1. Proxy over a plain object: accepted, hashes as its target - deterministic for
   well-behaved handlers, same posture as JSON.stringify. Held.
2. Non-enumerable own properties ignored (matches Object.keys/JSON semantics); the
   undefined-filter double-read is benign for data objects. Held.
3. Migration composite-key aliasing (itemId containing spaces vs 16-hex suffix): cannot
   alias because fromRevision is fixed-width hex. Sort is total and collision-free once
   duplicates are rejected. Held.
4. null-prototype objects admitted as plain and hash-equal to literals; proto-of-proto
   (Object.create(Object.create(null))) correctly rejected as non-plain. Held.

## Commands run (captured in ROOT.1.1.3-verification/)

- npm test: 145/145 passed, EXIT_CODE=0 (reviewer-npm-test-fixverify.txt)
- npx tsc --noEmit: EXIT_CODE=0 (reviewer-tsc-fixverify.txt)
- npx eslint on both artifact files: clean, exit 0 (reviewer-eslint-fixverify.txt)
- node --experimental-strip-types probes 1-5 (reviewer-probe*-fixverify.txt)
- fixtures fx8-fx10 added alongside original fx1-fx7

## Verdict

request_changes - all 6 original findings FIXED; 1 NEW major (sparse-array holes:
silent collapse, Array(1) collides with []), 1 NEW minor (RangeError on pathological
depth). The major is a small, contained fix and must land with a test before approve:
it reopens the exact silent-collapse guarantee scenario 3 exists to protect.
