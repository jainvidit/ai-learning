# Module Spec: 11-agentic-claude-code

## Meta

- **id:** `11-agentic-claude-code`
- **title:** Agentic Claude Code
- **track:** `claude-code`
- **requires:** `["09-claude-code-power-tools", "10-context-engineering"]`
- **minutes:** ~50 total (4 lessons: 14 + 12 + 12 + 12)

`module.json`:

```json
{
  "id": "11-agentic-claude-code",
  "title": "Agentic Claude Code",
  "track": "claude-code",
  "description": "Put context isolation to work. Delegate searches to subagents, connect Claude to the outside world with MCP servers, use plan mode to think before touching code, and run parallel agents in git worktrees without them stepping on each other.",
  "lessons": [
    { "id": "01-subagents", "title": "Subagents: Delegate the Mess" },
    { "id": "02-mcp-servers", "title": "MCP: Plugging In the World" },
    { "id": "03-plan-mode", "title": "Plan Mode: Think First" },
    { "id": "04-parallel-agents-worktrees", "title": "Parallel Agents & Worktrees" }
  ]
}
```

## Audience state

Learner finished 1-10: power terminal user, knows skills/hooks/headless/permissions, and — critically — just finished context engineering, so they understand WHY isolation matters. This module shows the machinery that delivers it.

## Learning objectives

1. Use the Task/Agent tool concept: when to delegate, how to brief a subagent, what to expect back.
2. Run a real delegated search in the sandbox and observe conclusions-not-dumps.
3. Explain what an MCP server is, what it provides (tools/resources), and how one gets installed and trusted.
4. Describe plan mode: read-only exploration producing an approvable plan before any edit.
5. Explain parallel agents and why git worktrees prevent them from colliding.

---

## Lesson 1: `01-subagents` — Subagents: Delegate the Mess

Frontmatter: minutes 14; objectives: know the Task/Agent tool exists as a TOOL in Claude's toolkit; write a good delegation brief; recognize good vs bad delegation; observe a real delegated search.

### Narrative beats

1. **From principle to button.** Module 10 L5 taught WHY isolation works. In Claude Code, it's literally a tool: alongside Read and Bash, Claude has an Agent (Task) tool that spawns a fresh Claude with its own empty context, given a prompt, returning only its final message.
2. **What a good brief looks like.** Same rules as briefing a contractor: the question, the scope ("search src/, ignore tests"), and the return contract ("report the file paths and a one-paragraph conclusion — do not paste file contents"). Show one good and one bad brief side by side.
3. **When Claude delegates on its own.** For broad searches, Claude Code often reaches for a subagent unprompted. You can also ask explicitly: "use a subagent to find...". Steering delegation is part of directing the tool.
4. **Costs and limits.** A subagent is a full model session: it costs tokens and time, can't ask you questions mid-flight, and starts with none of your conversation context — everything it needs must be in the brief. Delegation is for exploration breadth, not for one known file.
5. **Terminal exercise** to watch it happen for real.

