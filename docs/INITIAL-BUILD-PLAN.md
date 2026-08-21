# AI Learning App — Interactive Prompt Engineering & Claude Code Mastery

## Context

The user (a relatively non-technical beginner) wants a local interactive web app that takes them from zero → expert in three tracks: **LLM/AI fundamentals**, **prompt engineering**, and **Claude Code tooling mastery**. Confirmed decisions:

- **Location:** `C:\Users\jainv\workplace\ai-learning-app` (workplace dir already exists).
- **Stack:** Next.js 15 (App Router, TypeScript, Tailwind) — single full-stack app, best interactive-learning ecosystem.
- **Claude access — BOTH:**
  - **Prompt playground** → Amazon Bedrock via `@anthropic-ai/bedrock-sdk` (user already has `AWS_BEARER_TOKEN_BEDROCK` + `AWS_REGION=us-east-1` in Claude settings env).
  - **Claude Code terminal** → spawn the locally installed, already-authenticated `claude -p` headless mode (it inherits `CLAUDE_CODE_USE_BEDROCK=1` auth automatically).
- **Content depth:** full 14-module curriculum skeleton with navigation/gating/progress; **Module 1 fully authored** (Module 2 if time permits); a **`specs/` directory** with one self-contained authoring spec per remaining module so parallel agents can build modules while the user learns Module 1.
- **Depth requirement (user follow-up):** cover expert-level context-engineering concepts — context rot, attention budget, progressive disclosure / just-in-time context, compaction & memory, context isolation via subagents — as a dedicated hands-on module, with the vocabulary seeded in earlier modules.
- **Profiles (user follow-up):** simple local profile management — multiple named profiles, each with its own progress/learning path; switch profiles or create a new one from the UI. NO auth/authn/authz, no passwords — just a name picker (like Netflix profiles).
- **Interactivity (all four):** prompt playground with LLM-as-judge scoring, embedded Claude Code terminal with live streamed output, gating quizzes, auto-verified guided challenges.

## Verified environment facts

- Node v24.12.0, npm 11.6.2, Python 3.14. Claude Code CLI **2.1.207**.
- CLI binary is a **native exe**: `C:\Users\jainv\AppData\Roaming\npm\node_modules\@anthropic-ai\claude-code\bin\claude.exe` (package `bin` maps `claude` → `bin/claude.exe`). **Spawn this .exe directly with `child_process.spawn` — no `shell: true` needed on Windows.** Resolve the path at server startup; fail loudly if missing.
- Bedrock creds confirmed in `~/.claude/settings.json` env block; the Next.js server process inherits them when launched from a shell where Claude settings env applies — **the app must read `AWS_BEARER_TOKEN_BEDROCK`/`AWS_REGION` from `process.env` and also support `.env.local` fallback** (document in README that the user may need to copy these two values into `.env.local` since settings.json env only applies inside Claude Code sessions).
- Headless mode research (verified via docs agent): `claude -p --output-format stream-json --verbose --include-partial-messages` emits NDJSON; `stream_event` with `event.delta.type === "text_delta"` carries text; final `result` message has `session_id` + cost. `--resume <session-id>` must run from same cwd. `--allowedTools "Read,Edit,Bash(node *)"`, `--permission-mode dontAsk`, `--max-turns N` for sandboxing. Prompt passed via **stdin** (10MB cap), never argv.

## Directory structure

