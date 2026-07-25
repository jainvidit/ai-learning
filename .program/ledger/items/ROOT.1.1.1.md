---
id: ROOT.1.1.1
parent: ROOT.1.1
type: Task
title: Velite swap — build-time MDX compilation + interim LessonRenderer
ledger_depth: 3
status: blocked
generation: 0
owner_agent: implementer-ROOT.1.1.1-gen0
blocked_reason: "verification commands denied by permission system: npm install, npm run build, npx tsc --noEmit, npm run lint, npm run validate, npm test"
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
verification: 
  - criterion: "All verification commands (npm install, npm run build, npx tsc --noEmit, npm run lint, npm run validate, npm test)"
    status: UNVERIFIED
    method: "Attempted as individual bare Bash commands per coordinator instruction"
    evidence_path: null
    notes: "Permission system denied all verification commands individually: npm install, npm run build, npx tsc --noEmit, npm run lint, npm run validate, npm test. No alternative verification path available."
artifacts:
  - velite.config.ts
  - package.json
  - .gitignore
resume_hint: "BUILD-BROKEN mid-migration: package.json swapped to velite but LessonRenderer.tsx still imports next-mdx-remote and npm install never ran. Blocked on environment-wide npm/Bash permission denial. See 'Partial state at block' section."
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

## Partial state at block (gen0)

Read-only survey (evidence: velite.config.ts, package.json, LessonRenderer.tsx, .gitignore inspected 2026-07-25T14:15Z) shows this exact partial state:

- velite.config.ts EXISTS (collections for modules/**/lessons/**/lesson.mdx).
- package.json: next-mdx-remote REMOVED, velite ^0.2.0 ADDED; scripts now "build": "velite && next build", "dev": "velite --watch & next dev -H 127.0.0.1". Existing test/vitest/playwright/validate entries intact.
- .gitignore: /.velite/ added (line ~79) — out-of-ownership additive touch, record as deviation.
- src/components/lesson/LessonRenderer.tsx: STILL imports next-mdx-remote/rsc (line 2) — NOT migrated.
- src/lib/content.ts: UNTOUCHED, no velite references.
- node_modules: contains NEITHER velite NOR next-mdx-remote; npm install never ran. Consequence: npm run build would FAIL right now — the repo is mid-migration and build-broken.

Remaining work:
1. npm install (to install velite and remove next-mdx-remote from node_modules)
2. Migrate LessonRenderer.tsx off next-mdx-remote preserving mdxComponents map + sanitizeQuiz
3. Wire content.ts loadLesson to .velite output
4. Run six verification commands with evidence under .program/evidence/ROOT.1.1.1/:
   - npm install
   - npm run build
   - npx tsc --noEmit
   - npm run lint
   - npm run validate
   - npm test

## Plan (gen0, written before implementation)

1. CONTRACT TOUCHED: the lesson render path — `loadLesson()` in `src/lib/content.ts`
   (consumed by `src/app/learn/[moduleId]/[lessonId]/page.tsx`) and the props of
   `LessonRenderer.tsx`, plus the `package.json` Phase-0 script chain. New build-time
   artifact `.velite/lessons.json` becomes the compiled-MDX carrier.
2. OTHER SIDE OWNED BY: `src/app/learn/**` + LessonRenderer's eventual replacement belong
   to ROOT.4.2 (BeatRenderer); `src/lib/schema.ts` to the schema steward (ROOT.1.2, then
   ROOT.7.1) per `.program/interfaces/content-schema.md`; regression-floor RF-02/RF-11
   anchors to LessonRenderer.tsx and are maintained by ROOT.7.1. `.program/interfaces/`
   holds no interface file for the renderer prop shape, so no ratified contract is broken —
   but page.tsx is NOT mine, so LessonRenderer's existing call signature must keep
   compiling unchanged (`mdx`, `moduleId`, `lessonId`, `exercises`).
3. WILL NOT CHANGE: `src/lib/schema.ts`; `src/app/learn/**` (incl. page.tsx call site);
   `scripts/validate-content.ts`; `.program/interfaces/regression-floor.md`; any existing
   package.json script (test/vitest/playwright/validate/dev/build/start/lint bodies);
   `gray-matter` stays (validate-content.ts + frontmatter parsing still need it).
   No contract SHAPE change: LessonRenderer's existing props stay accepted; new inputs are
   additive/optional only.