Anchors: `<Exercise id="quiz-subagents" />`, `<Exercise id="term-delegate-search" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-subagents",
    "title": "Quiz: Subagents",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-what",
        "kind": "single",
        "prompt": "In Claude Code, what IS a subagent?",
        "options": [
          { "id": "a", "text": "A second human reviewer" },
          { "id": "b", "text": "A fresh Claude session spawned via the Agent/Task tool, with its own empty context, that runs a brief and returns only its final message" },
          { "id": "c", "text": "A cached copy of earlier answers" },
          { "id": "d", "text": "A smaller model that only reads files" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Delegation is a tool call like any other: the main agent writes a brief, a separate session executes it in isolation, and only the conclusion crosses back into the main context."
      },
      {
        "id": "q2-brief",
        "kind": "single",
        "prompt": "Which delegation brief is best for finding where a repo handles authentication?",
        "options": [
          { "id": "a", "text": "'Look around the repo and tell me everything interesting.'" },
          { "id": "b", "text": "'Find where user authentication is implemented. Search src/ (skip tests). Return the key file paths and a one-paragraph summary of the flow — do not paste whole files.'" },
          { "id": "c", "text": "'Paste the contents of every file mentioning auth.'" },
          { "id": "d", "text": "'Fix the authentication bug.' (with no other context)" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "A good brief has a precise question, a scope, and a return contract that forbids dumps. Option c imports the pollution you delegated to avoid; a and d are unscoped."
      },
      {
        "id": "q3-blank-slate",
        "kind": "single",
        "prompt": "You've been discussing a bug for ten minutes, then delegate: 'use a subagent to find the function we talked about.' Why will this likely fail?",
        "options": [
          { "id": "a", "text": "Subagents can't search for functions" },
          { "id": "b", "text": "The subagent starts with an empty context — it never saw your conversation, so 'the function we talked about' means nothing to it" },
          { "id": "c", "text": "Subagents only run at night" },
          { "id": "d", "text": "It will succeed; subagents share the main context" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Isolation cuts both ways: no pollution in, no shared memory either. Every fact the subagent needs must be written into the brief itself."
      },
      {
        "id": "q4-when",
        "kind": "multi",
        "prompt": "Which tasks are worth delegating to a subagent? (select all that apply)",
        "options": [
          { "id": "a", "text": "Sweep all of src/ to map how errors are logged" },
          { "id": "b", "text": "Read the 15-line config file at a known path" },
          { "id": "c", "text": "Investigate three plausible causes of a bug in parallel, one subagent each" },
          { "id": "d", "text": "Survey how each of a repo's five services does input validation" }
        ],
        "correctOptionIds": ["a", "c", "d"],
        "explanation": "Delegate breadth (sweeps, surveys, parallel hypotheses). A single small known file (b) is cheaper to just read — delegation overhead would exceed the pollution saved."
      }
    ]
  },
  {
    "type": "terminal",
    "id": "term-delegate-search",
    "title": "Terminal: Delegate a Search",
    "instructions": "This sandbox is a mini codebase with several files. Ask Claude to use a subagent for a sweep: 'Use a subagent to find every file that defines or throws a custom error class. Have it report just the file paths and class names — no file contents.' Watch the tool badges: you should see the Agent/Task tool appear, then a pause while the subagent works, then a compact summary. Follow up with: 'How much of those files did YOU read directly?' — the honest answer is little or none. That's isolation working.",
    "sandboxTemplate": "m11-mini-repo",
    "allowedTools": "Read,Glob,Grep,Agent",
    "maxTurns": 12,
    "suggestedPrompts": [
      "Use a subagent to find every file that defines or throws a custom error class. Have it report just the file paths and class names — no file contents.",
      "How much of those files did YOU read directly, versus what the subagent told you?"
    ]
  }
]
```

Builder note: confirm the Agent tool's exact name in `--allowedTools` against the installed CLI (it may be `Task` in some versions); if delegation is unavailable headlessly, keep the exercise but soften instructions to "ask Claude to search; if it can delegate, watch for the Agent badge."

---

## Lesson 2: `02-mcp-servers` — MCP: Plugging In the World

Frontmatter: minutes 12; objectives: define MCP (Model Context Protocol); understand servers expose tools/resources to any MCP client; know install/trust flow conceptually; reason about MCP risks. CONCEPT + QUIZ ONLY — the sandbox can't install servers.

### Narrative beats

