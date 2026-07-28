---
id: ROOT.1.1.5
parent: ROOT.1.1
type: Task
title: revisions.ts rejection-widening — array-arm plainness + non-index own-prop checks (GEN2-1/GEN2-2)
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.1.1.5-gen0 (dream-implementer-hardened, dispatched by director-gen42 2026-07-27 ~22:25Z)
spawned_at: 2026-07-27T22:25:00Z
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-05
acceptance_criteria:
  - Array arm rejects non-plain arrays — getPrototypeOf(arr) === Array.prototype required, else TypeError with JSON path (GEN2-1; closes the Array.isArray subclass admission)
  - Array arm rejects own symbol keys and non-index enumerable own properties with TypeError + path, matching the object arm's enforcement (GEN2-2; closes the silent-ignore asymmetry)
  - All 10 pinned hashes unchanged (frozen contract; the fix is rejection-widening ONLY — any pin change is an automatic failure)
  - New rejection tests with paths for both defects (subclass array; symbol-keyed array; out-of-domain value on an array expando, e.g. Date/function/self-ref)
  - npm test passes; npx tsc --noEmit passes; evidence paths recorded
depends_on: [ROOT.1.1.3]
blocks: []
children: []
file_ownership: ["src/lib/revisions.ts", "tests/revisions.test.ts"]
review: {tier: 2, required_lenses: [spec-conformance, adversarial-fixverify], verdicts: [{lens: spec-conformance, verdict: approve, confidence: high, event_ts: 2026-07-28T00:40:00Z, evidence: ".program/audits/ROOT.1.1.5-review-spec-conformance.md", note: "12/12 pins independently re-derived without importing the artifact; scoping calls (a) narrow-form and (b) null-proto-array asymmetry both ruled consistent-with-spec; MINOR not-this-item: non-enumerable own props hash silently in BOTH arms (pre-existing, symmetric) - Phase 0 Gate note"}]}
verification:
  - criterion: "AC1 GEN2-1 - array arm rejects non-plain arrays (getPrototypeOf === Array.prototype required)"
    how: "isPlainArray() gate added at the TOP of the array arm, before any iteration, so a non-plain array is never partially canonicalized. Verified empirically by a before/after probe over the same 11 cases: pre-fix an Array subclass of 1,2,3 HASHED a615eeaee21de517 (identical to plain [1,2,3]) and a null-prototype array HASHED 49a64717d5d4cb19 (identical to plain [1,2]); post-fix both throw TypeError naming the path and the offending class name. 6 new tests (subclass at root, subclass at nested path beats[0].choices, two differently-tagged subclasses Alpha/Beta, reassigned-null prototype, plain-array admission regression, object-arm symmetry)."
    evidence: ".program/audits/ROOT.1.1.5-verification/02-prefix-probe.txt (pre-fix HASHED), 03-postfix-probe.txt (post-fix THREW), 04-postfix-revisions-suite-verbose.txt"
    result: PASS
  - criterion: "AC2 GEN2-2 - array arm rejects own symbol keys and non-index enumerable own properties, TypeError + path, matching the object arm"
    how: "Two checks after the plainness gate: getOwnPropertySymbols(arr).length > 0 rejects with path <path>[Symbol(x)] (mirrors the object arm existing check and message shape); then every Object.keys(arr) entry must be a CANONICAL array index in [0, length) via isCanonicalArrayIndex. Probe pre-fix: arrays carrying a Date, a function, a SELF-REFERENCE, or a string tag on an expando key ALL hashed to 49a64717d5d4cb19 == plain [1,2]; post-fix all four throw with the expando key in the path. 12 new tests incl. index-looking-but-not-index keys (01, 1.0, -0, +1, 1e0, space-1) and a beyond-2^32-1 numeric key."
    evidence: ".program/audits/ROOT.1.1.5-verification/02-prefix-probe.txt, 03-postfix-probe.txt, 04-postfix-revisions-suite-verbose.txt"
    result: PASS
  - criterion: "AC3 all 10 pinned hashes unchanged (frozen contract)"
    how: "TWO independent proofs. (a) VALUES: the verbose reporter names each pinned expectation and its hash - null 74234e98afe7498f, true b5bea41b6c623f7c, 42 73475cb40a568e8d, -0 5feceb66ffc86f38, hello 5aa762ae383fbb72, empty-object 44136fa355b3678a, empty-array 4f53cda18c2baa0c, nested 90d6116c9bd77072, compiled beat 5ac6a2295c26fb46, undefined-key object 015abd7f5cc57a2d - all 11 lines PASS (10 pins + the -0==0 normalization assertion). (b) TEXT: git diff -U0 on the test file filtered on all 10 hash literals returns ZERO lines, so no expected value was edited to make a test pass. Baseline was 96 tests / exit 0 before the change; 114 / exit 0 after (96 + 18 new, 0 removed, 0 modified)."
    evidence: ".program/audits/ROOT.1.1.5-verification/00-baseline-revisions-suite.txt (96 passed, EXIT_CODE=0), 04-postfix-revisions-suite-verbose.txt (114 passed, EXIT_CODE=0, all pin lines listed), 09-diff-scope.txt"
    result: PASS
  - criterion: "AC4 new rejection tests with paths for both defects (subclass; symbol-keyed; out-of-domain value on an array expando)"
    how: "18 new tests in two describe blocks (GEN2-1: 6, GEN2-2: 12). All three probes the disposition doc named as its evidence bar are present and named after it: Array-subclass rejected with path; symbol-keyed array rejected with the symbol in the path; array carrying a Date on an expando rejected with path - plus the function and SELF-REFERENCE expando cases (the previously undetected cycle). The pre-fix collision partners 49a64717d5d4cb19 ([1,2]) and a615eeaee21de517 ([1,2,3]) are themselves re-pinned in the new block so the collision partner cannot drift. All use the existing expectTypeErrorWithPath helper, which asserts instanceof TypeError, NOT instanceof RangeError, path substring, and a descriptor regex."
    evidence: ".program/audits/ROOT.1.1.5-verification/04-postfix-revisions-suite-verbose.txt"
    result: PASS
  - criterion: "AC5 npm test passes; npx tsc --noEmit passes; evidence paths recorded"
    how: "Full suite (4 files) 218 passed / EXIT_CODE=0, up from the 200-passed baseline by exactly the 18 added tests - so tests/bundle.test.ts, the real CONSUMER of revisions.ts, is still green. tsc --noEmit clean, EXIT_CODE=0. Lint recorded for completeness: EXIT_CODE=1 but every one of the 4 errors + 3 warnings is pre-existing and in a file this item does not own (audit probe scripts, sandbox fixtures, ThemeToggle.tsx); ZERO findings in either owned file."
    evidence: ".program/audits/ROOT.1.1.5-verification/05-postfix-npm-test-full.txt, 06-postfix-tsc-noemit.txt, 08-postfix-lint.txt; baseline 01-baseline-full-suite.txt (200 passed)"
    result: PASS
  - criterion: "HARD INVARIANT - emitted bundle version id for the real corpus stays eb647973722173b3"
    how: "buildBundlePayload() invoked in-process against the REAL authored corpus after the change: POSTFIX_BUNDLE_VERSION=eb647973722173b3, MATCH=true. The same probe was run BEFORE the edit and returned the same value, so this is a genuine before/after comparison, not just a match against a remembered constant. Consistent with the disposition corpus scan: 74 arrays, 0 with a non-plain prototype, symbol key, or extra own property."
    evidence: ".program/audits/ROOT.1.1.5-verification/07-postfix-bundle-version.txt (MATCH=true)"
    result: PASS
  - criterion: "HARD INVARIANT - signatures unchanged and still synchronous; no behaviour change for in-domain input; file_ownership respected"
    how: "The diff touches only rejectOutOfDomain call sites plus three new pure file-local helpers (isPlainArray, describeNonPlainArray, isCanonicalArrayIndex); no export line changed, no async/await/Promise introduced (tsc clean confirms the bundle script call sites still typecheck against synchronous returns). git status --porcelain in the worktree lists EXACTLY two modified files, so the bundle script, src/lib/bundle.ts, tests/bundle.test.ts, src/lib/schema.ts and package.json are untouched. No dependency change."
    evidence: ".program/audits/ROOT.1.1.5-verification/06-postfix-tsc-noemit.txt, 09-diff-scope.txt"
    result: PASS
  - criterion: "SELF-CHECK (not an AC; recorded for the reviewer) - no perf regression, no over-rejection"
    how: "A 200,000-element in-domain array hashes in 89ms and deterministically: the new Object.keys(arr) pass is O(n) beside the existing O(n) hole loop, so nothing super-linear was introduced. FROZEN and SEALED plain arrays still hash to 49a64717d5d4cb19 (== plain [1,2]) - freezing changes neither prototype nor own keys, so the widening does not over-reject. Exotic string keys (empty string, constructor, __proto__, 0x1, Infinity, NaN) each reject with the key named in the path; `length` cannot be redefined as enumerable so it can never be read as an expando. A realistic nested beats/skillIds content shape still hashes."
    evidence: ".program/audits/ROOT.1.1.5-verification/10-adversarial-selfcheck.txt"
    result: PASS
