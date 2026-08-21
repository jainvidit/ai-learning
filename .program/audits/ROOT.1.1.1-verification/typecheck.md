# ROOT.1.1.1 -- npx tsc --noEmit (gen1)

Run 2026-07-25 by `implementer-ROOT.1.1.1-gen1` in git worktree
`C:\Users\jainv\workplace\ai-learning-app\.claude\worktrees\agent-aa6fa42c34751a5cc`
(npm-installed; `next-mdx-remote` absent, `velite@0.4.0` devDependency).

FINAL pass, after all throwaway probe files were deleted.

Command: `npx tsc --noEmit`
Exit code: 0

```
(no output on stdout/stderr; tsc prints nothing on success -- exit code 0 IS the pass signal)
TSC_EXIT=0
```

## What this specifically proves for the interface constraint

`src/app/learn/[moduleId]/[lessonId]/page.tsx` is NOT owned by this item and was NOT
edited. It still calls:

```tsx
const { frontmatter, mdx, exercises } = loadLesson(moduleId, lessonId);
...
<LessonRenderer mdx={mdx} moduleId={moduleId} lessonId={lessonId} exercises={exercises} />
```

A clean `tsc --noEmit` over an `include` that covers `**/*.tsx` means that call still
type-checks against the new renderer signature. That holds because every new prop is
additive and optional:

- `code?: string` is NEW and optional; when absent the renderer resolves the compiled
  output itself via `getCompiledLesson(moduleId, lessonId)`.
- `mdx?: string` is RETAINED (widened from required to optional, which cannot break an
  existing caller that passes it) and marked `@deprecated`; it is accepted and ignored.
- `moduleId`, `lessonId`, `exercises` are unchanged in name and type.

`loadLesson`'s return type gained one member (`code: string | undefined`). Adding a
member to a returned object type cannot break destructuring callers that ignore it, and
the two other in-repo consumers (`getExercise`, `allExercisesPassed`, both in
`src/lib/content.ts`) destructure only `.exercises`.

Also proves `src/lib/schema.ts` was NOT edited: it is unchanged on disk and remains the
sole authority for `LessonFrontmatterSchema`, which `loadLesson` still parses with.