1. **The gap.** Claude Code's built-in tools end at your filesystem and shell. What about your Postgres database, browser, Slack, or issue tracker? Writing custom integrations for every tool x every AI app = combinatorial explosion.
2. **MCP defined.** An open protocol: a SERVER exposes tools (and resources/prompts) in a standard format; any CLIENT (Claude Code, other apps) can connect. USB analogy: one port standard, any device. A Postgres MCP server gives Claude a `query` tool; a browser server gives it navigation tools.
3. **How installation works (conceptually).** You register a server with Claude Code (e.g., via `claude mcp add ...` or config), it runs as a separate process, and its tools appear in Claude's toolkit alongside Read/Bash — subject to the SAME permission system. Note clearly: the sandbox here can't install servers, so this stays conceptual.
4. **Trust.** An MCP server is code running with real access (your DB! your browser!). Install servers you trust, scope their credentials read-only where possible, and remember tool RESULTS from the world can carry prompt injection (foreshadow module 13's injection lesson).
5. **Context cost.** Every connected server's tool definitions ride along in context — another attention-budget line item. Connect what you need, not everything you can.

Anchor: `<Exercise id="quiz-mcp" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-mcp",
    "title": "Quiz: MCP Servers",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-what",
        "kind": "single",
        "prompt": "What is an MCP server?",
        "options": [
          { "id": "a", "text": "A cloud machine that hosts the Claude model" },
          { "id": "b", "text": "A program that exposes tools and resources through a standard protocol, so AI clients like Claude Code can use them" },
          { "id": "c", "text": "A faster alternative to the Bash tool" },
          { "id": "d", "text": "A database Anthropic maintains of approved prompts" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "MCP (Model Context Protocol) is the USB of AI integrations: build a server once — say for Postgres or a browser — and any MCP client can plug into it."
      },
      {
        "id": "q2-why-protocol",
        "kind": "single",
        "prompt": "What problem does a STANDARD protocol solve here?",
        "options": [
          { "id": "a", "text": "It makes models generate text faster" },
          { "id": "b", "text": "Without it, every AI app would need a custom integration for every external tool — MCP means one server works with every client" },
          { "id": "c", "text": "It encrypts all model traffic" },
          { "id": "d", "text": "It removes the need for permissions" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "N apps x M tools becomes N + M: tool builders write one MCP server; app builders write one MCP client. Same reason USB beat proprietary connectors."
      },
      {
        "id": "q3-appears-as",
        "kind": "single",
        "prompt": "After you add a Postgres MCP server to Claude Code, how does Claude use it?",
        "options": [
          { "id": "a", "text": "The server's tools (e.g., a query tool) join Claude's toolkit and are called through the same agent loop and permission system as built-in tools" },
          { "id": "b", "text": "Claude gains raw shell access to the database machine" },
          { "id": "c", "text": "The entire database is loaded into the context window" },
          { "id": "d", "text": "Claude emails queries to the server's maintainer" }
        ],
        "correctOptionIds": ["a"],
        "explanation": "MCP tools are just more tools: the model requests a call, the server executes, results come back into context — with permissions applying exactly as they do to Bash or Edit."
      },
      {
        "id": "q4-risks",
        "kind": "multi",
        "prompt": "Which are sensible cautions with MCP servers? (select all that apply)",
        "options": [
          { "id": "a", "text": "Only install servers from sources you trust — they run real code with real access" },
          { "id": "b", "text": "Give servers the least credentials that work, e.g., a read-only database user" },
          { "id": "c", "text": "Connect every server you can find, to maximize capability" },
          { "id": "d", "text": "Remember that data returned by tools (web pages, tickets) can contain injected instructions" }
        ],
        "correctOptionIds": ["a", "b", "d"],
        "explanation": "MCP extends both capability and attack surface. Least privilege, trusted sources, and injection awareness apply. And every connected server's tool definitions spend context — connect what you need (c is the anti-pattern)."
      }
    ]
  }
]
```

---

## Lesson 3: `03-plan-mode` — Plan Mode: Think First

Frontmatter: minutes 12; objectives: describe plan mode (read-only research → written plan → your approval → execution); know when to use it; connect it to context and safety benefits.

### Narrative beats

1. **The failure mode it prevents.** Ask for a risky refactor and an eager agent starts editing file 1 before understanding file 7. Plan mode makes Claude research first, WITHOUT write access: it reads, searches, and produces a plan you approve before any edit happens.
2. **The flow.** Enter plan mode (interactive: Shift+Tab cycles modes) → Claude explores read-only → presents a step plan → you approve, adjust, or reject → only then does it execute. It's a permission stance plus a thinking discipline in one.
3. **When to use it.** Multi-file changes, unfamiliar codebases, destructive operations, anything where "wrong direction" costs more than the planning overhead. Skip for one-line fixes.
4. **Context connection.** Planning first also produces better context: the plan itself is a compact summary of the exploration — the plan survives, the exploration can be discarded. (Same shape as the handoff note from module 10.)
5. **Terminal taste.** True plan mode is interactive, but the discipline works headlessly: give Claude read-only tools and ask for a plan — which is exactly what the exercise does.

Anchors: `<Exercise id="quiz-plan-mode" />`, `<Exercise id="term-plan-first" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-plan-mode",
    "title": "Quiz: Plan Mode",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-what",
        "kind": "single",
        "prompt": "What does plan mode change about how Claude Code works?",
        "options": [
          { "id": "a", "text": "It makes Claude respond faster by skipping analysis" },
          { "id": "b", "text": "Claude explores read-only and must present a plan for your approval before making any changes" },
          { "id": "c", "text": "It disables all tools including reading" },
          { "id": "d", "text": "It automatically approves all edits" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Plan mode separates research from execution: read and think freely, change nothing, get sign-off on the approach first."
      },
      {
        "id": "q2-when",
        "kind": "single",
        "prompt": "Which task most deserves plan mode?",
        "options": [
          { "id": "a", "text": "Fixing an obvious typo in a README" },
          { "id": "b", "text": "Renaming a function used in one file" },
          { "id": "c", "text": "Restructuring how authentication flows through a 40-file codebase you don't know well" },
          { "id": "d", "text": "Asking what a regex does" }
        ],
        "correctOptionIds": ["c"],
        "explanation": "Plan mode earns its overhead when changes are broad, the codebase is unfamiliar, or a wrong start is expensive. Trivial edits don't need a signed plan."
      },
      {
        "id": "q3-context",
        "kind": "multi",
        "prompt": "Beyond safety, what does plan-first working buy you? (select all that apply)",
        "options": [
          { "id": "a", "text": "The plan is a compact artifact — you can carry it into a fresh session and discard the messy exploration" },
          { "id": "b", "text": "You catch a wrong approach at the cheapest possible moment: before any code changed" },
          { "id": "c", "text": "It guarantees the plan will execute without bugs" },
          { "id": "d", "text": "You can edit the plan to steer execution before it starts" }
        ],
        "correctOptionIds": ["a", "b", "d"],
        "explanation": "A plan is both a safety gate and a context artifact — the summarize-then-restart pattern built into the workflow. No guarantee of bug-free execution, though (c)."
      }
    ]
  },
  {
    "type": "terminal",
    "id": "term-plan-first",
    "title": "Terminal: Read-Only Planning",
    "instructions": "Claude has NO write tools here — a plan-mode stance enforced by permissions. The project has a deliberately tangled utils.js where three functions duplicate date-formatting logic. Ask: 'Study this project and write a step-by-step plan to remove the duplicated date logic, without changing any files. Number the steps, list which files each touches, and flag any risks.' Review the plan like a tech lead: is the order right? Did it miss the usage in report.js? Push back with a follow-up if so — refining a plan is the point of planning.",
    "sandboxTemplate": "m11-mini-repo",
    "allowedTools": "Read,Glob,Grep",
    "maxTurns": 8,
    "suggestedPrompts": [
      "Study this project and write a step-by-step plan to remove the duplicated date-formatting logic without changing any files. Number the steps, list which files each touches, and flag risks.",
      "Your plan misses at least one caller. Re-check report.js and revise the plan."
    ]
  }
]
```

---

## Lesson 4: `04-parallel-agents-worktrees` — Parallel Agents & Worktrees

Frontmatter: minutes 12; objectives: explain why parallel agents collide in one directory; describe git worktrees (multiple checkouts, one repo); outline a fan-out workflow; know merge/review remains a human-led step. Quiz-only (sandboxes are per-lesson; no git parallelism available).

### Narrative beats

1. **Scaling up.** One agent, one task is yesterday's workflow. Real leverage: three agents on three independent tasks simultaneously. But in one directory they'd overwrite each other's edits and cross-contaminate test runs.
2. **Worktrees.** `git worktree add ../feature-x branch-x` gives each agent its OWN full checkout backed by the same repo — separate files, separate branch, shared history. Isolation for the filesystem, just as subagent contexts are isolation for attention.
3. **The fan-out pattern.** Split work into independent chunks → spawn an agent per worktree → each works and commits on its branch → you review and merge. Independence is the hard part: two agents touching the same file = merge pain; design the split so they don't.
4. **The human role.** Parallelism multiplies output AND review load. Merging, resolving conflicts, and quality control stay with you. (Module 12 pushes autonomy further with goals and remote execution.)
5. **Note honestly:** this app's sandboxes are single-directory, so this lesson is conceptual; on your own machine, tools and harnesses (including Claude Code's own worktree isolation for subagents) make this routine.

