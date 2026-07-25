---
id: ROOT.1.1
parent: ROOT.1
type: Capability
title: Content pipeline — Velite migration, beat compiler, versioned bundle
ledger_depth: 2
status: in_progress
owner_agent: coordinator-ROOT.1.1-gen0
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
children: [ROOT.1.1.1, ROOT.1.1.2, ROOT.1.1.3, ROOT.1.1.4]
heartbeat: 2026-07-25T13:56:26Z
file_ownership: ["velite.config.*", "src/lib/content.ts", "src/components/lesson/LessonRenderer.tsx", "package.json"]
review: {tier: 2, required_lenses: [spec-conformance, framework-empirical], verdicts: []}
verification: []
artifacts: []
resume_hint: "Gen0 coordinator active. Deps done. Children ROOT.1.1.1-4 created; dispatch order 1 -> 2 -> {3,4}. See Decomposition record in body."
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

## Decomposition record (gen0, 2026-07-25)

Four leaves, all passing the six-point test; STRICTLY SEQUENCED 1 → 2 → 3 → 4 (each
consumes the prior's exports; content.ts shared by 1&2, package.json by 1&4 — sequencing
removes all file overlap, so no isolated-implementer needed):

- ROOT.1.1.1 Velite swap + interim renderer (CP-01; tier 2). Owns package.json,
  velite.config.*, content.ts, LessonRenderer.tsx.
- ROOT.1.1.2 Beat compiler (CP-02; tier 2). Owns content.ts, new src/lib/beats.ts, tests.
- ROOT.1.1.3 itemRevision hashing + migration maps (CP-05; tier 1 — pure library, no
  framework surface, no foreign interface). Owns new src/lib/revisions.ts, tests,
  content/migrations/**.
- ROOT.1.1.4 Versioned bundle emitter + static route (CP-04+CP-05 assembly; tier 2).
  Owns scripts/build-content-bundle.ts, src/lib/bundle.ts, tests, package.json,
  public/content-bundle/**.

Decisions delegated to no leaf: beatId derivation, segmentation, sidecar revisions,
hash-based bundle version — fixed in ADR-0011. Rejected decompositions: single mega-leaf
(fails ~5-file bound + multiple shard sections); splitting the interim renderer from the
Velite swap (phantom ownership — build cannot pass between them, renderer breaks the
moment next-mdx-remote is removed); parallel 3&4 (package.json + consumption coupling).

Code-state survey evidence (dream-reader-corpus, 2026-07-25): next-mdx-remote ^6.0.0
used ONLY in LessonRenderer.tsx (MDXRemote RSC, line ~162); mdxComponents map lines
31–103; sanitizeQuiz lines 16–29; content.ts 138 lines, no runtime MDX; no velite
remnants; curriculum.json = 14-module DAG with requires/track; Next 16.2.11 Turbopack
default (webpack plugins unusable — Velite wired via script chaining).

OQ #10 tiebreak watch: held here. ROOT.1.1.1 must report two-process DX pain; if
unworkable, coordinator writes the tiebreak record and re-dispatches on Content
Collections (runner-up). ADR-0009 weighed: risk lowered.

RF-02/RF-11 watch: any LessonRenderer.tsx DOM/selector change reported by ROOT.1.1.1 →
field_request-style note appended to ROOT.7.1's events; never edit regression-floor.md.

## Verification log

- CP-01 scenario 3 (ASSUMPTIONS #11 re-verify): DISCHARGED upstream by ROOT.1.7 /
  ADR-0009 (evidence .program/audits/probes-mdx-archival.md). Divergent finding
  (not archived) ruled Reading 2: migration proceeds. Nothing for this item to re-run.
