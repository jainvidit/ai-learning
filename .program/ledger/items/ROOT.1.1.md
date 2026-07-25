---
id: ROOT.1.1
parent: ROOT.1
type: Capability
title: Content pipeline — Velite migration, beat compiler, versioned bundle
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-01
  - .program/spec/content-pipeline.md#req-cp-02
  - .program/spec/content-pipeline.md#req-cp-04
  - .program/spec/content-pipeline.md#req-cp-05
acceptance_criteria:
  - next-mdx-remote absent; Velite (or recorded runner-up if the tiebreak fired) compiles MDX at build time (CP-01 scenarios 1–2)
  - Every lesson compiles to an ordered beat array with stable beatIds across rebuilds (CP-02 scenarios 1–3)
  - Build emits a versioned immutable bundle — DAG + layout hints, beat arrays, exercise bank, goldens (CP-04)
  - Stable item IDs + content-hash itemRevision + migration maps (CP-05)
depends_on: [ROOT.1.2, ROOT.1.7]
blocks: []
children: []
file_ownership: ["velite.config.*", "src/lib/content.ts", "src/components/lesson/LessonRenderer.tsx", "package.json"]
review: {tier: 2, required_lenses: [spec-conformance, framework-empirical], verdicts: []}
verification: []
artifacts: []
resume_hint: "Needs ROOT.1.2's beat-model contract and ROOT.1.7's ASSUMPTIONS-#11 probe result before dispatch. Beat types per ADR-0005."
---
Coordinator-owned; will split into leaves (Velite swap, compiler, bundle emitter,
itemRevision hashing). Framework-touching: verification must include build/typecheck
evidence, never review alone (PART 6).
