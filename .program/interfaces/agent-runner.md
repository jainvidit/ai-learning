# Interface: AgentRunner

**Spec source:** `.program/spec/execution-layer.md` REQ-EX-04 (production seam with recorded-transcript fakes), REQ-EX-05 (prompt-based, transport-agnostic)
**Contract ownership (as the shard assigns it):** `execution-layer.md` assigns **Atlas the ExecutionDriver interface** (REQ-EX-01) and **Ramesh the implementations and the TermEvent protocol**. The shard names no separate lane owner for the `AgentRunner` seam itself; this document is the seam's contract of record and changes to it go through its steward.
**Implementation owner:** ROOT.1.4 (per this item's acceptance criteria); the seam **code** — the `claudeSpawn.ts` lineage and `src/lib/seams/**` — sits with **ROOT.1.5** ("Production seams — AgentRunner + ModelGateway with fakes")
**Steward succession:** ROOT.1.2 (initial definition) → ROOT.7.1 (maintenance after the Phase 0 gate)
**Sibling seam:** `.program/interfaces/model-router.md` (ModelGateway, `model-gateway.md` REQ-MG-03) — the same pattern for model calls. Two seams, never merged, never duplicated into parallel abstractions.

---

## Purpose

`AgentRunner` is the **production interface seam** for Claude Code CLI execution. It abstracts whether the agent behind a terminal exercise is **real** (spawning the learner's real `claude` CLI) or **fake** (replaying a recorded NDJSON transcript — a cassette). It is not a test-only mock: the fake is a first-class product mode (`GLOSSARY.md` "Fakes are a product surface").

Both implementations satisfy the same compile-time-checked TypeScript interface, which is what makes these consumers real:

- **Development** against recorded transcripts with no CLI installed on the machine
- **Preview** builds that demo terminal exercises deterministically
- **CI** — deterministic PR checks with no network, no API key, and no CLI (`testing-and-ci.md` REQ-TC-01 scenario 1)
- **Offline** work and testing
- **Production** — the real runner over the learner's own CLI

This fulfils REQ-EX-04 scenario 1 (with no CLI installed, terminal exercises play recorded transcripts end-to-end **through the real UI**, not through a test-only harness) and scenario 2 (real and fake type-check against one interface).

---

## AgentRunner vs. ExecutionDriver — two different seams

These are distinct contracts on different axes, and conflating them is a contract error:

- **`ExecutionDriver` (REQ-EX-01, Atlas)** is the *where-execution-happens* contract: one interface, two drivers — `LocalDriver` (Home default, the evolution of today's `claudeSpawn.ts`) and `CloudDriver` (Hosted, specified in `hosted-edition.md`). `LocalDriver` and `CloudDriver` implement **ExecutionDriver**, not `AgentRunner`.
- **`AgentRunner` (REQ-EX-04)** is the *real-vs-recorded* seam over the modified `claudeSpawn.ts` ("new seam over the modified claudeSpawn.ts" — REQ-EX-04 current state). Its two implementations are the real runner and the cassette-playing fake.

Relationship, stated once: the real `AgentRunner` is the seam wrapping the `claudeSpawn.ts` agent-execution lineage that `LocalDriver` is built from, so substituting the fake changes *what produces the event stream* while leaving the driver contract, the stream protocol, and the dock UX untouched (REQ-EX-01 scenarios 1 and 3). Which driver is active and whether the runner is real or fake are independent choices, and no UI code branches on either.

---

## Member surface — contract level

The member list below is contract: it is what makes REQ-EX-04 scenario 2 checkable, because "both satisfy the same interface" is only a compile-time claim if the members exist. Names and signatures are binding on both implementations; **bodies, and every type marked DEFERRED or implementation-owned, are not fixed here**.

```ts
// ---------------------------------------------------------------------------
// DEFERRED — NOT DEFINED IN THIS DOCUMENT.
// `TermEvent` is ROOT.2.1's contract (see "Event payload — DEFERRED" below).
// This document names the type and its import site; it defines no variants,
// no fields, and no sequence-number semantics.
// ---------------------------------------------------------------------------
import type { TermEvent } from "<the TermEvent protocol module — location fixed by ROOT.2.1>";

/**
 * The single event payload type crossing this seam. Alias only: its shape is
 * ROOT.2.1's to define. Consumers of AgentRunner see this name; ROOT.2.1 owns
 * what it resolves to.
 */
export type AgentRunnerEvent = TermEvent;

/**
 * Opaque session handle. Consumers pass it back in; they do not construct it,
 * parse it, or depend on its representation.
 */
export type AgentSessionRef = { readonly sessionId: string };

/**
 * Run inputs. The FIELD SET is implementation-owned (ROOT.1.4 / ROOT.1.5).
 * This document fixes only the constraints stated under "Interaction contract
 * constraints" and REQ-EX-01 scenario 2 (tool and turn limits originate from
 * server-side content definitions, never from a client request). Where those
 * limits sit in this shape is NOT decided here.
 */
export type AgentRunOptions = { /* implementation-owned */ };

export interface AgentRunner {
  /** Begin a run. Resolves once the session exists and is streamable. */
  start(options: AgentRunOptions): Promise<AgentSessionRef>;

  /** Submit one whole composed prompt to an existing session (REQ-EX-05). */
  submitPrompt(session: AgentSessionRef, prompt: string): Promise<void>;

  /**
   * Subscribe to the session's event stream. Attach-style: `fromSeq` selects
   * where the subscription begins. REPLAY / GAP / LIVE-TAIL SEMANTICS ARE
   * DEFERRED to ROOT.2.1 (REQ-EX-03) — only the member and its signature are
   * contract here.
   */
  attach(session: AgentSessionRef, fromSeq?: number): AsyncIterable<AgentRunnerEvent>;

  /** Halt the run server-side. Idempotent; safe to call on a finished run. */
  stop(session: AgentSessionRef): Promise<void>;
}
```

**Binding properties of this surface:**

- **Four members, both implementations.** The fake implements `start` / `submitPrompt` / `attach` / `stop` for real — it is wired into the same call sites as the real runner, which is what "production seam" means.
- **Transport-neutral return types.** `attach` yields an async iterable of events; nothing in the surface names SSE, POST, WebSocket, or a PTY.
- **Prompt in, events out.** `submitPrompt` takes a whole string; there is no keystroke, key-code, or control-sequence member.
- **Not contract:** parameter *placement* inside `AgentRunOptions`, whether `AgentSessionRef` carries more than an id, concurrency-guard and session-registry internals, and how the implementations are resolved (DI container vs. config-driven factory).

---

## Single-shot vs. multi-turn — contract level

One `AgentRunner` **run is one prompt-to-completion agent invocation**: a prompt goes in, an event stream comes out, and the stream terminates (completion, error, timeout, or `stop`). This matches today's behaviour in `claudeSpawn.ts`, where one spawn always terminates.

- **The consumer drives conversational turns.** A multi-turn exercise is successive `submitPrompt` calls against the same `AgentSessionRef`; the runner does not decide when a follow-up turn happens and does not solicit one. There is no interactive read-loop the learner types into (REQ-EX-05).
- **Agent-internal iteration is not a consumer turn.** Within one run the agent may loop through its own tool use; that iteration is bounded by limits sourced from server-side content definitions (REQ-EX-01 scenario 2). Consumers neither see nor count those iterations, and where those limits sit in the run options is not decided here.
- **Session continuity is a session property, not a second contract.** Continuing an existing session across runs is what `AgentSessionRef` is for; the durable log that makes it replayable is REQ-EX-02/03 territory (deferred below).

The fake honours this identically: one cassette playback is one run, and a multi-turn exercise plays as successive prompts against the same session.

---

## Cassette contract — contract level

Contract-level statements about cassettes (`GLOSSARY.md` "Cassettes"; `testing-and-ci.md` REQ-TC-01):

1. **Content.** A cassette contains **recorded `TermEvent` NDJSON** — one JSON event per line, as emitted by a real run. It is not a screenplay, not a UI snapshot, and not a bespoke fake-only format: the fake yields the *same* event type the real runner yields, which is why playback drives the real UI unmodified.
2. **Matching is deterministic and version-controlled.** A given request resolves to the same cassette on every run, in any order, on any machine and in CI; cassettes live in the repository under version control, so a change to a recording is a reviewable diff.
3. **A miss is a loud, deterministic failure.** An unmatched request fails, naming what was unmatched. The fake never synthesizes, paraphrases, or nearest-neighbour-matches a transcript, and never falls through to a live CLI call. A missing recording is fixed by recording it. (The failure follows the error model below; the sibling seam's `CassetteMiss` in `.program/interfaces/model-router.md` is the same rule for model calls.)
4. **No CLI, no credentials, no network under the fake.** Playback cannot be made to succeed merely by having a CLI present, and cannot fail merely by its absence (REQ-EX-04 scenario 1).

**Explicitly NOT decided here (implementation-internal, ROOT.1.4):** the keying scheme — how a request maps to a recording (content hash, exercise id + fixture name, manual tags) — and cassette playback timing internals (whether events are emitted at recorded intervals, coalesced, or as fast as the consumer drains them). Those are free for the implementing item to choose, provided properties 1–4 hold.

---

## Error model — contract level

Errors are **both thrown and in-band, split at one boundary**, and the split is identical in the real and fake implementations:

- **Before a session exists → thrown (rejected promise).** If `start` cannot produce a streamable session, it rejects. This is the pre-flight class: no CLI resolvable for the real runner, no cassette matched for the fake, a concurrency guard refusing a second in-flight run for the same key. Nothing was streamed, so there is no stream to report into. This is today's behaviour in `claudeSpawn.ts`, which throws when the CLI cannot be found and throws `ConcurrentRunError` on a guarded key.
- **After the stream begins → in-band error events, then the stream ends.** A failure during a run (agent-side failure, non-zero exit, timeout, cancellation) surfaces as an **error event in the same ordered stream as normal output**, followed by termination — it is not thrown out of the iterator. This is also today's behaviour: `claudeSpawn.ts` pushes an error event for timeout, spawn failure, and non-zero exit rather than throwing mid-generator. It is the load-bearing choice for the UI, because a mid-run failure must appear **in the transcript at its true position** — and, once REQ-EX-02 lands, in the durable log at its true sequence number — rather than as an out-of-band exception the dock renders somewhere else.
- **Shared identically by real and fake.** A consumer's error handling cannot depend on which implementation is wired in: same boundary, same in-band-vs-thrown split, same termination guarantee. Every run terminates exactly once, by completion or by error.

**Not decided here:** the error *event variant* shape (it belongs to `TermEvent` — ROOT.2.1's contract, and this document defines no variant), the concrete thrown class names and codes, and message text. Consumers must not pattern-match on message strings.

---

## Interaction contract constraints (REQ-EX-05)

### 1. Prompt-based interaction (REQ-EX-05 scenario 1)

Learners send **composed prompts**, not raw PTY keystrokes. This is a product decision rooted in pedagogy: the course teaches deliberate instruction composition, not keystroke-level terminal interaction. Raw PTY was rejected for v1 and recorded as a non-precluded upgrade (`REJECTED.md` "Raw PTY keystroke terminal").

**Contract implication:** the seam accepts whole prompt strings — `submitPrompt(session, prompt: string)` above. There is no per-keystroke transmission and no raw PTY control-sequence path anywhere in the surface. The prompt travels as data (today's `claudeSpawn.ts` sends it via stdin, never argv — REQ-EX-01 scenario 2, and that hardening survives).

### 2. Transport-agnostic contract (REQ-EX-05 scenario 2)

Nothing in this contract encodes SSE/POST specifics that a WS or PTY transport could not also satisfy.

**Contract implication:** events are delivered as an async iterable of `AgentRunnerEvent`; prompts arrive by method call. Request/response framing, headers, heartbeats, and reconnect/backoff are the HTTP layer's concern (`api-and-streaming.md` REQ-API-03), not the runner's. A WebSocket or PTY transport adapts the same members without a contract change.

**Current transport (implementation detail, not contract):** SSE-down for events, POST-up for prompts.

---

## Event payload — DEFERRED (defining item: ROOT.2.1)

`AgentRunner` emits `TermEvent` and, once the durable log lands, interacts with a sequence-numbered session event log. **This document defines none of that.** No `TermEvent` variant, field, or sequence-number rule appears here; the alias in the member surface is a name, not a shape.

**What is deferred, where the requirement lives, and who defines the type:**

| Deferred item | Requirement lives in | Type defined by |
|---|---|---|
| `TermEvent` union and all variant shapes (including the error variant) | `execution-layer.md` — the shard states that it and `api-and-streaming.md` **co-own the TermEvent protocol**; `execution-layer.md` names Ramesh as the protocol's owner | **ROOT.2.1** |
| Durable, monotonically sequence-numbered session log | `execution-layer.md` **REQ-EX-02** | **ROOT.2.1** |
| `attach(sessionId, fromSeq)` semantics — gap replay ordering, exactly-once, live-tail handoff, partial replay | `execution-layer.md` **REQ-EX-03** | **ROOT.2.1** |

**The boundary stated plainly, to prevent drift:** the *requirements* for TermEvent, the sequence-numbered log, and attach **live in `execution-layer.md` (REQ-EX-02/03), co-owned with `api-and-streaming.md`** — they are already written down there. **ROOT.2.1 is the steward item that will define the types.** They do **not** live in `event-log-and-projections.md`: that shard governs the append-only `learning_events` store and its projections (REQ-EL-01…04) — a different log, a different schema, a different purpose — and it never mentions `TermEvent`. Anything in this program that tries to resolve a TermEvent question by reading `event-log-and-projections.md` is reading the wrong shard.

**What this seam assumes of the deferred contract, and nothing more:** that events are a single named type it can stream, and that a subscription can begin at a caller-supplied position. If ROOT.2.1's definition changes the event shape, this document's member surface is unaffected — that is the point of the alias.

**Merge gate on the deferred side:** the TermEvent protocol carries merge-blocking contract tests (`testing-and-ci.md` REQ-TC-02). Those apply to whatever ROOT.2.1 defines, not to this document.

---

## Consumers

1. **Terminal experience layer** (`terminal-experience.md`) — the dock UI and accessibility transcript render the runner's event stream and collect composed prompt input. Per REQ-EX-01 scenario 3 no rendering or behaviour branches on which driver is active; equally, none branches on real-vs-fake.
2. **Execution-layer implementation** (the `claudeSpawn.ts` lineage that becomes `LocalDriver`, plus the session/API layer above it) — the *host* of the real runner and the substitution point for the fake. Note the distinct axis: `LocalDriver` and `CloudDriver` implement **ExecutionDriver** (REQ-EX-01), not `AgentRunner`.
3. **Testing and CI cassette harness** (`testing-and-ci.md` REQ-TC-01) — replays recorded NDJSON cassettes through `AgentRunner` for deterministic PR checks with no network, no API key, and no CLI.
4. **Workshop and artifacts** (`workshop-and-artifacts.md`) — Claude runs scoped to the workshop directory reach agent execution through this seam.
5. **Hosted edition** (`hosted-edition.md`) — consumes execution via `CloudDriver`; the real-vs-fake seam is orthogonal and applies there too (preview builds).

---

## Current-state anchor

**`src/lib/claudeSpawn.ts`** — MODIFIED in the migration (`docs/origin/CURRENT-STATE.md`; REQ-EX-01 and REQ-EX-04 current-state lines). Today it:

- Spawns **the learner's real `claude` CLI** directly, with no shell, and sends the prompt via stdin (never argv)
- Maps NDJSON stdout lines to `TermEvent` objects
- Takes tool and turn limits from server-side content definitions, never from the client request
- Provides a concurrency guard and an in-memory session registry (ownership of the registry after the migration is implementation territory, not settled here)
- Always terminates a run, and reports mid-run failures as error events rather than thrown exceptions

`AgentRunner` is the seam over this file's evolution: the no-shell / stdin-prompt / limits-from-content hardening survives verbatim behind the interface, and the NDJSON→`TermEvent` mapping survives as the real runner's event production.

---

## Later-phase references (not specified here)

Named to fix this contract's boundary, not to specify them:

- **REQ-EX-01** — one `ExecutionDriver` interface, two drivers. A separate contract (Atlas); see the boundary section above.
- **REQ-EX-02** — durable, sequence-numbered event log. Deferred; ROOT.2.1 defines.
- **REQ-EX-03** — server-held, reattachable sessions and `attach(sessionId, fromSeq)` semantics. Deferred; ROOT.2.1 defines. (Today's abort-on-unmount in `Terminal.tsx` is REMOVED by that work.)
- **REQ-EX-06** — sandbox lifecycle: throwaway drills, path-confinement, per-profile isolation. Execution-layer and sandbox work.

---

## Summary

`AgentRunner` is the production seam that abstracts real vs. recorded Claude Code CLI execution:

- Fake runners play cassette transcripts through the real UI with no CLI installed (REQ-EX-04 scenario 1)
- One enumerated member surface — `start`, `submitPrompt`, `attach`, `stop` — so real and fake type-check against the same interface (REQ-EX-04 scenario 2)
- Prompt-based: whole composed prompts, never keystrokes (REQ-EX-05 scenario 1)
- Transport-agnostic: no SSE/POST specifics in the contract (REQ-EX-05 scenario 2)
- One run = one prompt-to-completion invocation; the consumer drives turns
- Cassettes contain recorded `TermEvent` NDJSON; matching is deterministic and version-controlled; a miss fails loudly
- Errors: thrown before a session exists, in-band events once the stream has begun — identically in both implementations

The event payload (`TermEvent`), the durable sequence-numbered log, and attach semantics are **deferred**: their requirements live in `execution-layer.md` REQ-EX-02/03 co-owned with `api-and-streaming.md`, and **ROOT.2.1** is the item that will define the types. Current-state anchor: `src/lib/claudeSpawn.ts`. Implementation ownership: ROOT.1.4 (seam code with ROOT.1.5). Stewardship: ROOT.1.2 → ROOT.7.1 at the phase gate.

---

**Document lineage:** gen0 by implementer-ROOT.1.2.5-gen0; reworked by implementer-ROOT.1.2.5-gen1 (hardened, attempt 2) after a blind pair both returned request_changes — member surface enumerated, deferral destination corrected to `execution-layer.md` / `api-and-streaming.md` with ROOT.2.1 as the defining item, AgentRunner and ExecutionDriver seams separated, cassette and error-model contracts stated, turn model stated, the CLI reference de-Windows-ified, ownership attribution aligned to the shard. Out-of-scope by arbitration and deliberately left undefined: cassette keying, playback timing, run-option parameter placement, session-registry internals, attach and partial-replay semantics.
