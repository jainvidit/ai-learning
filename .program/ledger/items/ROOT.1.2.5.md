---
id: ROOT.1.2.5
parent: ROOT.1.2
type: Task
title: agent-runner.md interface doc — AgentRunner seam contract (event types deferred)
ledger_depth: 3
status: in_progress
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
resume_hint: "Doc-only leaf. Source: execution-layer.md REQ-EX-04/05 (REQ-EX-01/02/03/06 are later-phase driver/session work — reference, don't specify). Event types deferred to ROOT.2.1 by parent's acceptance criterion — this is binding. gen1 = rework against 7 binding IN-SCOPE fixes + 5 binding OUT-OF-SCOPE exclusions (coordinator arbitration)."
verification: []
artifacts:
  - path: ".program/interfaces/agent-runner.md"
    type: interface_doc
    description: "AgentRunner production interface seam contract"
---

Contract doc for the AgentRunner seam ahead of the implementing item's work. The deferred
event-type boundary is the load-bearing edge: defining TermEvent here would create a
second steward for ROOT.2.1's contract.

## gen1 pre-implementation plan (tier-2 required)

1. **Contract touched:** `.program/interfaces/agent-runner.md` — the AgentRunner seam
   contract (member surface, error model, cassette statement, turn model). It abuts two
   contracts I do not own: the TermEvent protocol (`execution-layer.md` REQ-EX-02/03
   co-owned with `api-and-streaming.md`; steward item ROOT.2.1) and the ExecutionDriver
   interface (`execution-layer.md` REQ-EX-01).
2. **Who owns the other side:** ROOT.2.1 owns/defines the TermEvent types (binding per
   this item's acceptance criterion 3). `execution-layer.md` assigns Atlas the
   ExecutionDriver interface and Ramesh the implementations + TermEvent protocol.
   Sibling seam doc `.program/interfaces/model-router.md` (ROOT.1.2.4) already
   cross-references AgentRunner — I keep my side consistent with it, and do not edit it.
3. **What I will NOT change:** no TermEvent variant shapes, no ExecutionDriver contract,
   no other interface doc, no code. Out-of-scope per arbitration and therefore only ever
   named as deferred, never defined: cassette keying mechanism, playback timing internals,
   `allowedTools`/`maxTurns` parameter placement, session-registry ownership internals,
   attach/partial-replay semantics. Any of these turning out to be unavoidable to state
   would be a `needs_split`/blocked signal, not a judgment call.

## Implementation record (gen1)

Rework in progress — see verification block for per-criterion evidence as it lands.
