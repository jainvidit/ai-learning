---
id: ROOT.1.1.1
parent: ROOT.1.1
type: Task
title: Velite swap — build-time MDX compilation + interim LessonRenderer
ledger_depth: 3
status: proposed
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-01
acceptance_criteria:
  - next-mdx-remote absent from package.json dependencies AND devDependencies; velite present (CP-01 scenario 1)
  - Lesson MDX (frontmatter + <Exercise/> anchors) compiles at build time via velite.config.ts; no runtime MDX compilation in the request path (CP-01 scenario 2)
  - Interim LessonRenderer renders compiled lesson output with the existing mdxComponents map and sanitizeQuiz logic preserved intact (coupling #27)
  - npm run build passes; npx tsc --noEmit passes; npm run lint passes; evidence paths recorded in verification
depends_on: []
blocks: [ROOT.1.1.2]
children: []
file_ownership: ["package.json", "velite.config.*", "src/lib/content.ts", "src/components/lesson/LessonRenderer.tsx"]
review: {tier: 2, required_lenses: [spec-conformance, framework-empirical], verdicts: []}
verification: []
artifacts: []
resume_hint: "Not yet dispatched."
---
Replace runtime MDX (next-mdx-remote/rsc in LessonRenderer.tsx line ~2/162) with
build-time Velite compilation. READ docs/nextjs-conventions.md FIRST — this Next.js 16
has breaking changes; Turbopack is default, so Velite's webpack plugin is UNUSABLE:
wire Velite via package.json script chaining instead (e.g. `velite && next build`
prebuild-style; dev via a watch script). Report two-process DX pain honestly — the
coordinator holds the OQ #10 tiebreak on it.

Constraints:
- src/lib/schema.ts is steward-owned — NEVER edit it. Velite's own collection schema in
  velite.config.ts is separate; authored-content validation stays with npm run validate.
- package.json edits must be ADDITIVE/NON-BREAKING to existing test/vitest/playwright
  entries (ROOT.7.2's). Remove ONLY next-mdx-remote. Keep gray-matter if content.ts
  still needs it, remove if fully superseded.
- Interim renderer (coupling #27): the mdxComponents map (h2/h3/p/ul/ol/li/code/pre/
  blockquote/a/strong/table/Callout/TokenVisualizer/NextWordGame/Exercise) and
  sanitizeQuiz (strips correct/explanation before client) MUST survive functionally —
  they carry over to ROOT.4.2's BeatRenderer in Phase 3. Record in this item's
  verification exactly what carries over.
- Velite emits `.velite/` output; add it to .gitignore (additive append only) and note
  the out-of-ownership touch as a deviation.
- NEVER run `npm run dev` or anything on port 3000 (CONSTRAINTS #17 — owner's server).
  Verify with build/typecheck/lint only.
- After changing LessonRenderer.tsx, report in your return whether DOM structure /
  selectors changed (regression-floor RF-02/RF-11 anchor to this file; coordinator
  notifies the steward).
- Beat compilation is NOT this leaf (ROOT.1.1.2). This leaf only moves MDX compilation
  to build time and keeps lessons rendering.
- Velite dependency risk is accepted eyes-open per REQ-CP-01 (solo-maintainer,
  internal Zod 3); ADR-0009 rules the migration proceeds despite next-mdx-remote being
  unarchived. Do not relitigate.
