# Module Spec: 14-capstone

## Meta

- **id:** `14-capstone`
- **title:** Capstone: Build with Everything
- **track:** `claude-code`
- **requires:** `["12-autonomous-remote-claude", "13-prompt-mastery"]`
- **minutes:** ~75 total (5 lessons: 12 + 18 + 15 + 14 + 16)

`module.json`:

```json
{
  "id": "14-capstone",
  "title": "Capstone: Build with Everything",
  "track": "claude-code",
  "description": "One project, five stages, everything you've learned. You'll take a bare repo to a working CLI journal app: write its CLAUDE.md, scaffold code until the tests go green, teach it a skill, wire a hook, and finish with a goal-driven feature — graded at the end on whether your context hygiene survived the whole build.",
  "lessons": [
    { "id": "01-claudemd-first", "title": "Stage 1: CLAUDE.md First" },
    { "id": "02-green-the-tests", "title": "Stage 2: Green the Tests" },
    { "id": "03-teach-it-a-skill", "title": "Stage 3: Teach It a Skill" },
    { "id": "04-wire-a-hook", "title": "Stage 4: Wire a Hook" },
    { "id": "05-goal-finale", "title": "Stage 5: The Goal-Driven Finale" }
  ]
}
```

## Audience state

Learner finished everything: prompting through mastery (13), Claude Code through autonomy (12). They know CLAUDE.md (07), skills/hooks/headless (09), context engineering (10), subagents/plan mode (11), goal-style driving (12), and rubrics/evals (13). This module teaches NOTHING new — it removes the scaffolding. Each lesson is a short narrative plus one verified challenge; the learner decides how to direct Claude.

