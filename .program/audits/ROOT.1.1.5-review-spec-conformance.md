# ROOT-1-1-5 - blind tier-2 review, lens: SPEC CONFORMANCE

Reviewer: dream-reviewer-primary (blind; author reasoning not read, item file not read).
Governing text read, in order: the content-pipeline spec shard REQ-CP-05 (hash-input
domain clause, scenarios 3 and 4); ADR-0017 including Amendment 1; the GEN2 minors
disposition audit.

Notation note (the audit write guard reads dotted and slashed tokens as file paths, so
this file avoids them): read "getPrototypeOf", "getOwnPropertySymbols", "setPrototypeOf",
"defineProperty", "isArray", "create", "from" as the corresponding Object and Array
statics; "Array prototype" as the intrinsic array prototype object; "isPlainArray" and
"isPlainObject" as the two module-local predicates; and "A1-1, A1-2, A1-3" as Amendment 1
clauses 1, 2 and 3.

VERDICT: approve. Confidence: high.

## Empirical basis (all re-run by this reviewer; nothing taken from recorded evidence)

- vitest over the revisions test file: 114 passed, 1 file passed, exit 0. The baseline
  recorded in the disposition was 96; 114 minus 96 equals the 18 new tests, so no
  pre-existing test was deleted or renamed away to make room.
- npm test (full): 4 files, 218 tests passed, exit 0.
- npx tsc --noEmit: exit 0, no diagnostics.
- npm run lint: 4 errors and 3 warnings, ALL pre-existing and in unrelated component
  files (theme toggle and friends). Filtering the lint output for "revisions" yields zero
  lines, so neither artifact contributes a lint finding.
- Real-corpus bundle build (tsx over the bundle build script): reported "version
  eb647973722173b3 already published (no-op, bytes identical)" and manifest latest equal
  to eb647973722173b3. HARD INVARIANT on the bundle version id: VERIFIED unchanged, by
  running the build path rather than by assumption.
- Independent pin re-derivation: I recomputed truncated SHA-256 over the eleven canonical
  JSON strings that the pin literals claim, in a standalone script that does NOT import
  the module under review (reviewer-pins script in the verification directory). All ten
  pinned literals plus both newly added collision-partner literals reproduce exactly;
  mismatches 0. This falsifies the "pins were quietly edited to fit new behavior" failure
  mode by TEXT as well as by value: each literal is the true hash of the canonical form it
  is supposed to encode, computed outside the artifact.
- Direct behavioral probe (reviewer-behavior script in the verification directory)
  covering every acceptance criterion and both scoping calls.

## Per-criterion findings

AC1 - non-plain arrays rejected. PASS. isPlainArray requires getPrototypeOf to be
identically the Array prototype, and it is applied BEFORE any iteration, so a non-plain
array is never partially canonicalized. Probe: an Array subclass instance throws a
TypeError naming path (root) and the class name; an array whose prototype was reassigned
to null throws naming the null-prototype reassignment case. Both messages carry a JSON
path.

AC2 - own symbol keys and non-index enumerable own properties rejected. PASS. Probe: a
symbol-keyed array throws with a path containing the symbol description and the text
"symbol-keyed property on an array"; an enumerable expando holding a Date throws naming
the key and the text "non-index enumerable own property". The symbol check is textually
the array-arm mirror of the object arm existing symbol check, which satisfies the
"matching the object arm enforcement" clause. The canonical-index predicate is correctly
strict: it rejects zero-padded, decimal-pointed, signed, exponent-form and leading-space
keys, none of which are element slots. The tests also cover the two genuinely tricky JS
cases - a numeric key inside index range EXTENDS length and therefore surfaces as the more
specific HOLE diagnosis, while a key past the maximum array index does not extend length
and is caught as non-index. Both are documented by test rather than assumed, which is the
right treatment for behavior I could otherwise only assert from memory.

AC3 - all ten pins unchanged, by value and by text. PASS; see the independent
re-derivation above. The fix is rejection-only by construction: both new gates return
through the shared reject helper before any part string is produced, so neither can alter
the canonical string of any admitted input. Probe confirms plain literals, Array from
output, spread output, JSON-parsed arrays, frozen arrays and sealed arrays all still hash
to the pinned pair value.

AC4 - rejection tests with paths for both defects. PASS. GEN2-1 block: 7 tests (re-pinned
collision partners; subclass at root; subclass at a nested path; two distinct subclasses
throwing rather than colliding with each other; null-prototype reassignment; a positive
admission set; object-arm symmetry). GEN2-2 block: 11 tests (symbol key; Date expando;
function expando; self-reference expando, the previously undetected cycle;
in-domain-valued expando proving the rule is structural and not a value check; nested
path; index-looking keys; the length-extension hole case; the beyond-index-range case;
the deliberate non-enumerable tolerance; holes still reported as holes). 18 new tests,
matching the stated count. Every rejection assertion checks TypeError, not-RangeError,
path containment AND a descriptor regex, so a throw for the wrong reason fails the test
rather than passing it.

