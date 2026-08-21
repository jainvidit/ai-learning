# Blind tier-1 review - item ROOT-7-3-1 (ADR-0019, SSE-endpoint enumeration for REQ-API-03 s3)

Reviewer: dream-reviewer-primary (blind). Lens: spec conformance. Date: 2026-07-27.
Artifacts: ADR-0019 in the decisions dir; the amended api-and-streaming shard.
No author reasoning read. Nothing modified outside the audits dir.
Note: this file avoids slash and dotted-path characters because the write guard treats them
as redirect targets; route and shard names are therefore spelled in prose.

## Check 1 - Amendment additive? PASS

git diff HEAD on the shard shows exactly one changed line, s3. Scenarios 1, 2 and 4, the
requirement prose, the Source block and the Current-state block are byte-identical. The s3
edit inserts a bracketed domain clause; every original word of s3 survives in order.
Narrowing by domain clause is the ratified ADR-0017 pattern, so the semantic restriction is
sanctioned, not a deletion. No other shard touched.

## Check 2 - Enumeration exhaustive over the SPEC domain? FAIL (blocking)

Today's built corpus matches the ADR exactly: the SSE content-type string appears in exactly
two route files - the playground run route and the claude-code exec route. Regression-floor
rows RF-05 and RF-07 corroborate those two as the SSE surfaces. So the enumeration is
exhaustive over today's ROUTES.

It is not exhaustive over the SPEC domain. Two mandated SSE surfaces are missing:

- Terminal reattach. Execution-layer REQ-EX-03 scenario 1 requires that after a CLOSED TAB
  the learner attaches with their last seq and receives ordered gap replay followed by the
  live tail. That cannot be served by the in-flight POST response on the exec route the ADR
  enumerates; that route has no attach surface today - only continueSession, which starts a
  fresh run (exec route lines 23, 43, 89). A compliant implementation needs an attach-by-seq
  SSE surface, and the ADR closed-world rule then brands that REQUIRED endpoint a spec
  violation until another ADR is written. The ADR self-blocks a requirement it cites.
- Playground resume. REQ-API-03 scenario 1 requires a refresh to reconnect with last seq
  without restarting the model call. Resumable-stream style resume is conventionally a
  separate GET stream surface; the ADR enumerates only the POST run route and never rules on
  whether resume rides that same route.

Either reading can be made conformant, but the ADR must choose NORMATIVELY: either state
that reattach and resume are the same enumerated endpoints (same path, different method or
params), or enumerate them as further entries with owning spec and owning item.

Non-blocking omissions from the What-was-NOT-enumerated section: hosted-edition REQ-HE-02
(client WebSockets terminated by a Durable Object session actor) goes unmentioned even
though the hosted-edition shard declares a dependency on api-and-streaming; and the
beat-model interface doc (lines 157 and 212) names an SSE-fed-widgets and agent-runs beat
class recorded there as vacuous in the authored corpus. The relaxation path covers both, but
naming them would close the loop.

## Check 3 - Per-endpoint obligation falsifiable? PARTIAL FAIL (blocking)

Obligations 1 (named header names and values) and 2 (heartbeat at about 20s during idle,
with a stated method - spawn a stream, read headers, wait through a quiet period) are
concrete and falsifiable.

Obligation 3 is not. Keep-alive-or-else-no-Connection-header-on-HTTP-2 is satisfied by the
presence OR the absence of the header, so no response can fail it - a vacuous check inside a
document whose stated purpose is eliminating vacuous checks. It is also extra-spec: amended
s3 obligates only the accel-buffering header, no-transform, and heartbeats. Adding a third
normative obligation in the ADR without amending s3 puts ADR and shard out of step. Delete
it, or mark it non-normative background.

Empirical note, not itself a conformance defect: the accel-buffering header name appears
NOWHERE under the src tree, and the playground run route (lines 111 to 115) sends no-cache
with NO no-transform, so enumerated endpoint 1 fails obligation 1 today; the exec route
(line 152) does carry no-cache plus no-transform. The migration paragraph covers this only
abstractly - recording the known-failing baseline per endpoint would make the retrofit
obligation concrete and testable now.

## Check 4 - Closed-world plus additive relaxation present? PASS

The closed-world rule is stated (the enumeration is declared exhaustive; creating an
off-list SSE endpoint is a spec violation) and a three-step additive relaxation path is
given. This mirrors ADR-0017 Amendment 1 item 3 and the ADR-0018 formula: enumerate the
domain closed-world, reject outside it, relax only additively via a new ADR. Structurally
conformant.

## Check 5 - Divergence check credible? PASS with one imprecision

Verified: CONSTRAINTS items 15 and 17 are quoted accurately; the REJECTED
raw-PTY-keystroke-terminal row exists and the exec endpoint is prompt-based, consistent with
it. The coach-and-hints and judge-pipeline shards yield no SSE or stream matches, so both
exclusions hold.

Imprecise: the claim that no SSE-specific contract exists among the interface docs. The
agent-runner doc, line 151, speaks to exactly this - headers, heartbeats and
reconnect-backoff are declared the HTTP layer's concern under REQ-API-03, not the runner's -
and line 153 records SSE-down plus POST-up as the current transport. That text CORROBORATES
the ADR, so the no-divergence verdict stands; the citation should say so rather than assert
absence. Regression-floor rows RF-05 and RF-07 likewise corroborate and are uncited.

## Verdict: request_changes

Blocking: Check 2 (reattach and resume surfaces unresolved; the ADR self-blocks
REQ-EX-03 scenario 1) and Check 3 (vacuous, extra-spec obligation 3).

Evidence that will satisfy me:
1. The ADR states normatively whether attach and resume are the same enumerated endpoints,
   or adds them as entries with owning spec and item, worded so that a
   REQ-EX-03-compliant attach surface is not itself a closed-world violation.
2. Obligation 3 is removed or explicitly marked non-normative.
3. Optional but recommended: a per-endpoint current-header baseline, so the retrofit
   obligation on the playground run route is explicit rather than implied.
