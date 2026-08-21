# Module 05 — Meet Claude Code

## Meta

| Field    | Value                                             |
|----------|---------------------------------------------------|
| id       | `05-meet-claude-code`                             |
| track    | `claude-code`                                     |
| requires | `["02-prompting-basics", "03-capabilities-limits"]` |
| minutes  | ~68 (5 lessons: 12+14+14+10+18) |

`module.json`:

```json
{
  "id": "05-meet-claude-code",
  "title": "Meet Claude Code",
  "track": "claude-code",
  "description": "Meet the AI that doesn't just talk — it acts. You'll learn how Claude Code reads files, edits them, and runs commands in a loop; drive your first real session in a safe sandbox; make your first AI-assisted edit; understand the permission model that keeps you in charge; and finish by fixing your first real bug.",
  "lessons": [
    { "id": "01-what-is-claude-code", "title": "An AI That Acts: the Agent Loop" },
    { "id": "02-first-session", "title": "Your First Session" },
    { "id": "03-first-edit", "title": "Your First Edit" },
    { "id": "04-permissions", "title": "Who's in Charge: Permissions" },
    { "id": "05-fix-the-bug", "title": "Challenge: Fix the Bug" }
  ]
}
```

## Audience state

Finished modules 01–03 (02 and 03 required). They can prompt well and know the model's
limits — but they have NEVER used a terminal, never written code, and may find both
intimidating. The embedded terminal in this app is their first ever. Every terminal
exercise instruction must say exactly what to type or click, and reassure: the sandbox
is a disposable copy; nothing can be broken. JavaScript files appear as "small text
files containing instructions for the computer" — learners read them WITH Claude's help,
never alone. This module may begin building terminal comfort but must assume zero.

## Learning objectives

1. Explain how Claude Code differs from a chat assistant (it acts: reads files, edits, runs commands).
2. Describe the agent loop: gather context → act → observe results → repeat until done.
3. Drive a real Claude Code session to explore an unfamiliar folder and answer questions about it.
4. Direct Claude Code to make a specific, small file edit and confirm the result.
5. Explain what the permission model allows, asks about, and blocks — and why.
6. Complete an end-to-end bug fix: describe the problem, let Claude find and fix it, verify with a test.

## Lessons

### Lesson 01-what-is-claude-code — "An AI That Acts: the Agent Loop" (~12 min)

**Frontmatter objectives:**
- Contrast a chat assistant (talks) with an agent (acts)
- Describe the agent loop in plain language
- Name the three core actions: read, edit, run

**Narrative outline:**
1. Bridge from everything so far: you've been talking WITH an AI. Claude Code is the AI
   given hands — it works inside a real folder on a real computer: reading files, editing
   them, and running commands.
2. Analogy: chat AI is a brilliant consultant on the phone — great advice, but YOU do all
   the typing. Claude Code is the consultant sitting at the keyboard while you direct.
3. Introduce the **terminal** gently: a text window where you talk to a computer by
   typing. In this app it's embedded right in the lesson — nothing to install, and every
   exercise runs in a disposable **sandbox** (a copy made just for you; break anything,
   we hand you a fresh copy).
4. The **agent loop**, as a numbered cycle: (1) you give a goal in plain English —
   prompting skills from modules 02/04 apply directly; (2) Claude gathers context (reads
   files, looks around); (3) it acts (edits a file, runs a command); (4) it OBSERVES the
   result — did the command succeed? what did the test print?; (5) repeat until done or
   until it needs your input.
5. The observe step is the magic: unlike chat, the agent sees the actual outcome of its
   actions and corrects course. Connect to module 03: this is how agents beat pure
   recall/reasoning limits — they check their work against reality.
6. `<Callout kind="info">` "Agent" just means an AI that takes actions in a loop toward a
   goal — you'll hear this word constantly from now on.
