# ROOT.1.1.1 -- DOM equivalence (RF-02 / RF-11) + ROOT.4.2 carry-over inventory (gen1)

Run 2026-07-25 by `implementer-ROOT.1.1.1-gen1` in git worktree
`C:\Users\jainv\workplace\ai-learning-app\.claude\worktrees\agent-aa6fa42c34751a5cc`.

---

## PART 1 -- Did LessonRenderer's DOM structure / selectors change? NO.

**Answer: no. Byte-identical HTML on all five existing lessons.**

Method: a throwaway probe (`dom-probe.mjs`, deleted after capture) rendered each lesson
through BOTH pipelines and diffed the output.

- **PATH A (new)**: read the BUILD-TIME compiled `code` out of `.velite/lessons.json` and
  evaluate it exactly as the shipped `renderCompiledMdx()` does
  (`new Function(code)({Fragment, jsx, jsxs}).default({components})`).
- **PATH B (old)**: compile the same MDX body at "request time" with
  `@mdx-js/mdx`'s `compile(content, { outputFormat: 'function-body', development: false })`
  and evaluate it identically. This reproduces what `next-mdx-remote/rsc` did -- that
  package is a thin wrapper over `@mdx-js/mdx` with the same output format.

The components map was transcribed verbatim from `LessonRenderer.tsx`, and the four
injected components (`Callout`, `TokenVisualizer`, `NextWordGame`, `Exercise`) were
replaced by identical stand-ins in BOTH runs, so any diff would be attributable to the
MDX pipeline change alone. Output compared two ways: full `renderToStaticMarkup` string
equality, and a "selector inventory" (every `tag.class` pair a DOM regression test would
target).

```
01-what-is-an-llm: html_identical=true selector_inventory_identical=true len_new=8861  len_old=8861  exercise_anchors=[quiz-what-is-llm]
02-tokens:         html_identical=true selector_inventory_identical=true len_new=7343  len_old=7343  exercise_anchors=[quiz-tokens]
03-training:       html_identical=true selector_inventory_identical=true len_new=8773  len_old=8773  exercise_anchors=[quiz-training]
04-hallucination:  html_identical=true selector_inventory_identical=true len_new=10154 len_old=10154 exercise_anchors=[playground-observe-hallucination,quiz-hallucination]
05-randomness:     html_identical=true selector_inventory_identical=true len_new=8181  len_old=8181  exercise_anchors=[playground-observe-variance,quiz-randomness]

ALL_LESSONS_DOM_IDENTICAL=true
```

Why it is identical by construction, not by luck: Velite's `s.mdx()` uses the same
`@mdx-js/mdx` compiler and the same `function-body` output format that
`next-mdx-remote/rsc` used. Only the *moment* of compilation moved (request time ->
build time). The element mapping is still performed at render time from the `components`
map, and every `className` in that map is unchanged.

**Consequence for the regression floor**: RF-02 and RF-11 anchor on this file, but no
DOM-level or selector-level expectation needs updating. The renderer's PROP SHAPE
changed additively (`code?` added, `mdx?` widened to optional and now ignored), so only a
test that constructs `LessonRenderer` directly with a required `mdx` prop would notice --
and it would still compile. ROOT.7.1 (regression-floor maintainer) should be notified of
the prop-shape change, not of a DOM change.

A second probe drove the REAL renderer with the REAL client components through
`renderToStaticMarkup` and confirmed end-to-end behaviour:

```
PROBE loadLesson keys: frontmatter,mdx,code,exercises
PROBE code is compiled function-body: true
PROBE raw mdx retained, length: 4649
PROBE frontmatter.title: Tokens: How AI Reads
PROBE html length: 18988
PROBE legacy call style identical: true      <- page.tsx's mdx-only call === explicit-code call
PROBE RF-02 leaked field names: []
PROBE quiz questions: 4
PROBE leaked explanation TEXT count: 0
PROBE fingerprint present: true <- class="mt-10 border-b border-zinc-200 pb-2 text-2x
PROBE fingerprint present: true <- class="my-4 leading-7 text-zinc-700 dark:text-zinc
PROBE fingerprint present: true <- class="my-4 list-disc space-y-2 pl-6 text-zinc-700
PROBE fingerprint present: true <- class="font-semibold text-zinc-900 dark:text-zinc-
PROBE fingerprint present: true <- class="leading-7"
PROBE quiz UI rendered: true
PROBE getCompiledLesson(missing): undefined
PROBE missing-lesson fallback rendered: true
```