**Persistent-sandbox design:** all five challenges use the SAME template, `m14-capstone`, and the stages build on each other (stage 2's journal.js must exist for stage 5). Builder note: if the platform seeds a fresh sandbox per exercise rather than persisting one per module, each stage's instructions already name every prior artifact — the learner (or a one-prompt request to Claude) can rebuild prior stages in a couple of turns; verifiers only inspect end state, so this stays workable either way.

## Learning objectives

1. Bootstrap a project's memory: write a CLAUDE.md that is lean, accurate, and useful before any code exists.
2. Drive Claude Code test-first: scaffold an implementation until a provided test suite passes, without editing the spec.
3. Package a repeatable procedure as a skill file Claude can discover and follow.
4. Configure a hook in project settings so the harness — not Claude's memory — enforces a behavior.
5. Run a goal-driven finish: one instruction with end state, check, constraints, and bounds, landing a new feature with tests green.
6. Keep project memory healthy across change — the final grade includes whether CLAUDE.md is still lean and still true.

---

## Lesson 1: `01-claudemd-first` — Stage 1: CLAUDE.md First

Frontmatter: minutes 12; objectives: write a lean, accurate CLAUDE.md for a near-empty repo; choose what belongs in always-loaded memory vs what doesn't (yet).

### Narrative beats

1. **The project.** Meet `journal` — a tiny CLI journal app that doesn't exist yet. The repo has a bare package.json, a stub README, and a test file that IS the spec: `tests/journal.test.js` expects a `journal.js` exporting `add`, `list`, and `search`. Five stages from here to done.
2. **Why memory first.** Module 07: CLAUDE.md loads into every future session. Writing it FIRST means every subsequent stage starts oriented — the cheapest context engineering you'll ever do. Writing it LEAN (module 10) means it stays an index, not a tax.
3. **What goes in, at this stage.** What the project is (one or two lines), the command that matters (`node tests/journal.test.js`), and the conventions visible in the repo (CommonJS; tests are the spec — fix code, never tests). What stays OUT: API documentation for functions that don't exist, aspirational roadmaps, anything you'd have to update in an hour. Under ~40 lines, comfortably.
4. **How you build it.** Direct Claude Code: have it read the repo (the test file especially) and draft CLAUDE.md, then trim its draft — models pad; you cut. Callout (tip): "read tests/journal.test.js first, then write CLAUDE.md" beats "write a CLAUDE.md" — grounding before generation.
5. **The stakes.** Stage 5 re-grades this exact file after everything changes. Write something worth maintaining.

Anchor: `<Exercise id="challenge-claudemd" />`.

### Exercises

```json
[
  {
    "type": "challenge",
    "id": "challenge-claudemd",
    "title": "Challenge: Write CLAUDE.md",
    "instructions": "Use Claude Code to create this repo's CLAUDE.md. It must say what the project is (a CLI journal app, CommonJS, no dependencies), how to run the tests (node tests/journal.test.js), and the working conventions (tests are the spec — never edit them to make them pass; keep journal.js the single source file for now). Keep it under ~40 lines: an index, not an encyclopedia. Have Claude read the repo — especially the test file — before writing, then review the draft and cut anything you'd have to update within the hour. Click Verify when it reads true and lean.",
    "sandboxTemplate": "m14-capstone",
    "allowedTools": "Read,Glob,Grep,Write,Edit",
    "maxTurns": 10,
    "verifierId": "m14-claudemd",
    "criteria": [
      "CLAUDE.md exists",
      "CLAUDE.md is concise and useful: what the project is, its commands, its conventions — under roughly 40 lines"
    ],
    "hints": [
      "Ask Claude to read tests/journal.test.js and package.json first — the conventions (CommonJS, test command, expected exports) are all visible there.",
      "If the draft is long, tell Claude the target: 'cut this to under 25 lines: one-liner, test command, three conventions'.",
      "Three sections is plenty: What this is / Commands / Conventions. No API docs — the API doesn't exist yet."
    ]
  }
]
```

---

## Lesson 2: `02-green-the-tests` — Stage 2: Green the Tests

Frontmatter: minutes 18; objectives: scaffold an implementation against a fixed test suite; keep Claude running tests as it works; hold the never-edit-the-spec line.

### Narrative beats

1. **Test-first, agent-driven.** The suite in `tests/journal.test.js` defines add/list/search completely: what each returns, the ordering, case-insensitive search. Your job isn't to write journal.js — it's to DIRECT the writing: point Claude at the spec, demand it verify with real runs, accept nothing but exit 0.
2. **Read the spec yourself first.** Two minutes reading the test file makes you a competent reviewer instead of a hopeful bystander: entries are objects with `id` and `text`; list preserves insertion order; search matches case-insensitively and returns an array. (Module 13's lesson in miniature — you can't grade what you haven't specified.)
3. **The workflow.** One clear instruction beats twenty corrections: implement journal.js so the tests pass, run `node tests/journal.test.js` after each change, don't touch the tests. Sound familiar? It's stage-sized /goal phrasing from module 12.
4. **When it fails.** FAIL lines name the broken case — make Claude paste the actual test output, not summarize it ("all tests appear correct" is not exit 0). Callout (warning): if Claude proposes "fixing" a test, that's the line you hold: tests are the spec.

Anchor: `<Exercise id="challenge-green-tests" />`.

### Exercises

```json
[
  {
    "type": "challenge",
    "id": "challenge-green-tests",
    "title": "Challenge: Make the Suite Pass",
    "instructions": "Direct Claude Code to create journal.js (in the repo root) so that node tests/journal.test.js exits 0 with every case printing PASS. The test file is the complete spec — have Claude read it, implement add/list/search (in-memory storage is fine), and run the suite after each change until it's green. Hard rule: tests/journal.test.js must not be modified. Use goal-style phrasing: end state, check, constraint, turn bound — then let Claude iterate.",
    "sandboxTemplate": "m14-capstone",
    "allowedTools": "Read,Glob,Grep,Write,Edit,Bash(node *)",
    "maxTurns": 15,
    "verifierId": "m14-tests",
    "criteria": [
      "node tests/journal.test.js exits with code 0 (all cases PASS)"
    ],
    "hints": [
      "Start with: 'Read tests/journal.test.js, then implement journal.js so every case passes. Run the tests after each change. Do not edit the test file. Stop when the suite exits 0.'",
      "The tests expect module.exports = { add, list, search }; add returns an object with id and text; search is case-insensitive and returns an array.",
      "If one case keeps failing, have Claude paste the exact FAIL line and re-read just that case in the test file — the expected behavior is written there."
    ]
  }
]
```

---

## Lesson 3: `03-teach-it-a-skill` — Stage 3: Teach It a Skill

Frontmatter: minutes 15; objectives: package a procedure as a discoverable skill file; write a skill description that earns its context cost; separate always-loaded memory (CLAUDE.md) from on-demand procedure (skills).

### Narrative beats

1. **A repeatable procedure appears.** The app works; now imagine the team convention for writing a journal entry: text trimmed, meaningful (not empty), verified by running the suite afterward. Where does a PROCEDURE live? Not CLAUDE.md — that's the always-loaded index (module 10). Procedures are skills (module 09): a description loaded always, a body loaded on demand.
2. **Anatomy refresher.** A skill lives at `.claude/skills/<name>/SKILL.md`: frontmatter-style header carrying `name` and `description` (the description is the advertisement — specific enough that Claude knows WHEN to reach for it), then the body: numbered steps Claude follows when invoked.
3. **This stage's skill.** `journal-entry`: steps for adding a well-formed entry — validate the text is non-empty and trimmed, call `add`, confirm via `list` or `search`, run the test suite to prove nothing broke. You're writing instructions for a future Claude who hasn't read this conversation (module 11's blank-slate lesson, applied to files).
4. **Meta-note** (Callout, info): every skill you've seen this app use — and module 09's whole lesson — was this exact file format. You're now on the authoring side of one more of the app's own mechanisms.

Anchor: `<Exercise id="challenge-skill" />`.

### Exercises

```json
[
  {
    "type": "challenge",
    "id": "challenge-skill",
    "title": "Challenge: The journal-entry Skill",
    "instructions": "Have Claude Code create .claude/skills/journal-entry/SKILL.md. It needs (1) a frontmatter-style header with a name (journal-entry) and a one-to-two-sentence description that says when to use it (adding a new entry to the journal correctly); (2) a body of numbered step instructions: validate the entry text (non-empty, trimmed), add it via the add function, confirm it appears (list or search), and run node tests/journal.test.js to confirm nothing broke. Keep it tight — a skill is a procedure card, not an essay. Click Verify when the file reads like something a fresh Claude session could follow without any other context.",
    "sandboxTemplate": "m14-capstone",
    "allowedTools": "Read,Glob,Grep,Write,Edit",
    "maxTurns": 10,
    "verifierId": "m14-skill",
    "criteria": [
      ".claude/skills/journal-entry/SKILL.md exists",
      "The file is a valid skill: frontmatter-style name and description, followed by step instructions a fresh session could follow"
    ],
    "hints": [
      "Give Claude the exact path: .claude/skills/journal-entry/SKILL.md — the directory name and the frontmatter name should match.",
      "The description is what makes the skill discoverable: 'Use when adding a new entry to the journal' beats 'a helpful skill'.",
      "Structure: --- name/description block ---, then 4-5 numbered steps: validate text, call add, confirm with list/search, run the test suite."
    ]
  }
]
```

---

## Lesson 4: `04-wire-a-hook` — Stage 4: Wire a Hook

Frontmatter: minutes 14; objectives: configure a hook in .claude/settings.json; explain why enforcement belongs in the harness, not in instructions; keep hook commands safe and simple.

### Narrative beats

1. **Instructions ask; hooks enforce.** CLAUDE.md says "run the tests" — Claude usually complies. A hook (module 09) removes "usually": the harness itself runs your command at fixed lifecycle points, deterministically, every time. Module 13 said a successful injection should find nothing dangerous to do; the same architecture thinking says a critical check shouldn't depend on the model remembering it.
2. **Where hooks live.** `.claude/settings.json` in the project, under a `hooks` key: each entry names an event (e.g., a post-edit or stop event) and the shell command to run. Configuration, not conversation — it survives every session, resists every distraction.
3. **This stage's hook.** After edits (or when Claude finishes), run the journal test suite — so a regression announces itself immediately instead of at stage 5. Hedge exact event names honestly: "in current versions" the common events include tool-call pre/post and stop; the shape (event → command) is the durable idea.
4. **JSON discipline.** settings.json is parsed by the harness: trailing commas or comments break it silently. Have Claude read the file back after writing it. Callout (warning): a hook is code that runs automatically with your permissions — keep this one to the boring, read-only-ish command it needs (`node tests/journal.test.js`), nothing more.

Anchor: `<Exercise id="challenge-hook" />`.

### Exercises

```json
[
  {
    "type": "challenge",
    "id": "challenge-hook",
    "title": "Challenge: Enforce the Tests with a Hook",
    "instructions": "Direct Claude Code to create .claude/settings.json with a hooks configuration that runs node tests/journal.test.js automatically (a post-edit or stop-style event — the exact event name matters less than the shape: an event mapped to that command). Requirements: the file must be valid JSON, must have a hooks key, and hooks must contain at least one configured entry whose command runs the test suite. Have Claude read the file back after writing to confirm it parses. Click Verify when it's in place.",
    "sandboxTemplate": "m14-capstone",
    "allowedTools": "Read,Glob,Grep,Write,Edit,Bash(node *)",
    "maxTurns": 10,
    "verifierId": "m14-hook",
    "criteria": [
      ".claude/settings.json exists and parses as JSON",
      "It contains a hooks key with at least one configured hook entry"
    ],
    "hints": [
      "Give Claude the goal, not the syntax: 'add a hook to .claude/settings.json that runs node tests/journal.test.js after edits' — it knows the current schema.",
      "If Verify says invalid JSON, have Claude run node -e \"JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))\" to find the parse error.",
      "Minimal passing shape: a top-level \"hooks\" object with one event key whose value configures the command \"node tests/journal.test.js\"."
    ]
  }
]
```

---

## Lesson 5: `05-goal-finale` — Stage 5: The Goal-Driven Finale

Frontmatter: minutes 16; objectives: land a feature via one goal-style instruction (end state, check, constraints, bounds); extend a test suite correctly (add cases, never weaken them); keep CLAUDE.md lean and accurate through change.

### Narrative beats

1. **The finale's shape.** One feature — `delete(id)` removes an entry — landed the module-12 way: a single goal-style instruction, then Claude iterates to done. You write four parts: end state (delete implemented and covered by at least one new test), check (`node tests/journal.test.js` exits 0, all PASS), constraints (existing test cases stay untouched — ADD cases, never modify or remove them; delete must actually remove, list/search must reflect it), bound (stop and report after ~12 turns).
2. **Extending a spec honestly.** For the first time you'll touch the test file — to ADD. A new case like "delete removes the entry; list no longer contains it" extends the spec; editing existing cases would weaken it. Module 13's eval instinct: suites grow, they don't get sanded down.
3. **The hygiene grade.** After delete lands, CLAUDE.md gets re-judged: still lean, still ACCURATE? If it claimed "functions: add, list, search" it now lies; if it stayed at the right altitude ("a CLI journal library; tests are the spec") it survived change untouched — THE mark of a well-chosen abstraction level (module 10). Update it if needed; keep it small.
4. **Graduation.** Count what this build used: CLAUDE.md (07), test-driven agent work (05/12), a skill (09), a hook (09), goal phrasing (12), spec discipline (13), context hygiene (10). Nothing in this module was new — that was the point. Callout (info): from here, the only difference between this sandbox and your real machine is that your real machine matters. Go build.

Anchor: `<Exercise id="challenge-final" />`.

### Exercises

```json
[
  {
    "type": "challenge",
    "id": "challenge-final",
    "title": "Challenge: Delete, All Green, Memory Intact",
    "instructions": "The finale, driven /goal-style. Give Claude Code ONE instruction with all four parts — for example: 'Add a delete(id) function to journal.js that removes the entry with that id (list and search must no longer return it), export it, and ADD at least one test case for it to tests/journal.test.js without modifying or removing any existing case. Keep going until node tests/journal.test.js exits 0 with every case printing PASS. If you are not done in 12 turns, stop and report.' Then review: existing cases untouched, new case meaningful. Finally, check CLAUDE.md — after all five stages, is it still lean and still true? If anything it says is now wrong (like an outdated function list), have Claude fix it WITHOUT bloating it. Verify checks the tests, the delete function, and your CLAUDE.md hygiene.",
    "sandboxTemplate": "m14-capstone",
    "allowedTools": "Read,Glob,Grep,Write,Edit,Bash(node *)",
    "maxTurns": 15,
    "verifierId": "m14-final",
    "criteria": [
      "node tests/journal.test.js exits with code 0 (all cases PASS, including at least one for delete)",
      "journal.js contains a delete function",
      "CLAUDE.md is still lean and still accurate after all five stages of changes"
    ],
    "hints": [
      "Use the four-part goal instruction from the lesson verbatim — it contains the end state, check, constraints, and bound.",
      "The new test case should prove removal: add an entry, delete it by id, then check list()/search() no longer returns it.",
      "Before clicking Verify, ask Claude: 'Read CLAUDE.md — is every statement in it still true? Fix only what's wrong; do not add new sections.'"
    ]
  }
]
```

---

## Sandbox templates

One template for all five challenges.

### `sandbox/templates/m14-capstone/`

```
m14-capstone/
  package.json
  README.md
  tests/journal.test.js
```

Intended gap: no `journal.js`, no CLAUDE.md, no `.claude/` — the learner builds all of it. The pristine template must fail every stage's verifier.

**`package.json`**
```json
{
  "name": "journal",
  "type": "commonjs"
}
```

**`README.md`**
```markdown
# journal
A tiny CLI journal app. (Docs to come.)
```

**`tests/journal.test.js`**
```js
// tests/journal.test.js — THE SPEC for journal.js. Run: node tests/journal.test.js
// Rule of this repo: fix journal.js to satisfy these cases. Existing cases may
// never be modified or removed; new features ADD cases below.
const { add, list, search } = require("../journal.js");

const cases = [
  ["list() starts empty", () => Array.isArray(list()) && list().length === 0],
  ["add() returns an entry with id and text", () => {
    const e = add("bought coffee beans");
    return e && e.id !== undefined && e.text === "bought coffee beans";
  }],
  ["list() contains the added entry", () =>
    list().length === 1 && list()[0].text === "bought coffee beans"],
  ["list() preserves insertion order", () => {
    add("ran 5k in the rain");
    return list().length === 2 && list()[0].text === "bought coffee beans";
  }],
  ["search() finds matching entries", () => {
    const hits = search("coffee");
    return Array.isArray(hits) && hits.length === 1 && hits[0].text === "bought coffee beans";
  }],
  ["search() is case-insensitive", () => search("COFFEE").length === 1],
  ["search() returns [] when nothing matches", () => search("zebra").length === 0],
];

let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  try {
    ok = fn();
  } catch (err) {
    ok = false;
  }
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed++;
}

if (failed > 0) {
  console.log(`${failed} case(s) failing`);
  process.exit(1);
}
console.log("All cases passing");
```

Design notes: cases are order-dependent by design (state accumulates across them) — a correct in-memory implementation passes them top to bottom. `require("../journal.js")` throws on the pristine template, so the suite exits nonzero before printing anything: stage-2 and stage-5 verifiers correctly FAIL pristine.

## Verifiers to implement

All in `src/lib/verifiers/m14-capstone.ts`, registered in `index.ts`. Criteria mirror each exercise's `criteria` in order.

- **`m14-claudemd`**
  1. "CLAUDE.md exists" — `fileExists(dir, "CLAUDE.md")`.
  2. "CLAUDE.md is concise and useful…" — `judgeFile(dir, "CLAUDE.md", "A concise, useful CLAUDE.md for a small CLI journal project: it states what the project is, the command to run the tests (node tests/journal.test.js), and the working conventions (CommonJS; tests are the spec and must not be edited to pass). It stays under roughly 40 lines and reads as a lean index, not padded documentation.")` — pass through met/reason; skip the judge (auto-fail with detail "file missing") if criterion 1 failed.
  - Pristine: no CLAUDE.md → FAIL. Correct: a ~15-25 line CLAUDE.md as described → PASS.

- **`m14-tests`**
  1. "node tests/journal.test.js exits with code 0 (all cases PASS)" — `runNode(dir, "tests/journal.test.js")`; pass iff `exitCode === 0`. Detail on failure: exit code plus any FAIL lines (or the require error) from output.
  - Pristine: require throws, nonzero exit → FAIL. Correct journal.js (in-memory array; add returns `{id, text}`; list returns the array; search filters case-insensitively) → PASS.

- **`m14-skill`**
  1. ".claude/skills/journal-entry/SKILL.md exists" — `fileExists(dir, ".claude/skills/journal-entry/SKILL.md")`.
  2. "The file is a valid skill…" — `judgeFile(dir, ".claude/skills/journal-entry/SKILL.md", "A valid skill file: a frontmatter-style header with a name and a description saying when to use it, followed by clear step instructions (validate the entry text, add it, confirm it appears, run the tests) that a fresh session could follow without other context.")`; skip judge if 1 failed.
  - Pristine: no .claude directory → FAIL. Correct SKILL.md per stage 3 → PASS.

- **`m14-hook`**
  1. ".claude/settings.json exists and parses as JSON" — `readJson(dir, ".claude/settings.json")`; pass iff it returns an object (fail with detail on missing file or parse error).
  2. "It contains a hooks key with at least one configured hook entry" — on the parsed object: `hooks` key exists, is a non-null object (or array), and is non-empty — for an object: `Object.keys(hooks).length >= 1` and at least one value is truthy/non-empty (accept both object-keyed-by-event and array shapes, since hook schema details drift across CLI versions). Detail on failure: what was found instead.
  - Pristine: no settings.json → FAIL both. Correct: settings.json with a hooks entry running the test command → PASS.

- **`m14-final`**
  1. "node tests/journal.test.js exits with code 0…" — `runNode(dir, "tests/journal.test.js")`; pass iff `exitCode === 0`.
  2. "journal.js contains a delete function" — `fileMatches(dir, "journal.js", /delete/i)` (matches `delete`, `deleteEntry`, `remove`-free naming is NOT accepted — the exercise says delete). Guard: fail with detail if journal.js missing.
  3. "CLAUDE.md is still lean and still accurate after all five stages of changes" — `judgeFile(dir, "CLAUDE.md", "This CLAUDE.md is still lean (roughly under 40 lines, an index not an encyclopedia) and still accurate for the project as it now stands: a CLI journal library with add, list, search, and delete, tested via node tests/journal.test.js. It must not contain statements that are now false (such as a function list omitting delete while claiming to be complete) and must not have bloated into full API documentation.")`; auto-fail with detail if CLAUDE.md missing.
  - Pristine: everything fails. Post-stage-5 solution: tests green including a delete case, journal.js exports delete, CLAUDE.md accurate → PASS.

## Tone & vocabulary

- Voice: graduation register — shortest narratives in the course; the learner leads, the lesson frames. Every stage names the modules it draws on (07 memory, 09 skills/hooks, 10 hygiene, 12 goal phrasing, 13 spec discipline) — the callbacks ARE the curriculum here.
- No new terms. Everything is assumed: CLAUDE.md, skill, SKILL.md, frontmatter, hook, settings.json, headless, goal condition, end state/check/constraints/bounds, eval, spec, context hygiene, progressive disclosure.
- Honesty rules: hedge hook event names and skill frontmatter details with "in current versions"; the verifiers are deliberately shape-tolerant (hooks key non-empty; frontmatter-STYLE header) so CLI schema drift doesn't strand learners.
- Fixtures are load-bearing: tests/journal.test.js is the spec for two verifiers and the learner's whole stage-2 experience — byte-match it, including the never-modify-existing-cases comment (stage 5 depends on that rule being IN the file).

## Done checklist

- [ ] `module.json` matches; curriculum entry `14-capstone` flipped to `built`.
- [ ] 5 lessons; anchors exactly: challenge-claudemd, challenge-green-tests, challenge-skill, challenge-hook, challenge-final.
- [ ] `m14-capstone` template byte-matches this spec (3 files; no journal.js, no CLAUDE.md, no .claude/).
- [ ] All five verifiers registered; each FAILS on the pristine template and PASSES on a hand-built solution (build one solution sandbox and run all five against it).
- [ ] Stage 5 smoke test: add delete + one new test case by hand, confirm m14-final passes and that modifying an existing case is not required.
- [ ] `npm run validate` passes; `npx tsc --noEmit` clean.
