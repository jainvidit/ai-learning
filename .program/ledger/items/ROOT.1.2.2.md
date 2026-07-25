---
id: ROOT.1.2.2
parent: ROOT.1.2
type: Task
title: beat-model.md interface doc — beat type, stability rules, persistent-beat portal-slot contract
ledger_depth: 3
status: changes_requested
generation: 0
owner_agent: null # gen0 dead; takeover logged by coordinator-ROOT.1.2-gen1 — done was invalid with unresolved secondary request_changes (see events ROOT.1.2.jsonl 12:16)
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-02
acceptance_criteria:
  - .program/interfaces/beat-model.md exists and defines the beat type — beatId (stable across rebuilds per REQ-CP-02 scenario 2), type from the closed set prose|quiz|playground|terminal|challenge|widget (ADR-0005), optional persistent boolean, completion predicate "passed"|"verified"|"attempted"
  - The doc states persistent:true is REQUIRED for terminal/streaming beats (REQ-CP-02 scenario 3) and records the LX-03/TX-01 portal-slot contract — persistent beats stay mounted across beat transitions, never display:none, never collapsed to zero height, min-height reserved; xterm instance ownership lives with the root-level PersistentTerminalHost which portals instances into beat slots or the dock
  - The doc records ADR-0005's session-end rule — session-end/recap is an authored convention over a prose beat, NOT a schema type
  - Consumers are listed (beat compiler in src/lib/content.ts / ROOT.1.3, lesson-experience ROOT.4, terminal-experience ROOT.4, dashboard resume-to-beat) and the change protocol names the steward (ROOT.1.2 while open, ROOT.7.1 after)
depends_on: []
blocks: []
children: []
file_ownership: [".program/interfaces/beat-model.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification:
  - criterion: ".program/interfaces/beat-model.md exists and defines the beat type — beatId (stable across rebuilds per REQ-CP-02 scenario 2), type from the closed set prose|quiz|playground|terminal|challenge|widget (ADR-0005), optional persistent boolean, completion predicate \"passed\"|\"verified\"|\"attempted\""
    verdict: VERIFIED
    evidence: .program/interfaces/beat-model.md
    method: Direct inspection — document sections "Beat Type Shape" and "Beat ID Stability" define all required fields and the closed type vocabulary per ADR-0005
  - criterion: "The doc states persistent:true is REQUIRED for terminal/streaming beats (REQ-CP-02 scenario 3) and records the LX-03/TX-01 portal-slot contract — persistent beats stay mounted across beat transitions, never display:none, never collapsed to zero height, min-height reserved; xterm instance ownership lives with the root-level PersistentTerminalHost which portals instances into beat slots or the dock"
    verdict: VERIFIED
    evidence: .program/interfaces/beat-model.md
    method: Direct inspection — section "Persistent Beats" states requirement, section "Portal-Slot Contract (REQ-LX-03, REQ-TX-01)" documents the full contract with PersistentTerminalHost ownership and portal-slot invariants
  - criterion: "The doc records ADR-0005's session-end rule — session-end/recap is an authored convention over a prose beat, NOT a schema type"
    verdict: VERIFIED
    evidence: .program/interfaces/beat-model.md
    method: Direct inspection — section "Beat Type Vocabulary" includes explicit note that session-end/recap is an authored convention over prose, citing ADR-0005
  - criterion: "Consumers are listed (beat compiler in src/lib/content.ts / ROOT.1.3, lesson-experience ROOT.4, terminal-experience ROOT.4, dashboard resume-to-beat) and the change protocol names the steward (ROOT.1.2 while open, ROOT.7.1 after)"
    verdict: VERIFIED
    evidence: .program/interfaces/beat-model.md
    method: Direct inspection — section "Consumers and Change Protocol" lists all four consumers with their item IDs and file paths, and the "Change Protocol" subsection names ROOT.1.2 (current) and ROOT.7.1 (successor)
artifacts: [".program/interfaces/beat-model.md"]
resume_hint: "Doc-only leaf. Source texts: content-pipeline REQ-CP-02, ADR-0005 (.program/decisions/ADR-0005.md), lesson-experience REQ-LX-03, terminal-experience REQ-TX-01. Write only the one named file."
---

This doc is the Contract artifact for LANE-DEPENDENCIES "Beat model type". It describes
COMPILED OUTPUT shape (what src/lib/content.ts emits), not authored input — the authored
schema is content-schema.md / src/lib/schema.ts. Event types are explicitly out of scope
(deferred to ROOT.2.1); say so in the doc.
