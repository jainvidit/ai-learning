---
id: ROOT.1.2.5
parent: ROOT.1.2
type: Task
title: agent-runner.md interface doc — AgentRunner seam contract (event types deferred)
ledger_depth: 3
status: done
generation: 1
owner_agent: implementer-ROOT.1.2.5-gen1 # attempt 2, hardened. gen0 artifact failed on merits: fresh blind pair both request_changes; verdicts + scope arbitration in events/ROOT.1.2.jsonl (2026-07-25T12:12:04Z, 12:14:52Z).
spec_refs:
  - .program/spec/execution-layer.md#req-ex-04
acceptance_criteria:
  - .program/interfaces/agent-runner.md exists and defines the seam — AgentRunner as a production interface with dev/preview/CI/offline consumers; fake plays recorded NDJSON transcripts (cassettes) end-to-end through the real UI without a claude CLI (REQ-EX-04 scenario 1); real and fake satisfy the same compile-time-checked interface (scenario 2)
  - The doc records the interaction contract constraints — prompt-based (composed prompts, never raw PTY keystrokes, REQ-EX-05) and transport-agnostic (nothing SSE/POST-specific that a WS upgrade could not satisfy, REQ-EX-05 scenario 2)
  - The doc explicitly DEFERS session event-log/TermEvent type definitions to ROOT.2.1 (event-log shard) and says where they will live, without defining them
  - Consumers listed (terminal-experience, execution-layer drivers, testing-and-ci cassette harness) with current-state anchor src/lib/claudeSpawn.ts; implementation ownership stays with ROOT.1.4; steward succession noted (ROOT.1.2 -> ROOT.7.1)
