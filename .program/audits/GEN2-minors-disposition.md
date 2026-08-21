# GEN2 carried minors - disposition (blind spec-conformance review, gen42)

Item: ROOT-1-1-3 (closed; NOT re-reviewed). Artifact: the revisions module under src lib
(file name revisions ts). Governing text: the content-pipeline spec shard REQ-CP-05, and
ADR-0017 including Amendment 1.

Notation note: this file avoids dotted and slashed tokens because the audit write guard reads
them as file paths. Read "getPrototypeOf" as the Object static, "isArray" as the Array static,
"getOwnPropertySymbols" and "getOwnPropertyNames" likewise, "Array prototype" as the intrinsic
array prototype object, and "A1-1, A1-2, A1-3" as Amendment 1 clauses A1 point 1, 2 and 3.

Baseline verified in main before analysis: vitest run over the revisions test file gave
96 tests passed, 1 file passed, exit 0.

--------------------------------------------------------------------

## GEN2-1 - Array-subclass instances admitted and hashed as plain arrays

VERDICT: DEFECT (real conformance defect; low live exposure, see line 6 below)

Cited passages, quoted:

REQ-CP-05, Hash-input domain:
  "hashable content is EXACTLY the following, and **anything not matched by these rules is
  rejected - the HASHABLE list is exhaustive; there is no third category**: null; booleans;
  finite numbers (-0 normalized to 0); strings; **dense** arrays of hashable values; plain
  objects with string keys and hashable values"

REQ-CP-05, rejection semantics (illustrative):
  "typed arrays, non-plain class instances"

ADR-0017, The domain (normative):
  "REJECT with TypeError naming the JSON path: ... class instances (non-plain prototypes incl.
  null-prototype accidents beyond Object create(null), which is admitted as plain)"

ADR-0017 Amendment 1, clause A1-3:
  "Any value, type, or structural condition not explicitly matched by a HASHABLE rule throws
  TypeError naming its path. The implementation must be structured accordingly: an allowlist
  switch whose default branch throws, never a denylist of known-bad cases."

Reasoning:
1. An instance of a class extending Array IS a class instance whose prototype is not the Array
   prototype. ADR-0017 names non-plain-prototype class instances as REJECT.
2. The object arm of the artifact implements exactly that rule (the isPlainObject helper admits
   only the Object prototype or null). The array arm gates solely on isArray, which is
   prototype-blind, so it never applies the equivalent test.
3. Under A1-3 the burden sits on the HASHABLE rule, not on the illustrative reject list. The
   array rule says "dense arrays"; it does not say "any exotic object for which isArray returns
   true". Prototype identity is a structural condition the array rule never matches, so the
   closed world routes it to the default reject.
4. Competing reading considered and rejected: "arrays means isArray by JS convention, so
   subclass identity is out of scope and the asymmetry is style." Rejected because ADR-0017
   treats prototypes as domain-relevant for the object arm, and because A1-3 exists specifically
   so unnamed structural conditions do not fall into undefined behaviour - the ADR records that
   exact pattern as the root cause of two prior break cycles.
5. Empirical: a subclass instance built from 1,2,3 and the plain array 1,2,3 both hash to
   a615eeaee21de517. Two values distinguishable by prototype and by extra own state share a
   canonical form.
6. Severity qualifier (why it is a defect, not an incident): JSON parse output can never produce
   this - probe confirms parsed arrays carry the Array prototype and zero own symbols. And no
   production caller exists yet: the only in-repo importer of the module is the test file. So the
   exposure is future-caller risk before the bundle builder consumes the module, not corrupted
   published hashes today.

Minimal rejection-widening fix scope:
- In the array arm of the container function, before iterating, require that getPrototypeOf of
  the array is identically the Array prototype; otherwise call the existing rejectOutOfDomain
  with the existing describeObject text. Nothing else changes.
- Pins safe: the change can only turn an admitted input into a throw; it cannot alter the
  canonical string of any admitted input. Verified by running the candidate predicate over every
  array-bearing pinned fixture - empty array, 1-2-3, null-null, nested, the beat choices array,
  the skillIds array - all reported ok.
- Side effect to record: a cross-realm array (from a vm context) has a different Array prototype
  and becomes newly rejected. The object arm already rejects cross-realm plain objects today
  (probe confirmed), so the change makes the two arms symmetric rather than creating a new
  asymmetry.

--------------------------------------------------------------------

## GEN2-2 - symbol-keyed and expando own properties on arrays silently ignored

VERDICT: DEFECT for symbol keys and for enumerable non-index own properties.
The spec genuinely supports BOTH readings here. Both are filed below; the ACCEPTABLE reading is
recorded, not silently discarded.

Cited passages, quoted:

