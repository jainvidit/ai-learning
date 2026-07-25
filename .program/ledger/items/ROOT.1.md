---
id: ROOT.1
parent: ROOT
type: Phase
title: Phase 0 — Forced foundations
ledger_depth: 1
status: in_progress
owner_agent: director-gen0 (scheduling container; children flat-dispatched)
owner_model: fable
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-01
  - .program/spec/content-pipeline.md
  - .program/spec/api-and-streaming.md
  - .program/spec/model-gateway.md
  - .program/spec/testing-and-ci.md#req-tc-03
acceptance_criteria:
  - next-mdx-remote is absent from package.json and Velite (or recorded runner-up) compiles content at build time (REQ-CP-01)
  - Lessons compile to ordered beat arrays with stable beatIds (REQ-CP-02)
  - Workspace packages extracted per ADR-0002/ADR-0008 (npm workspaces, no apps/api); one Next.js process (ROOT.1.10)
  - oRPC layer emits OpenAPI/JSON-Schema (REQ-API-02)
  - AgentRunner and ModelGateway seams exist with working fakes (REQ-EX-04, REQ-MG-03)
  - CI runs validate + typecheck + build on PRs (REQ-TC-03)
  - Phase 0 Gate (ROOT.1.8) passed the REQ-MS-02 regression floor
depends_on: []
blocks: [ROOT.2]
children: [ROOT.1.1, ROOT.1.2, ROOT.1.3, ROOT.1.4, ROOT.1.5, ROOT.1.6, ROOT.1.7, ROOT.1.8, ROOT.1.9, ROOT.1.10]
file_ownership: ["package.json", "packages/**", "velite.config.*", ".github/**", "src/lib/schema.ts", "src/lib/content.ts", "src/lib/bedrock.ts", "src/lib/claudeSpawn.ts", "scripts/validate-content.ts"]
review: {tier: 2, required_lenses: [assembly-vs-shard, interface-consistency], verdicts: []}
verification: []
artifacts: []
resume_hint: "Dispatch ROOT.1.7 (probes) and ROOT.1.2 (contracts pack) first — everything else consumes their outputs."
---

# Phase 0 — Forced foundations

The forced Velite migration, beat compiler, package split (ADR-0002: packages only;
ADR-0008: npm workspaces), oRPC layer, the two production seams + fakes, and CI.
Probes ROOT.1.7 (#11) and ROOT.1.9 (#12) discharge assumptions before dependent work.
Intra-phase order: 1.7/1.9/1.2 first (ROOT.7.2 runs before this phase); package.json
writers are SERIALIZED by depends_on edges (1.1 → 1.6 → 1.3 → 1.5, per ADR-0007 —
coupling finding 3); 1.10 (workspace split) runs alone after all implementation items;
1.8 (Gate) last.
