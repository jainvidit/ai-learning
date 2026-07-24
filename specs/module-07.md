# Module 07 — Everyday Claude Code

## Meta

| Field    | Value                          |
|----------|--------------------------------|
| id       | `07-claude-code-workflows`     |
| track    | `claude-code`                  |
| requires | `["05-meet-claude-code"]`      |
| minutes  | ~54 (4 lessons: 16+13+10+15)   |

`module.json`:

```json
{
  "id": "07-claude-code-workflows",
  "title": "Everyday Claude Code",
  "track": "claude-code",
  "description": "Turn one-off sessions into a daily workflow: give every project a memory with CLAUDE.md, read and reason about the permission rules in settings.json, learn the slash commands that manage sessions, and master the art of resuming work and phrasing tasks so Claude nails them on the first try.",
  "lessons": [
    { "id": "01-claude-md", "title": "Project Memory: CLAUDE.md" },
    { "id": "02-settings-permissions", "title": "Permissions on Paper: settings.json" },
    { "id": "03-slash-commands", "title": "The Slash Command Tour" },
    { "id": "04-resume-and-phrasing", "title": "Resuming Sessions & Phrasing Tasks Well" }
  ]
}
```

## Audience state

Finished module 05 (and its prerequisites 01–03). They have driven real Claude Code
sessions in the embedded terminal: explored a project, made edits, run `node` scripts,
fixed a bug against a test, and learned the permission model as behavior (Claude asks
before acting). They are still non-programmers: JavaScript files are "instructions for
the computer" that Claude reads for them, and JSON is known from module 04 as "labeled
data" ONLY if they took the prompting track — reintroduce JSON in one sentence when
settings.json appears, don't assume it. New in this module: configuration as FILES
(CLAUDE.md, settings.json) and session management. Keep the module 05 safety line
alive: sandboxes are disposable copies.

## Learning objectives

1. Explain what CLAUDE.md is (standing project instructions Claude reads at session start) and what belongs in one.
2. Direct Claude Code to study an unfamiliar project and write a concise, accurate CLAUDE.md for it.
3. Read a `.claude/settings.json` file and explain which actions are pre-approved, which are blocked, and which will trigger an ask-first prompt.
4. Name what the everyday slash commands do (/help, /clear, /resume, /config) and when to reach for each.
5. Resume a session so follow-up requests can lean on earlier context instead of re-explaining.
6. Phrase tasks with a specific verb, a named target, and an explicit constraint or definition of done.

## Lessons

### Lesson 01-claude-md — "Project Memory: CLAUDE.md" (~16 min)

