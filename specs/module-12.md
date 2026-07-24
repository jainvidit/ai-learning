# Module Spec: 12-autonomous-remote-claude

## Meta

- **id:** `12-autonomous-remote-claude`
- **title:** Autonomous & Remote Claude
- **track:** `claude-code`
- **requires:** `["11-agentic-claude-code"]`
- **minutes:** ~60 total (5 lessons: 16 + 10 + 12 + 10 + 12)

`module.json`:

```json
{
  "id": "12-autonomous-remote-claude",
  "title": "Autonomous & Remote Claude",
  "track": "claude-code",
  "description": "Claude that keeps going without you. Drive a session with /goal until a judge model says the condition is met, poll with /loop and compare scheduled tasks to cloud routines, let ultracode write orchestration scripts that coordinate hundreds of subagents, reach your sessions from anywhere with three tiers of remote Claude, and survey the ecosystem from GitHub @claude to third-party agent gateways.",
  "lessons": [
    { "id": "01-goal-driven-sessions", "title": "Goal-Driven Sessions: /goal" },
    { "id": "02-loop-and-schedules", "title": "/loop & Scheduled Tasks" },
    { "id": "03-ultracode-dynamic-workflows", "title": "Ultracode & Dynamic Workflows" },
    { "id": "04-remote-claude", "title": "Remote Claude: Three Tiers" },
    { "id": "05-claude-in-your-repos", "title": "Claude in Your Repos & the Ecosystem" }
  ]
}
```

## Audience state

Learner finished 1-11: fluent in this app's terminal, knows skills/hooks/headless mode (09), context engineering (10), and subagents/MCP/plan mode/worktrees (11). They have always been the turn-by-turn driver. This module removes the driver: sessions that decide for themselves when they're done, run on a clock, run without the laptop, or run inside GitHub. They do NOT yet know /goal, /loop, schedules, ultracode, or remote tiers.

## Learning objectives

1. Explain how a /goal session works: Claude iterates across turns until a small fast model judges the stated condition met.
2. Write a measurable goal condition (one end state, a stated check, constraints, turn bounds) and drive a real fix-the-tests session with goal-style phrasing.
3. Distinguish /loop (in-session polling) from desktop scheduled tasks and cloud routines, and pick the right one for a job.
4. Describe ultracode mode: Claude writes a JS orchestration script coordinating subagents — the script holds the plan, the context holds only conclusions.
5. Name the three tiers of remote Claude (local CLI, Claude Code on the web, Remote Control) and what --resume carries across them.
6. Describe how Claude shows up inside repos (@claude mentions, Actions, PR review) and place third-party frameworks like OpenClaw in the ecosystem.

---

## Lesson 1: `01-goal-driven-sessions` — Goal-Driven Sessions: /goal

Frontmatter: minutes 16; objectives: explain the /goal loop and its judge model; write measurable goal conditions; contrast /goal with Stop hooks; drive a fix-until-green session with goal-style phrasing.

### Narrative beats

1. **The handoff.** Until now, YOU decided when Claude was done: read the answer, send the next prompt. `/goal <condition>` flips it: you state an end condition once, and Claude keeps working across turns — editing, running, re-checking — while a small fast model acts as judge, reading the state of play each round and answering one question: is the condition met yet? When the judge says yes, the session stops.
2. **Why a judge, not the worker.** The model doing the work is motivated to declare victory; a separate cheap judge with one narrow question is harder to fool and nearly free to consult every turn. (Callback to module 06: this is a rubric with exactly one criterion, applied by a second model.)
3. **Anatomy of a measurable condition.** Four parts, every time: (a) ONE end state — "all tests pass", not "the code is better"; (b) a stated CHECK the judge can apply — "node test.js exits 0 and prints no FAIL"; (c) CONSTRAINTS — "only edit calc.js, never test.js"; (d) TURN BOUNDS — "give up and report if not done in 12 turns." A condition missing any part invites either premature victory or an infinite loop. Show good vs bad side by side: `/goal make the calculator good` (unjudgeable) vs `/goal node test.js exits 0 with no FAIL lines; only edit calc.js; stop after 12 turns`.
4. **vs Stop hooks.** Module 09's Stop hooks also keep Claude going: a script fires when Claude tries to stop and can push it back to work. Difference in kind: a hook is deterministic CODE (exit code decides), /goal is a JUDGED natural-language condition (a model decides). Hooks for checks you can script; goals for conditions you can only describe. Callout (info): they compose — a Stop hook can enforce "tests ran at least once" while a goal judges "the refactor is complete."
5. **Do it for real.** This app's terminal doesn't expose the /goal slash command itself, but goal-style PHRASING gives you most of the behavior in any session: state the condition, the check, the constraints, and the bound in your first message, then let Claude iterate. That's the terminal exercise — followed by a challenge where a verifier (a deterministic judge!) confirms the end state. Anchors: `<Exercise id="term-goal-session" />`, `<Exercise id="challenge-goal-tests" />`.

