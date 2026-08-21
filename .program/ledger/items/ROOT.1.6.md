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
  - FP-01 scenarios hold — prose beats ship no hydration JS; exercise beats hydrate inside Suspense boundaries; no runtime-MDX in the request path (checked against build output)
  - TanStack Query provider + per-session Zustand factory pattern wired with one reference consumer; no Jotai/XState-everywhere (FP-02, REJECTED); migration of existing components stays with their owners
  - Tailwind v4 + shadcn/ui on Base UI with token layer; Arial→Geist fix (FP-03)
depends_on: [ROOT.1.2, ROOT.1.1]
blocks: []
children: []
file_ownership: ["src/components/ui/**", "src/app/layout.tsx", "src/app/globals.css", "tailwind.config.*"]
review: {tier: 1, required_lenses: [spec-conformance, framework-empirical], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned (ADR-0007; sizing #4 — this is a full design-system migration, not near-leaf). Leaves: Tailwind v4 + tokens + Geist; shadcn-on-Base-UI for existing primitives; Query/Zustand pattern + one reference consumer; RSC posture audit probe. Motion tokens + celebration API (FP-04) and the a11y bar (FP-05) land in Phase 3."
---
Cross-cutting seam files (ui/index, layout) had the only collisions last build
(LANE-DEPENDENCIES) — single owner at a time. Cross-phase overlaps recorded in org.md:
src/components/ui/** transfers 1.6 → 4.1; src/app/layout.tsx transfers 1.6 → 4.6.
Second writer in the Phase-0 package.json chain (after 1.1, before 1.3).
