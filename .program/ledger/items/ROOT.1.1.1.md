---
id: ROOT.1.1.1
parent: ROOT.1.1
type: Task
title: Velite swap — build-time MDX compilation + interim LessonRenderer
ledger_depth: 3
status: in_progress
generation: 1
owner_agent: implementer-ROOT.1.1.1-gen1
blocked_reason: null
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
  - criterion: "next-mdx-remote absent from package.json dependencies AND devDependencies; velite present (CP-01 scenario 1)"
    status: VERIFIED
    method: "package.json inspected after edit: next-mdx-remote removed from dependencies, absent from devDependencies; velite ^0.4.0 added to devDependencies. npm install run; `ls node_modules/next-mdx-remote` -> No such file or directory; `node -p require('./node_modules/velite/package.json').version` -> 0.4.0. grep for next-mdx-remote across src/ + package.json + velite.config.ts returns 3 COMMENT-ONLY matches, no import and no dependency entry. Velite version chosen empirically from `npm view velite dist-tags` = {next: 1.0.0-alpha.3, latest: 0.4.0}; latest taken, not the alpha."
    evidence_path: ".program/audits/ROOT.1.1.1-verification/install.md"
    notes: "Velite resolved to 0.4.0, NOT the ^0.2.0 recorded in the gen0 inventory. npm install surfaces 13 high-severity advisories from Velite's own subtree (sharp/terser/esbuild/@mdx-js/mdx); `npm audit fix` NOT run (dependency-tree mutation beyond file_ownership; Velite supply-chain risk already accepted eyes-open per REQ-CP-01 + ADR-0009). Flagged for coordinator."
  - criterion: "Lesson MDX (frontmatter + <Exercise/> anchors) compiles at build time via velite.config.ts; no runtime MDX compilation in the request path (CP-01 scenario 2)"
    status: VERIFIED
    method: "`npm run content:build` (velite build --clean) emits .velite/lessons.json (41696 bytes, 5 lessons). Emitted `code` proven to be already-compiled minified JS, not MDX: head is `const{Fragment:e,jsx:n,jsxs:t}=arguments[0];function _createMdxContent(o){...}` — function-body outputFormat, JSX runtime from arguments[0]. Frontmatter typed through (id/title/minutes/objectives); `<Exercise>` anchors survive as UNRESOLVED component refs (`{...o.components}`), which is what preserves the components map. Request path contains no MDX compiler: no @mdx-js/* import anywhere under src/; the only lesson-content operation is renderCompiledMdx() = new Function(code)({Fragment,jsx,jsxs}).default({components}), i.e. EVALUATION of a build-time artifact. Build-order proof: `[VELITE] build finished` prints ABOVE `Next.js 16.2.11 (Turbopack)` in npm run build output."
    evidence_path: ".program/audits/ROOT.1.1.1-verification/build-time-compilation-proof.md"
    notes: "Turbopack (default for dev AND build in Next 16) has no Velite integration and Velite's only bundler integration is a webpack-era plugin, which would additionally force `next build --webpack` — so script chaining is the ONLY viable wiring, as the item body directed. Landed: content:build + content:watch are NEW; build/dev/dev:e2e gained a velite prefix; start, lint, test, test:watch, verify:e2e, verify:e2e:manual, verify:e2e:ui, e2e:server, validate, seed-sandboxes bodies are byte-identical (ROOT.7.2's entries + the steward-facing validate untouched). dev/dev:e2e use one-shot `velite build`, not `velite dev`, so a dev server can never boot against stale output; watch is opt-in via content:watch. npm run dev NEVER executed (CONSTRAINTS #17)."
  - criterion: "Interim LessonRenderer renders compiled lesson output with the existing mdxComponents map and sanitizeQuiz logic preserved intact (coupling #27)"
    status: VERIFIED
    method: "Probe drove the REAL LessonRenderer with the REAL client components through renderToStaticMarkup against real Velite output: 18988 bytes of HTML, all 5 components-map className fingerprints present, quiz UI (form/button) mounted, all 4 question prompts and 16/16 options rendered. sanitizeQuiz asserted empirically: 0 leaked field names from [correctOptionIds, explanation, passingScore] and 0 leaked explanation TEXT across a 4-question quiz. Legacy call style (mdx only, no code) produced output IDENTICAL to the explicit-code call. Missing-lesson path degrades to the warning Callout instead of crashing. mdxComponents and sanitizeQuiz bodies are byte-identical to their pre-Velite versions — only the MDX evaluation mechanism changed."
    evidence_path: ".program/audits/ROOT.1.1.1-verification/dom-equivalence-and-carryover.md"
    notes: "CARRY-OVER TO ROOT.4.2's BeatRenderer, recorded exactly as the item body requires. mdxComponents = 16 entries: 12 HTML element overrides (h2 h3 p ul ol li code pre blockquote a strong table) + 3 imported components (Callout, TokenVisualizer, NextWordGame) + 1 render-time closure (Exercise). `table` is the one STRUCTURAL special case — it emits a wrapper <div class='my-4 overflow-x-auto'> around the <table>; any BeatRenderer DOM assertion must keep that div. Exercise closes over exercises/moduleId/lessonId, switches on the closed set quiz|playground|terminal|challenge, and only the quiz branch applies sanitizeQuiz. sanitizeQuiz is a WHITELIST projection (so future schema fields are excluded by default): KEEPS type/id/title/passingScore, per-question id/kind/prompt, per-option id/text ONLY. STRIPS per question `correctOptionIds` (the answer key) and `explanation`; strips every other per-option field — which as of ROOT.1.2.1 includes `misconception`, the per-distractor misconception tag, itself answer-revealing. ROOT.4.2 must preserve that exclusion. Client-side grading is impossible by construction; /api/quiz/submit re-reads the full exercise server-side via getExercise()."
  - criterion: "npm run build passes; npx tsc --noEmit passes; npm run lint passes; evidence paths recorded in verification"
    status: VERIFIED_WITH_PRE_EXISTING_LINT_FAILURE
    method: "All six commands run in worktree agent-aa6fa42c34751a5cc as a FINAL pass after every throwaway probe file was deleted, so they reflect exactly the shipped state. npm install exit 0. npm run build exit 0 (velite 881ms then Turbopack compile + TypeScript, 14/14 static pages). npx tsc --noEmit exit 0. npm run validate exit 0 (all content valid, anchor-integrity gate included). npm test exit 0 (1 file / 3 tests — same as pre-migration baseline). npm run lint exit 1, but `npx eslint velite.config.ts src/lib/content.ts src/components/lesson/LessonRenderer.tsx` exits 0 with NO output — every file this item owns is lint-clean."
    evidence_path: ".program/audits/ROOT.1.1.1-verification/build.md, .program/audits/ROOT.1.1.1-verification/typecheck.md, .program/audits/ROOT.1.1.1-verification/lint.md, .program/audits/ROOT.1.1.1-verification/validate-and-tests.md"
    notes: "LINT EXIT 1 IS PRE-EXISTING BASELINE, NOT A REGRESSION — 4 errors + 2 warnings in 5 files, none owned by this item (.program/audits/probe-bedrock-basic.ts, probe-bedrock-structured-outputs.ts, sandbox/templates/demo-fix-greet/greet.js + test.js, src/components/nav/ThemeToggle.tsx). Proof is from INDEPENDENT evidence predating this item's code: .program/audits/ROOT.7.2-gen1-typecheck-lint.txt records the identical `6 problems (4 errors, 2 warnings)` over the identical 5 files/rules from worktree agent-a66e241ac72f6bf50, which had NO velite and still had next-mdx-remote. ROOT.1.1.1's own gen0 evidence reports the same six again — three independent worktrees, three identical sets. Not fixed: all 5 files belong to other owners. SEPARATE FINDING for the coordinator: `npm run lint` in the SHARED checkout is unusable as a baseline because eslint.config.mjs does not ignore .claude/**, so it recursively lints every sibling agent worktree (hundreds of problems, incl. .next build artifacts). A dispatched dream-verifier (agent ad2f031471b19758f) hit exactly this and correctly returned inconclusive. Worth a globalIgnores('.claude/**') entry by whoever owns eslint.config.mjs — NOT this item."
  - criterion: "LessonRenderer DOM structure / selectors unchanged (regression floor RF-02/RF-11 anchor on this file)"
    status: VERIFIED
    method: "Throwaway probe rendered all 5 existing lessons through BOTH pipelines and diffed. PATH A = read build-time compiled code from .velite/lessons.json and evaluate it exactly as shipped renderCompiledMdx() does. PATH B = compile the same MDX body at request time with @mdx-js/mdx compile(content, {outputFormat:'function-body', development:false}), reproducing what next-mdx-remote/rsc did (it is a thin wrapper over the same compiler and format). Components map transcribed verbatim; the 4 injected components replaced by identical stand-ins in BOTH runs so any diff would be attributable to the pipeline change alone. Compared two ways: full renderToStaticMarkup string equality AND a tag.class selector inventory. RESULT: html_identical=true AND selector_inventory_identical=true for all 5 lessons, with identical byte lengths (8861/7343/8773/10154/8181). ALL_LESSONS_DOM_IDENTICAL=true. All 7 <Exercise/> anchors resolve."
    evidence_path: ".program/audits/ROOT.1.1.1-verification/dom-equivalence-and-carryover.md"
    notes: "Identical BY CONSTRUCTION, not by luck: Velite's s.mdx() uses the same @mdx-js/mdx compiler and same function-body output format next-mdx-remote/rsc used; only the MOMENT of compilation moved (request time -> build time), and element mapping still happens at render time from the unchanged components map. What DID change is the renderer's PROP SHAPE, additively: `code?: string` added; `mdx?: string` widened from required to optional and now @deprecated + ignored. So ROOT.7.1 should be notified of a PROP-SHAPE change, not a DOM change — no DOM-level or selector-level regression-floor expectation needs updating."
  - criterion: "Gen1 defect fix: build-time artifact absence must not break the six API routes (no contract-shape change)"
    status: VERIFIED
    method: "Hid .velite/ and ran the exercise-only callers: getCompiledLesson -> undefined, getExercise -> OK id=quiz-tokens, allExercisesPassed -> OK false. Confirmed the gen0 design was genuinely defective by running the same probe in the surviving gen0 worktree agent-ad9cdcfddc53d1dfc: it THREW `Error: Compiled lesson content is missing ...` from loadCompiledLessons at content.ts:61 via getCompiledLesson at :85."
    evidence_path: ".program/audits/ROOT.1.1.1-verification/build-time-compilation-proof.md"
    notes: "See 'Gen1 defect found in gen0 design' in this item body. Both worktrees were restored to their prior state after the probe."
