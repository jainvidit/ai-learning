# ROOT.1.1.1 -- npm run validate + npm test (gen1)

Run 2026-07-25 by `implementer-ROOT.1.1.1-gen1` in git worktree
`C:\Users\jainv\workplace\ai-learning-app\.claude\worktrees\agent-aa6fa42c34751a5cc`
(npm-installed; `next-mdx-remote` absent, `velite@0.4.0` devDependency).

FINAL pass, after all throwaway probe files were deleted.

## `npm run validate` -- exit code 0

Script body `tsx scripts/validate-content.ts`, UNCHANGED by this item.

```
> ai-learning-app@0.1.0 validate
> tsx scripts/validate-content.ts

curriculum.json: 14 modules
module 01-how-llms-work:
  ✓ 01-what-is-an-llm (1 exercises)
  ✓ 02-tokens (1 exercises)
  ✓ 03-training (1 exercises)
  ✓ 04-hallucination (2 exercises)
  ✓ 05-randomness (2 exercises)

All content valid.
VALIDATE_EXIT=0
```

This is the load-bearing check for the steward boundary: authored-content validation still
runs entirely through `src/lib/schema.ts` (unedited) via `scripts/validate-content.ts`
(unedited). Velite's collection schema in `velite.config.ts` is a SEPARATE, build-only
gate and did not take over any part of `npm run validate`. Anchor integrity -- the
`<Exercise id>` check at `scripts/validate-content.ts:88` -- still passes, confirming the
exercise anchors survive in the authored MDX.

## `npm test` -- exit code 0

Script body `vitest run`, UNCHANGED by this item.

```
> ai-learning-app@0.1.0 test
> vitest run

 RUN  v4.1.10 C:/Users/jainv/workplace/ai-learning-app/.claude/worktrees/agent-aa6fa42c34751a5cc

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  10:51:49
   Duration  362ms
TEST_EXIT=0
```

Same 1 file / 3 tests as the pre-migration baseline: this item added no shipped tests
(`tests/**` and the runner configs belong to ROOT.7.2) and broke none. The two throwaway
probe suites used during implementation were deleted before this final run -- the "3
tests" figure confirms they are gone.