artifacts:
  - path: "src/lib/revisions.ts"
    checkout: "WORKTREE .claude/worktrees/agent-a3da94d911d4bd3fe (branch program/dream-build) - PENDING MERGE by the director"
    note: "Array arm of canonicalStringifyContainer widened: (1) isPlainArray gate before iteration; (2) own-symbol-key rejection; (3) canonical-index check over Object.keys. Three new file-local helpers. File header + array-arm comments updated to state the widened domain. No signature, export, or sync/async change."
  - path: "tests/revisions.test.ts"
    checkout: "WORKTREE .claude/worktrees/agent-a3da94d911d4bd3fe - PENDING MERGE by the director"
    note: "+18 tests in two new describe blocks (GEN2-1, GEN2-2) nested inside the existing Amendment 1 describe so they reuse expectTypeErrorWithPath. NO existing test edited; the 10 pinned hash literals are byte-identical (proved by filtered git diff, see 09-diff-scope.txt)."
  - path: ".program/audits/ROOT.1.1.5-verification/"
    checkout: "MAIN checkout (written by absolute path)"
    note: "9 evidence files: 00 baseline revisions suite, 01 baseline full suite, 02 PRE-fix probe (the silent admissions), 03 POST-fix probe (same cases now throwing), 04 post-fix verbose suite (pin-by-pin), 05 post-fix full suite, 06 tsc, 07 bundle version id, 08 lint, 09 diff scope."