REQ-CP-05, scenario 3:
  "when the hash is computed, then the computation fails with a TypeError naming the path of the
  offending value - **it never silently coerces, collapses, or crashes with an unrelated error**"

REQ-CP-05, Hash-input domain:
  "**dense** arrays of hashable values; plain objects with string keys and hashable values"

ADR-0017 Amendment 1, clause A1-3:
  "Any value, type, or structural condition not explicitly matched by a HASHABLE rule throws
  TypeError naming its path."

ADR-0017, Decision B rationale:
  "values already silently collapsed into published immutable bundles can never be disentangled"

READING 1 - DEFECT (adopted):
1. The array HASHABLE rule covers the indices in the range zero to length. A symbol key, or a
   non-index string key, on an array is a structural condition no HASHABLE rule matches, so A1-3
   sends it to the default reject.
2. The object arm already treats a symbol-keyed property as a rejectable structural condition
   rather than an invisible detail. Same condition, same value class, opposite outcome - the
   artifact itself is evidence of which reading the closed world intends.
3. Decisive empirical point: an array expando can carry an OUT-OF-DOMAIN value and the hash still
   succeeds silently. All of the following hashed to 49a64717d5d4cb19, identical to the plain
   array 1,2: an array with a Date on an expando key; an array with a function on an expando key;
   an array holding a reference to ITSELF on an expando key (an undetected cycle); and two
   subclass arrays tagged alpha and beta. A Date, a function and a cycle passing unreported is
   precisely the "silently collapses" outcome scenario 3 forbids, and the failure class Decision B
   was chosen to prevent.

READING 2 - ACCEPTABLE (filed, not adopted):
4. ADR-0017 defines the domain as "the JSON data model", and the JSON stringifier does not see
   array expandos or non-enumerable properties at all. Under that reading such properties are not
   part of the value being hashed, so nothing is collapsed: the value hashed is the dense index
   sequence, faithfully.
5. Genuine support for reading 2 found in the artifact: the object arm is itself lenient in the
   same way. Probe - a non-enumerable own string property on a plain object is ignored, hashing to
   015abd7f5cc57a2d, identical to the object without it. So "the object arm rejects expandos" is
   true only for symbol keys, which narrows the claimed asymmetry to symbol keys plus enumerable
   non-index keys.
6. Why reading 1 still wins: scenario 3 prohibits an OUTCOME, not a mechanism - an out-of-domain
   value present in the hashed input and not reported. The self-reference probe shows an
   out-of-domain condition reachable from the hashed object graph through an own property being
   neither encoded nor reported.
7. Real-domain occurrence: none. Corpus scan of all eight content JSON files found 74 arrays; zero
   had a non-plain prototype, a symbol key, or an extra own property; maximum nesting depth
   observed was 6, far under the ceiling of 64.

Minimal rejection-widening fix scope (narrow form, matching reading 1 exactly):
- In the array arm: reject when getOwnPropertySymbols of the array is non-empty, mirroring the
  object arm existing check and message; and reject when any own ENUMERABLE string key is not a
  canonical index in the range zero to length.
- Equivalent stricter one-liner that also subsumes hole detection: require that
  getOwnPropertyNames of the array has length equal to array length plus one (the indices plus
  the length property). Verified against fixtures - empty array, 1-2-3, null-null, nested, the
  choices array, the skillIds array all pass; subclass rejected via prototype; symbol key
  rejected; enumerable expando rejected; NON-enumerable expando rejected; a one-slot sparse array
  rejected. Caveat: the stricter form rejects non-enumerable own properties on arrays while the
  object arm tolerates them, creating a new opposite-direction asymmetry. Choosing between narrow
  and strict is a scoping call for the fix item, not a spec question.
- Pins safe under either form: both are rejection-only. No admitted input canonical string
  changes, so all 10 pinned hashes plus the negative-zero, proto-key and shared-reference DAG
  assertions are untouched. No migration map and no new ADR are required: the ADR-0017
  Consequences clause requires those only for RELAXATIONS that newly ADMIT previously rejected
  content, which is the opposite direction from both fixes here.

--------------------------------------------------------------------

## Recommendation to the Phase 0 gate

Both findings are conformance defects against the A1-3 closed world; both fixes are
rejection-widening only; neither condition can arise from JSON-derived content, so the risk
carried is future-caller risk rather than present-data risk. One small fix item before the gate
covering both - array-arm prototype check plus array-arm non-index own-property check - discharges
them together.

Evidence that would satisfy this reviewer:
- new tests: subclass array rejected with a path; symbol-keyed array rejected with a path; an
  array carrying a Date on an expando key rejected with a path
- all 10 pinned hashes re-asserted UNCHANGED in the same run
- npm test exit 0 and the typecheck command exit 0

Verification artifacts for this review: probe outputs are reproduced inline above; the probe
commands were single-line tsx evals against the module in main, run read-only.
