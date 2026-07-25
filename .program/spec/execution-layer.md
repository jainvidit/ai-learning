# Capability: Execution Layer (ExecutionDriver, sessions, sandboxes)

One ExecutionDriver interface with two drivers (LocalDriver primary, CloudDriver optional-hosted), the durable sequence-numbered session log, the reattach contract, and sandbox lifecycle.

**Depends on:** `api-and-streaming.md` (SSE transport, heartbeats — the two shards co-own the TermEvent protocol; Ramesh owns the contract).
**Depended on by:** `terminal-experience.md` (dock UI, a11y transcript), `workshop-and-artifacts.md` (Claude runs scoped to the workshop dir), `testing-and-ci.md` (AgentRunner cassettes), `hosted-edition.md` (CloudDriver).
**Contract owner:** Atlas owns the ExecutionDriver interface; Ramesh owns implementations and the TermEvent protocol; Nova's dock UX must not branch on driver (LANE-DEPENDENCIES rows).

---

## REQ-EX-01: One ExecutionDriver interface, two drivers {#req-ex-01}

`LocalDriver` (Home default) spawns the learner's real claude CLI — the evolution of today's `claudeSpawn.ts` — with path-confined sandboxes, `allowedTools`/`maxTurns` from content definitions only, plus Claude Code's own OS sandbox where supported; the product states plainly that the agent runs on your machine. `CloudDriver` (Hosted default; opt-in at home) is specified in `hosted-edition.md`. Local-as-default was the resolved contested decision — real files on the learner's machine ARE the pedagogy (REJECTED.md; blueprint §8); Atlas's isolation concern stands on record, mitigated not eliminated. One interface, one stream protocol, one dock UX.

**Source:** DREAM-BLUEPRINT.md §3 "Execution layer", §8 contested decision 1; GLOSSARY.md "ExecutionDriver"; CONSTRAINTS.md #2 [HARD] (hands-on Claude Code is the point).
**Current state (docs/origin/CURRENT-STATE.md):** `src/lib/claudeSpawn.ts` MODIFIED — becomes the LocalDriver; NDJSON→TermEvent mapping survives; the no-shell/stdin-prompt/flags-from-content hardening survives verbatim. `src/lib/sandbox.ts` MODIFIED — path-confinement survives.

**Scenarios:**
1. Given both drivers, when their interfaces are compared, then they implement the identical ExecutionDriver contract and emit the identical TermEvent stream protocol.
2. Given a LocalDriver spawn, when its invocation is inspected, then: the CLI binary is spawned directly (no shell), the prompt goes via stdin (never argv), and `allowedTools`/`maxTurns` come from server-side content definitions, never from the client request.
3. Given the terminal/dock UI code, when audited, then no rendering or behavior branches on which driver is active.
4. Given the Home Edition UI around terminal exercises, when rendered, then it states that the agent runs on the learner's machine.

## REQ-EX-02: Durable, sequence-numbered event log per session {#req-ex-02}

