---
id: ROOT.5
parent: ROOT
type: Phase
title: Phase 4 — Workshop era & curriculum
ledger_depth: 1
status: proposed
owner_agent: null
owner_model: null
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-01
  - .program/spec/workshop-and-artifacts.md
  - .program/spec/boss-and-test-out.md
  - .program/spec/curriculum-content.md
acceptance_criteria:
  - Git-backed per-profile Workshop with checkpoint/restore-forward; no hard reset anywhere (REQ-WA-01)
  - Artifact records, shelf, cumulative re-verification, non-punitive repair (REQ-WA-03/04/05)
  - Boss + test-out mechanics live (boss-and-test-out)
  - Spec amendments landed before any module 2–14 authoring (REQ-CC-04)
  - Modules 2–14 authored in parallel against the enriched schema, one agent per module (REQ-CC-01..06)
  - Phase 4 Gate (ROOT.5.6) passed
depends_on: [ROOT.4]
blocks: []
children: [ROOT.5.1, ROOT.5.2, ROOT.5.3, ROOT.5.4, ROOT.5.5, ROOT.5.6]
file_ownership: ["src/lib/workshop.ts", "content/modules/**", "specs/**", "sandbox/templates/**", "src/lib/verifiers/**"]
review: {tier: 2, required_lenses: [assembly-vs-shard, content-protected-properties], verdicts: []}
verification: []
artifacts: []
resume_hint: "ROOT.5.4 (spec amendments) before ROOT.5.5 (module authoring) — hard order per REQ-CC-04; workshop plumbing 5.1 parallel to 5.4."
---

# Phase 4 — Workshop era & curriculum

Module 12's weakness mitigation (OPEN-QUESTIONS #8) must be ADR'd at ROOT.5.5
decomposition time — module 12 is not built until then (REQ-CC-05). Module authoring
follows the LANE-DEPENDENCIES per-module ownership pattern: only shared file is the
append-only verifier registry. Workshop dir is never-delete once created. Fixtures and
verifiers are 100% authored, never generated (REQ-CG-02).
