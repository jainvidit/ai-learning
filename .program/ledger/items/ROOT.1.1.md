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
  - next-mdx-remote absent from package.json; MDX compiles at build time via the framework named in the tiebreak record (Velite default; OQ #10); npm run build passes (CP-01 scenarios 1–2)
  - Every lesson compiles to an ordered beat array with stable beatIds across rebuilds (CP-02 scenarios 1–3)
  - Build emits a versioned bundle — DAG + layout hints, beat arrays, exercise bank, goldens — immutable per version, served from a versioned static route (CP-04 restated for local desktop per ADR-0007)
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

HANDOFF NOTE (coupling #27): this item ships an INTERIM renderer that keeps lesson
rendering + quiz sanitization working at the Phase 0 Gate after next-mdx-remote is
removed; the components map + sanitization logic carry over and ROOT.4.2's BeatRenderer
replaces it in Phase 3 — record what carries over in this item's verification.
package.json writes are serialized: this item writes FIRST in the Phase 0 chain
(1.1 → 1.6 → 1.3 → 1.5), then ROOT.1.10, then ownership transfers to ROOT.7.1.