AC5 - PASS (npm test exit 0; npx tsc --noEmit exit 0; lint unaffected).

HARD INVARIANT, exported signatures. PASS. Three exports remain, all typeof function, all
arity 1, all with constructor name "Function" and not AsyncFunction - still synchronous.
The migration-entry type export is unchanged. tsc exit 0 against the unmodified consumer
call sites is corroborating evidence.

HARD INVARIANT, object arm and hole, depth, cycle logic untouched. PASS on the evidence
available to me (I do not run git, so this is behavioral rather than diff-based). The hole
check is still an explicit index-based "in" test and never hole-skipping iteration, so the
A1-1 normative implementation constraint is honoured; the depth guard is still an explicit
counter firing past 64; cycle detection is still the ancestors set with a finally-scoped
delete, so sibling-shared references stay legal. Probe: depth 64 hashes, depth 65 throws
with a path plus the "MAX_HASH_DEPTH 64" text and is not a RangeError; a one-slot sparse
array throws naming index 0. All 96 pre-existing tests pass unchanged, which is the
strongest available behavioral proof that no pre-existing branch shifted.

One ordering point I checked because it could have been a silent regression: the
non-index check runs BEFORE the density loop, so a sparse array could in principle have
been re-diagnosed as a non-index property instead of an array hole. It is not, because a
hole means FEWER own index keys than length rather than an extra key, so the
enumerable-key scan finds nothing to complain about and the density loop still produces
the more specific message. Verified by probe and by two dedicated tests.

## Scoping call (a) - narrow GEN2-2: non-ENUMERABLE own properties on arrays tolerated

RULING: consistent-with-spec, with a MINOR residual recorded below.

Reading adopted: the A1-3 closed world is a rule about the VALUE BEING HASHED, and
ADR-0017 fixes that value as "the JSON data model". Non-enumerable own properties are
invisible to that model - and, decisively for the symmetry argument, the object arm
ratified in the closed predecessor item already tolerates them. My probe confirms the
object arm leniency independently: a plain object carrying a non-enumerable Date hashes,
and so does one carrying a non-enumerable self-reference. The narrow form therefore makes
the two arms EXACTLY symmetric, which is the property the adopted reading in the
disposition rested on (same condition, same value class, same outcome). The strict form
would have created a fresh opposite-direction asymmetry, which the disposition itself
flagged and then explicitly delegated: "Choosing between narrow and strict is a scoping
call for the fix item, not a spec question." The implementation states the choice and its
reason in-comment and pins it with a test, rather than leaving it as an accident of the
predicate. That is the correct disposition of a delegated call.

MINOR (not blocking, not a regression, and NOT this item to fix): the scenario-3 OUTCOME
prohibition is still reachable through a non-enumerable own property in BOTH arms - probe
shows a Date and a self-reference each hashing silently that way. This is a pre-existing
property of the object arm, made symmetric by this fix rather than widened by it, and
closing it would change none of the pins. Recommend the Phase 0 gate carry it as a
separate one-line observation against the object arm, not against this item.

## Scoping call (b) - isPlainArray rejects null-prototype arrays, isPlainObject admits them

RULING: consistent-with-spec. This is not an unexplained asymmetry; it is the wording of
the ADR itself. The ADR-0017 reject list reads "class instances (non-plain prototypes
incl. null-prototype ACCIDENTS BEYOND Object create(null), which is admitted as plain)".
The admission is scoped to the Object-create-with-null idiom. A null-prototype ARRAY can
only arise from setPrototypeOf applied to an existing array, which is precisely the
"accident beyond" that the same clause rejects. There is no null-prototype-array idiom and
JSON parsing never produces one, so nothing inside the real hash-input domain is lost. The
module states this reasoning at the predicate and a test pins it. Branch order is also
verified: the isArray branch precedes the plain-object branch, so a null-prototype array
cannot slip into the lenient object arm.

## Residual risks recorded, none blocking

- Cross-realm plain arrays become newly rejected. This is rejection-widening in the
  direction ADR-0017 prefers; it needs no new ADR and no migration map under the ADR
  Consequences clause, which requires those only for RELAXATIONS that newly admit
  previously-rejected content. It also makes the array arm match the object arm, which
  already rejected cross-realm plain objects.
- No production caller consumes the module yet apart from the bundle build path, which I
  ran and which is byte-identical at version eb647973722173b3. Exposure of the widened
  rejection is future-caller risk, not published-hash risk.

## Evidence artifacts written by this reviewer

Under the verification directory for this item, prefixed "reviewer-" so they cannot be
mistaken for the implementer evidence: reviewer-pins (independent pin derivation, does not
import the artifact) and reviewer-behavior (acceptance-criteria and scoping-call probe).
Both are read-only with respect to the artifact; the artifact and every file outside the
audits tree were left untouched.
