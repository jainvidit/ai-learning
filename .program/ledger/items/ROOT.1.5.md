---
id: ROOT.1.5
parent: ROOT.1
type: Capability
title: Production seams — AgentRunner + ModelGateway with fakes
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/execution-layer.md#req-ex-04
  - .program/spec/model-gateway.md#req-mg-01
  - .program/spec/model-gateway.md#req-mg-02
  - .program/spec/model-gateway.md#req-mg-03
acceptance_criteria:
  - AgentRunner seam wraps claudeSpawn lineage with recorded-transcript fakes (EX-04)
  - ModelRouter/ModelGateway seam wraps bedrock lineage with a fake consumer; quality-first table per REQ-MG-02 (MG-01/03)
depends_on: [ROOT.1.9, ROOT.1.3]
blocks: []
children: []
file_ownership: ["src/lib/bedrock.ts", "src/lib/claudeSpawn.ts", "src/lib/seams/**", "package.json"]
review: {tier: 2, required_lenses: [spec-conformance, seam-fidelity], verdicts: []}
verification: []
artifacts: []
resume_hint: "Needs ROOT.1.9's probe (Bedrock structured outputs) before the gateway API is frozen. Workspace split moved to ROOT.1.10 (ADR-0007/0008; sizing #11). Last writer in the Phase-0 package.json chain."
---
The two seams everyone's testability rides on (LANE-DEPENDENCIES block 6). Fakes are a
product surface, not test mocks (testing-and-ci). SEAM UNIFICATION (coupling #16):
ROOT.4.5's ExecutionDriver is the SAME abstraction this item's AgentRunner wraps —
one seam, extended in Phase 3, never a second parallel one; the interface doc this item
publishes must say so, and ROOT.4.8's cassettes attach to the shipped path. Seam
modules go in src/lib/seams/ until ROOT.1.10 relocates them into packages/.