resume_hint: "Created by director-gen42 from the GEN2 minors disposition (.program/audits/GEN2-minors-disposition.md — both ruled DEFECT vs ADR-0017 A1.3 closed-world). Must close before ROOT.1.1 assembly review / Phase 0 Gate. No new ADR needed (disposition: rejection-widening within ADR-0017 Amendment 1). Globs overlap only ROOT.1.1.3 (done) — do not reopen it; overlap scan re-run required if 1.1.3 ever reopens."
---
## Tier-2 pre-implementation plan (implementer-ROOT.1.1.5-gen0)

1. CONTRACT TOUCHED: the CP-05 hash-input domain (REQ-CP-05 "Hash-input domain" /
   ADR-0017 A1.3 closed world) as enforced in the array arm of
   canonicalStringifyContainer inside src/lib/revisions.ts. The exported signatures
   (computeItemRevision, buildRevisionsMap, loadMigrationMaps) are NOT part of the
   change - only the set of inputs that throw widens.
2. OTHER SIDE OWNED BY: no .program/interfaces shard governs the hash domain (grep over
   interfaces: beat-model.md only REFERENCES itemRevision as the change-detection
   mechanism per REQ-CP-05 and explicitly puts CP-05 hashing out of its own scope). The
   real consumer is the bundle builder script (ROOT.1.1.4, done) via
   buildRevisionsMap/computeItemRevision; its observable contract is the emitted bundle
   version id eb647973722173b3, which must not move.
