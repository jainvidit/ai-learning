# Adversarial fix-verify - item ROOT 1-1-5 (tier-2 lens 2 of 2, gen42)

Artifact: the revisions module under src lib plus its test file. Governing text: shard
REQ-CP-05 and ADR-0017 with Amendment 1. Blind review; the item file was not read.

Notation note (same convention as the GEN2 disposition doc): this file avoids dotted,
slashed and greater-than tokens because the audit write guard reads them as paths or
redirects. Read "the intrinsic Array prototype" for the Array prototype object,
"getOwnPropertyDescriptor" as the Object static, and "A1-1, A1-3" as Amendment 1 clauses.

Probe scratch: the folder named ROOT 1-1-5-adversarial-fixverify under audits. Probes ran
as single tsx eval commands against main, read-only. Baseline: npm test 218 passed exit 0;
typecheck exit 0. Control hashes unchanged: plain 1,2,3 gave a615eeaee21de517 and plain
1,2 gave 49a64717d5d4cb19 - the frozen pins are intact.

## Part 1 - disposition probe reconstruction: ALL PASS

Every previously-silent admission named in the GEN2 disposition now throws TypeError
naming a JSON path:

- P1 subclass array 1,2,3: THREW (root path, "non-plain array", names BossArray)
- P2a and P2b tagged subclass alpha and beta: BOTH THREW (no collision possible)
- P3 expando Date on 1,2: THREW at path meta
- P4 expando function: THREW at path cb
- P5 expando self-reference (the undetected cycle): THREW at path self
- P6 symbol key: THREW, symbol named in path
- P7 cross-realm array from a vm context: THREW ("foreign or reassigned" prototype)
- P8 null-prototype array: THREW (reassignment accident wording)
- P9 nested subclass under a key: THREW at path beats (nested paths work)

Also held: canonical-index edge keys "01", "+1", "1 dot 0", "-0", 4294967295 and
9007199254740993 all rejected as expandos; defineProperty at index 5 on a length-2 array
rejected at the first hole; a getter EXPANDO is rejected WITHOUT invoking the getter
(side effect confirmed not fired); an index getter returning a Date still throws Date.

## Part 2 - adversarial findings (new, in blast-radius order)

### F-A (major) - pollution of the intrinsic Array prototype defeats the hole check
The hole check uses the in operator, which walks the prototype chain. Repro: set index 2
on the intrinsic Array prototype to the string "polluted"; then a sparse array 1,2 with
length 3 is ADMITTED and hashes to 742804ccea6d339e - IDENTICAL to the dense array
1,2,"polluted". A hole silently coerced to an inherited value plus a collision between two
distinguishable inputs; scenario 3 forbids exactly this outcome. Mitigating: the artifact
implements an option A1-1 itself names ("index-based in checks"), so this is partly an ADR
gap; but A1-1 also names the pollution-immune equivalent (own-keys length equals array
length), and getOwnPropertyDescriptor is likewise immune. Rejection-mechanism swap only;
no admitted canonical string changes; pins safe.

### F-B (major) - enumerable ACCESSOR at a canonical index is admitted; hash is impure
An array whose index 0 is an enumerable getter is ADMITTED, and hashing the SAME object
twice returned c2368849f1308854 then 2e4888aa3db91bb1 (counter getter). The hash is no
longer a pure function of a value; getter side effects execute during hashing. An accessor
slot is a structural condition no HASHABLE rule matches ("dense arrays of hashable
VALUES"), so under A1-3 and under the disposition's own reading-1 logic it must reject.
Note the inconsistency inside the artifact: a getter EXPANDO is rejected unread, but a
getter INDEX is invoked and admitted. The object arm has the same admission (a getter key
is read twice - once by the undefined filter, once by the encoder; probe G1 showed the
second read wins). Fix is rejection-widening via getOwnPropertyDescriptor per key or
index; pins safe (all pinned fixtures are data properties).

### F-C (major) - Proxy wrapping an array is admitted; trap proxies collide at will
A transparent Proxy over plain 1,2,3 is ADMITTED (a615eeaee21de517, identical to its
target). A Proxy with a get trap over plain 1,2 hashed FIRST to 49a64717d5d4cb19 -
colliding with the frozen pin for plain 1,2 - and SECOND to 1ad6041faf516d00: an
attacker-controlled collision plus nondeterminism on one object. A Proxy is not a dense
plain array; no HASHABLE rule matches it. Node exposes isProxy under util types; the
module is already Node-only (node crypto, node fs). Same exposure qualifier as GEN2:
unreachable from JSON parse output, future-caller risk. A has-trap Proxy hiding a hole was
caught only by luck (reading the hole returned undefined, which threw as undefined, not
as a hole).

### F-D (minor, recorded) - non-enumerable expando leniency still hides a Date or a cycle
A NON-enumerable Date expando, and a NON-enumerable SELF-REFERENCE, are both ADMITTED and
hash to 49a64717d5d4cb19 (identical to plain 1,2). This is the documented narrow-form
scoping call from the disposition; recorded for the Gate, not re-litigated. Note however
that the disposition's decisive reading-1 argument (an out-of-domain value reachable
through an own property, unreported) applies verbatim here.

## Searched and held
- Cross-arm distinctness: the number 1 in an array vs the string "1" vs an object with
  key "0"; empty object vs empty array; 1e21 vs its string form - all distinct.
- Getter returning undefined between the two object-arm reads: throws, no omission bypass.
- The arguments object: rejected via its own symbol iterator key.
- Sparse shape after prototype cleanup: throws at the first hole with a path.

## Verdict
request_changes (the fix itself verified correct and complete against the disposition;
three new same-class admission or collision paths in the container arms need disposition
or an explicit accepted-scoping record before the Gate). All 10 pins and the bundle id
untouched by any recommended fix - every recommendation is rejection-widening or
mechanism-swap only.
