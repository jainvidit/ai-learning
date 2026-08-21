# Module Spec: 09-claude-code-power-tools

## Meta

- **id:** `09-claude-code-power-tools`
- **title:** Claude Code Power Tools
- **track:** `claude-code`
- **requires:** `["07-claude-code-workflows"]`
- **minutes:** ~58 total (5 lessons: 12 + 12 + 12 + 12 + 10)

`module.json`:

```json
{
  "id": "09-claude-code-power-tools",
  "title": "Claude Code Power Tools",
  "track": "claude-code",
  "description": "Level up from everyday use to power use: skills that load knowledge on demand, hooks that automate around events, headless mode that turns Claude Code into a building block — the exact mechanism running this app's terminal — and the permission system that keeps it all safe.",
  "lessons": [
    { "id": "01-skills", "title": "Skills: Knowledge on Demand" },
    { "id": "02-hooks", "title": "Hooks: Automation on Events" },
    { "id": "03-headless-mode", "title": "Headless Mode: How This App Works" },
    { "id": "04-permission-modes", "title": "Permission Modes & Allowed Tools" },
    { "id": "05-sandboxing-in-practice", "title": "Sandboxing in Practice" }
  ]
}
```

## Audience state

Learner finished 1-7: comfortable in this app's embedded terminal, has run real Claude Code sessions, knows CLAUDE.md, the permission prompt concept, and slash commands. They have NOT built skills/hooks or used headless flags.

## Learning objectives

1. Explain what a skill is, where it lives (`.claude/skills/<name>/SKILL.md`), and why trigger-based loading beats stuffing everything into CLAUDE.md.
2. Explain hooks: shell commands the harness (not Claude) runs on events like PreToolUse/PostToolUse/Stop.
3. Describe headless mode (`claude -p --output-format stream-json`) and trace how this very app streams a session into the browser.
4. Predict what `--allowedTools` will permit or deny, and choose sensible permission modes.
5. Observe real tool denials in a sandbox and adjust the task accordingly.

---

## Lesson 1: `01-skills` — Skills: Knowledge on Demand

Frontmatter: minutes 12; objectives: define a skill; know the SKILL.md layout; explain trigger-based loading; contrast with CLAUDE.md.

### Narrative beats

