---
id: ROOT.1.6
parent: ROOT.1
type: Capability
title: Frontend platform substrate — tokens, state posture, motion foundation
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/frontend-platform.md#req-fp-01
  - .program/spec/frontend-platform.md#req-fp-02
  - .program/spec/frontend-platform.md#req-fp-03
acceptance_criteria:
  - RSC + islands posture verified against docs/nextjs-conventions.md; no runtime-MDX in request path (FP-01)
  - TanStack Query + per-session Zustand factories wired; no Jotai/XState-everywhere (FP-02, REJECTED)
  - Tailwind v4 + shadcn/ui on Base UI with token layer; Arial→Geist fix (FP-03)
depends_on: [ROOT.1.2]
blocks: []
children: []
file_ownership: ["src/components/ui/**", "src/app/layout.tsx", "src/app/globals.css", "tailwind.config.*"]
review: {tier: 1, required_lenses: [spec-conformance, framework-empirical], verdicts: []}
verification: []
artifacts: []
resume_hint: "Motion tokens + celebration API (FP-04) and the full a11y bar (FP-05) land in Phase 3 with their consumers; this item is the substrate only."
---
Cross-cutting seam files (ui/index, layout) had the only collisions last build
(LANE-DEPENDENCIES) — single owner at a time.
