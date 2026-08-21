---
id: ROOT.4.6
parent: ROOT.4
type: Capability
title: Terminal experience — PersistentTerminalHost, dock, detachability, a11y
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/terminal-experience.md#req-tx-01
  - .program/spec/terminal-experience.md#req-tx-02
  - .program/spec/terminal-experience.md#req-tx-03
  - .program/spec/terminal-experience.md#req-tx-04
  - .program/spec/execution-layer.md#req-ex-01
acceptance_criteria:
  - PersistentTerminalHost owns xterm instances via portals (TX-01)
  - Bottom dock with per-sandbox tabs (TX-02)
  - Session detachability as a UX feature (TX-03)
  - A11y transcript from TermEvents — UI never parses raw NDJSON (TX-04)
  - Home Edition terminal-exercise UI states the agent runs on the learner's machine (EX-01 scenario 4 copy, from completeness #11)
depends_on: [ROOT.4.5, ROOT.4.1, ROOT.4.2]
blocks: []
children: []
file_ownership: ["src/components/lesson/Terminal.tsx", "src/components/terminal/**", "src/app/layout.tsx"]
review: {tier: 2, required_lenses: [spec-conformance, driver-agnosticism], verdicts: []}
verification: []
artifacts: []
resume_hint: "Nova's dock UX must not branch on driver. Edges added per coupling #2/#8: consumes 4.1's tokens/a11y tooling and 4.2's beat contract. layout.tsx transfers cross-phase from ROOT.1.6 (org.md table corrected) — preserve its providers and ThemeToggle placement ([HARD] #26/#27) when inserting the host/dock."
---
The portal-slot contract with ROOT.4.2's SandboxBeat lives in
.program/interfaces/beat-model.md — implement against the doc. The Workshop dock tab
(REQ-TX-02) ships as an extensible tab registration so ROOT.5.2 can populate it in
Phase 4 without editing this item's files; until then the tab is absent, never dead
(coupling #20).