```
ai-learning-app/
├── package.json, next.config.ts, tsconfig.json, .env.local (gitignored), .gitignore
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # sidebar nav (tracks→modules→lessons) + progress
│   │   ├── page.tsx                      # dashboard: curriculum map, resume point
│   │   ├── profiles/page.tsx             # Netflix-style profile picker (first visit / switch)
│   │   ├── learn/[moduleId]/page.tsx     # module overview + lesson list + lock states
│   │   ├── learn/[moduleId]/[lessonId]/page.tsx   # lesson renderer
│   │   └── api/
│   │       ├── playground/run/route.ts   # POST → SSE: Bedrock streaming
│   │       ├── playground/score/route.ts # POST → JSON: LLM-as-judge
│   │       ├── claude-code/exec/route.ts # POST → SSE: spawn claude -p
│   │       ├── claude-code/reset/route.ts# POST: reseed sandbox
│   │       ├── quiz/submit/route.ts
│   │       ├── challenge/verify/route.ts
│   │       ├── progress/route.ts         # GET/PUT (active profile from cookie)
│   │       └── profiles/route.ts (+switch, +[id] delete)   # profile CRUD, no auth
│   ├── components/
│   │   ├── lesson/{LessonRenderer,Quiz,Playground,Terminal,Challenge}.tsx
│   │   ├── lesson/{TokenVisualizer,NextWordGame}.tsx   # Module 1 zero-code widgets
│   │   ├── nav/{Sidebar,ProgressBadge}.tsx
│   │   └── ui/*                          # button, card, callout, shiki code block
│   └── lib/
│       ├── schema.ts        # zod schemas + TS types — THE authoring contract, write first
│       ├── content.ts       # content tree loader + validation + gating logic
│       ├── bedrock.ts       # Bedrock client singleton, model config
│       ├── judge.ts         # LLM-as-judge
│       ├── claudeSpawn.ts   # spawn/stream/parse claude.exe, session registry
│       ├── sandbox.ts       # seed/reset/path-confinement
│       ├── progress.ts      # JSON file store
│       └── verifiers/       # index.ts registry + common.ts helpers + per-challenge modules
├── content/
│   ├── curriculum.json                   # all 12 modules, status: built|spec
│   └── modules/<moduleId>/module.json + lessons/<lessonId>/{lesson.mdx, exercises.json}
├── sandbox/
│   ├── templates/<lessonId>/             # committed fixtures (small starter files)
│   └── live/<profileId>/<lessonId>/      # runtime copies per profile, gitignored; claude cwd
├── data/
│   ├── profiles.json                     # profile registry, gitignored
│   └── progress/<profileId>.json         # per-profile progress, gitignored
├── specs/                                # _TEMPLATE.md, AUTHORING-GUIDE.md, module-02..12.md
└── scripts/{validate-content.ts, seed-sandboxes.ts}
```

**Packages:** `next@^15`, `react@^19`, `typescript@^5`, `tailwindcss@^4`, `@anthropic-ai/bedrock-sdk`, `zod@^3`, `next-mdx-remote` (runtime MDX so agent-authored content needs no rebuild), `@xterm/xterm@^5` + `@xterm/addon-fit`, `shiki`, `gray-matter`. **No SQLite** — JSON file store (local single-machine use, few KB per profile, avoids native-build friction on Windows/Node 24); atomic write (tmp + rename) with in-process mutex.

### Profiles (no auth — Netflix-style name picker)

- `data/profiles.json`: `{ profiles: {id, name, avatarColor, createdAt, lastActiveAt}[] }`; per-profile progress at `data/progress/<profileId>.json` (same `ProgressStore` shape). All gitignored.
- Active profile = `profileId` cookie (httpOnly not needed — no security value here, just persistence). Every progress/quiz/score/verify route resolves the profile from the cookie; requests without one get redirected to the picker.
- Routes: `GET/POST /api/profiles` (list/create), `POST /api/profiles/switch` (set cookie), `DELETE /api/profiles/:id` (remove profile + its progress file, confirm dialog in UI).
- UI: `src/app/profiles/page.tsx` — profile picker shown on first visit (no cookie) with "New profile" card; each card shows name + overall completion %. Current profile name + switch link in the sidebar header.
- Sandbox + Claude sessions: `sandbox/live/<profileId>/<lessonId>/` so two profiles never share a workspace; session registry and playground history keyed by profile too.

## Content schema (`src/lib/schema.ts` — authoring contract)

