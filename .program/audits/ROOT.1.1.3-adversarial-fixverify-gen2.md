# Adversarial Fix Verification: item ROOT 1-1-3, gen2 (REQ-CP-05, Amendment 1)

Artifact: the revisions source and its test file in the MAIN checkout (merged).
Spec basis: content-pipeline shard REQ-CP-05 as amended (hash-input domain clause,
MAX_HASH_DEPTH, scenario 3) and ADR-0017 including Amendment 1 (clauses A1-1, A1-2, A1-3).
Prior verdict verified against: the gen1 adversarial fix-verify (findings NEW-1, NEW-2).
Reviewer: dream-reviewer-adversarial, FRESH instance, blind review. Date: 2026-07-27.
Probe transcripts: the five reviewer probe files suffixed fixverify-gen2 plus the three
command captures (npm test, tsc, eslint) in the verification subdirectory for this item.
All probes executed empirically (node v24 importing the live module); nothing trusted
from the implementer replay.

## Disposition of the two open gen1 findings

NEW-1 (major, sparse holes): CLOSED. Probe 1: new Array(1) now throws TypeError at [0]
naming "array hole" while the empty array still hashes to its pin 4f53cda18c2baa0c, so
the collision class is gone. delete on index 1 throws at [1] (wrapped: beats[1]).
Leading, middle, and trailing holes (including length-extension holes) all throw at the
FIRST hole with correct paths, including nested paths. Hole and explicit undefined at
the same index now both throw. Dense arrays with explicit nulls still hash, and
distinctly by length. Detection is an index-based in-check, not hole-skipping iteration
(confirmed by source read and by the Proxy probes below).

NEW-2 (minor, deep-nesting RangeError): CLOSED. Probe 2: depth 64 hashes (arrays,
objects, and 32 plus 32 mixed); depth 65 throws TypeError naming the full path and
"exceeds MAX_HASH_DEPTH 64" -- verified instanceof TypeError and NOT RangeError.
The 5000-deep replay and a 100000-deep structure both TypeError cleanly with a bounded
message (488 chars -- the counter fires at 65 segments, so no path explosion).
Boundary is exact per the amended spec (root = depth 0; 64 in, 65 out).

## Closed-world allowlist (clause A1-3)

Source read confirms allowlist structure: a typeof switch whose default throws, a
container arm admitting only isArray-true values and plain-prototype objects, with a
throwing fallthrough. Probe 3 -- none of these appear in ANY enumeration, and every one
threw TypeError with a path: Promise, WeakRef, SharedArrayBuffer, DataView, boxed
Number, boxed String, boxed Boolean, generator object, generator function, async
function, Error instance, URL, WeakSet, arguments object, the Math namespace object, a
two-level null-prototype chain, and a top-level Promise. No implicit admission path
into the canonical form was found for any unlisted TYPE.

## Frozen contract

The three export signatures are unchanged (source read). Probe 5 independently
re-derived all 10 pinned pre-fix hashes with a canonicalizer written inside the probe
(sorted keys, undefined-key omission, negative-zero normalization, sha256 to 16 hex):
all 10 match both the pins and the live module. Rejection-only change confirmed:
in-domain output is byte-identical.

## Commands (captured with EXIT_CODE lines)

npm test: 161 of 161 passed, EXIT_CODE=0. tsc noEmit: EXIT_CODE=0. eslint on both
artifact files: clean, EXIT_CODE=0.

## NEW findings (fresh adversarial pass, probe 4)

GEN2-1 (minor). An Array SUBCLASS instance is admitted via the isArray check and hashes
identically to the equivalent plain array. The shard rejects non-plain class instances
and the object arm enforces plain prototypes, but the array arm has no plainness check,
so a class extending Array slips past the "non-plain class instances" illustrative
reject. Not a distinctness violation (canonical form reflects contents only, output is
deterministic and valid JSON), and "dense arrays of hashable values" is literally
satisfied, so this is a posture inconsistency rather than a scenario breach. Fix
direction: in the array arm, reject arrays whose prototype is not the canonical Array
prototype, mirroring the plain-object rule.

GEN2-2 (minor). Symbol-keyed properties are rejected on OBJECTS but silently ignored on
ARRAYS (probe 4: an array carrying a symbol-keyed own property hashes identically to
the bare array; an object with the same symbol key throws). Same for non-index string
expandos on arrays (silently ignored, matching JSON semantics). The HASHABLE rule for
objects says string keys only and the implementation enforces it; the array rule says
nothing about extra own properties, so this is spec-arguable -- but the enforcement
asymmetry is the kind of unnamed case Amendment 1 exists to eliminate. Blast radius
low (parsed JSON can never carry either). Fix direction: either reject arrays bearing
symbol keys or extra own string keys, or record the JSON-semantics admission explicitly
in the domain comment.

Neither finding is a silent collision between distinct in-domain values, neither
resurrects a REJECTED alternative, and neither weakens the two closed findings.

## Attacked and held (probe 4)

- Proxy has-trap lying "no holes" over a holey array: the hole reads back as undefined
  and is rejected at the right index. Fail-closed.
- Proxy has-trap denying membership over a DENSE array: over-rejection only ("array
  hole" at index 0), never admission. Fail-closed.
- Getter on an array index returning undefined: rejected at the index.
- Object getter flipping defined-then-undefined between the filter read and the map
  read (double-read race): rejected, not silently emitted.
- length manipulated to one million on a one-element array: rejected at index 1.
- Depth off-by-one at the 64 boundary, objects-vs-arrays counting, mixed alternation,
  and error-path truncation: all exact per spec.
- Object with key "0" versus the array [1]; proto-named JSON key present versus absent:
  distinct hashes. Distinctness matrix intact.

## Verdict

approve -- NEW-1 and NEW-2 empirically closed, closed-world holds under fresh probes,
frozen contract held (10 of 10 pins independently re-derived), all three commands exit
zero. Two minor findings (GEN2-1 array-subclass admission, GEN2-2 array symbol-key and
expando asymmetry) recorded for follow-up; neither reopens scenario 3.
