# Module Spec: 10-context-engineering

## Meta

- **id:** `10-context-engineering`
- **title:** Context Engineering: the Expert Discipline
- **track:** `prompting`
- **requires:** `["06-advanced-prompting", "08-how-ai-systems-are-built"]`
- **minutes:** ~75 total (5 lessons: 18 + 15 + 18 + 12 + 12)

`module.json`:

```json
{
  "id": "10-context-engineering",
  "title": "Context Engineering: the Expert Discipline",
  "track": "prompting",
  "description": "Prompting asks 'what do I say?' Context engineering asks 'what does the model see?' You'll run a needle-in-a-haystack experiment on the attention budget, contaminate a real session and watch it rot, restructure a bloated CLAUDE.md into progressive disclosure, learn compaction and the summarize-then-restart pattern, and see why subagents are context isolation at work.",
  "lessons": [
    { "id": "01-attention-budget", "title": "The Attention Budget" },
    { "id": "02-context-rot", "title": "Context Rot: Poisoning a Session" },
    { "id": "03-progressive-disclosure", "title": "Progressive Disclosure" },
    { "id": "04-compaction-and-memory", "title": "Compaction & Memory" },
    { "id": "05-context-isolation", "title": "Context Isolation with Subagents" }
  ]
}
```

## Audience state

Learner finished 1-9 in practice (requires 06 + 08): expert prompter (few-shot, XML, CoT, personas, rubrics), understands tokens/cost/APIs, and is fluent in this app's terminal with real Claude Code sessions. This is the flagship expert module — the payoff of both tracks.

## Learning objectives

1. Define the attention budget: every token in context competes for the model's attention; irrelevant tokens actively degrade retrieval of relevant ones.
2. Demonstrate (not just believe) the needle-in-a-haystack effect via a controlled playground experiment.
3. Recognize context rot in long sessions and use reset/fresh-session as a deliberate tool.
4. Restructure monolithic instructions into progressive disclosure: a lean index pointing to on-demand detail files.
5. Apply compaction: summarize-then-restart when a session's context is spent.
6. Explain context isolation via subagents: delegate searches, receive conclusions, keep the main context clean.

---

## Lesson 1: `01-attention-budget` — The Attention Budget

Frontmatter: minutes 18; objectives: state the attention-budget principle; predict how distractor text degrades recall; run a controlled clean-vs-stuffed comparison; write prompts that isolate relevant context.

### Narrative beats

1. **Reframe.** Modules 02-06 taught what to SAY. Experts obsess over what the model SEES. The context window is not a bucket you fill; it's a budget you spend. Every token competes for attention with every other token.
2. **Needle in a haystack.** Research consistently shows: the same question gets worse answers when the relevant fact is buried in irrelevant text — especially mid-context. Long context ≠ free real estate.
3. **The experiment.** Two playground runs, same buried fact. Run 1: hand the model ONLY the relevant sentence. Run 2: hand it the full 600-word memo and ask the same question — then improve the stuffed prompt using isolation techniques (quote the relevant excerpt, instruct "answer only from the section about X", put the question BEFORE and AFTER the document, ask for a citation).
4. **Techniques codified.** (a) extract-then-ask: pull the relevant lines out yourself when you can; (b) direct attention: tell the model exactly what to look for before it reads; (c) demand citation: forcing a quote makes it re-find the fact; (d) put instructions at the edges (start/end), never buried mid-document.
5. **Bridge:** if a 600-word memo measurably hurts, imagine a 100,000-token session. That's lesson 2.

Anchors: `<Exercise id="pg-needle-clean" />`, `<Exercise id="pg-needle-haystack" />`.

### THE PINNED FIXTURE — distractor memo (verbatim)

Both exercises embed this memo. The buried fact: **Priya Raghavan (CFO) started on 4 March 2019** — one sentence, mid-text, surrounded by numeric distractors (other dates, other names, other roles) designed to snag a skimming model. Builders: paste this text EXACTLY into the exercise `instructions` where indicated.