Anchor: `<Exercise id="quiz-worktrees" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-worktrees",
    "title": "Quiz: Parallel Agents & Worktrees",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-collision",
        "kind": "single",
        "prompt": "Why can't two agents safely work on different features in the SAME checkout at the same time?",
        "options": [
          { "id": "a", "text": "Git forbids two processes in one directory" },
          { "id": "b", "text": "They share the same working files — edits collide, and one agent's half-done changes contaminate the other's builds and tests" },
          { "id": "c", "text": "Two agents would double the API cost" },
          { "id": "d", "text": "They can — files are locked automatically" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "A working directory is shared mutable state. Agent A's in-progress edits sit in Agent B's view of the world; tests, builds, and edits interleave chaotically."
      },
      {
        "id": "q2-worktree",
        "kind": "single",
        "prompt": "What does `git worktree add` give you?",
        "options": [
          { "id": "a", "text": "A full second copy of the repository history on another disk" },
          { "id": "b", "text": "An additional working directory with its own checked-out branch, backed by the same repository" },
          { "id": "c", "text": "A read-only snapshot for backups" },
          { "id": "d", "text": "A new remote on GitHub" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Worktrees are extra checkouts of one repo: each has its own files and branch, sharing the underlying history. One agent per worktree = filesystem isolation without cloning."
      },
      {
        "id": "q3-split",
        "kind": "single",
        "prompt": "You're fanning three agents out over a codebase. Which task split is best?",
        "options": [
          { "id": "a", "text": "All three refactor the same core module from different angles" },
          { "id": "b", "text": "Independent chunks: one takes the API layer, one the UI components, one the test suite — minimal shared files" },
          { "id": "c", "text": "Each rewrites the whole app; keep the best" },
          { "id": "d", "text": "One works while two watch for mistakes" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Parallel speedup depends on independence. Overlapping edits (a) reconverge as merge conflicts; triplicating everything (c) triples cost for one output."
      },
      {
        "id": "q4-human",
        "kind": "multi",
        "prompt": "What remains YOUR job when running parallel agents? (select all that apply)",
        "options": [
          { "id": "a", "text": "Designing the split so tasks don't overlap" },
          { "id": "b", "text": "Reviewing each branch before merging" },
          { "id": "c", "text": "Resolving conflicts when isolation wasn't perfect" },
          { "id": "d", "text": "Nothing — parallel agents manage and merge themselves" }
        ],
        "correctOptionIds": ["a", "b", "c"],
        "explanation": "Parallelism multiplies output and review load together. Task design, review, and merging are the human bottleneck — and the quality gate."
      }
    ]
  }
]
```

