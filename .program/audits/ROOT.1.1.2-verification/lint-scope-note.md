# Lint scope note (ROOT.1.1.2)

`npx eslint` on this item's owned/created files exits **0 with no output** — see
`eslint-owned-files.txt` (`src/lib/beats.ts`, `src/lib/content.ts`, `tests/beats.test.ts`,
`tests/fixtures/beats-fixture-lesson.ts`, plus `tests/seed.test.ts` as a neighbour control).

Repo-wide `npm run lint` (bare `eslint`, no path argument) exits **1**, but every finding is
**pre-existing and outside this item's ownership**. Two facts establish that:

1. Bare `eslint` in this repo walks the whole tree including
   `.claude/worktrees/agent-*/`, so it lints *other concurrently active agents' worktree
   copies* — the overwhelming majority of the 34k-line output. That is an artifact of
   concurrent worktrees, not a code defect, and would disappear once those worktrees are
   integrated or removed. Not this leaf's file to fix (`eslint.config.mjs` is not in
   `file_ownership`).
2. In the MAIN checkout the only findings are, verbatim from that run:
   - `.program/audits/probe-bedrock-basic.ts` — `no-explicit-any`
   - `.program/audits/probe-bedrock-structured-outputs.ts` — `no-explicit-any`, unused `e`
   - `sandbox/templates/demo-fix-greet/greet.js` — unused `name` (intentional: it is a
     broken fixture a learner exercise repairs)
   - `sandbox/templates/demo-fix-greet/test.js` — `no-require-imports` (same fixture)
   - `src/components/nav/ThemeToggle.tsx` — `setState` in effect

   None of these five files is touched by ROOT.1.1.2, and all five predate it.

The 4.3 MB raw log was deleted rather than committed as evidence: it is dominated by other
agents' worktree paths, would be stale the moment those worktrees change, and its
item-relevant content is the scoped run above. Reproduce with
`npx eslint src/lib/beats.ts src/lib/content.ts tests/beats.test.ts tests/fixtures/beats-fixture-lesson.ts`.
