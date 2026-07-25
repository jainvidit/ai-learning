---
id: ROOT.4.3
parent: ROOT.4
type: Capability
title: Dashboard & wayfinding — hero, metro map, sidebar, quiet stats, first-run
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/dashboard-and-wayfinding.md#req-dw-01
  - .program/spec/dashboard-and-wayfinding.md#req-dw-02
  - .program/spec/dashboard-and-wayfinding.md#req-dw-03
  - .program/spec/dashboard-and-wayfinding.md#req-dw-04
  - .program/spec/dashboard-and-wayfinding.md#req-dw-05
  - .program/spec/profiles-and-identity.md#req-pi-01
acceptance_criteria:
  - Hero with next-best-action; position/next/why within 5s (DW-01; streak per ADR-0004)
  - Metro map from bundle layout hints, (col,lane) math; list-view parity (DW-02)
  - Progress-aware sidebar + breadcrumbs; owner [HARD]s 26–28 preserved (DW-03)
  - Quiet intrinsic stats — no competitive framing (DW-04)
  - First-run without form or lecture (DW-05)
  - Passwordless local profiles + per-profile isolation preserved through the picker/dashboard rework (PI-01; owner [HARD] #10)
depends_on: [ROOT.4.1]
blocks: []
children: []
file_ownership: ["src/app/page.tsx", "src/app/profiles/**", "src/components/nav/**", "src/components/dashboard/**"]
review: {tier: 2, required_lenses: [spec-conformance, owner-hard-constraints], verdicts: []}
verification: []
artifacts: []
resume_hint: "REPLACES dashboard + sidebar — predecessors retire only post-floor. Active-profile visibility ([HARD] #26) and ThemeToggle ([HARD] #27) must survive the replacement."
---