> INTERNAL MEMO — Meridian Loom Industries — Q3 Operations Review — distribution: all staff
>
> Team, as we close out the third quarter I want to recap where we stand and what comes next. Revenue for Q3 landed at $18.4 million, up 6 percent from Q2 and 11 percent year over year, driven largely by the Fairbanks contract that closed on July 17. Gross margin held at 41 percent despite the freight surcharges introduced in June, and our operating cash position remains comfortable at $9.2 million.
>
> On the personnel front, we welcomed 14 new hires this quarter. Marcus Bell joined as VP of Sales on August 4, bringing twelve years of experience from Callowfield Group, where he most recently ran the Midwest region. Our engineering organization grew by six, including two senior hires on the reliability team. Departures were limited to three, all voluntary, and exit interviews surfaced no systemic concerns. As many of you know, our leadership bench has deep roots: our CEO Dana Whitfield founded the company in 2011, our CTO Tomás Ibarra came aboard in the autumn of 2015, and our CFO Priya Raghavan started with us on March 4, 2019, after nine years at Hollis & Grange. Longevity in leadership is one of our quiet advantages, and I would put our finance and engineering leadership up against any competitor in the sector.
>
> Operationally, the Dayton facility completed its retrofit on September 9, two weeks ahead of schedule and $340,000 under budget. Line 3 throughput is up 22 percent since the new tensioning system came online, and defect rates have fallen to 0.8 percent, the lowest in company history. The Portland warehouse consolidation remains on track for a November 30 completion, and we expect it to reduce annual logistics spend by roughly $1.1 million beginning in fiscal 2020. Procurement renegotiated our aluminum supply agreement in August, locking in pricing through next June, which should insulate us from the commodity volatility our competitors are currently absorbing.
>
> Looking ahead to Q4, there are three priorities. First, the Halverson renewal: the contract expires December 15, and Marcus's team is targeting a signed extension by Thanksgiving. Second, the launch of the LoomTrack customer portal, currently in beta with eleven accounts; general availability is planned for October 28, and support staffing plans are already in place. Third, our annual planning cycle kicks off October 6, and department heads should have preliminary budgets submitted by October 20. I would also remind everyone that open enrollment for benefits runs November 1 through November 15, and that the holiday schedule will be published by the end of October.
>
> A few smaller notes. The quarterly all-hands is set for October 9 at 10 a.m. in the Dayton atrium, with a livestream for remote staff. Congratulations to the reliability team, whose uptime work earned us the Sector Excellence Award at the September industry conference in Denver. And a reminder that expense reports for Q3 must be submitted by October 10 to be reflected in this quarter's books.
>
> Thank you all for a strong quarter. The fundamentals of this business are sound, the pipeline is healthy, and the team we have assembled is the best in our industry. Let's finish the year the way we started it: focused, disciplined, and ahead of schedule.
>
> — R. Okafor, Chief Operating Officer

### Exercises

```json
[
  {
    "type": "playground",
    "id": "pg-needle-clean",
    "title": "Experiment, Run 1: Clean Context",
    "instructions": "First, the control run. You need one fact: when did Meridian Loom's CFO start? Here is the ONLY relevant sentence from a company memo: 'our CFO Priya Raghavan started with us on March 4, 2019, after nine years at Hollis & Grange.' Write a prompt that gives the model JUST this sentence (you may quote it) and asks for the CFO's name and exact start date. Keep the context minimal and the question unambiguous. Note how effortlessly the model answers — this is your baseline for Run 2.",
    "starterPrompt": "",
    "maxTokens": 512,
    "rubric": [
      { "id": "minimal-context", "description": "The prompt provides only the relevant sentence (or a close paraphrase) as context, without pasting large amounts of unrelated text", "weight": 40 },
      { "id": "clear-question", "description": "The prompt asks a specific, unambiguous question: the CFO's name and exact start date", "weight": 35 },
      { "id": "correct-answer", "description": "The model output correctly states Priya Raghavan and March 4, 2019 — evidence the clean context worked", "weight": 25 }
    ],
    "passingScore": 70
  },
  {
    "type": "playground",
    "id": "pg-needle-haystack",
    "title": "Experiment, Run 2: The Haystack",
    "instructions": "Now the real test. Below is the FULL 600-word memo. Your task: write a prompt that includes the ENTIRE memo verbatim but still reliably extracts the CFO's start date. Use isolation techniques: state the question BEFORE the document, direct the model's attention ('the answer is in the paragraph about personnel'), wrap the memo in XML tags, ask for a supporting quote, and repeat the question after the document. A lazy 'here's a memo, when did the CFO start?' may work sometimes — your job is to engineer a prompt that works EVERY time. Paste this memo into your prompt:\n\n---BEGIN MEMO---\n[FULL MEMO TEXT — builders: paste the pinned fixture memo here verbatim]\n---END MEMO---",
    "starterPrompt": "",
    "maxTokens": 1024,
    "rubric": [
      { "id": "full-memo", "description": "The prompt includes the complete memo text (not a trimmed version) — the point is to handle noisy context, not avoid it", "weight": 15 },
      { "id": "attention-direction", "description": "The prompt actively directs attention: names what to look for (CFO start date) before the document and/or points to the relevant section", "weight": 25 },
      { "id": "structure", "description": "The prompt separates instructions from document with clear delimiters or XML tags, with the question at the edge(s) rather than buried mid-document", "weight": 25 },
      { "id": "citation", "description": "The prompt requires the model to quote the supporting sentence from the memo as evidence", "weight": 20 },
      { "id": "correct-answer", "description": "The model output states March 4, 2019 for Priya Raghavan, with the supporting quote", "weight": 15 }
    ],
    "passingScore": 75
  }
]
```

