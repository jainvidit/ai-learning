---
id: ROOT.4.8
parent: ROOT.4
type: Capability
title: Testing & CI completion — cassettes, contract tests, nightly live battery
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/testing-and-ci.md#req-tc-01
  - .program/spec/testing-and-ci.md#req-tc-02
acceptance_criteria:
  - Deterministic cassettes on PRs, live battery nightly — no live-CLI on PRs (TC-01; REJECTED alternative)
  - TermEvent protocol contract tests merge-blocking (TC-02)
depends_on: [ROOT.4.5]
blocks: []
children: []
file_ownership: ["tests/**", ".github/**"]
review: {tier: 1, required_lenses: [spec-conformance, flake-hunting], verdicts: []}
verification: []
artifacts: []
resume_hint: "Consumes ROOT.1.5's fakes and ROOT.4.5's TermEvent contract. .github/** shared with ROOT.1.4 — sequential by phase, no live overlap."
---