**Frontmatter objectives:**
- Explain what CLAUDE.md is and when Claude Code reads it
- List what belongs in a good CLAUDE.md (and what doesn't)
- Direct Claude to study a project and write its CLAUDE.md

**Narrative outline:**
1. Pain point from module 05: every session started from zero — Claude re-read the
   project, re-discovered how to run things. Imagine a new coworker who forgets
   everything overnight. The fix real teams use: a one-page **briefing note** pinned to
   the project that the coworker reads first thing every morning.
2. That note is **CLAUDE.md** — a plain text file at the top of a project. Claude Code
   reads it automatically at the start of every session in that folder. (".md" is
   Markdown — the same headings-and-lists format the lessons in this app are written
   in. It's just text.)
3. What belongs in it, the three-part recipe: **what the project is** (one or two
   sentences), **how to run and check it** (the exact commands, e.g. `node index.js`
   to run, `node test.js` to check), and **the conventions** — the house rules a
   newcomer would otherwise trip over ("quotes are kept in alphabetical order by
   author").
4. What does NOT belong: long essays, information Claude can trivially see by reading
   the files, wish lists, or anything that changes weekly. `<Callout kind="tip">`
   The test for every line: "would a capable newcomer act differently after reading
   this?" If not, cut it. Short beats complete — this file is read EVERY session, so
   every line costs attention every time.
5. The meta-move of this lesson: you won't write the file — you'll direct Claude to
   study the project and write its own briefing note. This is real practice: it's
   exactly how people bootstrap CLAUDE.md on real projects (real Claude Code even has
   a built-in `/init` command that does this — you're learning the manual version).
6. Coaching for the challenge: ask Claude to EXPLORE first ("read every file, then
   tell me what this project is and how to run it"), THEN ask for the file — and
   state the shape you want: "write a concise CLAUDE.md covering what the project is,
   how to run and test it, and the conventions to follow — keep it short."
7. `<Callout kind="info">` A verifier will grade the resulting file — including an AI
   judge checking it reads as concise, accurate guidance. (You know this pattern:
   it's the LLM-as-judge from the prompting track, pointed at a file.)
8. Challenge anchor: `<Exercise id="ch-write-claudemd" />`
9. Debrief: open your next session in this project and the briefing note is just...
   known. That's project memory — and it compounds: every future session starts smart.

**Exercises:**

```json
{
  "type": "challenge",
  "id": "ch-write-claudemd",
  "title": "Write the project's briefing note",
  "instructions": "The sandbox contains a small 'daily quote' project you've never seen. Direct Claude Code to study it and write a CLAUDE.md briefing note at the top of the project.\n\nThe file must cover three things: (1) what the project is, (2) how to run it and how to check it's working (the exact commands), and (3) the conventions a newcomer should follow — the project's own notes mention some. Keep it concise: this note gets read at the start of every future session.\n\nSuggested flow: first have Claude explore ('read every file and tell me what this project is, how to run it, and what rules it follows'), then have it write CLAUDE.md, then ask it to show you the finished file. When it looks right, hit Verify.",
  "sandboxTemplate": "m07-claudemd",
  "allowedTools": "Read,Glob,Grep,Edit,Bash(node *)",
  "maxTurns": 15,
  "verifierId": "m07-claudemd",
  "criteria": [
    "CLAUDE.md exists at the top of the project",
    "CLAUDE.md reads as concise project guidance: what the project is, how to run it, and its conventions"
  ],
  "hints": [
    "Start with exploration, not writing: 'Read every file in this project and summarize what it is, how to run and test it, and any house rules you find.'",
    "The conventions aren't only in the code — check the project's notes file. Ask Claude: 'what conventions does notes.md ask contributors to follow?'",
    "Then be explicit about the deliverable: 'Write a CLAUDE.md at the project root with three short sections: What this is, How to run and test it (exact node commands), and Conventions. Keep it under 25 lines, then show me the file.'"
  ]
}
```

### Lesson 02-settings-permissions — "Permissions on Paper: settings.json" (~13 min)

**Frontmatter objectives:**
- Explain where permission rules live: .claude/settings.json inside the project
- Read allow and deny rules and predict what happens for a given action
- Explain the three outcomes: pre-approved, blocked, ask-first

**Narrative outline:**
1. Callback to module 05 lesson 04: Claude asked permission before acting, and this
   app pre-approved a narrow set of actions per exercise. Where do such standing
   decisions LIVE? In a file: `.claude/settings.json`, inside a hidden `.claude`
   folder at the top of the project. (JSON — text with labels: curly braces group
   things, quoted names label them, square brackets hold lists. You can read it.)
2. Show a small annotated example in a fenced block: a `permissions` section with an
   `"allow"` list and a `"deny"` list. Read one rule aloud: `"Bash(node *)"` means
   "running node commands — any of them (`*` is a wildcard meaning 'anything here')
   — is pre-approved."
3. The three outcomes for any action Claude wants to take: matches an **allow** rule →
   happens without asking; matches a **deny** rule → refused, full stop, Claude can't
   even ask; matches **neither** → the familiar ask-first prompt, and YOU decide.
   Analogy: the contractor from module 05 now has a signed work order — measuring and
   node-running pre-approved, demolition explicitly forbidden, everything else
   "check with the owner first."
4. `<Callout kind="info">` Deny beats allow: if an action somehow matches both lists,
   the deny wins. Safety rules outrank convenience rules.
5. Why files instead of clicking "allow" every time: the rules are shared with the
   project (everyone who opens it gets the same guardrails), reviewable (you can READ
   the policy), and editable (loosen or tighten deliberately, not in the heat of a
   session).
6. Quiz anchor: `<Exercise id="quiz-settings" />`
7. Now read a real one: terminal exercise — the sandbox project has an actual
   `.claude/settings.json`; make Claude read it and interrogate the policy.
   Anchor: `<Exercise id="tx-read-settings" />`
8. Debrief: you just read a security policy — a sentence you couldn't have said two
   modules ago. `<Callout kind="tip">` On any real project you join, this file is
   worth reading FIRST: it tells you what the project's owners trust an agent to do.

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-settings",
  "title": "Check: settings.json permissions",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "Where do a project's standing permission rules for Claude Code live?",
      "options": [
        { "id": "a", "text": "In a file: .claude/settings.json inside the project" },
        { "id": "b", "text": "In Claude's training data" },
        { "id": "c", "text": "They can't be stored — you must click allow every time" },
        { "id": "d", "text": "In CLAUDE.md" }
      ],
      "correctOptionIds": ["a"],
      "explanation": "Standing permission decisions are written down in .claude/settings.json — a readable, shareable, editable policy file in the project. CLAUDE.md (d) is the briefing note about the project itself; it gives guidance, not permissions. And per-click approval (c) is only the fallback for actions no rule covers."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "A settings.json allows \"Bash(node *)\" and denies \"Bash(rm *)\". Claude wants to run a command that matches neither rule. What happens?",
      "options": [
        { "id": "a", "text": "It runs — anything not denied is allowed" },
        { "id": "b", "text": "It's blocked — anything not allowed is denied" },
        { "id": "c", "text": "You get the ask-first permission prompt and decide yourself" },
        { "id": "d", "text": "Claude picks the closest rule and follows it" }
      ],
      "correctOptionIds": ["c"],
      "explanation": "Three outcomes, not two: allow-listed actions run freely, deny-listed actions are refused outright, and everything in between falls back to the ask-first prompt from module 05 — the human stays the decision-maker for the uncovered middle. Neither 'default open' (a) nor 'default shut' (b) is how it works."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "What does the * in a rule like \"Bash(node *)\" mean?",
      "options": [
        { "id": "a", "text": "The rule is important" },
        { "id": "b", "text": "It's a wildcard: any text can appear there, so every node command matches the rule" },
        { "id": "c", "text": "The rule is disabled" },
        { "id": "d", "text": "Only commands exactly named 'node *' match" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The star means 'anything here' — node index.js, node test.js, any node command all match. That's the power and the caution of wildcards: one short rule pre-approves a whole family of actions, so read what family it is before trusting it."
    },
    {
      "id": "q4",
      "kind": "single",
      "prompt": "Why keep permission rules in a file instead of clicking 'allow' each time?",
      "options": [
        { "id": "a", "text": "Files make Claude run faster" },
        { "id": "b", "text": "The policy becomes readable, shared with everyone using the project, and deliberately editable — instead of decisions made one click at a time mid-session" },
        { "id": "c", "text": "Clicking allow is being removed" },
        { "id": "d", "text": "Files allow Claude to change its own permissions" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "A written policy can be read before trusting it, travels with the project, and gets changed thoughtfully rather than in the heat of a session. Ask-first prompts still exist for the uncovered middle (c) — and no, the point is that YOU write the policy, not the agent (d)."
    }
  ]
}
```

```json
{
  "type": "terminal",
  "id": "tx-read-settings",
  "title": "Read the security policy",
  "instructions": "This sandbox project ships with a real .claude/settings.json. Use Claude to interrogate the policy — complete all three tasks:\n\n1. Ask Claude to read .claude/settings.json and explain each rule in plain language: what's pre-approved, what's forbidden.\n2. Ask: 'According to these settings, what would happen if you tried to run the report script with node? What about a command that deletes files? What about installing new software?' — make Claude name which of the three outcomes (allowed / denied / ask-first) each case hits.\n3. Ask Claude whether anything in this policy seems risky or surprisingly broad, and why.\n\nNote: in this exercise Claude can only READ — so it must answer from the file, not by trying things.",
  "sandboxTemplate": "m07-settings",
  "allowedTools": "Read,Glob,Grep",
  "maxTurns": 10,
  "suggestedPrompts": [
    "Read .claude/settings.json and explain every rule in plain language: what is pre-approved, and what is forbidden?",
    "Under these settings, what happens for: running the report with node? deleting a file? installing new software? Name allowed, denied, or ask-first for each.",
    "Is anything in this policy risky or surprisingly broad? Explain why."
  ]
}
```

### Lesson 03-slash-commands — "The Slash Command Tour" (~10 min)

**Frontmatter objectives:**
- Explain what slash commands are: instructions to the app, not prompts to the model
- Name what /help, /clear, /resume, and /config do
- Choose the right command for common session situations

**Narrative outline:**
1. Observation to build on: everything you've typed so far was FOR Claude — a goal, a
   question. But sometimes you need to talk to the APP AROUND Claude: wipe the slate,
   pick up yesterday's session, change a setting. Those messages start with `/` —
   **slash commands**.
2. The distinction, sharply: a prompt goes INTO the conversation (Claude reads and acts
   on it); a slash command steers the SESSION itself (the conversation is the cargo;
   slash commands drive the truck). Typing `/` first is how the app knows the
   difference.
3. The everyday four, one beat each:
   **`/help`** — lists what's available. The command you're allowed to forget
   everything else because of.
   **`/clear`** — wipes the conversation and starts fresh in the same project. When to
   use: the context is polluted (module 02's "restart beats a fifth correction" — now
   you have the button for it) or you're switching to an unrelated task.
   **`/resume`** — shows past sessions and lets you pick one up with its full memory
   intact (tomorrow's lesson makes this concrete).
   **`/config`** — opens settings to view or change how Claude Code behaves. The
   interactive cousin of the settings.json file you just read.
4. `<Callout kind="tip">` /clear is the most underused command in real workflows.
   A long, wandering conversation drags every wrong turn along with it; done with a
   task means /clear before the next one.
5. `<Callout kind="info">` There are more commands — /help lists them all — and
   module 09 introduces the power set (including commands you can create yourself).
   Note this app's embedded terminal doesn't take slash commands; its Reset button
   plays the role of /clear, and its Continue session box plays the role of /resume.
6. Quiz anchor: `<Exercise id="quiz-slash" />`

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-slash",
  "title": "Check: slash commands",
  "passingScore": 75,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "What's the difference between a slash command and a regular prompt?",
      "options": [
        { "id": "a", "text": "Slash commands are prompts written more politely" },
        { "id": "b", "text": "A prompt goes into the conversation for Claude to act on; a slash command steers the session itself — clearing it, resuming one, changing settings" },
        { "id": "c", "text": "Slash commands are only for programmers" },
        { "id": "d", "text": "There is no difference" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The conversation is the cargo; slash commands drive the truck. /clear, /resume, and /config manage the session around Claude rather than asking Claude to do something — the leading / is how the app tells the two apart."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "You spent an hour fixing a bug, and now you're starting a completely unrelated task in the same project. What's the best first move?",
      "options": [
        { "id": "a", "text": "/clear — start fresh so the old task's context doesn't drag into the new one" },
        { "id": "b", "text": "/config — change the model" },
        { "id": "c", "text": "Keep going in the same conversation — more context is always better" },
        { "id": "d", "text": "/help — read the manual again" }
      ],
      "correctOptionIds": ["a"],
      "explanation": "An unrelated task deserves a clean slate: the bug hunt's long history is now noise that steers responses off course. 'More context is always better' (c) is the classic trap — RELEVANT context helps; leftover context pollutes. This is module 02's 'restart beats a fifth correction' with a button on it."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "Yesterday you and Claude got halfway through reorganizing a project. Today you want to continue exactly where you left off. Which command?",
      "options": [
        { "id": "a", "text": "/clear" },
        { "id": "b", "text": "/config" },
        { "id": "c", "text": "/resume — pick yesterday's session and continue with its full memory intact" },
        { "id": "d", "text": "No command needed — Claude automatically remembers all past conversations" }
      ],
      "correctOptionIds": ["c"],
      "explanation": "/resume lists past sessions and reopens the one you pick, history and all — 'the second file, like we discussed' works again. Memory across sessions is opt-in, not automatic (d): a fresh session starts blank except for CLAUDE.md, which is exactly why /resume exists."
    },
    {
      "id": "q4",
      "kind": "single",
      "prompt": "You can't remember what commands exist or what one of them does. What do you type?",
      "options": [
        { "id": "a", "text": "/help" },
        { "id": "b", "text": "/clear" },
        { "id": "c", "text": "Nothing — guessing is faster" },
        { "id": "d", "text": "/resume" }
      ],
      "correctOptionIds": ["a"],
      "explanation": "/help lists every available command with what it does — it's the one command worth memorizing precisely because it makes memorizing the rest optional. /clear (b) would wipe your session, which is a rough way to look something up."
    }
  ]
}
```

### Lesson 04-resume-and-phrasing — "Resuming Sessions & Phrasing Tasks Well" (~15 min)

**Frontmatter objectives:**
- Continue a session so follow-ups can lean on earlier context
- Phrase tasks with a specific verb, a named target, and an explicit constraint
- Recognize when continuing beats starting fresh (and vice versa)

**Narrative outline:**
1. The payoff lesson: sessions have memory, and you now know how to keep or drop it
   (/resume vs /clear — or in this app's terminal, the **Continue session** checkbox vs
   the Reset button). This lesson: USE the memory, and feed it well-phrased tasks.
2. Why continuing matters, concretely: in a continued session, "now do the same for
   the menu file" is a complete instruction — Claude remembers what "the same" was.
   In a fresh session that sentence is gibberish. Context carried = words saved.
3. **Task phrasing** — the module's second skill, taught as a formula:
   **specific verb + named target + constraint/done-check**. Weak: "improve the
   guest list" (improve HOW?). Strong: "In guestlist.md, mark each guest as
   vegetarian or not, using the diet notes already in the file — change nothing
   else." Verbs that work: add, rename, mark, move, shorten-to-N, list. Verbs that
   wander: improve, clean up, fix up, make better.
4. Connect to prompting-track roots: this is module 02's specificity, adapted for
   agents — where vague CHAT prompts cost you one bad reply, vague AGENT tasks cost
   you wrong EDITS (recoverable in a sandbox, expensive in real life).
5. `<Callout kind="tip">` End big requests with a done-check: "...then show me the
   final file." It forces the verify step from module 05 into the task itself.
6. Terminal exercise anchor: `<Exercise id="tx-resume-session" />` — a two-part task
   where part 2 only makes sense because part 1's session is continued.
7. `<Callout kind="warning">` Continuing is not always right: memory of a WRONG turn
   steers future replies back toward it. Rule of thumb — same task, continue; new
   task or derailed conversation, reset. You now own both pedals.
8. Module close: you have project memory (CLAUDE.md), written permissions
   (settings.json), session control (slash commands, resume), and task phrasing.
   That's an everyday workflow. Module 09 adds the power tools — skills, hooks, and
   commands you build yourself.

**Exercises:**

```json
{
  "type": "terminal",
  "id": "tx-resume-session",
  "title": "Two sessions, one memory",
  "instructions": "The sandbox holds two planning files for a small office party. This exercise has two rounds — the point is what happens BETWEEN them.\n\nRound 1: send ONE well-phrased request: have Claude add a '## Status' line at the top of guestlist.md saying how many guests are confirmed versus undecided (the file marks each guest), and show you the result. Use the formula: specific verb, named target, constraint, done-check.\n\nRound 2: make sure the 'Continue session' box below the input is CHECKED (it becomes available after round 1), then send only: 'Now do the same for menu.md.' Watch Claude apply the same treatment — a Status line counting confirmed vs undecided dishes — without you re-explaining anything. That's session memory at work.\n\nOptional round 3: UNCHECK Continue session (or hit Reset sandbox) and try 'Now do the same for menu.md' as the FIRST message of a fresh session — watch Claude have no idea what 'the same' means. Feel the difference.",
  "sandboxTemplate": "m07-resume",
  "allowedTools": "Read,Edit",
  "maxTurns": 8,
  "suggestedPrompts": [
    "At the top of guestlist.md, add a '## Status' line saying how many guests are confirmed and how many are undecided, based on the markers in the file. Change nothing else, then show me the updated file.",
    "Now do the same for menu.md."
  ]
}
```

## Sandbox templates

Three templates. Create each file EXACTLY as shown.

### `m07-claudemd/`

The learner directs Claude to write a `CLAUDE.md` for this project. The template
deliberately has NO CLAUDE.md and no README — the facts must be gathered from
package.json, the code comments, and notes.md.

```
m07-claudemd/
  package.json
  index.js
  quotes.js
  test.js
  notes.md
```

**`package.json`**
```json
{
  "name": "daily-quote",
  "version": "1.0.0",
  "description": "Prints an inspiring quote of the day in the terminal.",
  "scripts": {
    "start": "node index.js",
    "test": "node test.js"
  }
}
```

**`index.js`**
```js
// Daily Quote: prints one quote per day, rotating through the list.
// Run with: node index.js
const { quotes } = require("./quotes");

const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
const pick = quotes[dayNumber % quotes.length];

console.log(`"${pick.text}"`);
console.log(`  — ${pick.author}`);
```

**`quotes.js`**
```js
// The quote list. House rules (see notes.md):
// - keep quotes in alphabetical order by author's last name
// - every quote needs both "author" and "text"
const quotes = [
  { author: "Maya Angelou", text: "Nothing will work unless you do." },
  { author: "Confucius", text: "It does not matter how slowly you go as long as you do not stop." },
  { author: "Thomas Edison", text: "Genius is one percent inspiration and ninety-nine percent perspiration." },
  { author: "Eleanor Roosevelt", text: "The future belongs to those who believe in the beauty of their dreams." },
];

module.exports = { quotes };
```

**`test.js`**
```js
// Checks every quote has an author and text. Run with: node test.js
const { quotes } = require("./quotes");

let failures = 0;
for (const q of quotes) {
  if (!q.author || !q.text) {
    console.log("FAIL: quote missing author or text:", JSON.stringify(q));
    failures += 1;
  }
}

if (failures === 0) {
  console.log(`PASS: all ${quotes.length} quotes are valid`);
  process.exit(0);
} else {
  process.exit(1);
}
```

**`notes.md`**
```md
# Maintainer notes

Rules we follow in this project:

- Quotes live ONLY in quotes.js — never hard-code a quote anywhere else.
- Keep the quote list in alphabetical order by the author's last name.
- Run `node test.js` before considering any change done.
- Keep quotes short — one sentence each.
```

(Builder reference — a good learner-produced CLAUDE.md will say roughly: this is a
tiny CLI that prints a rotating quote of the day; run with `node index.js`, check with
`node test.js`; conventions: quotes only in quotes.js, alphabetical by author's last
name, one sentence each, run the test before finishing. The alphabetical-order note in
quotes.js/notes.md is deliberately violated by the actual list order — do NOT fix or
mention this; it's harmless flavor and Claude may or may not notice.)

### `m07-settings/`

Read-only exploration target. The interesting file is the settings fixture; the rest
gives the policy something concrete to be about.

```
m07-settings/
  .claude/settings.json
  report.js
  sales.json
```

**`.claude/settings.json`**
```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(node *)"
    ],
    "deny": [
      "Bash(rm *)",
      "Bash(curl *)",
      "WebFetch"
    ]
  }
}
```

**`report.js`**
```js
// Prints a one-line sales summary. Run with: node report.js
const fs = require("fs");

const sales = JSON.parse(fs.readFileSync("sales.json", "utf8"));
const total = sales.reduce((sum, s) => sum + s.amount, 0);

console.log(`Sales entries: ${sales.length}, total: $${total.toFixed(2)}`);
```

**`sales.json`**
```json
[
  { "day": "Monday", "amount": 231.5 },
  { "day": "Tuesday", "amount": 187.25 },
  { "day": "Wednesday", "amount": 305.0 }
]
```

(Builder reference — intended answers for the exercise's three probes: running the
report with node → matches `Bash(node *)` → allowed without asking; deleting a file
→ matches `Bash(rm *)` → denied outright; installing new software (e.g. an npm
install) → matches neither list → ask-first prompt. The "risky or broad" discussion
should surface that `Bash(node *)` pre-approves ANY node command, which is a wide
grant. Note the exercise itself grants only `Read,Glob,Grep`, so Claude must reason
from the file, not experiment.)

### `m07-resume/`

Two parallel planning files so "now do the same for menu.md" is a meaningful
continued-session instruction.

```
m07-resume/
  guestlist.md
  menu.md
```

**`guestlist.md`**
```md
# Office Party — Guest List

- Ana (confirmed)
- Ben (undecided)
- Chloe (confirmed)
- Dev (confirmed)
- Elena (undecided)
- Farid (confirmed)
```

**`menu.md`**
```md
# Office Party — Menu

- Veggie lasagna (confirmed)
- Garlic bread (confirmed)
- Caesar salad (undecided)
- Lemon cake (confirmed)
- Fruit punch (undecided)
```

(Builder reference — round 1 should yield a Status line like "4 confirmed, 2
undecided" in guestlist.md; round 2, continued, should yield "3 confirmed, 2
undecided" in menu.md.)

## Verifiers to implement

- **`m07-claudemd`** in `src/lib/verifiers/m07-claude-code-workflows.ts`, registered
  additively in `src/lib/verifiers/index.ts` (`import { m07Verifiers } from
  "./m07-claude-code-workflows";` and spread `...m07Verifiers`). Two criteria, in
  this order (matching the challenge's `criteria` array):
  1. Criterion "CLAUDE.md exists at the top of the project":
     `fileExists(sandboxDir, "CLAUDE.md")`; on failure, detail "CLAUDE.md not found
     in the sandbox".
  2. Criterion "CLAUDE.md reads as concise project guidance: what the project is, how
     to run it, and its conventions": `judgeFile(sandboxDir, "CLAUDE.md", "The file
     reads as concise project guidance for an AI assistant: it says what the project
     is, gives the command(s) to run and/or test it, and states at least one project
     convention. It is guidance, not an essay — roughly a page or less.")`. Use the
     returned `reason` as the criterion's `detail`. Skip with detail "Skipped —
     CLAUDE.md is missing" when criterion 1 fails (do not call the judge on a missing
     file).
  - Overall pass = every criterion passes.
  - Pristine template MUST fail (no CLAUDE.md exists). A hand-written solution — a
    CLAUDE.md stating the project prints a daily rotating quote, run with
    `node index.js`, test with `node test.js`, quotes live only in quotes.js in
    alphabetical order — MUST pass. Test both by hand.

## Tone & vocabulary

- Voice: the coach from module 05, one notch less hand-holding — the learner has
  driven sessions and fixed a bug; acknowledge that competence ("you've earned the
  hidden folders"). Keep the safety line for anything new. Still say exactly what to
  type or click for every terminal step, especially the Continue session checkbox.
- May introduce (define on first use): **CLAUDE.md** (as "briefing note / project
  memory"), **Markdown / .md** (as "headings-and-lists text"), **settings.json** and
  the **.claude folder**, **allow/deny rule**, **wildcard `*`**, **slash command**
  (with /help, /clear, /resume, /config by name), **session / resume / continue**,
  **JSON** (one-sentence reintroduction: "text with labels" — do not assume module 04).
- Assumed: all of module 05 vocabulary (terminal, sandbox, agent loop, tools
  Read/Edit/Bash, permission prompt, test as definition-of-done, bug).
- BANNED: git, repository, MCP, subagent, hooks, skills, plan mode, headless/CLI
  flags, custom slash commands (module 09 — one forward reference is allowed),
  /compact, environment variables, npm install as an instruction (it may appear only
  as a hypothetical in the settings discussion).

## Done checklist

- [ ] `module.json` + 4 lessons + exercises.json files created and schema-valid
- [ ] Every exercise has an `<Exercise id/>` anchor in its lesson.mdx
- [ ] Templates `m07-claudemd`, `m07-settings`, `m07-resume` created byte-faithful
      to spec (including the hidden `.claude/settings.json`)
- [ ] `npm run seed-sandboxes` seeds all three templates
- [ ] Verifier `m07-claudemd` implemented, registered; FAILS on pristine
      m07-claudemd, PASSES on a hand-written good CLAUDE.md (test both)
- [ ] `npm run validate` passes; `npx tsc --noEmit` clean
- [ ] Both terminal exercises and the challenge smoke-tested end-to-end, including
      the Continue-session round trip in tx-resume-session
- [ ] curriculum.json status flipped `"spec"` → `"built"` for 07-claude-code-workflows only