7. Tools preview: Read (open a file), Edit (change a file), Bash (run a command — "Bash"
   is just the name of the terminal's language). You'll see these names flash by in
   sessions.
8. Quiz anchor: `<Exercise id="quiz-agent-loop" />`
9. Tee up lesson 02: enough theory — next you drive.

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-agent-loop",
  "title": "Check: the agent loop",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "What's the key difference between Claude Code and a chat assistant?",
      "options": [
        { "id": "a", "text": "Claude Code uses a smarter model" },
        { "id": "b", "text": "Claude Code can act — read files, edit them, and run commands — not just produce text for you to act on" },
        { "id": "c", "text": "Claude Code can't hold a conversation" },
        { "id": "d", "text": "Chat assistants can't write code" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Same kind of model underneath — the difference is hands. Chat gives you advice to carry out yourself; Claude Code carries it out in a real folder while you direct. It converses fine (c), and chat assistants write code too — they just can't run or save it (d)."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "Put the agent loop in order: which step comes right after Claude takes an action (like running a command)?",
      "options": [
        { "id": "a", "text": "It observes the result of that action and uses it to decide what to do next" },
        { "id": "b", "text": "It immediately declares the task done" },
        { "id": "c", "text": "It forgets the action and starts over" },
        { "id": "d", "text": "It waits for you to describe what happened" }
      ],
      "correctOptionIds": ["a"],
      "explanation": "Observe is the step that makes it an agent: the actual output of the command flows back into the loop, so mistakes get caught and corrected. It doesn't declare victory blind (b) or need you to relay results (d) — seeing outcomes for itself is the whole point."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "Why do your prompting skills from earlier modules still matter with Claude Code?",
      "options": [
        { "id": "a", "text": "They don't — agents ignore how you phrase things" },
        { "id": "b", "text": "The goal you give in plain English is still a prompt: specific goals with clear context and constraints steer the whole loop" },
        { "id": "c", "text": "Prompts only matter for the first message" },
        { "id": "d", "text": "Claude Code requires prompts written in code" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Everything you learned — be specific, give context, state the format of 'done' — now steers an agent instead of a single reply, which makes it MORE valuable, not less. Vague goal, wandering agent. And no, you direct it in ordinary English, not code (d)."
    }
  ]
}
```

### Lesson 02-first-session — "Your First Session" (~14 min)

**Frontmatter objectives:**
- Use the embedded terminal to give Claude Code a goal
- Watch the loop gather context (reading files) and report back
- Ask follow-up questions about an unfamiliar folder

**Narrative outline:**
1. Reassure and orient: below is a real terminal connected to a sandbox folder containing
   a tiny "recipe costs" project someone else wrote. Your job is NOT to understand the
   files — it's to make Claude understand them FOR you.
2. What's in the sandbox (tell them, roughly): a note file and two small JavaScript
   files — "JavaScript is a language of instructions for the computer; you will never
   need to read it unaided."
3. How to drive: type a plain-English request and press Enter. Suggested first move
   provided as a click-to-use prompt. Watch for the loop: you'll SEE Claude announce
   reads ("Read recipes.js") before it answers — that's step 2 of the loop, live.
4. `<Callout kind="tip">` Ask like you'd ask a colleague standing at the filing cabinet:
   "What's in this project?" "Which recipe is most expensive to make?" — goals, not
   commands.
5. Terminal exercise anchor: `<Exercise id="tx-first-session" />` with three tasks in the
   instructions (below).
6. Debrief prose after the anchor: what you just did — delegated reading. Point out that
   Claude ANSWERED from the actual files, not from training memory (module 03's cutoff
   lesson: context beats recall).
7. `<Callout kind="info">` If Claude's answer ever looks off — ask it to double-check the
   file. Agents can misread too; the loop makes correction cheap.

**Exercises:**

```json
{
  "type": "terminal",
  "id": "tx-first-session",
  "title": "Explore a stranger's project",
  "instructions": "The sandbox contains a tiny recipe-pricing project you've never seen. Use Claude to explore it — complete all three tasks by asking in plain English:\n\n1. Ask what files are in this project and what each one is for.\n2. Ask which recipe in the project costs the most to make, and how the cost is worked out.\n3. Ask what the TODO note in the project says and what it would involve.\n\nYou never need to open a file yourself — make Claude do the reading. If an answer seems vague, push back: 'check the file again and show me the exact line.'",
  "sandboxTemplate": "m05-explore",
  "allowedTools": "Read,Glob,Grep",
  "maxTurns": 10,
  "suggestedPrompts": [
    "What files are in this project, and what does each one do?",
    "Which recipe costs the most to make? Walk me through how the cost is calculated.",
    "What does the TODO note say, and what would doing it involve?"
  ]
}
```

### Lesson 03-first-edit — "Your First Edit" (~14 min)

**Frontmatter objectives:**
- Direct Claude Code to make a specific small edit
- Verify a change by asking Claude to show the result
- Practice specific edit requests (what file, what change, what outcome)

**Narrative outline:**
1. Level up: reading is safe; now you'll CHANGE something. Same sandbox style — a tiny
   "team snack menu" project. Still unbreakable: fresh copies on demand.
2. Anatomy of a good edit request (prompting skills, applied): name WHAT should be
   different (not how to code it), WHERE if you know it, and what DONE looks like.
   Example: "In the menu, change the Friday snack from donuts to fruit, and update the
   note at the top to say the menu was revised."
3. The Edit tool: you'll see Claude propose/announce edits. It reads before it edits —
   the loop again (gather context, act).
4. Verification habit — the most important beat: after any edit, ask Claude to show the
   changed part, or ask "read the file back — does it now say X?" Never assume; observe.
   `<Callout kind="tip">` This habit — request, then verify — is 80% of working well with
   agents, and it's exactly the trust/verify rule from module 03 applied to actions.
5. Terminal exercise anchor: `<Exercise id="tx-first-edit" />` (three-part edit task below).
6. Debrief: you described OUTCOMES in English and files changed. Notice what you didn't
   need: knowing JavaScript. The skill is precision of intent, not code.
7. Tee up lesson 04: "Claude asked before running things or editing — who decides what
   it's allowed to do? You do. Next lesson: the permission model."

**Exercises:**

```json
{
  "type": "terminal",
  "id": "tx-first-edit",
  "title": "Change the snack menu",
  "instructions": "The sandbox has a small 'team snack menu' project. Direct Claude to make these three changes — one request at a time, and VERIFY each before moving on:\n\n1. In menu.md, change Friday's snack from 'donuts' to 'fresh fruit'.\n2. In menu.md, add a new line at the bottom: 'Allergy note: always include a nut-free option.'\n3. In banner.js, the welcome message says 'SNACK MENU v1' — have Claude update it to 'SNACK MENU v2', then ask Claude to run it to prove the new banner prints.\n\nAfter each change, ask Claude to show you the updated lines. Done means: you've seen all three changes with your own eyes in Claude's output.",
  "sandboxTemplate": "m05-first-edit",
  "allowedTools": "Read,Edit,Bash(node *)",
  "maxTurns": 12,
  "suggestedPrompts": [
    "In menu.md, change Friday's snack from donuts to fresh fruit, then show me the updated Friday line.",
    "Add this line to the bottom of menu.md: Allergy note: always include a nut-free option. Show me the end of the file after.",
    "In banner.js, change the message SNACK MENU v1 to SNACK MENU v2, then run it with node to show me the new banner."
  ]
}
```

### Lesson 04-permissions — "Who's in Charge: Permissions" (~10 min)

**Frontmatter objectives:**
- Explain why an acting AI needs a permission system
- Describe what Claude Code does freely, asks about, and won't do
- Recognize permission prompts and respond deliberately

**Narrative outline:**
1. Reflect on lessons 02–03: Claude read freely, but edits and commands worked because
   this app pre-approved a narrow set of actions for each exercise. In real life, YOU
   hold that approval power. An AI with hands needs a leash you control.
2. The tiers, plain-language: **reading** (looking at files in the project) is generally
   allowed — looking can't break anything. **Acting** (editing files, running commands)
   triggers an ask-first prompt: Claude shows exactly what it wants to do and waits for
   yes/no. **Out of bounds** (files outside the project, dangerous commands) — blocked
   or heavily guarded by default.
3. Analogy: a contractor in your house. Walking around and measuring? Fine. Knocking a
   hole in a wall? They show you the plan and you sign off. Your neighbor's house?
   Never, no matter how helpfully they ask.
4. Approval choices when asked: allow once, allow for the whole session ("don't ask
   again for this"), or deny. Convenience vs control — start cautious, loosen as trust
   grows. Real Claude Code also lets you pre-approve specific narrow actions (exactly
   what this app does per exercise) — you'll configure that yourself in a later module.
5. `<Callout kind="warning">` The permission prompt is the ONE moment you're the safety
   system. Read what it says it will run. Approving without reading is how surprises
   happen.
6. `<Callout kind="info">` Why so careful when the sandbox is disposable? Habits
   transfer. Practice the read-then-approve reflex here, where mistakes are free.
7. Quiz anchor: `<Exercise id="quiz-permissions" />`

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-permissions",
  "title": "Check: the permission model",
  "passingScore": 75,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "Why does Claude Code need a permission system at all?",
      "options": [
        { "id": "a", "text": "To slow it down so humans feel useful" },
        { "id": "b", "text": "Because it takes real actions on real files — consequences require consent" },
        { "id": "c", "text": "Because the model is malicious by default" },
        { "id": "d", "text": "It's a legal formality with no practical effect" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "A chat model can only say things; an agent can DO things — edit files, run commands. Actions with consequences get a consent step. It's not about malice (c) — even a well-intentioned agent can misunderstand a goal, and the permission prompt is where you catch that."
    },
    {
      "id": "q2",
      "kind": "multi",
      "prompt": "Which actions would you expect to trigger an ask-first permission prompt (rather than happen freely)? Select all that apply.",
      "options": [
        { "id": "a", "text": "Reading a file inside the project to understand it" },
        { "id": "b", "text": "Editing a file to fix a bug" },
        { "id": "c", "text": "Running a command that deletes files" },
        { "id": "d", "text": "Listing which files exist in the project folder" },
        { "id": "e", "text": "Running any command it hasn't been pre-approved for" }
      ],
      "correctOptionIds": ["b", "c", "e"],
      "explanation": "Changes and commands (b, c, e) act on the world, so they ask first — destructive commands doubly so. Reading and listing files (a, d) just look, and looking can't break anything, so it's generally allowed inside the project."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "Claude Code asks to run a command you don't recognize. What's the right move?",
      "options": [
        { "id": "a", "text": "Approve — it probably knows best" },
        { "id": "b", "text": "Always deny anything you don't recognize, permanently" },
        { "id": "c", "text": "Ask Claude to explain in plain language what the command does and why it's needed, then decide" },
        { "id": "d", "text": "Close the terminal and start over" }
      ],
      "correctOptionIds": ["c"],
      "explanation": "You're allowed to interrogate before approving — 'explain what that command does and why' costs one message and Claude answers well. Blind approval (a) defeats the safety step; blanket permanent denial (b) makes the agent useless; neither builds the judgment you actually need."
    },
    {
      "id": "q4",
      "kind": "single",
      "prompt": "What does 'allow for the whole session' mean when approving a permission request?",
      "options": [
        { "id": "a", "text": "Claude may do that kind of action again this session without asking each time" },
        { "id": "b", "text": "Claude may now do anything it wants forever" },
        { "id": "c", "text": "The action is scheduled to run repeatedly" },
        { "id": "d", "text": "It only applies to reading files" }
      ],
      "correctOptionIds": ["a"],
      "explanation": "Session-wide approval trades some control for convenience on a SPECIFIC kind of action, for THIS session — useful when a task edits many files. It's scoped, not a forever blank check (b). Start with one-time approvals until you trust the pattern of what's being asked."
    }
  ]
}
```

### Lesson 05-fix-the-bug — "Challenge: Fix the Bug" (~18 min)

**Frontmatter objectives:**
- Complete a full agent-loop cycle on a real bug: describe, delegate, verify
- Use a test as the definition of done
- Pass an automated verification of the fix

**Narrative outline:**
1. Frame the milestone: everything so far, combined. There's a tiny program with a bug
   and a TEST that currently fails. You'll direct Claude to fix it. No hand-holding
   prompts this time — you write the goal.
2. Explain the fixture: `greet.js` builds a greeting message; `test.js` checks it and
   prints PASS or FAIL. "A test is a definition of done written as a program" — when the
   test prints PASS, you're done. Connect to module 02's format lesson: the test is the
   most specific 'format of done' possible.
3. Strategy coaching (not the answer): good opening goals mention the symptom AND the
   proof — e.g. "the test in this project fails; find the bug, fix it, and show me the
   test passing." Let Claude run the test FIRST to see the failure (observe before act —
   the loop).
4. `<Callout kind="tip">` Don't tell Claude HOW to fix it (you can't see the bug yet
   anyway) — tell it what done looks like and let the loop work.