artifacts:
  - package.json                                  # MODIFIED: next-mdx-remote removed, velite ^0.4.0 added, content:build + content:watch added, build/dev/dev:e2e prefixed
  - package-lock.json                             # MODIFIED: regenerated by npm install (velite subtree in, next-mdx-remote out)
  - velite.config.ts                              # NEW: build-time MDX collection (lessons)
  - src/lib/content.ts                            # MODIFIED: compiled-bundle readers + loadLesson now returns `code`
  - src/components/lesson/LessonRenderer.tsx      # MODIFIED: interim renderer, evaluates build-time output; mdxComponents + sanitizeQuiz byte-identical
  - .gitignore                                    # MODIFIED (additive, OUT OF OWNERSHIP - deviation D1): appended /.velite/
  - .program/audits/ROOT.1.1.1-verification/install.md
  - .program/audits/ROOT.1.1.1-verification/build.md
  - .program/audits/ROOT.1.1.1-verification/typecheck.md
  - .program/audits/ROOT.1.1.1-verification/lint.md
  - .program/audits/ROOT.1.1.1-verification/validate-and-tests.md
  - .program/audits/ROOT.1.1.1-verification/build-time-compilation-proof.md
  - .program/audits/ROOT.1.1.1-verification/dom-equivalence-and-carryover.md
