# ROOT.7.3.8 review — ADR-0026 (REQ-DL-03 s3 offline-state enumeration)

Reviewer: dream-reviewer-primary, FRESH instance, blind. Date: 2026-07-28.
VERDICT: **request_changes**, confidence **high**.

PROVENANCE: reviewer write DENIED by path guard (heredoc/redirect/tee all rejected) —
transcribed VERBATIM by director-gen43.

## Findings

1. **BLOCKING — exhaustiveness: stream-level and spawn-level failures unenumerated.**
   State 2 (line 30) detects "fetch to /api/playground/run or /api/claude-code/exec
   fails". Per REQ-API-03 + ADR-0019, both are SSE streams: response arrives 200
   text/event-stream, then the model call fails INSIDE the stream — the fetch does not
   fail. For the TERMINAL beat, REQ-EX-01's LocalDriver spawns the learner's LOCAL claude
   CLI, so the HTTP hop is same-machine and succeeds; the Bedrock dependency lives in the
   child process (ADR-0026 line 125 records this and does not use it). Two Home-v1
   reachable states are neither enumerated nor dispositioned: (a) SSE stream opens then
   errors/stalls mid-stream; (b) claude CLI absent / spawn fails (REQ-EX-04 s1's own
   premise). Both fall to the closed-world default whose escape hatch ("caught by State
   2") is false for them → indefinite spinner, which s3's "never fakes availability"
   forbids. Needs: enumerate both with honest messaging + decidable predicates, or an
   explicit Home-v1-unreachability ruling (which REQ-EX-01/EX-04 do not support).
2. **BLOCKING — fakes-configured offline state missing.** REQ-EX-04 s1 / REQ-MG-03 s1
   specify production fakes for "dev/preview/CI/OFFLINE consumers" — terminal exercises
   play recorded transcripts through the real UI; model features run against recorded
   responses without error. Those seams are Phase 0. So "navigator.onLine === false WITH
   fakes configured" is Home-v1-reachable, and State 1's behaviour (gate Run/Verify,
   show network-needed message) would FALSELY claim unavailability. Needs: State 1
   carve-out (fake AgentRunner/ModelGateway resolved → run normally against cassettes) or
   a separately enumerated state.
3. **MAJOR — closed-world cardinality contradiction.** Line 18 says "exactly ONE offline
   state", then enumerates two; line 76 says two; the shard amendment says two. Correct
   ONE→TWO (or the true final count after F1/F2).
4. **MAJOR — falsifiability of test plans.** (i) State 1 test plan is vitest-flavoured
   and requires rendering a lesson beat, but vitest.config.ts sets environment:'node' and
   no jsdom/happy-dom exists — no React beat can render under `npm test`; only the mock
   half is executable. (ii) onLine=FALSE does not imply model unreachability in Home v1
   (same-machine HTTP works; with fakes it is reachable). (iii) Line 118 offers as PROOF:
   "Both tests are presence-or-absence-satisfiable" — that phrase NAMES the vacuity
   failure mode, not its cure. Needs: name an executable harness (Playwright
   context.setOffline(true) — @playwright/test ^1.62.0 present — or add a DOM env), and
   restate line 118 without the vacuity phrase.
5. **MINOR — disposition rationale wrong.** Line 94 rules "local server unavailable" out
   as "a different failure mode (Next.js error page)" — a downed server yields a
   transport error, and a mounted beat's Run click becomes a fetch failure (State 2).
   Dispositioned, so non-blocking, but correct the rationale or route to State 2.
6. **MINOR — metadata.** "Status: ratified 2026-07-28" dated in the future.

## Passes

ADR-0003 CONSISTENCY both directions PASS (no silent expansion; exclusions each cite
their enabling deferred machinery; stale-bundle ruling holds). CLOSED-WORLD DEFAULT
decidable PASS (though not safe until F1 fixed). ADDITIVITY PASS (git diff 87416c8:
exactly one changed line, pre-existing sentence verbatim, domain clause appended).

## Reviewer's read-only command log

git diff 87416c8 -- .program/spec/data-layer-and-offline.md; node v24.12.0 probe
(navigator.onLine mockable); vitest.config.ts environment 'node'; package.json (no
jsdom/happy-dom; @playwright/test ^1.62.0); grep onLine|offline src/ tests/ → no matches.
