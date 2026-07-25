---
id: ROOT.1.2.5
parent: ROOT.1.2
type: Task
title: agent-runner.md interface doc — AgentRunner seam contract (event types deferred)
ledger_depth: 3
status: in_progress
generation: 0
owner_agent: implementer-ROOT.1.2.5-gen0
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
verification: []
artifacts: []
---

Contract doc for the AgentRunner seam ahead of ROOT.1.4's implementation. The deferred
event-type boundary is the load-bearing edge: defining TermEvent here would create a
second steward for ROOT.2.1's contract.