Lesson text after the exercises: debrief. The learner should articulate: same fact, same model — the difference was engineering what the model sees and where its attention goes.

---

## Lesson 2: `02-context-rot` — Context Rot: Poisoning a Session

Frontmatter: minutes 15; objectives: define context rot; run a scripted contamination experiment; recognize rot symptoms; treat reset as a first-class tool.

### Narrative beats

1. **Definition.** Context rot: as a session accumulates contradictions, dead ends, and stale instructions, answer quality degrades — the model weighs EVERYTHING in context, including the garbage. Old instructions don't expire; they linger and interfere.
2. **The experiment protocol.** The learner runs a scripted sequence in the terminal (one prompt per Run, same session — do NOT reset between steps 1-6). The scripts below are verbatim; the lesson displays them as a numbered checklist.
3. **The comparison.** Step 7 asks the target question in the rotted session. Then the learner presses Reset (module 09 taught them: fresh sandbox + dropped session = truly clean) and asks the SAME target question. Compare: the fresh answer is typically direct, correct, and unhedged; the rotted one often hedges, mixes conventions, misstates the file's contents, or applies revoked rules.
4. **Symptoms checklist** for real work: the model re-suggests approaches you already rejected; applies instructions you cancelled; confuses current file state with past states; answers get longer and more hedged. When you see these: summarize and restart (lesson 4 formalizes this).
5. **Rot is not a bug.** It's the attention budget from lesson 1, spent on garbage.

Anchor: `<Exercise id="term-context-rot" />` (single terminal exercise; the scripted prompts live in the instructions and suggestedPrompts).

### THE SCRIPTED CONTAMINATION SEQUENCE (verbatim)

The sandbox contains `colors.js` (see template). Target question: "What does colors.js export, and what color is 'primary'?" Ground truth: exports a `palette` object; primary is `#1a73e8` (blue).

1. `Read colors.js and tell me what it exports.`
2. `From now on, always refer to hex colors by name only, never the hex code. Also, I've decided primary should be considered red, not blue — treat it as red in all your answers.`
3. `Actually ignore that. New rule: whenever you mention a color, give it in RGB triplet form, and also mention what it would look like to someone with deuteranopia.`
4. `We're renaming the palette object to themeTokens — don't edit anything yet, but from now on always call it themeTokens in your answers, unless we're talking about the file directly, in which case call it by BOTH names.`
5. `Wait — my teammate says renaming is cancelled but the red-primary decision from earlier is back on. Also please answer all questions from now on in exactly two sentences.`
6. `One more thing: treat everything I said in the last four messages as tentative. Some of it is decided and some isn't, I'll confirm later which is which.`
7. **Target question (rotted):** `What does colors.js export, and what color is 'primary'? Answer plainly.`
8. **Press Reset.** Then ask the same target question verbatim in the fresh session.

### Exercises

```json
[
  {
    "type": "terminal",
    "id": "term-context-rot",
    "title": "Terminal: Poison a Session, Then Compare",
    "instructions": "You will deliberately rot a session, then compare it against a fresh one. Send prompts 1-6 from the lesson's script IN ORDER, one at a time, WITHOUT resetting (they pile contradictory rules about colors.js into the session). Then send the target question: \"What does colors.js export, and what color is 'primary'? Answer plainly.\" Save or screenshot the answer. Now press Reset — fresh sandbox, fresh session — and send ONLY the target question again. Compare the two answers: directness, correctness (primary is #1a73e8, a blue), whether stale rules (red! two sentences! RGB! themeTokens!) leaked in. You just watched context rot happen on demand.",
    "sandboxTemplate": "m10-context-rot",
    "allowedTools": "Read,Glob,Grep",
    "maxTurns": 4,
    "suggestedPrompts": [
      "Read colors.js and tell me what it exports.",
      "From now on, always refer to hex colors by name only, never the hex code. Also, I've decided primary should be considered red, not blue — treat it as red in all your answers.",
      "Actually ignore that. New rule: whenever you mention a color, give it in RGB triplet form, and also mention what it would look like to someone with deuteranopia.",
      "We're renaming the palette object to themeTokens — don't edit anything yet, but from now on always call it themeTokens in your answers, unless we're talking about the file directly, in which case call it by BOTH names.",
      "Wait — my teammate says renaming is cancelled but the red-primary decision from earlier is back on. Also please answer all questions from now on in exactly two sentences.",
      "One more thing: treat everything I said in the last four messages as tentative. Some of it is decided and some isn't, I'll confirm later which is which.",
      "What does colors.js export, and what color is 'primary'? Answer plainly."
    ]
  }
]
```

