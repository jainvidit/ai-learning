# ROOT.1.1.1 -- proof MDX compiles at BUILD time and not in the request path (gen1)

Run 2026-07-25 by `implementer-ROOT.1.1.1-gen1` in git worktree
`C:\Users\jainv\workplace\ai-learning-app\.claude\worktrees\agent-aa6fa42c34751a5cc`.

Covers REQ-CP-01 scenario 2: "Given a lesson MDX file with valid frontmatter and exercise
anchors, when the content build runs, then it emits compiled output without any runtime
MDX compilation step in the request path."

## Compiled output exists and is emitted by the build step

```
$ npm run content:build
> velite build --clean
[VELITE] building...
[VELITE] build finished in 1534.44ms

$ ls -la .velite
index.d.ts       230 bytes
index.js         110 bytes
lessons.json   41696 bytes
```

## The emitted artifact carries compiled JS, frontmatter, and the exercise anchors

```
$ node -e "const l=require('./.velite/lessons.json'); ..."
lessons: 5
keys: 01-how-llms-work/01-what-is-an-llm, 01-how-llms-work/02-tokens,
      01-how-llms-work/03-training, 01-how-llms-work/04-hallucination,
      01-how-llms-work/05-randomness
fields: id,title,minutes,objectives,filePath,code,moduleId,lessonId,key
code is string: string   len 6214
code contains 'arguments[0]' (function-body format): true
Exercise anchor preserved: true

code head:
const{Fragment:e,jsx:n,jsxs:t}=arguments[0];function _createMdxContent(o){
const r={em:"em",h2:"h2",li:"li",p:"p",strong:"strong",ul:"ul",...o.components},{Callo…
```

Three facts follow from that `code` head:

1. It is already **JavaScript**, not MDX or Markdown. The parse/transform happened at
   build time. (It is also terser-minified, which is Velite's default for `s.mdx()`.)
2. It destructures its JSX runtime from `arguments[0]`, i.e. Velite's default
   `outputFormat: 'function-body'`.
3. `{...o.components}` and the truncated `{Callo…` (= `Callout`) show component
   references are left **unresolved** and are supplied at render time from the
   `components` map. That is precisely what lets the existing components map keep
   producing identical DOM.

Frontmatter is present and typed (`id`, `title`, `minutes`, `objectives`), so REQ-CP-01
scenario 2's "valid frontmatter" half is satisfied, and the `<Exercise/>` anchors survive
compilation as unresolved component calls.

## No MDX compiler in the request path

```
$ grep -rn "next-mdx-remote" src package.json velite.config.ts
src/components/lesson/LessonRenderer.tsx:25:  (comment only)
src/lib/content.ts:25:                          (comment only)
velite.config.ts:7:                             (comment only)
```

Three matches, all inside explanatory comments. No import, no dependency entry.
`node_modules/next-mdx-remote` does not exist after `npm install`.

The only request-path operation on lesson content is now
`renderCompiledMdx(code, components)` in `LessonRenderer.tsx`, which is
`new Function(code)({Fragment, jsx, jsxs}).default({components})` -- EVALUATION of a
build-time artifact. No `@mdx-js/*` module is imported by any file under `src/`; Velite
pulls `@mdx-js/mdx` as its own dependency and uses it only in the CLI build process.

## Turbopack forced the script-chaining wiring

Next.js 16 makes Turbopack the default bundler for BOTH `next dev` and `next build`
(docs/nextjs-conventions.md, "Build System: Turbopack Now Default"). Velite exposes no
Turbopack integration; its only bundler integration is a webpack-era plugin, and adopting
it would additionally force builds onto `next build --webpack` (the same doc: a custom
webpack config makes Next 16 builds fail unless `--webpack` is passed). Script chaining is
therefore the only viable wiring, exactly as the item body directed.

Scripts as landed -- `content:build` and `content:watch` are NEW; `build`, `dev` and
`dev:e2e` gained a `velite` prefix; **no other script body changed**:

```json
"content:build": "velite build --clean",
"content:watch": "velite dev",
"dev":           "velite build && next dev -H 127.0.0.1",
"dev:e2e":       "velite build && next dev -H 127.0.0.1 -p 3001",
"build":         "velite build --clean && next build",
```

Unchanged, byte-for-byte: `start`, `lint`, `test`, `test:watch`, `verify:e2e`,
`verify:e2e:manual`, `verify:e2e:ui`, `e2e:server`, `validate`, `seed-sandboxes`. This
matters because `test`/`test:watch`/`verify:e2e*`/`e2e:server` are ROOT.7.2's and
`validate` drives the steward-owned schema.

`dev` and `dev:e2e` take a one-shot `velite build` (not `velite dev`) so a dev server can
never boot against missing or stale compiled output; the watch loop is opt-in via
`content:watch` as a second process. `npm run dev` was NOT executed (CONSTRAINTS #17 --
port 3000 is the owner's).

## Graceful degradation when the build step has not run

`getCompiledLesson()` returns `undefined` rather than throwing when `.velite/` is absent.
Proven by hiding the directory and calling the exercise-only paths:

```
$ mv .velite .velite-hidden && npx tsx probe-degrade.ts
PROBE getCompiledLesson with .velite absent: undefined
PROBE getExercise with .velite absent: OK, id = quiz-tokens
PROBE allExercisesPassed with .velite absent: OK, value = false
```

This is the gen0 defect gen1 fixed -- see the item file, "Gen1 defect found in gen0
design". The renderer surfaces the missing artifact as a remediation `Callout` ("Run
`npm run content:build` and reload") instead of a 500.