5. Challenge anchor: `<Exercise id="ch-fix-greet" />`
6. Debrief prose: name what happened in loop terms — context gather (read greet.js,
   test.js), act (edit), observe (run test), repeat. That's software work now.
7. Module close: you've driven, edited, gated, and shipped a fix. Module 07 makes this
   an everyday workflow (project memory, settings, slash commands).

**Exercises:**

```json
{
  "type": "challenge",
  "id": "ch-fix-greet",
  "title": "Fix the failing greeting",
  "instructions": "This project has a bug. greet.js is supposed to greet someone by name — 'Hello, Ada!' — but something's wrong, and test.js currently prints FAIL. Direct Claude to find and fix the bug so the test passes.\n\nSuggested flow: (1) ask Claude to run the test and explain the failure, (2) ask it to fix the bug in greet.js, (3) ask it to run the test again and show you PASS. Then hit Verify.",
  "sandboxTemplate": "m05-fix-bug",
  "allowedTools": "Read,Edit,Bash(node *)",
  "maxTurns": 12,
  "verifierId": "m05-fix-greet",
  "criteria": [
    "greet.js exists",
    "node test.js prints PASS"
  ],
  "hints": [
    "Start by asking Claude to run test.js and explain, in plain language, what the test expected versus what it got.",
    "The bug is in how greet.js puts the greeting sentence together — ask Claude to compare greet.js's output with what test.js expects, word by word.",
    "Tell Claude directly: 'test.js expects greet(\"Ada\") to return exactly Hello, Ada! — fix greet.js so it does, then run the test to confirm.'"
  ]
}
```