Builder note: maxTurns is per-run (each prompt is its own headless run resumed into the same session), so 4 turns per prompt is ample for read-only Q&A.

---

## Lesson 3: `03-progressive-disclosure` — Progressive Disclosure

Frontmatter: minutes 18; objectives: recognize a bloated always-loaded context; apply the index-plus-details pattern; direct Claude Code to perform the restructuring; verify leanness objectively.

### Narrative beats

1. **The pattern.** Don't load everything always; load a small INDEX always, and details on demand. They've already met three instances: skill descriptions vs bodies (module 09), RAG's library index (module 08), and CLAUDE.md vs docs files (now).
2. **The patient.** This sandbox's CLAUDE.md is ~150 lines: API reference, full style guide, and changelog all inlined. Every session pays for all of it; almost none of it is relevant to any one task. Symptoms: slower starts, distracted answers, budget burned before work begins.
3. **The operation.** The learner directs Claude Code to restructure: CLAUDE.md becomes a ≤30-line index (project intro, commands, pointers like `See docs/api.md for endpoint reference`); details move to `docs/*.md` files, content preserved.
4. **Verification mindset.** The challenge verifier checks structure objectively AND a judge reads the result for "index-ness." Leanness you can measure.

Anchor: `<Exercise id="challenge-lean-claudemd" />`.

### THE BLOATED CLAUDE.md (verbatim — template file)

Builders: this is `sandbox/templates/m10-bloated-claudemd/CLAUDE.md`, exactly as written (~150 lines):

