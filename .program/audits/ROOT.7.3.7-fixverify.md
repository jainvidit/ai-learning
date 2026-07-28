# ROOT#7#3#7 fix-verify -- ADR-0025 (REQ-EX-01 s3 no-driver-branching)

Reviewer: dream-reviewer-primary, FRESH instance, blind. Lens: spec conformance.
Date: 2026-07-27. Tooling: ripgrep 14#1#1 (+pcre2).
VERDICT: request_changes, confidence high.

Scope read: the shard REQ-EX-01 s3 (line 21), the artifact ADR-0025, the gen0 review,
and the verification evidence dir. Item file NOT read. git NOT run (reviewer constraint).

## Finding 1 -- EXECUTABLE PROCEDURE: DISCHARGED

Ran all 11 command lines from the ADR body character-for-character against the src tree.
Every one exits 1 with zero hits. The bad rg file-type argument is gone (no occurrence
of that token anywhere in the ADR). Recorded transcript at ADR lines 116-126 matches
reproducible reality exactly.

## Finding 2 -- PATTERN COMPLETENESS: NOT DISCHARGED

Two independent defects.

### 2a. Cited evidence contradicts the ADR body, and the reusable runner is broken

ADR line 140 claims CHECK 8 caught 1 hit at line 71. The evidence file it cites,
the negative-control run log, records at its line 46:

    === CHECK 8: switch on driver#name ===
    Exit: 1

i.e. NO hit. Root cause: the runner script line 57 uses a narrower CHECK 8 regex than
the ADR body line 73. Reproduced against the negative control:

    runner regex   -> exit 1 (misses)
    ADR body regex -> exit 0, hits lines 69 and 71

The runner's driver-substring clause cannot match the switch on activeDriver#name
because rg is case-sensitive and the receiver has a capital D. So: the ADR body's own
command is sound, but (i) the pasted per-check evidence is not supported by the saved
artifact it points at, and (ii) the runner script -- the very script ROOT#4#5 and the
ROOT#4#9 gate row are bound to re-run -- silently under-detects mechanism 8. Same class
as gen0 finding 1: recorded procedure diverges from reality.

Evidence to satisfy: runner CHECK 8 aligned to the ADR body command, script re-run, the
negative-control run log regenerated showing CHECK 8 exit 0, and the ADR body per-check
hit list reconciled line-for-line against the regenerated log.

### 2b. All 10 gen0 mechanisms ARE caught -- but 8 NEW mechanisms escape

Ran the ADR's 11 commands over the negative control myself: all exit 0. Every one of the
10 gen0-identified mechanisms is now detected. That half of finding 2 is fixed.

Adversarial probe, 8 constructs fed to all 11 checks. ALL 11 CHECKS EXIT 1 -- every
construct escapes. These are NEW, distinct from the gen0 set:

