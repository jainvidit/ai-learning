---
id: ROOT.1.5
parent: ROOT.1
type: Capability
title: Production seams — AgentRunner + ModelGateway with fakes; package split
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/execution-layer.md#req-ex-04
  - .program/spec/model-gateway.md#req-mg-01
  - .program/spec/model-gateway.md#req-mg-03
acceptance_criteria:
  - AgentRunner seam wraps claudeSpawn lineage with recorded-transcript fakes (EX-04)
  - ModelRouter/ModelGateway seam wraps bedrock lineage with a fake consumer; quality-first table per REQ-MG-02 (MG-01/03)
  - Workspace packages extracted per ADR-0002 — packages only, one Next app, no apps/api
depends_on: [ROOT.1.7]
blocks: []
children: []
file_ownership: ["packages/**", "src/lib/bedrock.ts", "src/lib/claudeSpawn.ts", "pnpm-workspace.yaml", "package.json"]
review: {tier: 2, required_lenses: [spec-conformance, seam-fidelity], verdicts: []}
verification: []
artifacts: []
resume_hint: "Needs ROOT.1.7's ASSUMPTIONS-#12 probe (Bedrock structured outputs) before the gateway API is frozen. package.json shared with ROOT.1.1 — sequence, never concurrent."
---
The two seams everyone's testability rides on (LANE-DEPENDENCIES block 6). Fakes are a
product surface, not test mocks (testing-and-ci). NOTE: file_ownership overlaps
ROOT.1.1 on package.json — the phase coordinator must sequence these two items, never
run them concurrently.