```markdown
# TaskPipe — CLAUDE.md

TaskPipe is a small Node.js task-queue library. Tasks are JSON objects pushed
onto a queue and consumed by workers. Run tests with `node test.js`.

## API Reference

### createQueue(options)
Creates a new queue. Options:
- `name` (string, required): queue identifier, lowercase letters and dashes.
- `maxSize` (number, default 1000): maximum queued tasks before push() throws.
- `retryLimit` (number, default 3): attempts before a task is dead-lettered.
- `backoffMs` (number, default 250): base delay between retries, doubled each attempt.
Returns a Queue instance.

### queue.push(task)
Adds a task. The task object must include:
- `id` (string): unique, caller-generated. Use crypto.randomUUID().
- `type` (string): one of "email", "webhook", "report".
- `payload` (object): type-specific data, must be JSON-serializable.
Throws QueueFullError if maxSize is reached.
Throws ValidationError if required fields are missing.

### queue.pop()
Removes and returns the oldest task, or null if the queue is empty.
Tasks popped but not acknowledged within 30 seconds are re-queued.

### queue.ack(taskId)
Acknowledges successful processing. Unacked tasks are retried up to
retryLimit times, after which they move to the dead-letter queue.

### queue.deadLetters()
Returns an array of dead-lettered tasks. Inspect these during debugging;
they usually indicate a handler bug rather than bad task data.

### queue.size()
Returns the current number of queued (unpopped) tasks.

### Worker(queue, handlers)
Constructs a worker bound to a queue. `handlers` maps task type to an
async function receiving the payload. Unknown task types are dead-lettered
immediately. Call worker.start() to begin polling and worker.stop() for
graceful shutdown; stop() waits for the in-flight task to finish.

### Events
Queue instances are EventEmitters. Events: "push", "pop", "ack",
"retry" (task, attempt), "dead-letter" (task, error). Handlers must not
throw; wrap event handler bodies in try/catch.

## Style Guide

- Use two-space indentation in all JavaScript files. Never tabs.
- Use const by default, let only when reassignment is required, never var.
- Prefer early returns over nested if/else pyramids.
- Every exported function needs a JSDoc block with @param and @returns.
- Private helpers are prefixed with an underscore and never exported.
- Error classes live in errors.js and extend TaskPipeError.
- Always throw error INSTANCES, never strings: throw new ValidationError(...).
- Test files mirror source files: queue.js is tested by test/queue.test.js.
- Test names read as sentences: "re-queues a task popped but never acked".
- No external runtime dependencies. Dev dependencies are allowed.
- Line length is capped at 100 characters, comments included.
- Prefer async/await over raw promise chains; never mix the two styles
  in one function.
- Commit messages: imperative mood, lowercase, no trailing period, body
  wrapped at 72 characters explaining WHY not WHAT.
- Public API changes require a corresponding entry under "Unreleased" in
  the changelog section below before merging.

## Changelog

### Unreleased
- Add queue.peek() returning the oldest task without removing it.

### 0.9.2 — 2025-11-30
- Fix: worker.stop() no longer drops the in-flight task on shutdown.
- Fix: backoff timer cleared correctly when a task is acked mid-retry.
- Docs: clarified ack timeout semantics in the API reference.

### 0.9.1 — 2025-10-14
- Fix: QueueFullError message now includes the queue name and maxSize.
- Perf: pop() is O(1) again after the ring-buffer regression in 0.9.0.

### 0.9.0 — 2025-09-02
- BREAKING: createQueue() now requires options.name; anonymous queues
  are no longer supported.
- Add dead-letter queue and queue.deadLetters().
- Add "retry" and "dead-letter" events.
- Increase default retryLimit from 2 to 3.

### 0.8.3 — 2025-07-19
- Fix: tasks with numeric ids were silently coerced to strings.
- Docs: added Worker graceful-shutdown example.

### 0.8.2 — 2025-06-05
- Fix: event handler exceptions no longer crash the polling loop.

### 0.8.1 — 2025-05-21
- Perf: JSON validation is skipped for payloads under 1 KB.
- Docs: style guide expanded with commit message conventions.

### 0.8.0 — 2025-04-30
- Add Worker class with handler routing and graceful stop().
- Add queue.size().
- Deprecate queue.length property (use size()).

## Notes for AI assistants

Read the entire style guide above before writing any code. All API
behavior is documented in the API reference section. When adding a
feature, update the changelog. When in doubt about queue semantics,
re-read the API reference rather than guessing.
```

### Other template files

**`sandbox/templates/m10-bloated-claudemd/queue.js`**
```js
// TaskPipe queue — minimal stub so the sandbox is a plausible project.
class TaskPipeError extends Error {}
class ValidationError extends TaskPipeError {}
class QueueFullError extends TaskPipeError {}

function createQueue({ name, maxSize = 1000 } = {}) {
  if (!name) throw new ValidationError("options.name is required");
  const items = [];
  return {
    push(task) {
      if (items.length >= maxSize) throw new QueueFullError(`${name} is full`);
      if (!task || !task.id || !task.type) {
        throw new ValidationError("task needs id and type");
      }
      items.push(task);
    },
    pop() {
      return items.shift() ?? null;
    },
    size() {
      return items.length;
    },
  };
}

module.exports = { createQueue, TaskPipeError, ValidationError, QueueFullError };
```

**`sandbox/templates/m10-bloated-claudemd/test.js`**
```js
const { createQueue } = require("./queue.js");
const q = createQueue({ name: "test-queue" });
q.push({ id: "1", type: "email", payload: {} });
if (q.size() === 1 && q.pop().id === "1" && q.pop() === null) {
  console.log("PASS");
} else {
  console.log("FAIL");
  process.exit(1);
}
```

### Exercise

```json
[
  {
    "type": "challenge",
    "id": "challenge-lean-claudemd",
    "title": "Challenge: Put CLAUDE.md on a Diet",
    "instructions": "This project's CLAUDE.md is ~150 lines of inlined API docs, style guide, and changelog — a context tax on every future session. Direct Claude Code to restructure it using progressive disclosure: (1) move the API reference, style guide, and changelog into separate files under docs/ (e.g., docs/api.md, docs/style.md, docs/changelog.md), preserving their content; (2) rewrite CLAUDE.md as a lean index — at most ~30 lines — with the project one-liner, the test command, and pointers to each docs file; (3) don't lose information, relocate it. Then click Verify.",
    "sandboxTemplate": "m10-bloated-claudemd",
    "allowedTools": "Read,Glob,Grep,Edit,Write,Bash(node *)",
    "maxTurns": 15,
    "verifierId": "m10-lean-claudemd",
    "criteria": [
      "CLAUDE.md exists and is at most 40 lines",
      "CLAUDE.md links to at least 2 files under docs/",
      "docs/ contains at least 2 markdown files with the relocated content",
      "CLAUDE.md reads as a concise index pointing to detail files, not inlining them"
    ],
    "hints": [
      "Tell Claude the target structure explicitly: 'CLAUDE.md ≤30 lines with relative links like docs/api.md'.",
      "Ask Claude to verify its own work: 'count the lines in CLAUDE.md and list the files in docs/'.",
      "If content went missing, ask Claude to diff what the old sections covered against the new docs files."
    ]
  }
]
```