depends_on: []
blocks: []
children: []
file_ownership: [".program/interfaces/agent-runner.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
resume_hint: "gen1 rework COMPLETE, status in_review. Doc-only leaf. The artifact was rewritten in worktree .claude/worktrees/agent-a7df83e7c572d4178 — the integrator must merge that copy into the main checkout. All 7 binding IN-SCOPE fixes landed; all 5 OUT-OF-SCOPE items left undefined. Empirical evidence: .program/audits/ROOT.1.2.5-gen1-contract-typecheck.md. Criterion-3 boundary (no TermEvent shapes) re-checked by grep and by compile-opacity; still holds."
verification:
  - criterion: ".program/interfaces/agent-runner.md exists and defines the seam — AgentRunner as a production interface with dev/preview/CI/offline consumers; fake plays recorded NDJSON transcripts (cassettes) end-to-end through the real UI without a claude CLI (REQ-EX-04 scenario 1); real and fake satisfy the same compile-time-checked interface (scenario 2)"
    verdict: VERIFIED
    evidence: >-
      Doc sections 'Purpose' (production seam; dev / preview / CI / offline / production each named
      as its own consumer bullet), 'Cassette contract — contract level' properties 1 and 4 (content
      is recorded TermEvent NDJSON; no CLI, credentials or network under the fake), and 'Member
      surface — contract level' (the enumerated interface). Scenario 2 is verified EMPIRICALLY
      rather than by inspection — that was the primary reviewer's blocker:
      .program/audits/ROOT.1.2.5-gen1-contract-typecheck.md, Probe A runs tsc --strict over the
      doc's extracted ts block plus a real-shaped and a fake-shaped implementation and one
      indifferent consumer, TSC_EXIT=0; Probe B is a negative control that produced exactly the
      three intended diagnostics (TS2420 missing submitPrompt/stop, TS2416 Response not assignable
      to AsyncIterable, TS18046 ev is of type unknown), so Probe A's pass is demonstrably
      non-vacuous.
    method: >-
      Empirical — repo TypeScript 5.9.3 tsc --strict on the doc's own contract block: positive probe
      (exit 0) plus negative control (exit 2, three expected errors). Prose clauses checked by
      section mapping to REQ-EX-04. Probe sources are reproduced verbatim inside the evidence doc;
      the temporary .ts files were deleted, so nothing was added under src/**.
  - criterion: "The doc records the interaction contract constraints — prompt-based (composed prompts, never raw PTY keystrokes, REQ-EX-05) and transport-agnostic (nothing SSE/POST-specific that a WS upgrade could not satisfy, REQ-EX-05 scenario 2)"
    verdict: VERIFIED
    evidence: >-
      Section 'Interaction contract constraints (REQ-EX-05)' subsections 1 and 2 — now backed by the
      member surface instead of prose alone: submitPrompt(session, prompt: string) takes a whole
      composed string and no keystroke, key-code or control-sequence member exists anywhere in the
      surface; attach returns AsyncIterable<AgentRunnerEvent> and no SSE, POST, WS or PTY type
      appears. Enforcement is proven empirically in
      .program/audits/ROOT.1.2.5-gen1-contract-typecheck.md Probe B — an SSE-shaped implementation
      whose attach returns Response FAILS to compile (TS2416), and a keystroke-style member does not
      satisfy submitPrompt (TS2420). SSE-down / POST-up is recorded as implementation detail,
      explicitly not contract.
    method: >-
      Empirical — the negative-control compile failures show both constraints are enforced by the
      contract's shape, not merely asserted; plus section mapping to REQ-EX-05 scenarios 1 and 2.
  - criterion: "The doc explicitly DEFERS session event-log/TermEvent type definitions to ROOT.2.1 (event-log shard) and says where they will live, without defining them"
    verdict: VERIFIED
    evidence: >-
      Section 'Event payload — DEFERRED (defining item: ROOT.2.1)' carries a three-row table giving,
      per deferred item, the requirement home and ROOT.2.1 as the defining item. The destination is
      CORRECTED per the primary reviewer — requirements for TermEvent, the sequence-numbered log and
      attach live in execution-layer.md REQ-EX-02/03 co-owned with api-and-streaming.md, and
      ROOT.2.1 is the steward item that will define the types. The doc now states explicitly that
      they do NOT live in event-log-and-projections.md and why (that shard governs the append-only
      learning_events store and its projections, REQ-EL-01..04, and never mentions TermEvent —
      confirmed by reading the shard). BOUNDARY HELD: grep of the artifact for TermEvent
      variant-shape tokens returns NO MATCHES; the only code-form reference is the deferred import
      plus the named alias AgentRunnerEvent = TermEvent. Opacity is proven empirically by Probe B's
      TS18046 — nothing in this doc licenses reading a field off an event.
    method: >-
      Grep for variant-shape tokens (quoted type literals, text, tool, result, costUsd, numTurns,
      union-arm braces) returning zero matches; read of event-log-and-projections.md to confirm the
      negative claim about that shard; empirical opacity check (TS18046) in
      .program/audits/ROOT.1.2.5-gen1-contract-typecheck.md.
  - criterion: "Consumers listed (terminal-experience, execution-layer drivers, testing-and-ci cassette harness) with current-state anchor src/lib/claudeSpawn.ts; implementation ownership stays with ROOT.1.4; steward succession noted (ROOT.1.2 -> ROOT.7.1)"
    verdict: VERIFIED
    evidence: >-
      Section 'Consumers' lists all three required entries (1 terminal-experience dock UI and a11y
      transcript, 2 execution-layer implementation, 3 testing-and-ci cassette harness) plus
      workshop-and-artifacts and hosted-edition, which execution-layer.md's own 'Depended on by'
      line names. Entry 2 is RESTRUCTURED to match the shard — LocalDriver and CloudDriver implement
      ExecutionDriver (REQ-EX-01), NOT AgentRunner — so the gen0 conflation is gone and the two axes
      are separated in a dedicated section. Section 'Current-state anchor' documents
      src/lib/claudeSpawn.ts as MODIFIED with every bullet checked against the actual file. The
      header records implementation owner ROOT.1.4 with the seam code sitting at ROOT.1.5
      (consistent with the sibling doc .program/interfaces/model-router.md) and steward succession
      ROOT.1.2 -> ROOT.7.1.
    method: >-
      Section mapping against execution-layer.md's 'Depended on by' and 'Contract owner' lines, plus
      a read of src/lib/claudeSpawn.ts confirming each current-state bullet — no-shell spawn, prompt
      via stdin never argv, NDJSON to TermEvent mapping, limits from server-side content
      definitions, concurrency guard and in-memory session registry, and in-band error events rather
      than mid-generator throws.
artifacts:
  - path: ".program/interfaces/agent-runner.md"
    type: interface_doc
    description: "AgentRunner production interface seam contract — REWRITTEN in gen1. INTEGRATOR NOTE: the edit lives in the worktree copy .claude/worktrees/agent-a7df83e7c572d4178/.program/interfaces/agent-runner.md and must be merged into the main checkout."
  - path: ".program/audits/ROOT.1.2.5-gen1-contract-typecheck.md"
    type: evidence
    description: "Empirical tsc --strict evidence for REQ-EX-04 scenario 2 — positive probe (exit 0, real + fake against one interface) and negative control (exit 2, three expected diagnostics). Written directly to the MAIN checkout."
---

Contract doc for the AgentRunner seam ahead of the implementing item's work. The deferred
event-type boundary is the load-bearing edge: defining TermEvent here would create a second
steward for ROOT.2.1's contract.

## gen1 pre-implementation plan (tier-2 required)

1. **Contract touched:** `.program/interfaces/agent-runner.md` — the AgentRunner seam
   contract (member surface, error model, cassette statement, turn model). It abuts two
   contracts I do not own: the TermEvent protocol (`execution-layer.md` REQ-EX-02/03,
   co-owned with `api-and-streaming.md`; steward item ROOT.2.1) and the ExecutionDriver
   interface (`execution-layer.md` REQ-EX-01).
2. **Who owns the other side:** ROOT.2.1 defines the TermEvent types (binding per this
   item's acceptance criterion 3). `execution-layer.md` assigns Atlas the ExecutionDriver
   interface and Ramesh the implementations plus the TermEvent protocol. The sibling seam
   doc `.program/interfaces/model-router.md` (ROOT.1.2.4) already cross-references
   AgentRunner, so I keep my side consistent with it and do not edit it.
3. **What I will NOT change:** no TermEvent variant shapes, no ExecutionDriver contract, no
   other interface doc, no code. Named-only-as-deferred, never defined (per arbitration):
   cassette keying mechanism, playback timing internals, `allowedTools`/`maxTurns`
   parameter placement, session-registry ownership internals, attach/partial-replay
   semantics. Any of these proving unavoidable to define would be a `needs_split`/blocked
   signal, not a judgment call.

Outcome: no contract-shape change to any contract I do not own was required, so no
`needs_split` signal arose.

## Implementation record (gen1)

Attempt 2, hardened. The gen0 artifact was replaced rather than patched. All seven binding
IN-SCOPE fixes landed; all five OUT-OF-SCOPE items are named only as
explicitly-not-decided.

**IN-SCOPE fixes, each traceable to doc text:**

1. **Member surface enumerated** — new section "Member surface — contract level" with a
   `ts` block declaring `AgentRunner` with four members and binding signatures:
   `start(options): Promise<AgentSessionRef>`, `submitPrompt(session, prompt: string):
   Promise<void>`, `attach(session, fromSeq?): AsyncIterable<AgentRunnerEvent>`, and
   `stop(session): Promise<void>`. The event payload is a **named deferred alias**
   (`export type AgentRunnerEvent = TermEvent`) pointing at ROOT.2.1, with zero variant
   shapes. The gen0 hedge "…style method or stream-write interface" is deleted — grep for
   "style method or" returns no matches.
2. **Deferral destination fixed** — requirements for TermEvent, the seq-numbered log and
   attach are stated to live in `execution-layer.md` REQ-EX-02/03 **co-owned with
   `api-and-streaming.md`**, with ROOT.2.1 as the steward item that will **define the
   types**. The doc now says explicitly that they do NOT live in
   `event-log-and-projections.md`, and why (that shard is `learning_events` plus
   projections, REQ-EL-01..04, and never mentions TermEvent — verified by reading it).
3. **AgentRunner vs ExecutionDriver distinguished** — dedicated section. `LocalDriver` and
   `CloudDriver` implement **ExecutionDriver** (REQ-EX-01); `AgentRunner` (REQ-EX-04) is
   the real-vs-recorded seam over the modified `claudeSpawn.ts`, quoting the shard's own
   current-state line. Consumer entry 2 was restructured to match, so the doc no longer
   claims the drivers implement AgentRunner.
4. **Cassette contract stated** — four numbered contract properties: content is recorded
   `TermEvent` NDJSON; matching is deterministic and version-controlled; a miss is a loud
   deterministic failure (never synthesized, never falls through to a live CLI); no CLI,
   credentials or network under the fake. The keying scheme is explicitly deferred.
5. **Error model chosen** — thrown before a session exists (`start` rejects: no CLI
   resolvable, no cassette matched, concurrency guard), in-band error events once the
   stream has begun, then termination; identical in real and fake. This is the
   least-irreversible reading because it is what `src/lib/claudeSpawn.ts` already does
   today — it throws on a missing CLI and throws `ConcurrentRunError`, but pushes error
   events for timeout, spawn failure and non-zero exit rather than throwing mid-generator —
   so nothing existing must change to honour it. The error *variant shape* stays
   ROOT.2.1's.
6. **Single-shot vs multi-turn stated** — one run is one prompt-to-completion invocation
   that always terminates; the **consumer drives turns** via successive `submitPrompt` calls
   on the same `AgentSessionRef`; agent-internal tool iteration is not a consumer turn and
   is invisible to consumers.
7. **Minors** — "claude.exe binary" replaced with the shard's phrasing "the learner's real
   `claude` CLI" (grep for `.exe` in the artifact: no matches); ownership attribution
   rewritten to what the shard actually says — Atlas owns the **ExecutionDriver
   interface**, Ramesh the implementations and TermEvent protocol, and the shard names no
   lane owner for the AgentRunner seam itself, which the doc states rather than inventing
   one.

**Empirical verification (mandatory at this tier).** REQ-EX-04 scenario 2 is a compile-time
claim, so it was checked by compiling rather than by reading: repo TypeScript 5.9.3,
`--strict`. Positive probe exit 0 (real-shaped and fake-shaped implementations against one
interface, one indifferent consumer); negative control exit 2 with exactly the three
intended diagnostics, proving the interface constrains and the deferred alias is opaque.
Evidence: `.program/audits/ROOT.1.2.5-gen1-contract-typecheck.md`, with probe sources
reproduced verbatim; the temp `.ts` files were deleted and nothing was left under `src/**`.

**OUT-OF-SCOPE items — confirmed named but undefined:** cassette keying mechanism and
playback timing (Cassette contract, closing paragraph); `allowedTools`/`maxTurns` parameter
placement (`AgentRunOptions` doc comment, the "Not contract" bullet, and the multi-turn
section); session-registry ownership internals ("Not contract" bullet and the Current-state
anchor bullet); attach and partial-replay semantics (deferral table row 3 and the `attach`
doc comment).