3. WILL NOT CHANGE: any pinned hash; any exported signature or its synchronous-ness; the
   object arm; hole/depth/cycle logic; the bundle builder script, src/lib/bundle.ts,
   tests/bundle.test.ts, src/lib/schema.ts, package.json.

Fix venue: main checkout unless the hook forces a worktree (predecessor pattern: code in
worktree, director merges). Frozen contract: computeItemRevision / buildRevisionsMap /
loadMigrationMaps signatures untouched, all synchronous. The disposition doc names the
exact probes that must flip from silent-admission to TypeError-with-path. ROOT.1.1.4
consumes revisions.ts but only on valid corpus content (74 arrays, 0 non-plain) — this
fix cannot change any emitted bundle hash; if it does, stop and escalate.

## Completion note (implementer-ROOT.1.1.5-gen0, 2026-07-27)

DONE, status in_review. All 5 acceptance criteria PASS plus both hard invariants; nothing
deviated from scope and nothing is blocked.

INTEGRATOR ACTION REQUIRED: the two CODE files live in the worktree
`.claude/worktrees/agent-a3da94d911d4bd3fe` (branch program/dream-build) and must be merged
into main by the director. I ran no git commands beyond read-only status/diff. All 11
evidence files are already in the MAIN checkout at
`.program/audits/ROOT.1.1.5-verification/`.

WHAT CHANGED (both inside the array arm of `canonicalStringifyContainer`, before the
existing A1.1 hole loop, so a rejected array is never partially canonicalized):
1. GEN2-1 - `isPlainArray(arr)`: `Object.getPrototypeOf(arr) === Array.prototype` or reject.
   Note the DELIBERATE asymmetry with `isPlainObject`, which admits a null prototype
   (ADR-0017 names `Object.create(null)` as plain): there is no plain null-prototype ARRAY
   idiom and JSON.parse never makes one, so a null-prototype array is a reassignment
   accident and is rejected. Recorded here because a reviewer will ask.
2. GEN2-2 - own symbol keys rejected (mirrors the object arm's existing check and message
   shape), then every `Object.keys(arr)` entry must be a canonical index in [0, length).
   NARROW form chosen, per the disposition's explicit statement that narrow-vs-strict is a
   scoping call for the fix item: non-ENUMERABLE own properties stay tolerated, because the
   object arm already tolerates them and the strict form would create the opposite
   asymmetry the disposition warned about.

ONE TEST PREMISE CORRECTED MID-WORK (not an implementation change): I first asserted that
`defineProperty(arr, '5', ...)` on a length-2 array yields a non-index property. It does
not - a numeric key within the array-index range is an index write and extends `length` to
6, so the array becomes sparse and the more specific A1.1 HOLE diagnosis correctly wins.
The test now documents that real semantics and a second test covers 4294967296, which is
past the max array index and so genuinely stays a non-index property. The implementation
was never changed for this; ordering hole-detection after the non-index check was
considered and rejected as it would produce the less specific message.

CARRIED RISK (none blocking): the widening newly rejects cross-realm arrays (vm contexts).
The object arm already rejected cross-realm plain objects before this change, so this makes
the arms symmetric rather than creating a new asymmetry - documented in the disposition and
in the code comment. No migration map and no new ADR are needed: ADR-0017 Consequences
requires those only for RELAXATIONS that newly ADMIT previously-rejected content, and both
changes here are rejection-only in the opposite direction.
