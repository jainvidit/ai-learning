# ROOT.1.1.1 -- npm run lint (gen1)

Run 2026-07-25 by `implementer-ROOT.1.1.1-gen1` in git worktree
`C:\Users\jainv\workplace\ai-learning-app\.claude\worktrees\agent-aa6fa42c34751a5cc`
(npm-installed; `next-mdx-remote` absent, `velite@0.4.0` devDependency).

Command: `npm run lint`  (script body `eslint`, unchanged)
Exit code: **1 -- see the pre-existence proof below**

```
> ai-learning-app@0.1.0 lint
> eslint

...\.program\audits\probe-bedrock-basic.ts
  31:19  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

...\.program\audits\probe-bedrock-structured-outputs.ts
  71:16  warning  'e' is defined but never used             @typescript-eslint/no-unused-vars
  75:19  error    Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

...\sandbox\templates\demo-fix-greet\greet.js
  2:16  warning  'name' is defined but never used  @typescript-eslint/no-unused-vars

...\sandbox\templates\demo-fix-greet\test.js
  1:19  error  A `require()` style import is forbidden  @typescript-eslint/no-require-imports

...\src\components\nav\ThemeToggle.tsx
  20:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders
         (react-hooks/set-state-in-effect)

✖ 6 problems (4 errors, 2 warnings)
```

## Files owned by ROOT.1.1.1 are CLEAN

```
$ npx eslint velite.config.ts src/lib/content.ts src/components/lesson/LessonRenderer.tsx
OWNED_LINT_EXIT=0
```

Exit 0, no output. Zero lint problems in any of the three files this item owns.

## Proof the 4 errors + 2 warnings PRE-EXIST this item

The gen1 attempt could NOT reproduce a clean baseline by running `npm run lint` in the
shared checkout: `eslint.config.mjs` does not ignore `.claude/**`, so a main-checkout run
recursively lints every sibling agent worktree and returns hundreds of problems. A
dispatched `dream-verifier` (agent `ad2f031471b19758f`) attempted exactly that and
correctly returned **inconclusive** for this reason. That is a real finding about the
lint setup, reported here and not worked around.

Pre-existence is instead established from INDEPENDENT evidence that predates this item's
code and was produced by a different item in a different worktree:
`.program/audits/ROOT.7.2-gen1-typecheck-lint.txt` records, from worktree
`agent-a66e241ac72f6bf50`, the identical summary line `✖ 6 problems (4 errors, 2 warnings)`
across the identical five files and identical rule IDs. ROOT.7.2's worktree contained no
Velite and still had `next-mdx-remote`, so those problems cannot originate from this
migration. ROOT.1.1.1's own gen0 evidence (produced before this generation, in worktree
`agent-ad9cdcfddc53d1dfc`) reports the same six problems again.

Three independent worktrees, three identical problem sets => baseline, not regression.

None of the five failing files is in this item's `file_ownership`
(`package.json`, `velite.config.*`, `src/lib/content.ts`,
`src/components/lesson/LessonRenderer.tsx`), so they were not fixed: repairing
`ThemeToggle.tsx` or the sandbox fixtures would be an out-of-scope edit to another
owner's file. Reported, not fixed.

## One lint error WAS introduced during implementation, and was fixed

`react-hooks/static-components` fired when the Velite-compiled MDX was mounted as a JSX
element (`<MdxContent/>`), because that declares a fresh component identity on every
render -- which would remount the subtree and reset the internal state of the interactive
widgets the components map injects (TokenVisualizer, NextWordGame, Quiz). Resolved by
invoking the compiled `default` export directly inside `renderCompiledMdx()` instead of
mounting it. The rule is correct and the fix addresses the underlying state-loss bug, not
just the diagnostic.
