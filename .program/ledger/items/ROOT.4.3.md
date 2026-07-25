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
acceptance_criteria:
  - Hero renders resume chip + due count + next-lesson CTA above the fold from one reactive query (DW-01 structural form per sizing #31; streak per ADR-0004; a named shelf-teaser slot reserved for ROOT.5.2)
  - Metro map from bundle layout hints, (col,lane) math; list-view parity (DW-02)
  - Progress-aware sidebar + breadcrumbs; owner [HARD]s 26–28 preserved (DW-03)
  - Quiet intrinsic stats — no competitive framing (DW-04)
  - First-run without form or lecture (DW-05)
  - Dashboard + sidebar predecessors retired only after replacements pass the regression floor, with gate-evidence citation (final leaf)
depends_on: [ROOT.4.1, ROOT.4.7]
blocks: []
children: []
file_ownership: ["src/app/page.tsx", "src/components/nav/**", "src/components/dashboard/**"]
review: {tier: 2, required_lenses: [spec-conformance, owner-hard-constraints], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned; one leaf per DW REQ, DW-02 sub-split (col,lane layout math vs list-view parity, sizing #20). Reads go through ROOT.4.7's reactive store (edge added, coupling #9). Profiles work moved to ROOT.4.10. Active-profile visibility ([HARD] #26) and ThemeToggle ([HARD] #27) must survive."
---
Module-page rework moved to ROOT.4.2 (owns src/app/learn/**). DW-03 scenario 4's
lesson breadcrumb: this item builds the breadcrumb COMPONENT in nav/**; ROOT.4.2
mounts it — one component, two items, contract in the beat-model interface doc
(coupling #22).
