<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read `docs/nextjs-conventions.md` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent operating precedence

- `.program/ledger` is the single source of truth for work state.
- The built-in task list is a dispatch mirror only; files win on any disagreement.
- Every agent reads only: its own item file, its parent's view file, its children's item files, its interfaces, its spec shards in `.program/spec/`, `docs/origin/`, and `.program/HEADLINE.md`.
- `docs/origin/CONSTRAINTS.md` and `docs/origin/REJECTED.md` are binding. Work that contradicts a hard constraint or reopens a rejected alternative is wrong.
- No agent uses AskUserQuestion.
- No agent performs an irreversible action. Those are parked, never self-authorized.
- This program does not use OpenSpec. No agent runs any opsx skill. If those skills are ever reinstalled, this prohibition still stands — subagents can invoke skills through the Skill tool whether or not they are preloaded.

## Verification commands

- **Install**: `npm install`
- **Build**: `npm run build`
- **Typecheck**: `npx tsc --noEmit`
- **Lint**: `npm run lint`
- **Unit test**: _(no test suite configured)_
- **Integration test**: _(no test suite configured)_
- **Dev server**: `npm run dev`
