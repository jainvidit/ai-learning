---
id: ROOT.4.5
parent: ROOT.4
type: Capability
title: Execution layer — ExecutionDriver, durable seq-log sessions, LocalDriver
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/execution-layer.md#req-ex-01
  - .program/spec/execution-layer.md#req-ex-02
  - .program/spec/execution-layer.md#req-ex-03
  - .program/spec/execution-layer.md#req-ex-05
  - .program/spec/execution-layer.md#req-ex-06
acceptance_criteria:
  - ExecutionDriver interface with LocalDriver primary; CloudDriver interface-only (EX-01; hosted parked per ADR-0001)
  - Durable seq-numbered TermEvent log per session (EX-02)
  - Server-held reattachable sessions — attach(sessionId, fromSeq); abort-on-unmount removed (EX-03)
  - Prompt-based interaction preserved; transport PTY-upgradeable (EX-05)
  - Sandbox lifecycle — drills throwaway, path-confined, per-profile isolation; bulk cleanup EXCLUDES any Workshop directory by guard, not convention (EX-06 incl. scenario 3 — the guard lives here even though Workshop arrives in Phase 4)
  - ADR-0025 no-driver-branching check run as part of acceptance — the 10-check procedure (.program/decisions/ADR-0025.md) executed against src/ after ExecutionDriver exists, transcript recorded; if a composition point needs to branch, it is named (single file+symbol) via additive amendment to ADR-0025 per its exception rules
  - MS-03 baseline remediation (ADR-0028) — the two recorded baseline violations in this item's ownership, src/lib/sandbox.ts:65 and scripts/seed-sandboxes.ts:33 (fs.rmSync targeting sandbox/live/**), are DISPOSITIONED — either refactored so no delete path targets a protected tree, or ruled an allowed exception via additive ADR per ADR-0028's exception-recording rules (file, line, justification); the ADR-0028 Gate grep re-run over these two files shows zero unclassified hits. Any disposition that keeps a delete on learner data is PART 9-adjacent — park for authorization, never self-approve.
depends_on: [ROOT.7.3.7]
blocks: [ROOT.4.6]
children: []
file_ownership: ["src/lib/claudeSpawn.ts", "src/lib/sandbox.ts", "src/lib/execution/**", "src/app/api/claude-code/**", ".program/interfaces/termevent-protocol.md", "scripts/seed-sandboxes.ts"]
review: {tier: 2, required_lenses: [spec-conformance, contract-tests], verdicts: []}
verification: []
artifacts: []
resume_hint: "Atlas owns the interface, Ramesh the impl + TermEvent protocol. The no-shell/stdin-prompt/flags-from-content hardening survives verbatim (CURRENT-STATE). TermEvent contract doc owned here."
---
SEAM UNIFICATION (coupling #16): ExecutionDriver EXTENDS ROOT.1.5's AgentRunner seam —
one abstraction; the fakes and ROOT.4.8's cassettes must exercise the shipped path
(durable log included), never a bypass. The Workshop-exclusion guard in sandbox
cleanup (EX-06 s3) is THIS item's deliverable with a test, because ROOT.5.1 cannot
edit sandbox.ts (coupling #19) — getting it wrong deletes learner work.