The load-bearing invariant is a durable, monotonically sequence-numbered TermEvent log per session — not the socket type. In the Home Edition this is a local append-only store, not infrastructure (CONSTRAINTS.md #15 [HARD]).

**Source:** DREAM-BLUEPRINT.md §3 "BFF & API — Streaming", §3 "Personal-desktop-tool directive", §8 aligned decision 7; GLOSSARY.md "Durable seq-numbered event log".
**Current state:** new; today's terminal stream is fire-and-forget SSE with in-memory session registry.

**Scenarios:**
1. Given any session, when events are emitted, then each carries a monotonic sequence number with no gaps in the durable log.
2. Given a server restart mid-session (restart-and-recover, per the desktop-tool directive), when the learner reattaches, then previously logged events replay from the durable store.

## REQ-EX-03: Server-held, reattachable sessions {#req-ex-03}

Sessions are server-held: navigate away, close the tab, come back — the run continued and the stream resumes from your last sequence number via `attach(sessionId, fromSeq)` → ordered gap replay + live tail. The protocol is transport-agnostic so a WS/PTY upgrade never breaks clients. This removes today's abort-on-unmount behavior.

**Source:** DREAM-BLUEPRINT.md §3 "Execution layer" (sessions server-held), §2 "Persistent beats"; UX-REVIEW-NOVA.md §1 problem 8 [AUDITED], §4 "Terminal dock"; GLOSSARY.md "attach(sessionId, fromSeq)".
**Current state:** `Terminal.tsx` abort-on-unmount is REMOVED (replaced by server-held reattach); `api/claude-code/*` MODIFIED onto ExecutionDriver + durable session log, SSE contract preserved for the UI.

**Scenarios:**
1. Given a running session and a closed tab, when the learner returns and attaches with their last seq, then all missed events replay in order followed by the live tail, and the underlying run was never killed by the navigation.
2. Given `attach(sessionId, fromSeq)` with a stale `fromSeq`, when invoked, then the client receives the gap from that seq forward exactly once, in order.

## REQ-EX-04: AgentRunner is a production seam with recorded-transcript fakes {#req-ex-04}

`AgentRunner` is a production interface with dev/preview/CI/offline consumers, so terminal features run against recorded NDJSON transcripts (cassettes) without a CLI. (Sibling seam: model-gateway REQ-MG-03; test harness: testing-and-ci.)

**Source:** DREAM-BLUEPRINT.md §3 "Fakes are a product surface", §6 Phase 0, §8 aligned decision 7; GLOSSARY.md "Cassettes".
**Current state:** new seam over the modified claudeSpawn.ts.

**Scenarios:**
1. Given an environment with no claude CLI installed, when the app runs with the fake runner, then terminal exercises play recorded transcripts end-to-end through the real UI.
2. Given the real and fake runners, when type-checked, then both satisfy the same AgentRunner interface.

## REQ-EX-05: Prompt-based terminal interaction is a product decision {#req-ex-05}

Learners send composed prompts, not raw PTY keystrokes — the pedagogy wants deliberate instructions. SSE-down + POST-up suffices; the protocol is transport-agnostic so a PTY/WS upgrade never breaks clients (raw PTY was REJECTED as v1; recorded as non-precluded upgrade).

**Source:** DREAM-BLUEPRINT.md §3 "BFF & API — Streaming", §8 aligned decision 7; REJECTED.md "Raw PTY keystroke terminal"; GLOSSARY.md "Prompt-based terminal".
**Current state:** consistent with today's prompt-composition model; survives.

**Scenarios:**
1. Given the terminal input UI, when a learner interacts, then input is composed and submitted as whole prompts (no per-keystroke transmission to the agent).
2. Given the session protocol definition, when reviewed, then nothing in it encodes SSE/POST specifics that a WS/PTY transport could not also satisfy (transport-agnostic contract).

## REQ-EX-06: Sandbox lifecycle — drills throwaway, path-confined; per-profile isolation {#req-ex-06}

Drill sandboxes stay throwaway (template seed → live copy → reset re-copies), path-confined under the sandbox root with path-resolve + prefix checks; per-profile isolation (`sandbox/live/<profileId>/...`) extends to Workshop dirs and session keys. Sandbox tool restrictions are retained as own-machine safety (ASSUMPTIONS.md #31 [INFERRED] carve-out — flagged to owner, not objected to).

**Source:** DREAM-BLUEPRINT.md §3 "Execution layer", §6 keep-list item 5, §3 "Auth & profiles"; GLOSSARY.md "Sandbox template / live sandbox".
**Current state:** `src/lib/sandbox.ts` MODIFIED — path-confinement survives, gains Workshop-adjacent lifecycle; `sandbox/templates/**` SURVIVES; `sandbox/live/**` regenerable BUT the future Workshop dir must NEVER be bulk-deleted (CURRENT-STATE never-delete flag).

**Scenarios:**
1. Given a reset request for a drill sandbox, when executed, then the live copy is deleted and re-seeded from its template, and the operation refuses any path resolving outside the sandbox live root.
2. Given two profiles using the same lesson, when their sandboxes are inspected, then they are disjoint directories and neither can address the other's.
3. Given any bulk sandbox cleanup, when it runs, then the Workshop directory is excluded (never bulk-deleted).