---

## PART 2 -- EXACTLY what carries over to ROOT.4.2's BeatRenderer (coupling #27)

Recorded here because the item body requires this inventory to be explicit before
ROOT.4.2 lifts it. Both artifacts are byte-identical to their pre-Velite versions.

### 2a. The `mdxComponents` map -- 16 entries

**12 HTML element overrides** (each a function component applying a fixed `className`,
spreading `props` after it):

| key | rendered element | className (verbatim) |
| --- | --- | --- |
| `h2` | `<h2>` | `mt-10 border-b border-zinc-200 pb-2 text-2xl font-bold dark:border-zinc-800` |
| `h3` | `<h3>` | `mt-8 text-xl font-semibold` |
| `p` | `<p>` | `my-4 leading-7 text-zinc-700 dark:text-zinc-300` |
| `ul` | `<ul>` | `my-4 list-disc space-y-2 pl-6 text-zinc-700 dark:text-zinc-300` |
| `ol` | `<ol>` | `my-4 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300` |
| `li` | `<li>` | `leading-7` |
| `code` | `<code>` | `rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-indigo-700 dark:bg-zinc-800 dark:text-indigo-300` |
| `pre` | `<pre>` | `my-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit` |
| `blockquote` | `<blockquote>` | `my-4 border-l-4 border-indigo-300 pl-4 italic text-zinc-600 dark:border-indigo-700 dark:text-zinc-400` |
| `a` | `<a>` | `font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400` |
| `strong` | `<strong>` | `font-semibold text-zinc-900 dark:text-zinc-100` |
| `table` | `<div>` **wrapping** `<table>` | outer `my-4 overflow-x-auto`; inner `w-full border-collapse text-sm` + the long `[&_td]:…`/`[&_th]:…` arbitrary-variant chain |

`table` is the one structural special case: it emits a WRAPPER `<div>` around the
`<table>`. Any BeatRenderer DOM assertion must preserve that extra div.

**3 statically imported components** passed through by reference:
`Callout` (from `@/components/ui`), `TokenVisualizer`, `NextWordGame` (both from
`@/components/lesson/`).

**1 dynamically closed component**: `Exercise`, declared INSIDE the renderer body because
it closes over `exercises`, `moduleId` and `lessonId`. It is merged in at render time
(`{ ...mdxComponents, Exercise }`), not stored in the module-level map. Its contract:
- looks up `exercises.find(e => e.id === id)`;
- on miss, renders `<Callout kind="warning">Exercise <code>{id}</code> not found in this lesson.</Callout>`;
- on hit, switches on `exercise.type` over the closed set
  `quiz | playground | terminal | challenge` and mounts `Quiz` / `Playground` /
  `Terminal` / `Challenge`, each receiving `moduleId`, `lessonId`, `exercise`;
- the `quiz` branch is the ONLY one that passes its exercise through `sanitizeQuiz`; the
  other three pass `exercise` straight through.

### 2b. `sanitizeQuiz` -- exactly what it strips

Signature `sanitizeQuiz(exercise: QuizExercise): ClientQuizExercise`. It is a
whitelist projection, not a delete-list, so any field added to the schema later is
excluded by default. **KEEPS**: `type: "quiz"` (re-asserted literally), `id`, `title`,
`passingScore`; per question `id`, `kind`, `prompt`; per option `id`, `text` only.

**STRIPS — per question:**
- `correctOptionIds` — which option(s) are right. The actual answer key.
- `explanation` — the post-answer rationale, which leaks the answer.

**STRIPS — per option:** every field except `id`/`text`, which as of the ROOT.1.2.1
schema extensions includes **`misconception`** (the per-distractor misconception tag from
`.program/interfaces/content-schema.md`). Worth flagging to ROOT.4.2: a misconception tag
names the wrong mental model behind a distractor and is therefore answer-revealing;
because `sanitizeQuiz` whitelists, it is already excluded, and BeatRenderer must keep it
that way. Any per-question or per-option extension field (`skillIds`, `tier`, …) is
likewise dropped.

Grading therefore cannot happen client-side by construction: the answer key never crosses
the boundary, and `/api/quiz/submit` re-reads the full exercise server-side via
`getExercise()`. Empirically confirmed above: `leaked field names: []` and
`leaked explanation TEXT count: 0` against real rendered HTML for a 4-question quiz with
16 options.