1. **The problem skills solve.** CLAUDE.md is loaded EVERY session, whether relevant or not. Deep instructions for occasional tasks (release process, chart styling, DB migrations) would bloat every session. (This plants the seed for module 10's progressive disclosure — say so explicitly: "hold this thought.")
2. **What a skill is.** A folder `.claude/skills/<name>/` with a `SKILL.md`: frontmatter (`name`, `description`) plus instructions. The description is the trigger: Claude sees only the one-line description in its context; when a task matches, it loads the full file. Knowledge on demand.
3. **Anatomy walkthrough.** Show a complete small example verbatim in the lesson:
   ```markdown
   ---
   name: release-notes
   description: Use when asked to write or update release notes for a version bump
   ---
   # Writing release notes
   1. Read CHANGELOG.md for unreleased entries.
   2. Group by Added/Fixed/Changed.
   3. Write in past tense, one line per change, no marketing language.
   ```
4. **When to make a skill vs CLAUDE.md.** CLAUDE.md: always-true facts about the project (build command, layout). Skill: procedures needed occasionally. Rule of thumb: "if it only matters for some tasks, make it a skill."
5. **Meta:** this course's authoring pipeline itself uses skills-style docs — an AUTHORING-GUIDE the agents load only when authoring.

Anchors: `<Exercise id="quiz-skills" />`, `<Exercise id="term-inspect-skill" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-skills",
    "title": "Quiz: Skills",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-what",
        "kind": "single",
        "prompt": "What is a Claude Code skill?",
        "options": [
          { "id": "a", "text": "A plugin written in Python that extends the CLI" },
          { "id": "b", "text": "A folder with a SKILL.md whose full instructions load only when the task matches its short description" },
          { "id": "c", "text": "A fine-tuned model specialized for one task" },
          { "id": "d", "text": "Another name for a slash command's source code" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "A skill is markdown instructions with a trigger description. Claude carries only the one-line description; the full body loads on demand — knowledge that costs almost nothing until needed."
      },
      {
        "id": "q2-vs-claudemd",
        "kind": "single",
        "prompt": "Your project has a 60-line database-migration procedure needed maybe once a month. Where should it live?",
        "options": [
          { "id": "a", "text": "CLAUDE.md, so it's always available" },
          { "id": "b", "text": "A skill — occasional procedures shouldn't be loaded into every single session" },
          { "id": "c", "text": "Pasted into each prompt when needed" },
          { "id": "d", "text": "A comment at the top of every source file" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "CLAUDE.md is for always-relevant facts; skills are for sometimes-relevant procedures. 60 lines in CLAUDE.md is 60 lines of context tax on every session, relevant or not."
      },
      {
        "id": "q3-trigger",
        "kind": "single",
        "prompt": "Which part of a skill determines WHEN Claude loads it?",
        "options": [
          { "id": "a", "text": "The folder name's alphabetical position" },
          { "id": "b", "text": "The description field in SKILL.md frontmatter — Claude matches the task against it" },
          { "id": "c", "text": "A cron schedule" },
          { "id": "d", "text": "The file size" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "The description is the trigger. Write it like an instruction to a future assistant: 'Use when asked to...'. Vague descriptions mean the skill never fires — or fires constantly."
      },
      {
        "id": "q4-benefit",
        "kind": "multi",
        "prompt": "Why is trigger-based loading better than putting everything in CLAUDE.md? (select all that apply)",
        "options": [
          { "id": "a", "text": "Sessions start with a smaller, cleaner context" },
          { "id": "b", "text": "Detailed procedures are available at full fidelity exactly when relevant" },
          { "id": "c", "text": "Skills run faster because they're compiled" },
          { "id": "d", "text": "Irrelevant instructions can't distract Claude on unrelated tasks" }
        ],
        "correctOptionIds": ["a", "b", "d"],
        "explanation": "It's progressive disclosure: a cheap index (descriptions) plus on-demand detail. Nothing is compiled — skills are just markdown. Module 10 turns this idea into a general context-engineering principle."
      }
    ]
  },
  {
    "type": "terminal",
    "id": "term-inspect-skill",
    "title": "Terminal: Explore and Improve a Skill",
    "instructions": "This sandbox is a tiny notes project that already has one skill installed. First, ask Claude what skills are available in this project and what the 'summarize-notes' skill does. Then ask it to USE the skill: 'Summarize my notes following the summarize-notes skill.' Watch it read the skill file, then apply the procedure to notes.md, writing summary.md. Compare the output to the skill's rules — did it follow them?",
    "sandboxTemplate": "m09-skill-demo",
    "allowedTools": "Read,Glob,Grep,Edit,Write",
    "maxTurns": 10,
    "suggestedPrompts": [
      "What skills exist in this project? Read .claude/skills and tell me what each does.",
      "Summarize my notes following the summarize-notes skill.",
      "Did summary.md follow every rule in the skill? Check and fix any violations."
    ]
  }
]
```

---

## Lesson 2: `02-hooks` — Hooks: Automation on Events

Frontmatter: minutes 12; objectives: define hooks; name key events (PreToolUse, PostToolUse, Stop); understand hooks run deterministically in the harness, not by the model's goodwill; read a hooks config.

### Narrative beats

1. **The reliability gap.** "Please always run the formatter after editing" in CLAUDE.md is a request — Claude usually complies, but 'usually' isn't 'always'. Hooks close the gap: the HARNESS runs your shell command on an event, every time, no model judgment involved.
2. **Events.** PreToolUse (before a tool runs — can block it), PostToolUse (after — e.g., format after edit), Stop (when Claude finishes responding), and others like SessionStart. Matchers narrow which tools trigger it (e.g., only `Edit|Write`).
3. **Config walkthrough.** Show a complete `.claude/settings.json` verbatim:
   ```json
   {
     "hooks": {
       "PostToolUse": [
         {
           "matcher": "Edit|Write",
           "hooks": [{ "type": "command", "command": "npx prettier --write ." }]
         }
       ]
     }
   }
   ```
4. **Prompts vs hooks decision rule.** If it must happen EVERY time X occurs → hook. If it needs judgment → instruction. (Foreshadow the capstone: they'll write one.)
5. **Safety note.** Hooks execute arbitrary shell commands with your permissions — review any hooks in a repo you didn't write.

Anchor: `<Exercise id="quiz-hooks" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-hooks",
    "title": "Quiz: Hooks",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-who-runs",
        "kind": "single",
        "prompt": "Who executes a hook's command when its event fires?",
        "options": [
          { "id": "a", "text": "Claude decides whether to run it, like any instruction" },
          { "id": "b", "text": "The Claude Code harness runs it automatically — the model has no say" },
          { "id": "c", "text": "You are prompted to run it manually" },
          { "id": "d", "text": "It runs on Anthropic's servers" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "That's the whole point: hooks are deterministic automation. A CLAUDE.md instruction is followed with high probability; a hook fires with certainty, every matching event."
      },
      {
        "id": "q2-pick-event",
        "kind": "single",
        "prompt": "You want the test suite to run automatically after Claude edits any file. Which hook event and matcher?",
        "options": [
          { "id": "a", "text": "PreToolUse with matcher Bash" },
          { "id": "b", "text": "PostToolUse with matcher Edit|Write" },
          { "id": "c", "text": "Stop with no matcher" },
          { "id": "d", "text": "SessionStart with matcher Edit" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "PostToolUse fires after a tool completes; the Edit|Write matcher scopes it to file modifications. PreToolUse would run tests before the edit — pointless here."
      },
      {
        "id": "q3-vs-instruction",
        "kind": "single",
        "prompt": "Which task is a hook the WRONG choice for?",
        "options": [
          { "id": "a", "text": "Formatting code after every edit" },
          { "id": "b", "text": "Blocking any Bash command containing 'rm -rf'" },
          { "id": "c", "text": "Deciding whether a code change also needs a documentation update" },
          { "id": "d", "text": "Playing a sound when Claude finishes" }
        ],
        "correctOptionIds": ["c"],
        "explanation": "Hooks are dumb and deterministic — perfect for always-do-X, wrong for judgment calls. 'Does this need a doc update?' requires understanding the change: that's an instruction for the model."
      },
      {
        "id": "q4-safety",
        "kind": "multi",
        "prompt": "Which are true about hook safety? (select all that apply)",
        "options": [
          { "id": "a", "text": "Hooks run arbitrary shell commands with your user's permissions" },
          { "id": "b", "text": "You should review hooks configured in a repository you just cloned" },
          { "id": "c", "text": "Hooks can only run read-only commands" },
          { "id": "d", "text": "A PreToolUse hook can block a dangerous tool call before it happens" }
        ],
        "correctOptionIds": ["a", "b", "d"],
        "explanation": "Hooks are real shell commands — powerful for guardrails (d) and equally powerful for mischief, so audit configs you didn't write. Nothing restricts them to read-only."
      }
    ]
  }
]
```

---

## Lesson 3: `03-headless-mode` — Headless Mode: How This App Works

Frontmatter: minutes 12; objectives: know `claude -p` runs one non-interactive turn-set; understand stream-json output; trace this app's terminal pipeline end to end; see headless as a building block for products.

### Narrative beats

1. **The reveal.** Every terminal exercise the learner has done in this course was NOT a fake terminal. The app spawns the real Claude Code binary headlessly. This lesson opens the hood on the exact machinery that has been grading them.
2. **`claude -p` basics.** `-p` = print/headless: pass a prompt on stdin, Claude runs its agent loop without an interactive UI, prints results, exits. Add `--output-format stream-json --verbose --include-partial-messages` and instead of prose you get newline-delimited JSON events: text deltas, tool-use starts, and a final `result` object with `session_id`, `total_cost_usd`, `num_turns`.
3. **This app's pipeline, step by step** (paraphrase `src/lib/claudeSpawn.ts` accurately):
   - You type a prompt in the lesson terminal → browser POSTs to `/api/claude-code/exec`.
   - The server seeds your per-profile sandbox copy from a template (`sandbox/templates/<name>` → `sandbox/live/<you>/<lesson>`).
   - It spawns `claude -p --allowedTools <exercise's list> --permission-mode dontAsk --max-turns <N> --output-format stream-json ...` with the sandbox as cwd.
   - Each NDJSON line is parsed; `text_delta` events become streaming text in your browser; `tool_use` blocks become those tool-name badges you've seen; the `result` line carries the session id (saved so your next prompt can `--resume`) and cost.
4. **Why this matters beyond this app.** Headless mode turns Claude Code into a composable unit: CI pipelines, batch jobs, other apps. "If a lesson platform can embed a coding agent, so can your scripts." (Foreshadow module 12's ecosystem lesson.)
5. **Session resume.** `--resume <session-id>` continues with full context — that's why the app's terminal remembers your earlier messages, and why "Reset" (fresh sandbox + dropped session id) gives a truly clean slate. Hold that thought for module 10's context-rot lesson.

Anchors: `<Exercise id="quiz-headless" />`, `<Exercise id="term-headless-observe" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-headless",
    "title": "Quiz: Headless Mode",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-flag",
        "kind": "single",
        "prompt": "What does `claude -p` do?",
        "options": [
          { "id": "a", "text": "Opens Claude Code in plan mode" },
          { "id": "b", "text": "Runs Claude Code headlessly: takes a prompt, runs the agent loop without an interactive UI, prints output, and exits" },
          { "id": "c", "text": "Prints Claude Code's version" },
          { "id": "d", "text": "Pauses the current session" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "-p is print/headless mode — the non-interactive building block. Scripts, CI jobs, and apps (including this one) drive Claude Code this way."
      },
      {
        "id": "q2-stream-json",
        "kind": "single",
        "prompt": "With `--output-format stream-json`, what does Claude Code emit?",
        "options": [
          { "id": "a", "text": "A single JSON file written to disk at the end" },
          { "id": "b", "text": "Newline-delimited JSON events as they happen: text deltas, tool-use starts, and a final result with session id and cost" },
          { "id": "c", "text": "YAML, one document per turn" },
          { "id": "d", "text": "The same prose as interactive mode, wrapped in quotes" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Streamed NDJSON lets a consuming program react in real time — exactly how this app turns deltas into streaming text and tool_use blocks into the tool badges in your terminal panel."
      },
      {
        "id": "q3-this-app",
        "kind": "single",
        "prompt": "When you press Run in this app's terminal exercises, what actually happens on the server?",
        "options": [
          { "id": "a", "text": "A simulated terminal replays pre-recorded output" },
          { "id": "b", "text": "The real claude binary is spawned headlessly inside your personal sandbox copy, with the exercise's allowed tools and turn limit, and its JSON stream is relayed to your browser" },
          { "id": "c", "text": "Your prompt is sent directly to a bare model API with no tools" },
          { "id": "d", "text": "A human instructor runs the commands" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "It's the real thing: `claude -p --allowedTools ... --max-turns ... --output-format stream-json` in `sandbox/live/<your-profile>/<lesson>`. Everything you've learned transfers directly to the real CLI."
      },
      {
        "id": "q4-resume",
        "kind": "multi",
        "prompt": "Which are true about sessions in headless mode? (select all that apply)",
        "options": [
          { "id": "a", "text": "The final result event includes a session id" },
          { "id": "b", "text": "Passing --resume with that id continues the conversation with prior context intact" },
          { "id": "c", "text": "Headless sessions can never be continued" },
          { "id": "d", "text": "This app's Reset button discards the stored session id and reseeds the sandbox — a genuinely fresh start" }
        ],
        "correctOptionIds": ["a", "b", "d"],
        "explanation": "Headless runs are resumable via session id — that's how the app's terminal keeps context across your prompts, and why Reset (new sandbox + no resume) truly clears the slate."
      }
    ]
  },
  {
    "type": "terminal",
    "id": "term-headless-observe",
    "title": "Terminal: Watch the Machinery",
    "instructions": "You're inside the machinery this lesson described. Give Claude a small multi-step task and watch the event stream: 'Read package.json, then create a file called about.txt describing what this project does in two sentences.' Notice the tool badges (Read, Write) — each is a tool_use event from the JSON stream. Then send a SECOND prompt: 'What did you write in about.txt?' — it remembers, because the app resumed your session. Finally press Reset and ask the same question: with the session gone, Claude must read the file again (or won't know).",
    "sandboxTemplate": "m09-headless-demo",
    "allowedTools": "Read,Glob,Write",
    "maxTurns": 8,
    "suggestedPrompts": [
      "Read package.json, then create about.txt describing this project in two sentences.",
      "What did you write in about.txt?",
      "Without reading any files: what is in about.txt?"
    ]
  }
]
```

---

## Lesson 4: `04-permission-modes` — Permission Modes & Allowed Tools

Frontmatter: minutes 12; objectives: read an `--allowedTools` list; understand scoped Bash rules like `Bash(node *)`; know the modes (default ask, acceptEdits, dontAsk/bypass); reason about least privilege.

### Narrative beats

1. **Recap and deepen.** Module 05 introduced the permission prompt. Power users script permissions instead of clicking through them: `--allowedTools "Read,Edit,Bash(node *)"` pre-approves exactly those tools.
2. **The grammar.** Tool names allow the tool wholly (`Read`, `Edit`); `Bash(prefix *)` scopes shell access to commands matching a prefix — `Bash(node *)` allows `node test.js` but not `npm install` or `rm -rf`. Everything not listed is denied (or prompts, depending on mode).
3. **Modes.** Default: prompt for anything not allowed. `acceptEdits`: file edits auto-approved, commands still prompt. `dontAsk`: never prompt — unlisted tool calls are simply denied. Best for automation where nobody is watching (this app uses `dontAsk` because there's no way to click 'approve' mid-stream).
4. **Least privilege as a design skill.** For each job, ask: what's the smallest tool set that can do it? Review task → `Read,Glob,Grep`. Fix-a-bug task → add `Edit` and `Bash(node *)` for tests. Show 2-3 worked examples.
5. **What a denial looks like.** In headless dontAsk mode Claude is told the tool was denied and must adapt — often narrating "I can't run that command." The next lesson makes them experience this firsthand.

Anchor: `<Exercise id="quiz-permissions" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-permissions",
    "title": "Quiz: Permission Modes",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-scoped-bash",
        "kind": "single",
        "prompt": "With --allowedTools \"Read,Edit,Bash(node *)\", which command can Claude run in the shell?",
        "options": [
          { "id": "a", "text": "npm install lodash" },
          { "id": "b", "text": "node test.js" },
          { "id": "c", "text": "rm -rf build" },
          { "id": "d", "text": "git commit -m 'done'" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Bash(node *) scopes shell access to commands starting with 'node'. npm, rm, and git don't match the prefix and are denied. Scoped Bash rules are the heart of least-privilege agent setups."
      },
      {
        "id": "q2-dontask",
        "kind": "single",
        "prompt": "In --permission-mode dontAsk, what happens when Claude tries a tool that is NOT in the allowed list?",
        "options": [
          { "id": "a", "text": "The user gets a permission prompt" },
          { "id": "b", "text": "The call is denied automatically and Claude must adapt or explain it can't proceed" },
          { "id": "c", "text": "The call runs anyway with a warning" },
          { "id": "d", "text": "The session crashes" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "dontAsk means no human in the loop: allowed tools run, everything else is silently refused. Perfect for headless automation — like this app, where there's no way to click approve mid-stream."
      },
      {
        "id": "q3-least-priv",
        "kind": "single",
        "prompt": "You want Claude to review code and report issues WITHOUT changing anything. Best --allowedTools?",
        "options": [
          { "id": "a", "text": "Read,Glob,Grep" },
          { "id": "b", "text": "Read,Edit,Write,Bash" },
          { "id": "c", "text": "Bash" },
          { "id": "d", "text": "Edit only" }
        ],
        "correctOptionIds": ["a"],
        "explanation": "A review needs to find and read files — nothing more. Granting Edit or unscoped Bash to a read-only job violates least privilege for zero benefit."
      },
      {
        "id": "q4-modes",
        "kind": "multi",
        "prompt": "Match the mode to a sensible use. Which pairings are right? (select all that apply)",
        "options": [
          { "id": "a", "text": "Default prompting — exploring an unfamiliar repo where you want to see each action" },
          { "id": "b", "text": "acceptEdits — a refactor session where you trust file edits but want to approve commands" },
          { "id": "c", "text": "dontAsk with a tight allowlist — unattended automation like CI or this app's sandbox" },
          { "id": "d", "text": "dontAsk with all tools allowed — running an unknown repo's setup script overnight" }
        ],
        "correctOptionIds": ["a", "b", "c"],
        "explanation": "Looser modes demand tighter allowlists and safer environments. dontAsk + everything-allowed + unknown code + nobody watching (d) stacks every risk at once."
      }
    ]
  }
]
```

---

## Lesson 5: `05-sandboxing-in-practice` — Sandboxing in Practice

Frontmatter: minutes 10; objectives: experience tool denials firsthand; watch Claude adapt to a restricted toolset; connect allowlists to task design.

### Narrative beats

1. **Setup.** Two terminal exercises on the SAME template with different allowlists. The learner's job is to observe behavior differences, not to "win."
2. **Exercise A (read-only):** Claude can look but not touch. Ask it to fix a bug — watch it find the bug, explain the fix, but report it cannot edit. This is a denial in the wild.
3. **Exercise B (write, scoped bash):** same request now succeeds end to end, including running the test — but ask it to install a package and watch THAT get denied (`npm` doesn't match `Bash(node *)`).
4. **Takeaway.** The allowlist is part of the task design: grant exactly what the job needs. When an agent "refuses," check its permissions before blaming the model.

Anchors: `<Exercise id="term-denied" />`, `<Exercise id="term-granted" />`.

### Exercises

```json
[
  {
    "type": "terminal",
    "id": "term-denied",
    "title": "Terminal: The Read-Only Agent",
    "instructions": "This sandbox has a bug: mathy.js's add() subtracts. Claude's tools here are READ-ONLY (Read, Glob, Grep — no Edit, no Bash). Ask it to find and fix the bug, then run the tests. Watch carefully: it will locate the bug and explain the fix, but when it tries to edit or run tests, the calls are denied and it must tell you it can't. This is what a permission denial looks like from the inside.",
    "sandboxTemplate": "m09-permissions-lab",
    "allowedTools": "Read,Glob,Grep",
    "maxTurns": 8,
    "suggestedPrompts": [
      "There's a bug in mathy.js. Find it, fix it, and run node test.js to confirm.",
      "What tools would you need to actually complete this task?"
    ]
  },
  {
    "type": "terminal",
    "id": "term-granted",
    "title": "Terminal: Just Enough Power",
    "instructions": "Same project, new powers: Read, Edit, and Bash scoped to node commands only. Ask for the same fix — this time it should edit mathy.js and prove it with node test.js. Then test the fence: ask it to 'install the lodash package with npm'. npm doesn't match Bash(node *), so that call is denied even though other shell commands work. Least privilege in action.",
    "sandboxTemplate": "m09-permissions-lab",
    "allowedTools": "Read,Glob,Grep,Edit,Bash(node *)",
    "maxTurns": 10,
    "suggestedPrompts": [
      "There's a bug in mathy.js. Find it, fix it, and run node test.js to confirm.",
      "Now install the lodash package with npm.",
      "Why couldn't you run npm? What is your Bash permission scoped to?"
    ]
  }
]
```

---

## Sandbox templates

### `sandbox/templates/m09-skill-demo/`

**`notes.md`**
```markdown
# Meeting notes — sprint planning, March 3
- Aisha: payments refactor is 80% done, needs review by Friday.
- Ben: flaky checkout test traced to a timezone bug; fix in progress.
- Decision: ship v2.1 on March 12, feature-freeze March 8.
- Carlos raised that onboarding emails bounce for .co.uk addresses.
- Action: Aisha to open review PR; Ben to land test fix by Wednesday.

# Meeting notes — design sync, March 5
- New empty-state illustrations approved.
- Decision: dark mode postponed to v2.2.
- Action: Dana to update the style guide with the new color tokens.
```

**`.claude/skills/summarize-notes/SKILL.md`**
```markdown
---
name: summarize-notes
description: Use when asked to summarize meeting notes in this project
---
# Summarizing meeting notes
Write the summary to summary.md with exactly these sections:
1. `## Decisions` — every line that records a decision, one bullet each.
2. `## Action items` — every action, formatted as "**Owner** — task".
3. `## Risks` — anything unresolved or in progress.
Rules: past tense, no adjectives, never invent owners, max 12 words per bullet.
```

**`README.md`**
```markdown
# Notes project
Tiny sandbox for practicing skills. Notes live in notes.md.
```

### `sandbox/templates/m09-headless-demo/`

**`package.json`**
```json
{
  "name": "tiny-quotes",
  "version": "1.0.0",
  "description": "A tiny CLI that prints an inspiring quote about persistence",
  "main": "index.js"
}
```

**`index.js`**
```js
const quotes = [
  "Fall seven times, stand up eight.",
  "Rivers know this: there is no hurry.",
];
console.log(quotes[Math.floor(Math.random() * quotes.length)]);
```

### `sandbox/templates/m09-permissions-lab/`

**`mathy.js`**
```js
// A tiny math helper library.
function add(a, b) {
  return a - b; // BUG: should add, not subtract
}

function multiply(a, b) {
  return a * b;
}

module.exports = { add, multiply };
```

**`test.js`**
```js
const { add, multiply } = require("./mathy.js");

let failures = 0;
function expect(name, actual, expected) {
  if (actual === expected) {
    console.log(`ok - ${name}`);
  } else {
    console.log(`FAIL - ${name}: expected ${expected}, got ${actual}`);
    failures++;
  }
}

expect("add(2, 3)", add(2, 3), 5);
expect("add(10, -4)", add(10, -4), 6);
expect("multiply(3, 4)", multiply(3, 4), 12);

if (failures === 0) {
  console.log("PASS");
} else {
  console.log(`${failures} test(s) failed`);
  process.exit(1);
}
```

**`README.md`**
```markdown
# mathy
Tiny math helpers. Run tests with: node test.js
```

## Verifiers to implement

None — this module uses terminal exercises (observational) and quizzes only. No challenge exercises.

## Tone & vocabulary

- Voice: confident peer-to-power-user; the learner has earned real-CLI vocabulary. Still define each new flag on first use.
- Terms: skill, SKILL.md, trigger/description, hook, PreToolUse/PostToolUse/Stop, matcher, headless, `-p`, stream-json, NDJSON, session id, `--resume`, `--allowedTools`, scoped Bash rule, permission mode, dontAsk, acceptEdits, least privilege, sandbox.
- Lean hard on the meta-thread: lesson 3's "you have been inside this machinery all along" is the module's emotional peak. Keep claims about this app's internals consistent with `src/lib/claudeSpawn.ts` and `src/lib/sandbox.ts` — re-read them before writing.
- CLI flags in this spec match what this app actually passes; for features beyond that (hook event details, mode names), keep descriptions general ("Claude Code supports events like...") rather than exhaustive.

## Done checklist

- [ ] `module.json` matches above; curriculum entry `09-claude-code-power-tools` flipped to `built`.
- [ ] 5 lessons with frontmatter + anchors matching exercise ids: quiz-skills, term-inspect-skill, quiz-hooks, quiz-headless, term-headless-observe, quiz-permissions, term-denied, term-granted.
- [ ] 3 sandbox templates created exactly as specified (including the `.claude/skills/...` nested path in m09-skill-demo).
- [ ] Both permissions-lab exercises reference the SAME template with different allowedTools strings.
- [ ] Lesson 3's description of the exec pipeline verified against `src/app/api/claude-code/exec/route.ts` and `src/lib/claudeSpawn.ts`.
- [ ] `npm run validate` passes.
