# AUTHORING GUIDE — the contract for module-builder agents

You are building exactly ONE curriculum module for this app. Everything you need is:

1. **This file** — the rules.
2. **`src/lib/schema.ts`** — the exact Zod content contract. Read it before writing any JSON.
3. **`specs/module-NN.md`** — the complete blueprint for YOUR module (narrative beats, every
   exercise as JSON-ready definitions, fixture file contents, verifier logic).

Do not read other modules for guidance; specs are self-contained by design.

## Hard rules — read twice

- **NEVER modify `src/lib/schema.ts`.** It is the contract for every module.
- **NEVER modify other modules' content**, their specs, or their verifier files.
- **NEVER modify shared components** (`src/components/ui/`, `Quiz.tsx`, `Playground.tsx`,
  `Terminal.tsx`, `Challenge.tsx`, `LessonRenderer.tsx` logic). Two narrow exceptions:
  - You MAY **add** a brand-new widget file in `src/components/lesson/` if your spec calls for one.
  - To expose it to MDX you MAY make an **additive-only** change to `LessonRenderer.tsx`:
    one import line + one entry in `mdxComponents`. Nothing else in that file.
- **Only touch `content/curriculum.json` to flip YOUR module's `status` from `"spec"` to `"built"`.**

## File layout

```
content/
  curriculum.json                         # flip your status entry when done
  modules/<moduleId>/
    module.json                           # ModuleMetaSchema: id, title, track, description, lessons[]
    lessons/<lessonId>/
      lesson.mdx                          # frontmatter + prose + <Exercise id/> anchors
      exercises.json                      # ARRAY of exercises (ExercisesFileSchema)
sandbox/
  templates/<templateName>/               # fixture files for terminal/challenge exercises
src/lib/verifiers/
  common.ts                               # helpers (do not modify)
  index.ts                                # registry — add your import + spread here
  mNN-<slug>.ts                           # YOUR verifier file (challenges only)
```

- `moduleId` matches `/^\d{2}-[a-z0-9-]+$/` and must equal the folder name and the id in
  `curriculum.json` (e.g. `05-meet-claude-code`).
- `lessonId` convention: `NN-kebab-slug` (e.g. `01-what-is-claude-code`), listed in order in
  `module.json`'s `lessons` array. See `content/modules/01-how-llms-work/module.json` for shape.

## lesson.mdx conventions

Frontmatter (YAML, validated by `LessonFrontmatterSchema`):

```yaml
---
id: 01-be-specific            # must equal the lesson folder name
title: "Be Specific"
minutes: 12                   # positive integer, honest estimate
objectives:                   # 1–6 strings, each testable ("You can ...")
  - Explain why vague prompts get vague answers
---
```

Body rules:

- Use `##` and `###` headings (the page renders the title as h1 already). Plain Markdown
  paragraphs, lists, tables, and fenced code blocks all render with app styling.
- `<Callout kind="info">…</Callout>` — kinds: `info` (neutral note), `tip` (do this),
  `warning` (common mistake / gotcha). Use 1–3 per lesson; don't wrap whole sections in them.
- **Every exercise in `exercises.json` MUST have a matching anchor** in the prose:
  `<Exercise id="the-exercise-id" />` — self-closing, id exactly matching. `npm run validate`
  enforces this. Place the anchor where the exercise should appear in the reading flow, with a
  sentence of lead-in above it.
- Write for the audience stated in your spec. Early modules assume ZERO technical background;
  never use a term your spec's "Tone & vocabulary" section doesn't allow. Analogies before
  definitions. Short paragraphs. Second person ("you").

## exercises.json

A JSON **array** of exercise objects. Exercise `id`s are kebab-case and unique within the lesson.

### Quiz rules

```json
{
  "type": "quiz", "id": "quiz-context-window", "title": "Check: context windows",
  "passingScore": 70,
  "questions": [{
    "id": "q1", "kind": "single",
    "prompt": "…",
    "options": [{ "id": "a", "text": "…" }, { "id": "b", "text": "…" }],
    "correctOptionIds": ["b"],
    "explanation": "…"
  }]
}
```

- `kind: "single"` → exactly ONE entry in `correctOptionIds`. `kind: "multi"` → two or more,
  and the prompt must say "Select all that apply."
- Option ids: `"a"`, `"b"`, `"c"`, `"d"` in display order. 3–4 options for single, 4–5 for multi.
- **Explanations must teach, not just confirm**: state why the correct answer is right AND why
  the tempting wrong option is wrong. One explanation per question (shown after answering).
- Wrong options should be plausible misconceptions, never joke answers.
- `passingScore` 60–80 (70 is the default choice). 3–5 questions per quiz.