### Exercises
```json
[
  {
    "type": "terminal",
    "id": "term-goal-session",
    "title": "Terminal: Drive a Session Like /goal",
    "instructions": "This sandbox has calc.js (a tiny calculator, two functions are buggy) and test.js (prints PASS/FAIL per case). Instead of babysitting turn by turn, give ONE goal-style instruction with all four parts: end state, check, constraints, turn bound. For example: 'Keep going until node test.js prints all PASS and exits 0. Run the tests after every change to verify. Only edit calc.js — never touch test.js. If you can't get there in 12 turns, stop and report what's blocking you.' Then watch: Claude should run tests, diagnose, fix, and re-run without you steering. If it stops early with tests still failing, that's your condition being too loose — tighten it and try again.",
    "sandboxTemplate": "m12-goal-lab",
    "allowedTools": "Read,Glob,Grep,Edit,Bash(node *)",
    "maxTurns": 15,
    "suggestedPrompts": [
      "Keep going until node test.js prints all PASS and exits 0. Run the tests after every change to verify. Only edit calc.js — never touch test.js. If you can't get there in 12 turns, stop and report what's blocking you.",
      "Run node test.js and show me exactly which cases still fail."
    ]
  },
  {
    "type": "challenge",
    "id": "challenge-goal-tests",
    "title": "Challenge: All Green, Judged",
    "instructions": "Now the deterministic judge. Get calc.js to the point where node test.js exits 0 and prints no FAIL lines — using goal-style phrasing (one instruction with end state, check, constraints, turn bound), not turn-by-turn micromanagement. If you already fixed everything in the previous exercise, run the tests once to confirm and click Verify; otherwise drive the fix now. Rule of the lab: test.js is the spec — fix calc.js to match it, never the reverse.",
    "sandboxTemplate": "m12-goal-lab",
    "allowedTools": "Read,Glob,Grep,Edit,Bash(node *)",
    "maxTurns": 15,
    "verifierId": "m12-goal-tests-pass",
    "criteria": [
      "node test.js exits with code 0",
      "Test output contains no FAIL lines"
    ],
    "hints": [
      "Start by having Claude run node test.js — the FAIL lines name the broken functions.",
      "Two functions are wrong: one subtracts in the wrong order, one uses the wrong operator entirely.",
      "Give the full goal-style instruction from the lesson verbatim — it contains everything Claude needs to finish without you."
    ]
  }
]
```

---

## Lesson 2: `02-loop-and-schedules` — /loop & Scheduled Tasks

Frontmatter: minutes 10; objectives: describe /loop as in-session polling; compare desktop scheduled tasks with cloud routines; choose the right recurrence tool for a given job. CONCEPT + QUIZ ONLY.

### Narrative beats