```ts
type Track = "fundamentals" | "prompting" | "claude-code";
interface CurriculumEntry { id; title; track; summary; status: "built"|"spec"; requires: string[] }
interface ModuleMeta { id; title; track; description; lessons: {id; title}[] }
// lesson.mdx frontmatter: { id, title, minutes, objectives: string[] }
type Exercise = QuizExercise | PlaygroundExercise | TerminalExercise | ChallengeExercise;
// quiz: { type:"quiz", id, title, passingScore, questions: {id, kind:"single"|"multi",
//         prompt, options:{id,text}[], correctOptionIds, explanation}[] }
// playground: { type:"playground", id, title, instructions, starterPrompt?, systemPrompt?,
//         maxTokens?, rubric: {id, description, weight}[] (weights sum 100), passingScore }
// terminal: { type:"terminal", id, title, instructions, sandboxTemplate, allowedTools,
//         maxTurns, suggestedPrompts? }
// challenge: { type:"challenge", id, title, instructions, sandboxTemplate, allowedTools,
//         maxTurns, verifierId, criteria: string[], hints?: string[] }
```

Lesson prose lives in `lesson.mdx` with `<Exercise id="ex1" />` anchors; structured exercise data in colocated `exercises.json` validated by zod (`npm run validate`). Gating: lesson complete when all exercises passed; module unlocks when `requires` complete; lessons sequential within module.

## Curriculum (14 modules, beginner → expert, tracks interleaved)