## Sandbox templates

Three templates. Create each file EXACTLY as shown.

### `m05-explore/`

```
m05-explore/
  README.md
  recipes.js
  pricing.js
```

**`README.md`**
```md
# Recipe Cost Helper

A tiny tool for working out what our cafe's recipes cost to make.

- `recipes.js` — the list of recipes and their ingredients
- `pricing.js` — ingredient prices and the cost calculation

TODO: add a "brownies" recipe once we settle the cocoa supplier price.
```

**`recipes.js`**
```js
// Each recipe lists its ingredients and how much of each it uses (in units).
const recipes = [
  {
    name: "banana bread",
    ingredients: { banana: 3, flour: 2, sugar: 1, egg: 2 },
  },
  {
    name: "lemon muffins",
    ingredients: { lemon: 2, flour: 2, sugar: 2, egg: 1, butter: 1 },
  },
  {
    name: "shortbread",
    ingredients: { flour: 3, sugar: 1, butter: 2 },
  },
];

module.exports = { recipes };
```

**`pricing.js`**
```js
// Price per unit of each ingredient, in dollars.
const prices = {
  banana: 0.4,
  flour: 0.5,
  sugar: 0.6,
  egg: 0.35,
  lemon: 0.8,
  butter: 1.2,
};

const { recipes } = require("./recipes");

// Cost of a recipe = sum of (units used x price per unit).
function recipeCost(recipe) {
  let total = 0;
  for (const [ingredient, units] of Object.entries(recipe.ingredients)) {
    total += units * prices[ingredient];
  }
  return total;
}

for (const r of recipes) {
  console.log(`${r.name}: $${recipeCost(r).toFixed(2)}`);
}
```

