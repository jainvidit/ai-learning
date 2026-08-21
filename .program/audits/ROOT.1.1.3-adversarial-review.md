# Adversarial Review: ROOT.1.1.3 (REQ-CP-05 revisions module)

Artifact: src/lib/revisions.ts, tests/revisions.test.ts, content/migrations/README.md, content/migrations/example-migration.json
Spec basis: .program/spec/content-pipeline.md section REQ-CP-05
Reviewer: dream-reviewer-adversarial (dry-run generation; real review)
Date: 2026-07-27

Baseline: `npx vitest run tests/revisions.test.ts` passed 21/21 before probing.
Probe fixtures and outputs live under `.program/audits/ROOT.1.1.3-verification/`.

## Findings

### F1 (BLOCKING) - Canonicalization silently collapses distinct contents, breaking "content change flips hash"

Spec passage violated - REQ-CP-05 scenario 1: "Given an item whose content changes in any way, when the bundle rebuilds, then its `itemRevision` hash changes while its item ID does not."
Contract clause violated: "canonical-JSON sorted-keys SHA-256" - the serializer neither produces canonical JSON for non-plain values nor rejects them.

Empirical results (node --experimental-strip-types probes importing `computeItemRevision`):

- `NaN===null? true`, `Infinity===null? true`, `NaN===Infinity? true` - `JSON.stringify(NaN)` and `JSON.stringify(Infinity)` both emit the string `null` (revisions.ts lines 122-124), so an edit changing a numeric field between NaN, Infinity, and literal `null` does NOT change the hash. Distinct content, identical revision: direct scenario-1 violation.
- `Date==={}? true`, `Map==={}? true`, `Set==={}? true` - Dates, Maps and Sets have no own enumerable keys, so `canonicalStringify` (lines 131-143) serializes them all as `{}`. Changing a Date value or Map/Set contents leaves the hash unchanged. The signature is `content: unknown`; the beat compiler assembles objects in JS where a Date can slip in unnoticed.
- `toJSON` is ignored: an object with a `toJSON` method hashes by raw own keys, diverging from the JSON.stringify semantics the doc comment (line 116) claims to match.
- Function-valued keys are NOT omitted: they hit the line-146 fallback, `JSON.stringify(fn)` returns `undefined`, and the canonical string embeds the bare token `undefined` - not valid JSON. Probed: `objWithFn===objWithout? false`. JSON.stringify would omit the key; the comment "matching JSON.stringify semantics" is confidently wrong here.
- Top-level function input crashes with a misleading crypto error ("data argument... Received undefined"); BigInt throws "Do not know how to serialize a BigInt"; circular refs crash with a bare RangeError (stack overflow) rather than a diagnosable message; top-level `undefined` hashes the literal 9-char string `undefined`.

Why two reviews would miss it: every test feeds plain JSON-safe literals, and the doc comments assert exactly the properties the code lacks.

Fix direction: validate the input is JSON-representable (throw clearly on NaN/Infinity/BigInt/function/Date/Map/Set/circular) or canonicalize those cases explicitly. Silence is the bug.

### F2 (should-fix) - Migration validation accepts entries that cannot "link old revision to new"

Spec passage - REQ-CP-05 scenario 2: "a migration map entry exists linking old revision to new." README contract: fromRevision/toRevision are "the 16-character hex hash".

Empirical results (fixtures fx1-fx7 under the verification dir):

- Empty-string itemId/fromRevision/toRevision/note: PASSES validation.
- Non-hex, wrong-length revisions (`not-a-hash!!`, `ZZZ`): PASSES.
- `fromRevision === toRevision` (no-op self-link): PASSES.
- Two entries with the same `{itemId, fromRevision}` pointing at DIFFERENT toRevisions (across two files): PASSES, both returned. A consumer resolving an attempt against the old revision gets an ambiguous fork - the map no longer links old to new.

The zod schema (lines 12-17) is four bare `z.string()`. Minimum hardening: nonempty, 16-char lowercase-hex regex on both revision fields, reject from===to, reject duplicate `{itemId, fromRevision}` pairs across the full load. The code does not enforce its own README.

### F3 (should-fix) - buildRevisionsMap silently drops an item whose id is `__proto__`

Contract clause: one map entry per unique id, throwing only on duplicates.
Probed: `buildRevisionsMap([{id:'__proto__'},{id:'constructor'}])` returned a map whose only own key is `constructor`; the `__proto__` entry vanished (line 54 assignment hits the prototype accessor). No throw, no pollution (probed clean), just silent loss - that item's content changes become invisible downstream. Fix: null-prototype object or Map internally.

### F4 (should-fix) - loadMigrationMaps ordering is platform-dependent; ENOENT silent for caller-supplied dirs

`readdirSync` order is filesystem-dependent, so returned entry order is not deterministic across platforms - relevant if CP-04 snapshots the migration set into the immutable bundle. And a mistyped explicit `dir` argument returns `[]` silently (lines 74-77); ENOENT-tolerance is defensible only for the default path. Explicit-dir-missing should throw.

### F5 (note) - Tests assert weaker properties than the requirement

- Batch-load test (test file lines 193-221) uses `toBeGreaterThanOrEqual(2)` and `.some(...)` - cannot fail on duplicated or leaked entries.
- Determinism tests only recompute in-process; nothing falsifies cross-process or cross-platform stability (held in practice, but the test name overclaims).
- The undefined-omission test pins implementation behavior; it is the only canonicalization edge probed at all.

### F6 (note) - 16-hex truncation fitness for CP-04: examined, HELD

64 bits of SHA-256; birthday collision probability at 100,000 items is ~2.7e-10 (computed in probe). A collision would silently mark changed content unchanged, but at content-bank scale the bound is acceptable. Worth a code comment stating the accepted risk.

## Searched and held

1. Structure injection via crafted strings (values embedding quote/comma/brace sequences): held - strings pass through JSON.stringify, delimiters cannot be forged. Probed: `injection distinct? true`.
2. Unicode: NFC vs NFD forms of the same glyph hash differently (probed `false` equality). This matches RFC-8785-style canonical JSON (no normalization), so treated as correct - but authors should know visually identical edits flip revisions.
3. itemRevision leaking onto the compiled Beat shape (sidecar rule): held - grep shows only the revisions and beats modules mention it, and the beats module documents the sidecar rule explicitly.
4. Prototype pollution via migration JSON containing `__proto__` keys: held - JSON.parse and zod do not pollute; probed `Object polluted? false`.

## Commands run

- `npx vitest run tests/revisions.test.ts` - 21 passed
- node --experimental-strip-types stdin probes (canonicalization edges; outputs quoted above)
- fixture-based loadMigrationMaps probes (fx1-fx7 in the verification dir)

## Verdict

request_changes - 1 BLOCKING, 3 should-fix, 2 notes.
