# AI Mastery — Interactive Learning App

A local web app that takes you from non-technical beginner to expert across three tracks:

- **AI Fundamentals** — how LLMs actually work, capabilities & limits, how AI products are built
- **Prompt Engineering** — from basics through context engineering to production mastery
- **Claude Code** — everyday workflows, power tools, agents, and autonomous/remote Claude

14 modules. Module 1 is fully built; modules 2–14 have complete authoring specs in `specs/` that Claude agents can build in parallel (see below).

## How you learn

- **Quizzes** gate lesson progression, graded server-side with teaching explanations.
- **Prompt playground** — write a prompt, run it against a real Claude model on Amazon Bedrock, then have an LLM judge score it against the lesson's rubric with per-criterion feedback.
- **Embedded Claude Code terminal** — run the real, locally installed Claude Code inside a per-lesson sandbox, output streamed live.
- **Guided challenges** — do a task with Claude Code, click Verify, and a code-based verifier inspects the sandbox.
- **Profiles** — Netflix-style name picker; each profile has independent progress and sandboxes. No passwords.

## Setup

Requirements: Node 20+, the Claude Code CLI installed and authenticated (`claude --version` works), and Amazon Bedrock access.

```bash
npm install
npm run dev        # serves http://127.0.0.1:3000 (localhost only)
```

### Bedrock credentials

The playground and judge call Bedrock directly. The server reads from the environment:

- `AWS_REGION` (default `us-east-1`)
- `AWS_BEARER_TOKEN_BEDROCK` — if your shell doesn't inherit it, copy the value from
  `~/.claude/settings.json` → `env.AWS_BEARER_TOKEN_BEDROCK` into `.env.local`:

```
AWS_REGION=us-east-1
AWS_BEARER_TOKEN_BEDROCK=<your token>
```

Optional overrides in `.env.local`: `PLAYGROUND_MODEL`, `JUDGE_MODEL` (Bedrock model IDs, e.g. `anthropic.claude-haiku-4-5`), `CLAUDE_EXE` (path to claude.exe if not at the default npm global location).

### Terminal exercises

The embedded terminal spawns your local `claude.exe` in headless mode (`-p --output-format stream-json`) inside `sandbox/live/<profile>/<lesson>/`, restricted by each exercise's `--allowedTools` and `--max-turns`. It reuses your existing Claude Code authentication — no extra setup.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server, localhost-only |
| `npm run build` / `npm start` | Production build / serve |
| `npm run validate` | Validate all content against the schema (must pass before a module counts as built) |
| `npm run seed-sandboxes` | Reseed sandbox templates into live per-profile copies |

## Building the remaining modules with Claude agents

Each file `specs/module-NN.md` is a self-contained blueprint: lesson narratives, complete quiz/rubric/fixture/verifier definitions. To build a module, give a Claude agent this instruction:

> Read specs/AUTHORING-GUIDE.md and specs/module-NN.md in this repo, then build that module exactly as specified. Run `npm run validate` and `npx tsc --noEmit` until clean, and flip the module's status from "spec" to "built" in content/curriculum.json.

Modules can be built in parallel (each touches only its own content folder, sandbox templates, and verifier file).

## Architecture

- Next.js 16 App Router, TypeScript, Tailwind v4
- Content: MDX prose + JSON exercise definitions, validated by zod (`src/lib/schema.ts` is the contract)
- Progress: JSON files under `data/` per profile
- Bedrock: `@anthropic-ai/bedrock-sdk` (server-side only; secrets never reach the browser)
- Claude Code: spawned directly (no shell), prompt via stdin, flags from content definitions only
- Security: localhost-only proxy, path-confined sandboxes, quiz answers stripped from client payloads