resume_hint: "COMPLETE in worktree .claude/worktrees/agent-aa6fa42c34751a5cc (NOT merged; integrator must bring the 6 code paths across). All six verification commands green there; npm run lint exits 1 on 4 PRE-EXISTING errors in files this item does not own (proof in lint.md). Nothing left to implement."
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

## Plan (gen1, tier-2 3-line plan, written before implementation)

1. CONTRACT TOUCHED: the lesson render path — `loadLesson()` in `src/lib/content.ts`
   (consumed by `src/app/learn/[moduleId]/[lessonId]/page.tsx` and, via `getExercise`, by
   six `src/app/api/**` routes) plus `LessonRenderer`'s props, plus the Phase-0
   `package.json` script chain. New build-time artifact `.velite/lessons.json` is the
   compiled-MDX carrier.
2. OTHER SIDE OWNED BY: `src/app/learn/**` and LessonRenderer's successor = ROOT.4.2
   (BeatRenderer); `src/lib/schema.ts` = schema steward (ROOT.1.2 then ROOT.7.1) per
   `.program/interfaces/content-schema.md`; regression floor RF-02/RF-11 anchoring on
   LessonRenderer.tsx = ROOT.7.1. `.program/interfaces/` holds NO ratified renderer-prop
   contract file, so no ratified contract shape is broken. page.tsx is not mine: its
   existing call (`mdx`/`moduleId`/`lessonId`/`exercises`) must keep type-checking
   unchanged, so every new prop is additive and optional.
3. WILL NOT CHANGE: `src/lib/schema.ts`; `src/app/learn/**` (incl. the page.tsx call site);
   the six `src/app/api/**` routes; `scripts/validate-content.ts`; `vitest.config.ts`;
   `playwright.config.ts`; `scripts/run-e2e-with-server.sh`; `.program/interfaces/*`; and
   every existing package.json script BODY except `build`/`dev`/`dev:e2e` (which gain a
   `velite` prefix only) — test, test:watch, verify:e2e*, e2e:server, validate, start,
   lint, seed-sandboxes bodies stay byte-identical. `gray-matter` STAYS (both
   validate-content.ts and frontmatter parsing still need it).

## Gen1 note on recoverable gen0 output

Gen0's blocked write-up understated its own progress. Its worktree
`.claude/worktrees/agent-ad9cdcfddc53d1dfc` survives on disk with a COMPLETE
implementation and all six verification commands already green (that evidence was
already copied into `.program/audits/ROOT.1.1.1-verification/`). Gen1 re-derived the
design independently rather than trusting it, and re-ran all six commands itself in the
gen1 worktree `.claude/worktrees/agent-aa6fa42c34751a5cc`. Findings recorded below.