### Playground rules (prompt-writing exercises)

The learner writes a prompt; the app sends it to a real model and then **grades the learner's
PROMPT TEXT against your rubric** (the model's reply is shown for feedback but the rubric judges
the prompt). Therefore:

- **Every criterion must be independently gradeable from the prompt text alone.**
  Good: "The prompt names a specific audience." Bad: "The output is friendly."
- `rubric` weights are positive numbers that **sum to exactly 100** (schema-enforced).
  3–5 criteria; weight the core skill highest.
- `passingScore` 60–80. Set it so a learner can pass while missing the lowest-weight criterion.
- `instructions` must state the scenario AND enumerate what the prompt needs to include —
  learners should never be graded on unstated requirements.
- `starterPrompt` (optional): a deliberately weak prompt to improve. `systemPrompt` (optional):
  invisible framing for the model. `maxTokens` optional, ≤ 4096 (default it unless the spec says).

### Terminal exercise rules (real `claude -p` sessions)

```json
{
  "type": "terminal", "id": "tx-explore", "title": "…", "instructions": "…",
  "sandboxTemplate": "m05-explore", "allowedTools": "Read,Glob,Grep", "maxTurns": 8,
  "suggestedPrompts": ["What files are in this project?"]
}
```

- `sandboxTemplate` names a folder in `sandbox/templates/`. The app copies it fresh per learner;
  Claude Code runs for real inside the copy. **≤ 10 files, each small (aim < 40 lines), and
  NEVER include `node_modules`, lockfiles, or binaries.** Your spec lists every file verbatim —
  create them exactly.
- `allowedTools` is a comma-separated Claude Code tool filter. Keep it minimal for the task:
  read-only exploring → `"Read,Glob,Grep"`; editing → `"Read,Edit"`; running scripts →
  `"Read,Edit,Bash(node *)"`. Never grant more than the exercise needs.
- `maxTurns` ≤ 15 (schema allows 30; don't use it). Small tasks: 5–10.
- `suggestedPrompts` gives 1–3 clickable starters; write them as things a beginner would say.

### Challenge rules (terminal + automated verification)

Same sandbox/tool/turn rules as terminal exercises, plus:

- `verifierId` must exist in the registry (`src/lib/verifiers/index.ts`) — validate checks this.
- `criteria` (strings shown to the learner as a checklist) should mirror, in order, the
  `description`s your verifier returns, so the UI lines up.
- `hints`: 2–3, ordered gentle → explicit; the last hint can nearly give it away.

## Verifier registration (challenges only)

1. Create `src/lib/verifiers/mNN-<slug>.ts` (e.g. `m05-meet-claude-code.ts`):

```ts
import type { Verifier, VerifyResult } from "./index";
import { fileExists, fileMatches, readJson, runNode, judgeFile } from "./common";

export const m05Verifiers: Record<string, Verifier> = {
  "m05-fix-greet": async (sandboxDir) => { /* … return { pass, criteria } */ },
};
```

2. Register in `src/lib/verifiers/index.ts` (additive only):
   `import { m05Verifiers } from "./m05-meet-claude-code";` and spread `...m05Verifiers`
   into the `verifiers` record.
3. **Prefer deterministic checks** (`fileExists`, `fileMatches(dir, rel, /regex/)`, `readJson`,
   `runNode(dir, "test.js")` → `{ stdout, stderr, exitCode }`). Use `judgeFile(dir, rel,
   criterion)` — an LLM judge — ONLY for fuzzy prose criteria (e.g. "the file explains X in
   plain language"). Never judgeFile something a regex can check.
4. Every criterion pushes `{ description, pass, detail? }`; `pass` overall =
   `criteria.every(c => c.pass)`. Copy the structure of the reference verifier
   `"demo-fix-greet"` in `index.ts`.

## Definition of done

Your module is done ONLY when all of these hold:

1. `npm run validate` passes with zero errors (schemas, anchors, templates, verifier ids,
   quiz option integrity).
2. `npx tsc --noEmit` is clean (matters if you added verifiers or a widget).
3. Your entry in `content/curriculum.json` is flipped `"spec"` → `"built"` (only after 1 & 2).
4. **Every exercise smoke-tested**: quizzes render and score; playgrounds return a graded
   result for a passing prompt; terminal/challenge sandboxes seed (`npm run seed-sandboxes`)
   and the challenge verifier passes on a hand-fixed sandbox and fails on the pristine one.
5. Every fixture file matches your spec byte-for-byte in intent (contents as specified).

If anything in your spec conflicts with `schema.ts` or `npm run validate`, the schema wins —
adjust the smallest detail needed and note it in your final report.