| # | id | Track | Title |
|---|----|-------|-------|
| 1 | `01-how-llms-work` | fundamentals | **How LLMs Actually Work** — FULLY BUILT. L1 What is an LLM (NextWordGame widget) · L2 Tokens (TokenVisualizer) · L3 How it was trained · L4 Why AI makes things up (guided playground observation) · L5 Randomness & temperature. All zero-code. |
| 2 | `02-prompting-basics` | prompting | Talking to AI: be specific · context & role · show the format · iterate. (Built if time; else spec'd.) |
| 3 | `03-capabilities-limits` | fundamentals | Context windows, cutoff, reasoning vs recall, confidence ≠ correctness. Seeds the "attention budget" intuition module 10 builds on. |
| 4 | `04-core-prompt-techniques` | prompting | Few-shot, XML tags, step-by-step, constraining output, system vs user |
| 5 | `05-meet-claude-code` | claude-code | Agent loop, first embedded terminal session, first edit, permission model. First terminal + challenge exercises. |
| 6 | `06-advanced-prompting` | prompting | Extended thinking, chaining, personas, evaluating outputs (meta: how this app grades you) |
| 7 | `07-claude-code-workflows` | claude-code | CLAUDE.md, permissions/settings.json, slash commands, --resume, task phrasing |
| 8 | `08-how-ai-systems-are-built` | fundamentals | APIs & system prompts (peek at this app's own code), tool use, RAG intuition, cost/tokens |
| 9 | `09-claude-code-power-tools` | claude-code | Skills, hooks, headless mode (meta: this app's terminal uses it), permission modes |
| 10 | `10-context-engineering` | prompting | **Context Engineering: the Expert Discipline.** L1 *The attention budget* — context ≠ free memory; why more context can mean worse answers (needle-in-haystack playground experiment: same question with clean vs stuffed context, compare accuracy). L2 *Context rot* — how long sessions degrade: stale/contradictory info accumulates, early instructions fade, poisoned context compounds errors (guided terminal exercise: deliberately rot a Claude Code session, watch quality drop, then `/clear` and compare). L3 *Progressive disclosure / just-in-time context* — load context when needed, not up front: how CLAUDE.md points to files instead of inlining them, how skills load on trigger, how agents use search over pre-stuffing (challenge: restructure a bloated CLAUDE.md into a lean index + on-demand files, verifier checks structure + token count). L4 *Compaction, notes & memory* — summarize-and-restart patterns, external memory files, when to start a fresh session vs continue. L5 *Context isolation with subagents* — fan out research to keep the main context clean; the orchestrator gets conclusions, not file dumps (meta: this is exactly how this app was planned). |
| 11 | `11-agentic-claude-code` | claude-code | Subagents, MCP servers, plan mode, parallel agents — applies module 10's isolation patterns hands-on |
| 12 | `12-autonomous-remote-claude` | claude-code | **Autonomous & Remote Claude.** L1 *Goal-driven sessions* — `/goal <condition>`: Claude works across turns until a small fast model judges the condition met; writing measurable conditions (end state + check + constraints + turn bounds); vs Stop hooks (terminal exercise: set a goal like "test.js prints PASS", watch it self-iterate). L2 *Recurring loops & scheduled tasks* — `/loop [interval] [prompt]` for in-session polling; Desktop scheduled tasks vs Cloud Routines (`/schedule`) — the runs-where/needs-machine-on tradeoff table. L3 *Ultracode & dynamic workflows* — the `ultracode` keyword and `/effort ultracode` mode; Claude writes a JS orchestration script coordinating up to 1000 subagents; workflows vs subagents vs skills vs agent teams (when the plan should live in a script, not in context — direct callback to module 10). L4 *Remote Claude, three tiers* — local CLI, Claude Code on the web (Anthropic cloud, fresh clone), Remote Control (`/remote-control`: local execution steered from browser/mobile); `--resume` across all of them. L5 *Claude in your repos & the agent ecosystem* — GitHub integration (`@claude` mentions, Actions, auto PR review); headless `claude -p` as an automation building block (meta: this app!); survey of third-party agent frameworks — OpenClaw (multi-channel agent gateway with SOUL.md/IDENTITY.md/HEARTBEAT.md persona files, not an Anthropic product) and how such frameworks wrap Claude as a provider vs what Claude Code itself offers (Channels). Quiz-heavy + terminal exercises for L1/L2; L4/L5 are concept lessons (can't drive web/mobile from the sandbox). |
| 13 | `13-prompt-mastery` | prompting | Production prompts, writing rubrics, prompt injection awareness, systematic evals, cost/caching-aware prompt design |
| 14 | `14-capstone` | all | Multi-challenge project: CLAUDE.md + skill + hook + subagent + a `/goal`-driven finale to build a tool, auto-verified stages — graded partly on context hygiene (lean CLAUDE.md, progressive disclosure, appropriate delegation) |

Spec'd modules show greyed "coming soon" in the UI so the full map is visible from day one.

**Deep-concept coverage note:** context rot, attention budget, progressive disclosure/just-in-time context, compaction, context poisoning, and subagent context isolation get a dedicated module (10) with hands-on experiments — the playground and embedded terminal make these *observable*, not just explained (e.g., the learner personally watches a rotted session give worse answers than a fresh one). Earlier modules plant the vocabulary: module 3 introduces context windows and the attention-budget intuition; module 7 frames CLAUDE.md as progressive disclosure in miniature; module 9 frames skills' trigger-based loading the same way.

**Autonomous/remote coverage note (verified against current docs):** `/goal` (v2.1.139+, evaluator-driven completion), `/loop` (interval prompts), ultracode (keyword + `/effort ultracode` mode, v2.1.203+, dynamic JS workflows orchestrating subagents), the three remote tiers (local CLI / Claude Code on the web / Remote Control), Desktop scheduled tasks vs Cloud Routines, GitHub `@claude` integration, and third-party frameworks like OpenClaw (covered as a concept survey — external multi-channel agent gateway, not an Anthropic product; the user's local openclaw install is not set up correctly, so teach it conceptually only, no hands-on exercise against it). `/goal` and `/loop` get real terminal exercises since they work in `claude -p`-spawned sandbox sessions; web/mobile/GitHub tiers are taught conceptually with quizzes.

## Key API/engine designs

### Claude Code exec (`/api/claude-code/exec`, SSE) — riskiest piece, build carefully
1. Validate exercise; seed `sandbox/live/<lessonId>/` from template if absent.
2. `spawn("C:\\...\\claude-code\\bin\\claude.exe", args, { cwd: sandboxDir, env: process.env })` — args: `-p --allowedTools <from content> --permission-mode dontAsk --max-turns <from content> --output-format stream-json --verbose --include-partial-messages` (+ `--resume <id>` when continuing; sessions keyed to lessonId so cwd matches). **Prompt via stdin, never argv.** All safety flags come from server-side content, never the request body.
3. Parse stdout NDJSON → SSE: text deltas as `{type:"text",text}`, tool-use starts as `{type:"tool",name}` ("✏️ Editing app.js…"), final result as `{type:"result",sessionId,costUsd,numTurns}`; store sessionId in-memory per lesson.
4. Kill child on client disconnect / timeout; one concurrent child per lesson. Reset endpoint deletes + recopies template (path resolve + prefix check under `sandbox/live/`).

### Playground (`/api/playground/run`, SSE)
Server loads exercise (never trusts client for system prompt/maxTokens), streams Bedrock Messages API text deltas. Model: `anthropic.claude-opus-4-8` default, env-overridable (`anthropic.claude-haiku-4-5` cheap option). Client in `src/lib/bedrock.ts` singleton, `awsRegion` from env.

### LLM-as-judge (`/api/playground/score`)
One Bedrock call: system prompt = "strict but encouraging prompt-engineering instructor"; user content XML-tagged `<exercise_instructions>/<rubric>/<student_prompt>/<model_output>`; **structured output JSON schema** → `{criteria: [{id, met, feedback}], overallFeedback, improvedPromptExample}`. **Score computed in code** (Σ weights of met criteria), not by the model. UI: ✅/❌ checklist + per-criterion feedback + "show me a stronger prompt" disclosure.

### Quiz submit
Graded server-side; `correctOptionIds`/`explanation` stripped from client payloads, explanations returned in the grading response.

### Challenge verification
Code-based **verifier registry** in `src/lib/verifiers/` (content references by `verifierId` string — content is data, never code). `common.ts` helpers: `fileExists`, `fileMatches(regex)`, `runNode(dir,file,expectStdout)` (10s timeout, no shell), `readJson`, `gitHasCommit`. Fuzzy criteria use a `judgeCriterion()` boolean-verdict LLM call. Verify endpoint maps results to the challenge's criteria checklist; repeated failure unlocks hints.

## `specs/` for parallel agents

- `AUTHORING-GUIDE.md`: schema contract (points at `schema.ts`), layout, MDX conventions, rubric rules (independently gradeable, weights sum 100), sandbox template rules (≤10 small files), verifier registration, `npm run validate` must pass.
- `_TEMPLATE.md` sections: Meta / Audience state / Learning objectives / Per-lesson narrative outline + full JSON-ready exercise definitions / Sandbox templates (file-by-file) / Verifiers to implement (id + plain-English logic) / Tone & vocabulary / Done checklist.
- Create `specs/module-02.md` … `specs/module-14.md` — each **self-contained** (agent needs only spec + guide + schema.ts). The module-10 (context engineering) spec must define its experiments precisely: the needle-in-haystack fixture texts, the session-rot script (sequence of prompts that degrade a session), and the bloated-CLAUDE.md fixture + verifier logic (structure + token-count checks) for the progressive-disclosure challenge. The module-12 (autonomous/remote) spec must pin the exact `/goal` and `/loop` terminal-exercise setups (fixtures + conditions + verifiers) and mark L4/L5 as concept-only lessons.

## Security (bake in)

- Localhost only: `next dev -H 127.0.0.1` in scripts + middleware rejecting non-localhost `Host`.
- Bedrock token server-side only; no `NEXT_PUBLIC_` secrets.
- Spawn hardening: direct .exe spawn (no shell), prompt via stdin, flags from content not client, cwd path-confined under `sandbox/live/`, kill on disconnect/timeout.
- Claude sessions restricted per-exercise (`Read,Edit,Bash(node *)`-class allowlists, `dontAsk`, `--max-turns`).

## Implementation order (with verification at each step)

1. **Scaffold** — `create-next-app` (TS, Tailwind, App Router, src dir); deps; `.env.local`; `.gitignore`. ✔ `npm run dev` serves.
2. **Schema + content loader** — `schema.ts`, `content.ts`, `curriculum.json` (14 modules), module 1 stub, `validate-content.ts`. ✔ validate passes; dashboard shows 14 modules with lock/spec states.
3. **Profiles + progress store + gating** — `profiles.json` registry, profile picker page + cookie, per-profile `progress.ts`, `/api/profiles*` + `/api/progress`, sidebar wiring. ✔ create two profiles, complete a lesson on one, switch — progress is independent; manual PUT unlocks module 2.
4. **Lesson renderer + Quiz** — MDX pipeline, `Quiz.tsx`, `/api/quiz/submit`. ✔ take a quiz, wrong→right, persists across restart.
5. **Playground + Bedrock** — first real AWS call; verify creds path early. ✔ tokens stream in browser.
6. **Judge** — ✔ weak prompt scores low with actionable feedback; strong prompt passes.
7. **Terminal + claude spawn** — `claudeSpawn.ts` (assert claude.exe exists), sandbox, exec/reset routes, xterm UI. ✔ from browser: "list files and summarize app.js" streams live; resume works; reset reseeds.
8. **Challenge verify** — registry + helpers + UI. ✔ end-to-end: Claude fixes bug → Verify → criteria green.
9. **Author Module 1 fully** — 5 lessons, widgets, quizzes, 2 guided playground observations. ✔ complete Module 1 as a user; Module 2 unlocks.
10. **Write specs/** — guide, template, module-02…14. ✔ spot-check one spec by stubbing its module.json.
11. **Author Module 2** (time permitting) from its own spec — dogfoods the format.
12. **Polish** — localhost check, error toasts, README (run instructions, env setup incl. copying Bedrock creds to `.env.local` if needed). ✔ fresh `npm run dev` works.

## Execution strategy (user request: fan out 10 agents)

Build via multi-agent orchestration, in two waves because everything depends on the scaffold + schema contract:

**Wave 0 — Foundation (sequential, done first):** `create-next-app` scaffold, install ALL deps up front (so no agent touches `package.json`), `src/lib/schema.ts`, `src/lib/content.ts`, `curriculum.json` (14 modules), base layout/sidebar stubs, `.env.local`, `.gitignore`, shared UI primitives. This is the contract every parallel agent codes against.

**Wave 1 — 10 parallel agents, partitioned by directory to avoid file conflicts:**
1. **Profiles + progress** — `lib/progress.ts`, `/api/profiles*`, `/api/progress`, profile picker page
2. **Lesson renderer + Quiz** — MDX pipeline, `LessonRenderer.tsx`, `Quiz.tsx`, `/api/quiz/submit`, learn routes
3. **Playground + Bedrock** — `lib/bedrock.ts`, `/api/playground/run` SSE, `Playground.tsx`
4. **Judge** — `lib/judge.ts`, `/api/playground/score`, criteria checklist UI
5. **Terminal + spawn** — `lib/claudeSpawn.ts`, `lib/sandbox.ts`, `/api/claude-code/*`, `Terminal.tsx` (xterm)
6. **Challenges** — `lib/verifiers/*`, `/api/challenge/verify`, `Challenge.tsx`
7. **Module 1 content, L1–L3** — MDX + `NextWordGame.tsx`, `TokenVisualizer.tsx` widgets + quizzes
8. **Module 1 content, L4–L5** — MDX + playground-observation exercises + quizzes
9. **Specs part 1** — `AUTHORING-GUIDE.md`, `_TEMPLATE.md`, `specs/module-02..07.md`
10. **Specs part 2** — `specs/module-08..14.md` (incl. the pinned module-10 and module-12 experiment fixtures)

**Wave 2 — Integration & verify (sequential):** wire agents' pieces together where stubs meet (dashboard ↔ progress, lesson page ↔ exercise components), `npm run validate`, `npm run build`, fix cross-boundary type errors, then the end-to-end verification below.

## Verification (end-to-end)

- `npm run validate` — all content passes schema.
- Walk Module 1 start-to-finish in the browser: quizzes gate, widgets work, playground streams from Bedrock, judge scores a deliberately-bad and a good prompt correctly.
- Terminal lesson: run a real `claude -p` task against a seeded sandbox, watch live stream, resume the session, reset the sandbox.
- Challenge: complete one via the embedded terminal, click Verify, all criteria pass.
- Profiles: create a second profile, verify its curriculum starts locked/fresh while the first profile's progress is intact; switch back and forth; delete the test profile.
- Confirm server unreachable from non-localhost and no secrets in client bundles (`grep -r BEDROCK .next/static` empty).