(Builder reference — expected costs: banana bread = 3×0.4 + 2×0.5 + 1×0.6 + 2×0.35 = $3.50;
lemon muffins = 2×0.8 + 2×0.5 + 2×0.6 + 1×0.35 + 1×1.2 = $5.35;
shortbread = 3×0.5 + 1×0.6 + 2×1.2 = $4.50. Most expensive: **lemon muffins ($5.35)**.
Do not change the numbers; the lesson never states the answer, so learners must get it
from Claude.)

### `m05-first-edit/`

```
m05-first-edit/
  menu.md
  banner.js
```

**`menu.md`**
```md
# Team Snack Menu (week of the 12th)

- Monday: pretzels
- Tuesday: yogurt cups
- Wednesday: trail mix
- Thursday: cheese and crackers
- Friday: donuts
```

**`banner.js`**
```js
// Prints the menu banner. Run with: node banner.js
const title = "SNACK MENU v1";
const line = "=".repeat(title.length + 8);

console.log(line);
console.log(`||  ${title}  ||`);
console.log(line);
```

### `m05-fix-bug/`

```
m05-fix-bug/
  greet.js
  test.js
```

**`greet.js`** — the bug: greeting uses the literal string `"name"` instead of the
`name` variable, so every greeting comes out as `Hello, name!`.
```js
// Builds a friendly greeting for a person.
function greet(name) {
  return "Hello, " + "name" + "!";
}

module.exports = { greet };
```