1. **Recurrence, three ways.** /goal repeats until DONE; sometimes you want repeats FOREVER (or on a clock): check the deploy, poll the inbox, re-run the report. Claude has three tools for that, at three distances from your chair.
2. **`/loop [interval] [prompt]`** — in-session polling. Inside an open session: `/loop 5m check whether the build passed and summarize new failures`. Every interval, the prompt re-runs in THAT session, with that session's context; it lives and dies with the session. Best for: watching something for the next hour while you work.
3. **Desktop scheduled tasks.** Your machine fires a schedule; each run launches a fresh headless session (module 09's `claude -p`, on a timer). Survives you closing the chat — but not you closing the laptop.
4. **Cloud Routines (`/schedule`).** Schedule and session both live in Anthropic's cloud: machine can be off, results wait for you. The trade: it runs against what the cloud can see (connected repos and integrations), not your local uncommitted mess.
5. **The comparison table** (render in the lesson; hedge specifics with "in current versions"):

   | | `/loop` | Desktop scheduled task | Cloud Routine (`/schedule`) |
   |---|---|---|---|
   | Runs where | inside your currently open session | on your machine, fresh session per run | in Anthropic's cloud |
   | Machine must be on | yes — session stays open | yes — at trigger time | no |
   | Min interval | short — minutes, while you watch | minutes | coarser — minutes to hours |
   | Triggers | fixed interval, set in-session | time schedule fired locally | time schedules (and events) managed remotely |
6. **Context warning** (Callout, warning): a /loop run appends to ONE session's context every tick — module 10's rot on a timer. Long-lived recurrence belongs in fresh-session tools (scheduled tasks, routines), not in one immortal chat. Anchor: `<Exercise id="quiz-loop-schedules" />`.

### Exercises
```json
[
  {
    "type": "quiz",
    "id": "quiz-loop-schedules",
    "title": "Quiz: /loop & Schedules",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-loop",
        "kind": "single",
        "prompt": "What does /loop 10m <prompt> do?",
        "options": [
          { "id": "a", "text": "Schedules a cloud job that runs every 10 minutes forever" },
          { "id": "b", "text": "Re-runs the prompt every 10 minutes inside your current open session, sharing its context, until the session ends" },
          { "id": "c", "text": "Makes Claude think for 10 minutes before answering" },
          { "id": "d", "text": "Retries a failed command 10 times" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "/loop is in-session polling: same session, same context, on an interval — it dies with the session. A persistent cloud job (a) is what /schedule routines are for."
      },
      {
        "id": "q2-machine-off",
        "kind": "single",
        "prompt": "You want a nightly dependency-update check to run while your laptop is closed and in a bag. Which tool?",
        "options": [
          { "id": "a", "text": "/loop 24h in a session you leave open" },
          { "id": "b", "text": "A desktop scheduled task" },
          { "id": "c", "text": "A Cloud Routine via /schedule — it runs in Anthropic's cloud, machine off" },
          { "id": "d", "text": "None — recurring AI tasks require a running machine" }
        ],
        "correctOptionIds": ["c"],
        "explanation": "Only the cloud tier survives your machine sleeping. /loop needs the session open; a desktop scheduled task needs the machine awake at trigger time."
      },
      {
        "id": "q3-match",
        "kind": "multi",
        "prompt": "Which pairings of job and tool are sensible? (select all that apply)",
        "options": [
          { "id": "a", "text": "Watch a deploy for the next 30 minutes while you keep working → /loop in your open session" },
          { "id": "b", "text": "Summarize new GitHub issues every morning at 9, laptop possibly off → Cloud Routine" },
          { "id": "c", "text": "Re-run local tests against your uncommitted working tree every hour while you're at your desk → desktop scheduled task" },
          { "id": "d", "text": "A permanent monitor → one /loop session you promise never to close" }
        ],
        "correctOptionIds": ["a", "b", "c"],
        "explanation": "Match distance to duration: in-session for the next hour, local schedules for local state, cloud for machine-off recurrence. An immortal /loop session (d) is a rot farm with a single point of failure: you."
      }
    ]
  }
]
```

---

## Lesson 3: `03-ultracode-dynamic-workflows` — Ultracode & Dynamic Workflows

Frontmatter: minutes 12; objectives: describe ultracode mode; explain why the orchestration script holds the plan while context holds conclusions; choose among workflows, subagents, skills, and agent teams. CONCEPT + QUIZ ONLY.

### Narrative beats

1. **The ceiling.** Module 11's subagents fan out a handful of searches. Now imagine 300 files each needing the same analysis. Spawning them by hand from chat means the plan — who's done, who failed, what's next — lives in the conversation. Hundreds of status updates later, the attention budget is gone and the orchestrator forgets who it sent where.
2. **Ultracode.** Include the keyword `ultracode` in your request (or set `/effort ultracode`) and Claude changes strategy: instead of doing the work in-conversation, it WRITES A PROGRAM — a JS orchestration script that spawns and coordinates subagents (up to 1000 in a workflow, roughly 16 running concurrently in current versions), collects their results, retries failures, and reports back once.
3. **The pivotal move: plan lives in code, not context.** The script is the plan — loops, queues, retry logic, progress state all live in a file, costing zero attention. The main context receives only CONCLUSIONS: "294 of 300 analyzed, 6 failed, results in results.json." This is module 10's context isolation compounded: subagents isolate the exploration; the script isolates the coordination.
4. **Dynamic, not canned.** The script is written fresh for YOUR task — Claude decides the fan-out shape, the batching, the checks. A workflow is disposable orchestration code; you can read it, and you should skim it before a big run the way you'd skim a plan in plan mode (module 11).
5. **The decision table** (render in lesson):

   | You need… | Reach for |
   |---|---|
   | A reusable procedure or reference Claude should load on demand | Skill (module 09) |
   | One messy exploration whose details shouldn't enter your context | Subagent (module 11) |
   | Large fan-out with coordination — many subagents, batching, retries, progress | Ultracode workflow script |
   | Ongoing collaboration between long-lived agents with different roles | Agent team |
6. **Honest note:** the sandbox can't demonstrate a 300-agent fan-out; this lesson is conceptual. The instinct to build — "should this be a conversation or a program?" — is the takeaway. Anchor: `<Exercise id="quiz-ultracode" />`.

### Exercises
```json
[
  {
    "type": "quiz",
    "id": "quiz-ultracode",
    "title": "Quiz: Ultracode & Workflows",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-what",
        "kind": "single",
        "prompt": "What changes when you invoke ultracode (the keyword, or /effort ultracode)?",
        "options": [
          { "id": "a", "text": "Claude switches to a bigger model with a larger context window" },
          { "id": "b", "text": "Claude writes a JS orchestration script that spawns and coordinates subagents, instead of doing the whole task turn by turn in the conversation" },
          { "id": "c", "text": "Claude skips the permission system for speed" },
          { "id": "d", "text": "Claude answers with more detailed prose" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Ultracode is a strategy shift, not a model swap: the task becomes a program. The script fans out subagents (up to ~1000 per workflow, ~16 concurrent), handles retries, and reports conclusions."
      },
      {
        "id": "q2-why-script",
        "kind": "single",
        "prompt": "Why is a script coordinating 300 subagents better than the main session dispatching them from chat?",
        "options": [
          { "id": "a", "text": "Scripts run subagents on faster hardware" },
          { "id": "b", "text": "The plan — queues, progress, retries — lives in code costing zero attention, and the context receives only conclusions; chat-based dispatch would drown the session in status updates" },
          { "id": "c", "text": "Subagents refuse instructions that come from chat" },
          { "id": "d", "text": "It avoids paying for the subagents' tokens" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Module 10's lesson, compounded: every dispatch and status line in chat spends attention budget. In a script, coordination state is just variables — and only the final summary enters context."
      },
      {
        "id": "q3-decision",
        "kind": "multi",
        "prompt": "Which matches are right, per the lesson's decision table? (select all that apply)",
        "options": [
          { "id": "a", "text": "Reusable on-demand procedure → skill" },
          { "id": "b", "text": "One messy search, details kept out of context → subagent" },
          { "id": "c", "text": "Long-lived agents in distinct roles collaborating → agent team" },
          { "id": "d", "text": "Any task with more than one step → ultracode workflow" }
        ],
        "correctOptionIds": ["a", "b", "c"],
        "explanation": "Workflows earn their machinery at coordination scale — fan-out, batching, retries. A three-step task (d) needs no orchestration script; reaching for one is overhead, not leverage."
      }
    ]
  }
]
```

---

## Lesson 4: `04-remote-claude` — Remote Claude: Three Tiers

Frontmatter: minutes 10; objectives: name the three tiers (local CLI, Claude Code on the web, Remote Control); state where each runs and what it can see; explain what --resume carries across contexts. **CONCEPT-ONLY — quiz, no terminal** (the sandbox cannot pair devices or reach the cloud tier).

### Narrative beats

1. **Tier 1: local CLI.** Everything so far: `claude` in your terminal, working on YOUR files, with your permission settings. Full power, zero distance — you must be at the machine.
2. **Tier 2: Claude Code on the web.** Sessions run on Anthropic's cloud infrastructure against a FRESH CLONE of your connected repo — not your working tree. Start a task from a browser tab, close the laptop, come back to a proposed change. The fresh-clone detail matters: uncommitted local changes don't exist there; work lands as branches/PRs, not edits to your disk.
3. **Tier 3: Remote Control.** `/remote-control` in a LOCAL session generates a pairing QR code / link; from a browser or your phone you attach to that very session — same working tree, same context, your machine does the work while you steer from the sofa or the train. Distance for your hands, not for the session.
4. **The connective tissue: `--resume`.** Sessions are addressable and portable (module 09 taught local resume). In current versions you can resume across surfaces — pick up in the CLI a session you started elsewhere. The session (context, decisions, progress) is the durable thing; the surface is just a window onto it.
5. **Choosing:** local for your uncommitted mess and full tooling; web for fire-and-forget tasks on committed code; remote control for "my machine, my session, but I'm not at the desk." Callout (info): mark clearly that this lesson is conceptual — practice happens on your own machine and account. Anchor: `<Exercise id="quiz-remote-tiers" />`.

### Exercises
```json
[
  {
    "type": "quiz",
    "id": "quiz-remote-tiers",
    "title": "Quiz: Remote Claude",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-web-clone",
        "kind": "single",
        "prompt": "You start a task in Claude Code on the web. What code does it work on?",
        "options": [
          { "id": "a", "text": "Your laptop's working tree, streamed to the cloud" },
          { "id": "b", "text": "A fresh clone of your connected repo in Anthropic's cloud — your uncommitted local changes are not there" },
          { "id": "c", "text": "A cached copy from your last local session" },
          { "id": "d", "text": "It can't touch code; the web tier is chat only" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "The web tier runs on cloud infrastructure against a fresh clone. That's what makes machine-off work possible — and why uncommitted local changes are invisible to it; results come back as branches or PRs."
      },
      {
        "id": "q2-remote-control",
        "kind": "single",
        "prompt": "What does /remote-control do?",
        "options": [
          { "id": "a", "text": "Moves your session to Anthropic's cloud" },
          { "id": "b", "text": "Lets Claude control your mouse and keyboard" },
          { "id": "c", "text": "Generates a QR pairing code so a browser or phone can attach to your RUNNING LOCAL session — same working tree, steered from another device" },
          { "id": "d", "text": "Creates a read-only share link of the transcript" }
        ],
        "correctOptionIds": ["c"],
        "explanation": "Remote Control relocates your hands, not the session: the work still happens on your machine against your files. Cloud execution (a) is the separate web tier."
      },
      {
        "id": "q3-resume",
        "kind": "single",
        "prompt": "What does --resume carry forward when you pick a session back up?",
        "options": [
          { "id": "a", "text": "Only the last message" },
          { "id": "b", "text": "The session's accumulated context — conversation, decisions, progress — so you continue where it left off instead of starting cold" },
          { "id": "c", "text": "Your shell environment variables" },
          { "id": "d", "text": "Nothing; it just reopens an empty window with the same title" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "The session is the durable artifact; surfaces (CLI, web, phone) are windows onto it. Resuming restores its context — which is also why module 10's hygiene matters: you resume the rot along with the progress."
      }
    ]
  }
]
```

---

## Lesson 5: `05-claude-in-your-repos` — Claude in Your Repos & the Ecosystem

Frontmatter: minutes 12; objectives: describe @claude GitHub mentions, Actions integration, and automatic PR review; recognize headless `claude -p` as the universal automation building block (including under this app); place third-party frameworks like OpenClaw in the ecosystem. CONCEPT + QUIZ ONLY.

### Narrative beats

1. **Claude where the work already lives.** Instead of bringing the repo to Claude, install Claude in the repo. With the GitHub integration, typing `@claude fix the flaky date test` in an issue or PR comment kicks off a Claude session inside GitHub Actions: it clones, works on a branch, and pushes commits or opens a PR — reviewable like any teammate's work.
2. **Automatic PR review.** The same integration can review every PR unprompted: reading the diff, flagging bugs, suggesting simplifications. Position it honestly: a tireless first-pass reviewer that raises the floor; humans still own the merge button (module 11's lesson — parallelism multiplies review load, never deletes it).
3. **The building block under everything: `claude -p`.** Every integration in this module is, at bottom, module 09's headless mode wearing a costume: a prompt in, tools within permissions, output back. Actions runs it in CI; schedulers run it on timers. Meta-reveal (Callout, info): THIS APP's terminal is exactly that — every exercise you've run was `claude -p` in a sandbox. You've been using the automation building block all along.
4. **The third-party ecosystem.** Because the building block is a CLI, anyone can build on it. Survey honestly: open-source frameworks wrap Claude (and other models) into standing agents. Example: **OpenClaw** — a multi-channel agent gateway that connects a persistent agent to chat channels (WhatsApp, Telegram, and the like) and gives it a persona through files like SOUL.md, IDENTITY.md, and HEARTBEAT.md (its counterpart to CLAUDE.md-style memory: who the agent is, how it behaves, what it does on a schedule). State PLAINLY: OpenClaw is a third-party project, NOT an Anthropic product — evaluate its security and trust model yourself before handing it credentials.
5. **Closing the module.** The autonomy ladder you've climbed: turn-by-turn → goal-driven → scheduled → cloud → embedded in repos and channels. Every rung is the same agent loop from module 05, with more trust and less babysitting. Module 14's capstone hands you the keys. Anchor: `<Exercise id="quiz-ecosystem" />`.

### Exercises
```json
[
  {
    "type": "quiz",
    "id": "quiz-ecosystem",
    "title": "Quiz: Repos & the Ecosystem",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-mention",
        "kind": "single",
        "prompt": "What happens when you comment '@claude fix the failing date test' on a GitHub issue (with the integration installed)?",
        "options": [
          { "id": "a", "text": "Claude replies with advice but cannot touch code" },
          { "id": "b", "text": "A Claude session runs inside GitHub Actions: it clones the repo, works on a branch, and pushes commits or opens a PR for review" },
          { "id": "c", "text": "Claude edits the default branch directly with no review step" },
          { "id": "d", "text": "It opens Claude Code on your laptop" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "The mention triggers a real working session in CI. Crucially the output is a branch/PR — reviewable, revertable — not silent direct pushes to main (c)."
      },
      {
        "id": "q2-building-block",
        "kind": "single",
        "prompt": "Why does the lesson call headless claude -p 'the building block' of all these integrations?",
        "options": [
          { "id": "a", "text": "Because -p makes the model smarter" },
          { "id": "b", "text": "Because every integration — Actions, schedulers, this very app's terminal — is ultimately a script invoking Claude non-interactively with a prompt, scoped tools, and captured output" },
          { "id": "c", "text": "Because headless mode is the only free tier" },
          { "id": "d", "text": "Because -p disables permissions, which automation requires" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "One primitive, many costumes: prompt in, permitted tools, output back. Permissions still apply fully (d is exactly wrong — automation makes scoped permissions MORE important, not less)."
      },
      {
        "id": "q3-openclaw",
        "kind": "single",
        "prompt": "Which statement about OpenClaw is accurate?",
        "options": [
          { "id": "a", "text": "It is Anthropic's official mobile client for Claude Code" },
          { "id": "b", "text": "It is a third-party multi-channel agent gateway — a persistent agent reachable through chat channels, configured with persona files like SOUL.md, IDENTITY.md, and HEARTBEAT.md — and not an Anthropic product" },
          { "id": "c", "text": "It is a Claude model variant fine-tuned for messaging apps" },
          { "id": "d", "text": "It is the protocol underlying MCP" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "OpenClaw sits in the third-party ecosystem built ON the building block: a standing agent with file-based persona and schedule config. Because it isn't Anthropic's, its security and trust model is yours to vet before granting credentials."
      }
    ]
  }
]
```

---

## Sandbox templates

### `sandbox/templates/m12-goal-lab/` (used by both lesson-1 exercises)

Intended bugs (state nowhere in the files themselves — Claude must find them via the tests): `subtract` returns `b - a` (reversed operands) and `multiply` returns `a + b` (wrong operator). `add` and `divide` are correct.

**`calc.js`**
```js
// calc.js — a tiny calculator library.
function add(a, b) { return a + b; }
function subtract(a, b) { return b - a; }
function multiply(a, b) { return a + b; }
function divide(a, b) {
  if (b === 0) throw new Error("division by zero");
  return a / b;
}
module.exports = { add, subtract, multiply, divide };
```

**`test.js`**
```js
// test.js — the spec. Do not modify this file; fix calc.js instead.
const { add, subtract, multiply, divide } = require("./calc.js");

const cases = [
  ["add(2, 3) === 5", () => add(2, 3) === 5],
  ["add(-1, 1) === 0", () => add(-1, 1) === 0],
  ["subtract(10, 4) === 6", () => subtract(10, 4) === 6],
  ["subtract(3, 5) === -2", () => subtract(3, 5) === -2],
  ["multiply(3, 4) === 12", () => multiply(3, 4) === 12],
  ["multiply(6, 0) === 0", () => multiply(6, 0) === 0],
  ["divide(12, 3) === 4", () => divide(12, 3) === 4],
];

let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  try { ok = fn(); } catch { ok = false; }
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed++;
}
if (failed > 0) {
  console.log(`${failed} case(s) failing`);
  process.exit(1);
}
console.log("All cases passing");
```

**`README.md`**
```markdown
# goal-lab
A tiny calculator with failing tests. Run them with `node test.js`.
Fix calc.js until every case prints PASS. test.js is the spec — never edit it.
```

## Verifiers to implement

- **`m12-goal-tests-pass`** (in `src/lib/verifiers/m12-autonomous-remote-claude.ts`): two criteria, in exercise-criteria order.
  1. **"node test.js exits with code 0"** — `const { stdout, exitCode } = await runNode(dir, "test.js")`; pass iff `exitCode === 0`. Detail on failure: report the exit code and the last few stdout lines.
  2. **"Test output contains no FAIL lines"** — pass iff `!/^FAIL /m.test(stdout)`. Detail on failure: list the FAIL lines found.
  Pristine template: exit 1 with four FAIL lines (both subtract cases, both multiply cases) → both criteria FAIL. Correct solution (subtract fixed to `a - b`, multiply to `a * b`): exit 0, seven PASS lines, no FAIL → both PASS. `pass` = both criteria pass.

## Tone & vocabulary

- Voice: practitioner-to-practitioner; the through-line is the autonomy ladder ("same agent loop, more trust, less babysitting"). Callbacks are load-bearing: Stop hooks and headless -p (09), attention budget/rot/isolation (10), subagents/plan mode/review-load (11).
- May introduce (define on first use): goal condition, judge model, /goal, /loop, scheduled task, Cloud Routine, /schedule, ultracode, orchestration script, workflow, agent team, Claude Code on the web, Remote Control, /remote-control, pairing, @claude mention, agent gateway, persona files.
- Assumed: subagent, delegation brief, MCP, plan mode, worktree, headless mode, hooks, skills, context rot, attention budget.
- Honesty rules: lessons 2-5 are concept-only — say so plainly. Hedge fast-moving specifics (exact concurrency limits, slash-command names, min intervals) with "in current versions". OpenClaw must ALWAYS carry the "not an Anthropic product" disclaimer.

## Done checklist

- [ ] `module.json` matches; curriculum entry `12-autonomous-remote-claude` flipped to `built`.
- [ ] 5 lessons; anchors exactly: term-goal-session, challenge-goal-tests, quiz-loop-schedules, quiz-ultracode, quiz-remote-tiers, quiz-ecosystem.
- [ ] `m12-goal-lab` template byte-matches this spec (two intended bugs, no BUG comments in the files).
- [ ] Verifier `m12-goal-tests-pass` registered; fails on pristine template, passes after fixing subtract and multiply.
- [ ] Comparison table (lesson 2) and decision table (lesson 3) render in the lessons.
- [ ] `npm run validate` passes; challenge smoke-tested end-to-end.
