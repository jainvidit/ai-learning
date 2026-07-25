# AgentRunner Interface

**Contract owner:** Atlas (execution-layer shard)  
**Implementation owner:** ROOT.1.4 (execution-layer driver implementation)  
**Steward succession:** ROOT.1.2 (initial definition) → ROOT.7.1 (maintenance)  
**Source:** `.program/spec/execution-layer.md` REQ-EX-04, REQ-EX-05

## Purpose

`AgentRunner` is the production interface seam between the application and the Claude Code CLI execution layer. It abstracts away whether the agent is **real** (spawning the actual `claude.exe` binary) or **fake** (replaying a recorded NDJSON transcript cassette). Both implementations satisfy the same compile-time-checked TypeScript interface, enabling:

- **Development** against recorded transcripts without requiring a Claude CLI installation
- **Preview/CI** environments with deterministic cassette playback
- **Offline** work and testing
- **Production** execution with the real LocalDriver

This design fulfills REQ-EX-04's requirement that terminal features run end-to-end through the real UI with fake runners playing recorded transcripts (cassettes), and that real and fake satisfy the same compile-time interface.

## Consumers

1. **Terminal experience layer** (`terminal-experience.md` shard) — the dock UI, accessibility transcript, and learner-facing terminal components consume `AgentRunner` to display streaming agent output and collect prompt input
2. **Execution-layer drivers** (ROOT.1.4 implementation work) — `LocalDriver` (primary) and optional `CloudDriver` (hosted edition) both implement `AgentRunner`
3. **Testing and CI cassette harness** (`testing-and-ci.md` shard) — fake runner for deterministic PR checks and offline development

## Current State Anchor

**`src/lib/claudeSpawn.ts`** is the current implementation (MODIFIED in the migration). This file:
- Spawns `claude.exe` directly (no shell) with prompt via stdin (never argv)
- Maps NDJSON stdout lines to `TermEvent` objects
- Enforces `allowedTools` and `maxTurns` from server-side content definitions (never from client request)
- Provides concurrency guards and session registry (in-memory)

The `AgentRunner` interface abstracts this current behavior. The LocalDriver implementation (ROOT.1.4's work) will evolve `claudeSpawn.ts` behind this interface.

## Interaction Contract Constraints

Per REQ-EX-05:

### 1. Prompt-Based Interaction (REQ-EX-05 scenario 1)

Learners send **composed prompts**, not raw PTY keystrokes. This is a product decision rooted in pedagogy: the course teaches deliberate instruction composition, not keystroke-level terminal interaction.

**Interface implication:** The runner accepts whole prompt strings via a `submitPrompt(prompt: string)` style method or stream-write interface. There is no per-keystroke transmission, no raw PTY control sequences.

**Rationale:** Prompt-based interaction was explicitly chosen over raw PTY in the blueprint (REJECTED.md: "Raw PTY keystroke terminal — Prompt-based interaction is a stated product decision"). This enables:
- Composed, submitted prompts that learners construct deliberately
- Compatibility with SSE-down + POST-up transport (sufficient for v1)
- Future transport upgrades (WebSocket, PTY) without breaking the runner contract

### 2. Transport-Agnostic Contract (REQ-EX-05 scenario 2)

The `AgentRunner` interface must not encode SSE/POST specifics. Nothing in its contract should preclude a WebSocket or PTY upgrade.

**Interface implication:** The runner emits events/chunks in a transport-neutral format (async iterators, observables, or callbacks). The HTTP layer (SSE/POST) is a separate adapter concern. A future WebSocket transport would adapt the same `AgentRunner` interface.

**Current transport:** SSE (server-sent events) for downstream, POST for upstream prompts. This is implementation detail; the runner contract is decoupled.

## Event Stream Protocol — DEFERRED

The `AgentRunner` interface will emit and consume events of type `TermEvent` and interact with the durable sequence-numbered session event log. These types and the session log contract are **not defined here**.

**DEFERRAL:** Session event-log schema, `TermEvent` type definitions, sequence numbering, and reattachment protocol are the responsibility of **ROOT.2.1** (event-log-and-projections shard, owned by Ramesh per `execution-layer.md` contract notes). ROOT.2.1 will define:

- `TermEvent` union type and all variant shapes
- Durable, monotonically sequence-numbered event log schema (REQ-EX-02)
- `attach(sessionId, fromSeq)` reattachment contract (REQ-EX-03)
- Gap replay protocol and live-tail semantics

**Where they will live:** The event-log contract will be specified in `.program/spec/event-log-and-projections.md` (ROOT.2.1's shard) and implemented as part of ROOT.2's subtree. The execution-layer and api-and-streaming shards co-own the TermEvent protocol (per `execution-layer.md` dependencies).

**What this interface assumes:** `AgentRunner` will emit an async stream of `TermEvent` objects (exact shape TBD by ROOT.2.1) and accept prompt input. The fake runner will read `TermEvent` NDJSON from cassette files and yield them; the real runner will map CLI output to `TermEvent` objects.

## Later-Phase References (Not Specified Here)

The following requirements from `execution-layer.md` are referenced for context but are **not this interface's concern**:

- **REQ-EX-01:** One ExecutionDriver interface, two drivers (LocalDriver, CloudDriver) — ROOT.1.4 will implement
- **REQ-EX-02:** Durable, sequence-numbered event log — ROOT.2.1's contract
- **REQ-EX-03:** Server-held, reattachable sessions — ROOT.2.1 + execution-layer implementation
- **REQ-EX-06:** Sandbox lifecycle (throwaway drills, path-confinement) — execution-layer and sandbox implementation

These are named here to clarify the boundary: `AgentRunner` is the **agent execution seam**. Session durability, reattachment, and sandbox lifecycle are separate contracts.

## Summary

`AgentRunner` is the production interface that abstracts real vs. fake Claude Code CLI execution. It enables:

- Fake runners playing cassette transcripts through the real UI without a CLI (REQ-EX-04 scenario 1)
- Compile-time type safety across real and fake implementations (REQ-EX-04 scenario 2)
- Prompt-based interaction (composed prompts, never raw keystrokes, REQ-EX-05 scenario 1)
- Transport-agnostic contract (nothing SSE/POST-specific, REQ-EX-05 scenario 2)

Event types (`TermEvent`, session log schema) are deferred to ROOT.2.1. Implementation is ROOT.1.4's responsibility. Current-state anchor: `src/lib/claudeSpawn.ts`. Stewardship passes from ROOT.1.2 to ROOT.7.1 at phase gate.
