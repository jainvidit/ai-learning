# Module NN — <Title>  (SPEC TEMPLATE)

> Copy this skeleton for every module spec. A builder agent must be able to construct the
> whole module from THIS file + specs/AUTHORING-GUIDE.md + src/lib/schema.ts. No placeholders
> may survive into a real spec: every quiz option, rubric weight, fixture byte, and verifier
> branch is written out here.

## Meta

| Field    | Value                                      |
|----------|--------------------------------------------|
| id       | `NN-kebab-slug` (must match curriculum.json) |
| track    | `fundamentals` \| `prompting` \| `claude-code` |
| requires | `["..-.."]` (already fixed in curriculum.json — restate for the builder) |
| minutes  | total across lessons (sum of lesson frontmatter minutes) |

`module.json` description: 1–3 sentences, learner-facing, matching the module summary's promise.

## Audience state

What the learner knows walking in (ONLY prior-module knowledge — name the modules and the
concepts they delivered) and what they explicitly do NOT know yet. This governs vocabulary
and how much hand-holding exercises need.

## Learning objectives (4–6, testable)

- Each phrased as an observable ability: "Explain…", "Write a prompt that…", "Use Claude Code to…".
- Every objective must be exercised by at least one exercise below.

## Lessons

One subsection per lesson, in `module.json` order.

### Lesson NN-slug — "Title" (~X min)

**Frontmatter objectives:** 1–4 bullets (subset/refinement of module objectives).

**Narrative outline (5–10 beats):** numbered beats a writer expands into prose. Each beat is
1–2 sentences of WHAT to convey; include the load-bearing analogies verbatim (they are part of
the design, not decoration). Mark where each `<Exercise id="…"/>` anchor goes and where
Callouts belong.

**Exercises:** EVERY exercise as a full JSON-ready definition (real JSON in a fenced block —
the builder should be able to paste it into `exercises.json` nearly unchanged):

- Quizzes: all questions, options with ids, correctOptionIds, teaching explanations, passingScore.
- Playgrounds: instructions, starter/system prompts if any, full rubric with weights summing
  to 100, passingScore.
- Terminal: instructions, sandboxTemplate name, allowedTools, maxTurns, suggestedPrompts.
- Challenges: everything above plus verifierId, criteria list (mirroring verifier output), hints.

## Sandbox templates

One subsection per template (skip section if module has none).

### `templateName/`

File-by-file, full contents in fenced code blocks. ≤ 10 small files, no node_modules.
State the intended bug/gap explicitly if the exercise is fix-it style.

```
templateName/
  file-a.js
  file-b.md
```

**`file-a.js`**
```js
// exact contents
```

## Verifiers to implement

One entry per challenge verifier (skip if none):

- **`verifier-id`** (in `src/lib/verifiers/mNN-<slug>.ts`): plain-English logic, criterion by
  criterion, naming the helper used for each check (`fileExists`, `fileMatches` + the regex,
  `readJson` + fields, `runNode` + expected exit/stdout, `judgeFile` + the exact criterion
  string). State what pristine-template behavior should be (must FAIL) and what a correct
  solution looks like (must PASS).

## Tone & vocabulary

- Voice notes for this module (e.g. "plain-language, zero jargon" vs "may assume terminal comfort").
- **Terms this module may introduce** (with the expectation each is defined on first use).
- Terms assumed from prerequisites.
- Terms BANNED (too advanced — reserved for later modules).

## Done checklist

- [ ] `module.json` + all lessons + exercises.json files created and schema-valid
- [ ] Every exercise has an `<Exercise id/>` anchor in its lesson.mdx
- [ ] Sandbox templates created exactly as specified; `npm run seed-sandboxes` works
- [ ] Verifiers implemented, registered in index.ts; fail on pristine template, pass on solution
- [ ] `npm run validate` passes; `npx tsc --noEmit` clean
- [ ] Every exercise smoke-tested end-to-end
- [ ] curriculum.json status flipped `"spec"` → `"built"` for THIS module only
