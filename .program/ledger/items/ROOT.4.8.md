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
  - .program/spec/judge-pipeline.md#req-jp-06
acceptance_criteria:
  - Deterministic cassettes on PRs, live battery nightly — no live-CLI on PRs; cassettes attach to the shipped AgentRunner/ExecutionDriver path (TC-01; coupling #16)
  - TermEvent protocol contract tests merge-blocking (TC-02)
  - Verifier golden-matrix harness — pristine-must-fail / solution-must-pass, both directions, for every registered verifier (TC-03 scenario 2 / CC-02 s2; owns common.ts + the harness)
  - JP-06 drift detection — nightly battery per (judgeModel, promptVersion, itemRevision) + met-rate z-test monitor with always-escalate + pin + notify response, Langfuse for observability (moved from ROOT.2.3)
depends_on: [ROOT.4.5]
blocks: []
children: []
file_ownership: ["tests/**", ".github/**", "src/lib/verifiers/common.ts", "src/lib/verifiers/harness/**", "src/lib/drift/**"]
review: {tier: 1, required_lenses: [spec-conformance, flake-hunting], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned (sizing #23): cassette recorder; replay-in-CI; TermEvent suite; golden-matrix harness; nightly+drift. Runner comes from ROOT.7.2 — never chosen here. Consumes ROOT.1.5's fakes and ROOT.4.5's TermEvent contract. common.ts ownership here protects it from Phase-4 module agents (coupling #15). JP-06's 'page' = local notification (desktop app)."
---