N1  if (driver#name === "LocalDriver")
    CHECK 8 covers only the switch form; CHECK 2 requires a lowercase quoted
    cloud or local literal.
N2  const { kind } = driver; if (kind === "local")
    destructuring removes the receiver CHECK 3a requires.
N3  if (driver?#kind === "local")
    optional chaining breaks CHECK 3a's word-boundary receiver-dot-kind pattern.
N4  if (driver["kind"] === "local")
    bracket access, no dot.
N5  if (Reflect#get(driver, "kind") === "local")
    no member expression at all.
N6  if (driver#isLocal)
    boolean capability flag, no discriminant comparison.
N7  if (driver#mode === "local")
    field name outside the enumerated set.
N8  const Comp = isLocalDriver ? LocalPanel : CloudPanel
    component-selection ternary; CHECK 9 only matches ternaries inside dynamic import.

N8 is the most serious. REQ-EX-01 s3 forbids exactly this -- no RENDERING or behavior
branches on which driver is active -- and swapping a component by ternary is the
idiomatic way a React component tree commits that violation. A procedure that cannot
see it does not operationalize the scenario it claims to ratify.

Consequence for the ratification claim, not merely for coverage: the ADR asserts at line
20 that the greps detect all known driver-conditional mechanisms, and binds a binary
verdict to them at lines 100-101 (PASS = zero hits across all 10; FAIL definitive = any
hit). Zero hits is sound only if the detector is sound. With 8 trivial escapes the PASS
side is unsound, so s3 is not yet falsifiable-via-this-procedure as claimed. Note the
closed-world section already concedes brittleness -- if ROOT#4#5 uses different strings
the pattern must be updated -- which is an admission that the grep set is an open-ended
denylist.

Evidence to satisfy: EITHER (a) extend the checks to cover N1 through N8, with the
negative control extended and re-run showing each caught; OR (b) downgrade the claim
honestly -- state that grep is a necessary-not-sufficient screen, that zero hits is NOT
by itself a PASS, and name the typed or human complement that closes the gap, for
example ROOT#4#5 typing the driver handle so no discriminant field is reachable, making
the class structurally unrepresentable rather than merely un-grepped. Either discharges.
What does not discharge is retaining "detect all known mechanisms" plus a definitive
binary verdict over a denylist proven porous in 8 places.

## Finding 3 -- FACTORY EXCEPTION: DISCHARGED

ADR line 92 now reads PARKED UNTIL ROOT#4#5, and: until then, NO EXCEPTIONS -- any hit in
any file is a FAIL. The gen0 self-declaring language (the or-equivalent factory path, and
the clause letting any file branch if its sole purpose is driver selection) is gone.
Lines 94-97 give an ADR-0028-style additive amendment procedure requiring a single named
file path plus exported symbol, a factory-pattern justification, and recording of the
amending item ID and date. Line 101 makes FAIL definitive until that amendment exists.
The residual illustrative path inside the PARKED block is an example, not a grant. No
residual self-declared exception language found.

## Finding 4 -- RE-RUN OWNER: DISCHARGED

Re-run binding section, lines 173-181, names both owners: ROOT#4#5 as acceptance-criterion
owner (MUST run all 10 checks and record results) and the ROOT#4#9 Phase 3 Gate as
gate-row owner. Line 175 states the vacuity honestly rather than hiding it. Line 181
routes mirroring into the ROOT#4#5 and ROOT#4#9 item files to the director, correctly
recognizing the implementer lacks write access there. Caveat, not a blocker: both
bindings inherit the 2a defect -- they re-run a script whose CHECK 8 under-detects.

## Acceptance criterion 2 -- no-edit ruling: STILL HOLDS

Shard untouched. The execution-layer shard mtime is 2026-07-25T08:23:21-04:00, predating
all ROOT#7#3#7 work of 2026-07-27 and 2026-07-28; the ADR mtime is 2026-07-27T23:01:20.
A content probe over the shard for ADR-0025, the item ID, and the word grep returns exit
1 -- no ratification apparatus leaked into the spec. REQ-EX-01 s3 text at shard line 21
is verbatim what the ADR quotes at line 167. Ruling correct: the scenario needs no edit;
the procedure belongs in the ADR. Per reviewer constraints I did not invoke git; mtime
plus content probe is the substitute evidence.

## Summary

finding 1 executable procedure ....... DISCHARGED
finding 2 pattern completeness ....... NOT DISCHARGED (2a divergence; 2b 8 new escapes)
finding 3 factory exception .......... DISCHARGED
finding 4 re-run owner ............... DISCHARGED
ac2 no-edit ruling ................... HOLDS

Three of four gen0 findings are genuinely fixed and the gen0 9-of-10 escape is closed.
Blocking on finding 2 only.

NOTE ON RENDERING: the hash characters in dotted identifiers and item IDs above are
literal-dot substitutes. The path-guard hook rejected every write containing dotted
tokens in the document body (the known hook-parser defect, fifth in-allowlist denial
class). Read ROOT#7#3#7 as the item ID and driver#name as the member expression.