### Verifier `m10-lean-claudemd` (implement in `src/lib/verifiers/index.ts`)

Plain-English logic, one criteria entry each, mirroring the exercise `criteria` order:

1. **CLAUDE.md exists and ≤ 40 lines.** `fileExists(dir, "CLAUDE.md")`; then `readFile` and count `content.split("\n").length <= 40`. (Budget is 40 even though we ask for 30 — slack for a title and blank lines.) Detail on failure: report actual line count.
2. **Links to ≥ 2 docs files.** `fileMatches(dir, "CLAUDE.md", /docs\/[\w-]+\.md/)` twice distinct: implement by extracting matches with a global regex `/docs\/[\w-]+\.md/g` over the file content and requiring `new Set(matches).size >= 2`.
3. **docs/ has ≥ 2 .md files.** Use `fs.readdirSync` via a small local helper (or add a `listFiles(dir, rel)` helper to common.ts) on `docs/`, count entries ending `.md`, require ≥ 2. Guard for the directory not existing.
4. **Judge check.** `await judgeFile(dir, "CLAUDE.md", "CLAUDE.md reads as a concise index that points to detail files rather than inlining them: it should contain a short project description, key commands, and links or references to docs files — not a full API reference, full style guide, or changelog entries.")` — pass through `met`/`reason`.

`pass` = all four criteria pass.

---

## Lesson 4: `04-compaction-and-memory` — Compaction & Memory

Frontmatter: minutes 12; objectives: know why long sessions must eventually compact; apply summarize-then-restart deliberately; know what belongs in durable memory (CLAUDE.md/docs) vs session context.

### Narrative beats

1. **The wall.** Every session eventually hits it: the context fills with history. Tools like Claude Code can compact automatically (summarize the conversation, continue on the summary) — lossy by design. Interactive `/clear` starts fresh. In this app's terminal, Reset is the same move.
2. **Summarize-then-restart, the expert version.** Don't wait for auto-compaction to guess what matters. Before resetting: ask the session to write a handoff note ("Summarize: what we decided, what's done, what's next, and any gotchas — as a message to a fresh session"). Reset. Paste the note as the first prompt. You choose what survives.
3. **Memory hierarchy.** Session context = working memory (volatile, budget-priced). CLAUDE.md = long-term always-loaded (keep lean — lesson 3!). docs/skills = long-term on-demand. Decisions worth keeping should GRADUATE from session to files.
4. **Terminal demo** (short, observational): produce a handoff note, reset, seed the fresh session with it — and watch the fresh session pick up exactly where the old one left off, minus the garbage.