---

## Sandbox templates

One template serves lessons 1 and 3.

### `sandbox/templates/m11-mini-repo/`

**`README.md`**
```markdown
# shipmate
A tiny order-tracking library. No build step; run node directly.
```

**`orders.js`**
```js
const { formatDate } = require("./utils.js");

class OrderNotFoundError extends Error {}

const orders = new Map();

function placeOrder(id, item) {
  orders.set(id, { id, item, placedAt: new Date("2026-01-15T10:00:00Z") });
}

function getOrder(id) {
  const order = orders.get(id);
  if (!order) throw new OrderNotFoundError(`No order ${id}`);
  return { ...order, placedLabel: formatDate(order.placedAt) };
}

module.exports = { placeOrder, getOrder, OrderNotFoundError };
```

**`utils.js`**
```js
// Utility grab-bag. NOTE: date formatting is duplicated three ways below.
function formatDate(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function shipmentLabel(d) {
  // duplicate #2 of the same formatting idea
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `Ships ${y}-${m}-${day}`;
}

function auditStamp(d) {
  // duplicate #3, slightly different again
  return "[" + d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate() + "]";
}

class ValidationError extends Error {}

function requireString(value, name) {
  if (typeof value !== "string") throw new ValidationError(`${name} must be a string`);
  return value;
}

module.exports = { formatDate, shipmentLabel, auditStamp, ValidationError, requireString };
```

**`report.js`**
```js
const { auditStamp } = require("./utils.js");
const { getOrder } = require("./orders.js");

class ReportError extends Error {}

function dailyReport(ids) {
  try {
    return ids.map((id) => `${auditStamp(new Date())} ${getOrder(id).item}`).join("\n");
  } catch (err) {
    throw new ReportError(`Report failed: ${err.message}`);
  }
}

module.exports = { dailyReport, ReportError };
```

Design notes: three custom error classes across three files (OrderNotFoundError, ValidationError, ReportError) give the lesson-1 subagent sweep a countable answer; the triplicated date logic plus the `auditStamp` usage in report.js gives lesson 3's plan exercise a discoverable gotcha.

## Verifiers to implement

None — terminal + quiz module, no challenges.

## Tone & vocabulary

- Voice: practitioner-to-practitioner; every lesson ties back to module 10's principles ("this is isolation for X"). Be honest about sandbox limits: MCP and worktrees lessons say plainly they're conceptual here.
- Terms: subagent, Task/Agent tool, delegation brief, return contract, MCP, Model Context Protocol, server/client, tool definitions, plan mode, read-only exploration, git worktree, fan-out, merge/review.
- Do not overstate CLI specifics that may drift (exact mode-toggle keys, exact `claude mcp` syntax) — describe capabilities, and hedge UI details with "in current versions".

## Done checklist

- [ ] `module.json` matches; curriculum entry `11-agentic-claude-code` flipped to `built`.
- [ ] 4 lessons; anchors: quiz-subagents, term-delegate-search, quiz-mcp, quiz-plan-mode, term-plan-first, quiz-worktrees.
- [ ] `m11-mini-repo` template matches spec byte-for-byte (3 error classes, 3 date duplications, report.js caller).
- [ ] Verified the Agent/Task tool name works in `--allowedTools` with the installed CLI; adjusted the string in term-delegate-search if needed.
- [ ] `npm run validate` passes.
