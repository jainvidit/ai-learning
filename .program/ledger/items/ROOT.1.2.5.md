---
id: ROOT.1.2.5
parent: ROOT.1.2
type: Task
title: agent-runner.md interface doc — AgentRunner seam contract (event types deferred)
ledger_depth: 3
status: in_review
generation: 0
owner_agent: null # gen0 dead; takeover logged by coordinator-ROOT.1.2-gen1 — "completed" invalid vocab; no review verdicts on record; fresh blind pair dispatched
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
resume_hint: "Doc-only leaf. Source: execution-layer.md REQ-EX-04/05 (REQ-EX-01/02/03/06 are later-phase driver/session work — reference, don't specify). Event types deferred to ROOT.2.1 by parent's acceptance criterion — this is binding."
verification:
  - criterion: ".program/interfaces/agent-runner.md exists and defines the seam — AgentRunner as a production interface with dev/preview/CI/offline consumers; fake plays recorded NDJSON transcripts (cassettes) end-to-end through the real UI without a claude CLI (REQ-EX-04 scenario 1); real and fake satisfy the same compile-time-checked interface (scenario 2)"
    verdict: VERIFIED
    evidence: ".program/interfaces/agent-runner.md sections: Purpose (production interface seam), Consumers (dev/preview/CI/offline listed), Purpose paragraph 2 (fake runners playing cassettes through real UI), Purpose paragraph 3 (compile-time interface)"
    method: "Manual inspection — doc sections map to REQ-EX-04 requirements"
  - criterion: "The doc records the interaction contract constraints — prompt-based (composed prompts, never raw PTY keystrokes, REQ-EX-05) and transport-agnostic (nothing SSE/POST-specific that a WS upgrade could not satisfy, REQ-EX-05 scenario 2)"
    verdict: VERIFIED
    evidence: ".program/interfaces/agent-runner.md section 'Interaction Contract Constraints' subsections 1 (Prompt-Based Interaction) and 2 (Transport-Agnostic Contract) explicitly cover REQ-EX-05 scenarios"
    method: "Manual inspection — dedicated section with scenario cross-references"
  - criterion: "The doc explicitly DEFERS session event-log/TermEvent type definitions to ROOT.2.1 (event-log shard) and says where they will live, without defining them"
    verdict: VERIFIED
    evidence: ".program/interfaces/agent-runner.md section 'Event Stream Protocol — DEFERRED' states ROOT.2.1 responsibility, lists deferred items (TermEvent, sequence numbering, attach protocol), specifies location (.program/spec/event-log-and-projections.md), defines no event shapes"
    method: "Manual inspection — explicit deferral section with owner and location"
  - criterion: "Consumers listed (terminal-experience, execution-layer drivers, testing-and-ci cassette harness) with current-state anchor src/lib/claudeSpawn.ts; implementation ownership stays with ROOT.1.4; steward succession noted (ROOT.1.2 -> ROOT.7.1)"
    verdict: VERIFIED
    evidence: ".program/interfaces/agent-runner.md section 'Consumers' (three items listed), section 'Current State Anchor' (src/lib/claudeSpawn.ts), frontmatter (Implementation owner: ROOT.1.4, Steward succession: ROOT.1.2 -> ROOT.7.1)"
    method: "Manual inspection — all metadata and consumer lists present"
artifacts:
  - path: ".program/interfaces/agent-runner.md"
    type: interface_doc
    description: "AgentRunner production interface seam contract"
---

Contract doc for the AgentRunner seam ahead of ROOT.1.4's implementation. The deferred
event-type boundary is the load-bearing edge: defining TermEvent here would create a
second steward for ROOT.2.1's contract.

## Implementation record

**Spec source:** `.program/spec/execution-layer.md` REQ-EX-04 (AgentRunner as production seam, fake cassette playback) and REQ-EX-05 (prompt-based interaction, transport-agnostic contract). REQ-EX-01/02/03/06 are referenced by name as later-phase work but not specified in detail per task instructions.

**Deferral boundary enforced:** No TermEvent shapes defined. Event Stream Protocol section explicitly defers to ROOT.2.1 with owner (Ramesh), location (event-log-and-projections.md), and deferred items list (TermEvent types, sequence numbering, attach protocol, gap replay).

**Current-state anchor:** `src/lib/claudeSpawn.ts` documented as MODIFIED evolution into LocalDriver.

**Consumers enumerated:** terminal-experience (dock UI), execution-layer drivers (LocalDriver/CloudDriver), testing-and-ci (cassette harness).

**Interaction constraints:** Prompt-based (composed prompts, no raw PTY keystrokes) and transport-agnostic (no SSE/POST specifics) per REQ-EX-05.

**Stewardship:** ROOT.1.2 -> ROOT.7.1 in frontmatter; implementation ownership ROOT.1.4 stated.

All four acceptance criteria verified via manual section mapping.