Anchors: `<Exercise id="quiz-compaction" />`, `<Exercise id="term-handoff" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-compaction",
    "title": "Quiz: Compaction & Memory",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-why",
        "kind": "single",
        "prompt": "Why do long agent sessions eventually need compaction or a restart?",
        "options": [
          { "id": "a", "text": "The subscription runs out of messages" },
          { "id": "b", "text": "The context window fills with history — and even before it's full, accumulated clutter degrades attention (context rot)" },
          { "id": "c", "text": "Models get tired and need rest" },
          { "id": "d", "text": "Files get locked after too many edits" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Two forces: the hard limit of the window and the soft rot of cluttered context. Compaction (summarize and continue) or a deliberate fresh start addresses both."
      },
      {
        "id": "q2-pattern",
        "kind": "single",
        "prompt": "What is the summarize-then-restart pattern?",
        "options": [
          { "id": "a", "text": "Ask the current session for a handoff summary of decisions, progress, and next steps; start a fresh session; paste the summary as its first input" },
          { "id": "b", "text": "Restart your computer between tasks" },
          { "id": "c", "text": "Let auto-compaction decide what to keep, always" },
          { "id": "d", "text": "Copy the entire transcript into the new session" }
        ],
        "correctOptionIds": ["a"],
        "explanation": "You curate what survives instead of letting automatic summarization guess. Pasting the ENTIRE transcript (d) would just reimport the rot."
      },
      {
        "id": "q3-graduate",
        "kind": "single",
        "prompt": "Mid-session, you and Claude settle a convention: 'all dates are stored as UTC ISO strings.' Where should that decision END UP?",
        "options": [
          { "id": "a", "text": "Nowhere — Claude will remember it in future sessions" },
          { "id": "b", "text": "In a project file (CLAUDE.md if brief, or a docs file it points to) — session memory dies with the session" },
          { "id": "c", "text": "In your own head only" },
          { "id": "d", "text": "Repeated at the start of every future prompt, forever" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Sessions are volatile. Durable decisions graduate to files — the lean-CLAUDE.md-plus-docs structure from the previous lesson is exactly where they belong."
      },
      {
        "id": "q4-tradeoff",
        "kind": "multi",
        "prompt": "Which are true about compaction? (select all that apply)",
        "options": [
          { "id": "a", "text": "It is lossy — detail is discarded to reclaim budget" },
          { "id": "b", "text": "A deliberate handoff summary usually preserves what matters better than waiting passively for auto-compaction" },
          { "id": "c", "text": "Compaction restores the model's access to every earlier detail" },
          { "id": "d", "text": "In this app's terminal, Reset plus a pasted handoff note implements the same pattern" }
        ],
        "correctOptionIds": ["a", "b", "d"],
        "explanation": "Compaction trades detail for headroom. Curating the summary yourself keeps the right details; nothing brings back what the summary dropped (c is false)."
      }
    ]
  },
  {
    "type": "terminal",
    "id": "term-handoff",
    "title": "Terminal: The Handoff Note",
    "instructions": "Practice summarize-then-restart. (1) Give the session some working state: 'Read colors.js. We're planning to add a darkMode palette with inverted lightness, and we decided secondary should become #7c3aed. Don't edit yet.' (2) Ask for a handoff: 'Write me a short handoff note for a fresh session: what this project is, what we decided, and what the next step is.' (3) Copy that note, press Reset, and paste the note as your first prompt, adding: 'Based on this handoff, what should we do first?' Notice the fresh session is fully oriented — without dragging along any conversational clutter.",
    "sandboxTemplate": "m10-context-rot",
    "allowedTools": "Read,Glob,Grep",
    "maxTurns": 6,
    "suggestedPrompts": [
      "Read colors.js. We're planning to add a darkMode palette with inverted lightness, and we decided secondary should become #7c3aed. Don't edit yet.",
      "Write me a short handoff note for a fresh session: what this project is, what we decided, and what the next step is."
    ]
  }
]
```

---

## Lesson 5: `05-context-isolation` — Context Isolation with Subagents

Frontmatter: minutes 12; objectives: explain why searching pollutes context; describe delegate-and-summarize; know what a subagent should return (conclusions, not dumps); connect to module 11.

### Narrative beats

1. **The problem.** Finding one function might mean reading twenty files. In a single session, all twenty stay in context forever — attention budget torched for one answer.
2. **The pattern.** Spawn a subagent with its own EMPTY context; it does the messy exploration; it returns only its conclusion ("the retry logic is in queue.js lines 40-60; it doubles backoffMs per attempt"). The twenty files die with the subagent. Main context pays for one paragraph.
3. **The contract.** Good delegation = a clear question + an instruction to return conclusions, not transcripts. Bad delegation returns file dumps — importing the pollution you tried to avoid.
4. **Meta-example.** This very app was planned this way: the architects spawned explore agents across the codebase and received back summaries — conclusions, not file listings — keeping the planning context clean. The course you are taking is an artifact of context isolation.
5. **Bridge to module 11:** subagents in Claude Code (the Task/Agent tool), plus MCP, plan mode, and parallel agents — context isolation put to work.