**`test.js`**
```js
// Checks that greet() greets people by their actual name.
const { greet } = require("./greet");

const result = greet("Ada");
const expected = "Hello, Ada!";

if (result === expected) {
  console.log("PASS: greet(\"Ada\") returned \"" + result + "\"");
  process.exit(0);
} else {
  console.log("FAIL: expected \"" + expected + "\" but got \"" + result + "\"");
  process.exit(1);
}
```

## Verifiers to implement

- **`m05-fix-greet`** in `src/lib/verifiers/m05-meet-claude-code.ts`, registered in
  `src/lib/verifiers/index.ts`. Logic is IDENTICAL to the existing reference verifier
  `"demo-fix-greet"` in index.ts — copy its structure:
  1. Criterion "greet.js exists": `fileExists(sandboxDir, "greet.js")`; detail
     "greet.js not found in the sandbox" on failure.
  2. Criterion "node test.js prints PASS": `runNode(sandboxDir, "test.js")`; pass iff
     `exitCode === 0 && stdout.includes("PASS")`. On failure, detail should include the
     exit code and a trimmed slice of stderr/stdout (mirror demo-fix-greet's detail
     strings). Skip with detail "Skipped — greet.js is missing" when criterion 1 fails.
  - Overall pass = every criterion passes.
  - Pristine template MUST fail (test prints FAIL, exit 1). Fixing greet.js to
    `return "Hello, " + name + "!";` MUST pass. Test both.
  - Leave `demo-fix-greet` untouched in index.ts; add yours additively.

## Tone & vocabulary

- Voice: encouraging coach for a nervous first-timer. Celebrate milestones explicitly
  ("that was your first agent session"). Repeat the safety line: sandbox = disposable
  copy, nothing can break. Always say exactly what to type or click.
- May introduce (define on first use): **terminal**, **sandbox**, **agent / agent loop**,
  **Claude Code**, **tool** (Read/Edit/Bash by name), **command**, **permission prompt**,
  **test** (as "a definition of done written as a program"), **bug**, **JavaScript /
  .js file** (as "instructions for the computer" — no syntax teaching).
- Assumed: all of modules 01–03 vocabulary (prompting habits, context window, cutoff,
  trust/verify).
- BANNED: git, repository, CLAUDE.md, settings.json, slash commands, MCP, subagent,
  hooks, plan mode, function, variable, string (never explain code mechanics — Claude
  does the code reading), flags/CLI arguments.

## Done checklist

- [ ] `module.json` + 5 lessons + exercises.json files created and schema-valid
- [ ] Every exercise has an `<Exercise id/>` anchor in its lesson.mdx
- [ ] Templates `m05-explore`, `m05-first-edit`, `m05-fix-bug` created byte-faithful to spec
- [ ] `npm run seed-sandboxes` seeds all three templates
- [ ] Verifier `m05-fix-greet` implemented, registered; FAILS on pristine m05-fix-bug,
      PASSES after fixing greet.js (test both by hand)
- [ ] `npm run validate` passes; `npx tsc --noEmit` clean
- [ ] Both terminal exercises and the challenge smoke-tested end-to-end in the app
- [ ] curriculum.json status flipped `"spec"` → `"built"` for 05-meet-claude-code only
