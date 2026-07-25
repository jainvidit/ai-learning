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
acceptance_criteria:
  - PersistentTerminalHost owns xterm instances via portals (TX-01)
  - Bottom dock with per-sandbox tabs (TX-02)
  - Session detachability as a UX feature (TX-03)
  - A11y transcript from TermEvents — UI never parses raw NDJSON (TX-04)
depends_on: [ROOT.4.5]
blocks: []
children: []
file_ownership: ["src/components/lesson/Terminal.tsx", "src/components/terminal/**", "src/app/layout.tsx"]
review: {tier: 2, required_lenses: [spec-conformance, driver-agnosticism], verdicts: []}
verification: []
artifacts: []
resume_hint: "Nova's dock UX must not branch on driver. layout.tsx shared with ROOT.4.1's ownership history — coordinator sequences any overlap."
---