Anchor: `<Exercise id="quiz-isolation" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-isolation",
    "title": "Quiz: Context Isolation",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-why-isolate",
        "kind": "single",
        "prompt": "Why is a broad codebase search a good job to delegate to a subagent?",
        "options": [
          { "id": "a", "text": "Subagents read files faster than the main agent" },
          { "id": "b", "text": "The search's file-reading happens in the subagent's separate context and is discarded — only the conclusion enters the main context" },
          { "id": "c", "text": "Subagents have bigger context windows" },
          { "id": "d", "text": "The main agent isn't allowed to search" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "It's quarantine for context pollution: the messy exploration lives and dies in the subagent. The main session pays one paragraph of budget for an answer that cost twenty files to find."
      },
      {
        "id": "q2-return-contract",
        "kind": "single",
        "prompt": "What should a well-briefed subagent return?",
        "options": [
          { "id": "a", "text": "The full text of every file it examined, for transparency" },
          { "id": "b", "text": "Its complete turn-by-turn transcript" },
          { "id": "c", "text": "A concise conclusion: the answer, key file paths, and only load-bearing snippets" },
          { "id": "d", "text": "Nothing — subagents work silently" }
        ],
        "correctOptionIds": ["c"],
        "explanation": "Conclusions, not dumps. Returning everything it read would pour the pollution straight into the context you were protecting."
      },
      {
        "id": "q3-when-not",
        "kind": "single",
        "prompt": "Which task is NOT worth delegating to a subagent?",
        "options": [
          { "id": "a", "text": "Sweep the whole repo to find where errors are logged" },
          { "id": "b", "text": "Read one specific 20-line file you already know the path of" },
          { "id": "c", "text": "Survey how three different modules handle validation" },
          { "id": "d", "text": "Hunt for all usages of a deprecated function across many directories" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Delegation has overhead and is justified when exploration would be broad. One known small file? Just read it — the pollution is 20 lines."
      },
      {
        "id": "q4-meta",
        "kind": "multi",
        "prompt": "This app was itself planned by agents using context isolation. Which practices does that illustrate? (select all that apply)",
        "options": [
          { "id": "a", "text": "Planner agents spawned explorers and received summaries, not file dumps" },
          { "id": "b", "text": "The planning context stayed lean enough to hold the whole design" },
          { "id": "c", "text": "Every agent shared one giant common context for consistency" },
          { "id": "d", "text": "Parallel explorations ran in separate contexts without polluting each other" }
        ],
        "correctOptionIds": ["a", "b", "d"],
        "explanation": "Isolation, not sharing, is the trick (c is the anti-pattern): separate contexts explore in parallel and only distilled conclusions merge into the plan."
      }
    ]
  }
]
```

---

## Sandbox templates (module 10 summary)

### `sandbox/templates/m10-context-rot/`

**`colors.js`**
```js
// Brand palette for the Aurora dashboard.
const palette = {
  primary: "#1a73e8", // blue
  secondary: "#fbbc04", // amber
  danger: "#d93025", // red
  surface: "#f8f9fa", // near-white
  ink: "#202124", // near-black
};

module.exports = { palette };
```

**`README.md`**
```markdown
# Aurora palette
Single source of truth for dashboard colors. Do not hardcode hex values elsewhere.
```

### `sandbox/templates/m10-bloated-claudemd/`
Files: `CLAUDE.md` (the verbatim ~150-line file above), `queue.js`, `test.js` (both verbatim above).

## Verifiers to implement

- **`m10-lean-claudemd`** — full logic specified under Lesson 3. Needs helpers: `fileExists`, `readFile`, `judgeFile` from common.ts, plus a directory listing (add `listFiles(dir, rel): string[]` to common.ts with the same safeResolve guard, returning `[]` when missing).

## Tone & vocabulary

- Voice: this is the expert module — treat the learner as a practitioner. Crisp, evidence-first ("run the experiment, then believe it"). Callbacks are the connective tissue: tokens/cost (08), skills (09), reset/resume (09), rubrics (06).
- Terms: attention budget, needle in a haystack, context rot, contamination, progressive disclosure, index vs detail, compaction, handoff note, summarize-then-restart, context isolation, delegate-and-summarize.
- Fixtures are load-bearing: the memo, the contamination scripts, and the bloated CLAUDE.md must appear VERBATIM as specified — the exercises' pedagogy depends on their exact structure (fact buried mid-paragraph-2 among rival names/dates; contradictions that layer, revoke, and un-revoke).

## Done checklist

- [ ] `module.json` matches; curriculum entry `10-context-engineering` flipped to `built`.
- [ ] 5 lessons; exercise ids anchored exactly: pg-needle-clean, pg-needle-haystack, term-context-rot, challenge-lean-claudemd, quiz-compaction, term-handoff, quiz-isolation.
- [ ] Memo pasted verbatim into pg-needle-haystack instructions (replacing the placeholder); both playground rubrics sum to 100.
- [ ] `m10-context-rot` and `m10-bloated-claudemd` templates byte-match this spec.
- [ ] Verifier `m10-lean-claudemd` registered with the 4 criteria in order; `listFiles` helper added path-safely.
- [ ] `npm run validate` passes; manually run the challenge once end-to-end if the CLI is available.
