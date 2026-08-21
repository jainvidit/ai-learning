# Module 03 — What LLMs Can & Can't Do

## Meta

| Field    | Value                     |
|----------|---------------------------|
| id       | `03-capabilities-limits`  |
| track    | `fundamentals`            |
| requires | `["01-how-llms-work"]`    |
| minutes  | ~48 (4 lessons: 12+11+12+13) |

`module.json`:

```json
{
  "id": "03-capabilities-limits",
  "title": "What LLMs Can & Can't Do",
  "track": "fundamentals",
  "description": "Build an honest map of AI's edges: how much it can pay attention to at once, why it doesn't know last month's news, when it's reasoning versus reciting, and why a confident answer can still be flat wrong. You'll leave knowing which jobs to trust it with — and which to double-check.",
  "lessons": [
    { "id": "01-context-windows", "title": "The Context Window: An Attention Budget" },
    { "id": "02-knowledge-cutoff", "title": "The Knowledge Cutoff" },
    { "id": "03-reasoning-vs-recall", "title": "Reasoning vs Recall" },
    { "id": "04-confidence-vs-correctness", "title": "Confidence Is Not Correctness" }
  ]
}
```

## Audience state

Finished module 01 only (module 02 is NOT required — do not assume prompting habits,
though many learners will have them). They know: next-word prediction, tokens, training
on internet text, hallucination exists, randomness. No code, no terminal. This module is
concept-heavy: quizzes carry most of the assessment, plus two guided playgrounds where
instructions do a lot of hand-holding.

IMPORTANT SEED: lesson 01's "attention budget" framing is deliberately planted for
module 10 (context engineering). Keep the phrase **attention budget** verbatim and
prominent — later modules refer back to it.

## Learning objectives

1. Explain the context window as a finite attention budget and predict what happens when a conversation outgrows it.
2. Explain what a knowledge cutoff is and identify questions the model can't answer from training alone.
3. Distinguish tasks the model solves by recall from tasks that need step-by-step reasoning, and say which failure looks like.
4. Explain why fluent, confident text is not evidence of correctness.
5. Given a real-world task, judge whether an LLM is trustworthy for it as-is, needs verification, or is the wrong tool.

## Lessons

### Lesson 01-context-windows — "The Context Window: An Attention Budget" (~12 min)

**Frontmatter objectives:**
- Describe the context window as the model's finite working space
- Use the attention-budget analogy to predict failure modes in long conversations
- Explain why "in the middle of a huge pile" is a bad place for important details

**Narrative outline:**
1. Setup: you've had a long AI conversation and it "forgot" something you said an hour ago.
   It didn't forget the way people do — something more mechanical happened.
2. Define the **context window**: everything the model can see at once — your messages, its
   replies, any documents pasted in — all counted in tokens (module 01). It's a window, not
   a memory: what scrolls out is simply gone.
3. The core analogy, verbatim and bolded: the context window is an **attention budget**.
   Every token you put in front of the model spends a little of a finite budget of
   attention. A short, relevant conversation spends the budget on what matters. A bloated
   one dilutes attention across thousands of tokens of noise.
4. Consequence 1: overflow. When the conversation exceeds the window, the oldest material
   is dropped or squeezed — the model isn't lying when it acts like you never said it.
5. Consequence 2 (subtler, seeds module 10): even INSIDE the window, more text means
   thinner attention per token. Burying a key instruction in the middle of a 20-page paste
   makes it genuinely easier to miss — like whispering one important sentence in the middle
   of reading someone a phone book.
6. `<Callout kind="tip">` Practical habits: put key instructions at the start or end, trim
   irrelevant material before pasting, and start fresh conversations for fresh topics.
7. Quiz anchor: `<Exercise id="quiz-context-window" />`
8. Guided playground: feel the difference between a buried ask and a front-loaded one.
   Playground anchor: `<Exercise id="pg-attention-budget" />`
9. Close: the attention budget will come back in a big way when you learn context
   engineering later — plant the flag explicitly.

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-context-window",
  "title": "Check: context windows",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "What is the context window?",
      "options": [
        { "id": "a", "text": "The model's permanent memory of every conversation it has ever had" },
        { "id": "b", "text": "The finite amount of text — measured in tokens — the model can see at once" },
        { "id": "c", "text": "The time limit for the model to answer" },
        { "id": "d", "text": "A privacy screen that hides your data from the model" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The context window is the model's entire working view: your messages, its replies, and pasted documents, all in tokens. It's not permanent memory (a) — anything outside the window doesn't exist to the model — and it has nothing to do with time (c) or privacy (d)."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "Your conversation has grown very long and the model no longer remembers an instruction from the start. What most likely happened?",
      "options": [
        { "id": "a", "text": "The model got bored and stopped paying attention" },
        { "id": "b", "text": "The early messages scrolled out of the context window, or attention over the huge context got too thin" },
        { "id": "c", "text": "The model deleted the instruction because it disagreed with it" },
        { "id": "d", "text": "A software bug — this should never happen" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Two mechanical causes: overflow (old text dropped from the window) or dilution (the instruction is still there but buried in so much text that attention over it is thin). No boredom, no rebellion — it's an attention budget being overspent."
    },
    {
      "id": "q3",
      "kind": "multi",
      "prompt": "Which habits make good use of the attention budget? Select all that apply.",
      "options": [
        { "id": "a", "text": "Trim a pasted document down to the relevant sections before sending it" },
        { "id": "b", "text": "Put your key instruction at the start or end, not buried in the middle" },
        { "id": "c", "text": "Paste in everything you have, just in case any of it helps" },
        { "id": "d", "text": "Start a fresh conversation when switching to an unrelated topic" }
      ],
      "correctOptionIds": ["a", "b", "d"],
      "explanation": "Trimming, positioning key asks at the edges, and fresh starts all concentrate attention on what matters. \"Paste everything just in case\" (c) is the classic budget-waster: every irrelevant token dilutes attention over the tokens you actually care about."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-attention-budget",
  "title": "Don't bury the ask",
  "instructions": "You have three paragraphs of meeting notes (invent them — a team meeting about planning a charity bake sale works fine) and ONE thing you need: the model must extract every date and deadline mentioned. Write a prompt that respects the attention budget: (1) state the extraction task clearly BEFORE the pasted notes, (2) include your invented notes (at least three short paragraphs, with 2–3 dates hidden inside), (3) after the notes, repeat the ask in one line, and (4) specify the output format (e.g. a bulleted list of 'date — what it's for').",
  "rubric": [
    { "id": "task-first", "description": "The prompt states the extraction task before the pasted material.", "weight": 30 },
    { "id": "material", "description": "The prompt includes multi-paragraph notes with several dates embedded in them.", "weight": 20 },
    { "id": "restate", "description": "The prompt restates the ask after the pasted material.", "weight": 25 },
    { "id": "format", "description": "The prompt specifies an output format for the extracted dates.", "weight": 25 }
  ],
  "passingScore": 70
}
```

### Lesson 02-knowledge-cutoff — "The Knowledge Cutoff" (~11 min)

**Frontmatter objectives:**
- Explain what a knowledge cutoff is and why it exists
- Identify questions a model can't answer from training alone
- Know the workaround: put fresh information in the prompt yourself

**Narrative outline:**
1. Analogy: the model is like a very well-read person who has been in a windowless room
   since a certain date. Encyclopedic about everything BEFORE that date; guessing about
   everything after.
2. Why: training (module 01) happens on a snapshot of text collected up to a point — the
   **knowledge cutoff**. Retraining is enormously expensive, so models aren't continuously
   updated.
3. Danger zone: the model often won't SAY "I don't know that yet." Asked about events
   after its cutoff, it may hallucinate plausible-sounding answers (module 01's
   hallucination lesson, now with a mechanism: prediction fills gaps with likely-looking text).
4. What's affected: news, prices, versions of products, current office-holders, sports
   results, anything "latest". What's mostly safe: stable knowledge — history, science
   basics, cooking, language, math concepts.
5. The workaround that matters: the context window from lesson 01 is YOUR door into the
   windowless room. Paste in the current article, the latest price list, today's date —
   the model uses information in its context even when training never saw it. (Some AI
   products do this automatically with web search — that's the same trick, automated.)
6. `<Callout kind="warning">` If the answer depends on "now" and you didn't provide "now",
   treat the answer as a guess.
7. Quiz anchor: `<Exercise id="quiz-cutoff" />`
8. Close: connect forward — telling the model what it can't know is half of prompting well.

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-cutoff",
  "title": "Check: knowledge cutoffs",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "Why do models have a knowledge cutoff at all?",
      "options": [
        { "id": "a", "text": "Companies hide recent knowledge behind a paywall" },
        { "id": "b", "text": "Training happens on a snapshot of text collected up to a date, and retraining is too expensive to do continuously" },
        { "id": "c", "text": "Recent events are legally off-limits for AI" },
        { "id": "d", "text": "The model forgets new information after a while" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "A model learns during training, from a fixed snapshot of text. Nothing after that snapshot exists in its learned knowledge. It's an engineering economics fact, not a paywall (a) or a legal rule (c) — and the model isn't forgetting (d); it never knew."
    },
    {
      "id": "q2",
      "kind": "multi",
      "prompt": "Which questions are risky to ask a model WITHOUT giving it fresh information? Select all that apply.",
      "options": [
        { "id": "a", "text": "\"What's the current price of this phone?\"" },
        { "id": "b", "text": "\"Why does bread rise?\"" },
        { "id": "c", "text": "\"Who won last night's game?\"" },
        { "id": "d", "text": "\"What's the newest version of this app and what changed?\"" },
        { "id": "e", "text": "\"How do I convert cups to milliliters?\"" }
      ],
      "correctOptionIds": ["a", "c", "d"],
      "explanation": "Prices, last night's results, and 'newest version' all depend on now — the model will either admit ignorance or, worse, guess fluently. Bread chemistry (b) and unit conversion (e) are stable knowledge that training covers well."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "You need the model's help interpreting a news story from last week. What's the reliable approach?",
      "options": [
        { "id": "a", "text": "Ask about it directly — models absorb news automatically" },
        { "id": "b", "text": "Paste the article into your prompt and ask your question about the pasted text" },
        { "id": "c", "text": "Ask the model to try really hard to remember" },
        { "id": "d", "text": "It's impossible for a model to discuss anything after its cutoff" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The context window is your door into the model's windowless room: it uses whatever you put in front of it, even things training never saw. It can't absorb news on its own (a) or remember harder (c) — but (d) is too pessimistic: supplied context works great."
    }
  ]
}
```

### Lesson 03-reasoning-vs-recall — "Reasoning vs Recall" (~12 min)

**Frontmatter objectives:**
- Distinguish recall tasks from reasoning tasks
- Predict which failure mode each produces
- Know that asking for step-by-step work improves reasoning tasks

**Narrative outline:**
1. Puzzle opener: the model can write a sonnet about the French Revolution instantly, yet
   can fumble "how many days between March 3 and April 11?". Why is the 'easy' thing hard?
2. **Recall**: the answer (or something extremely close) appeared in training text many
   times. Prediction IS the answer. Capitals, definitions, famous dates, common code
   patterns, summaries of well-known books: rock solid.
3. **Reasoning**: the answer has to be CONSTRUCTED — multi-step arithmetic, novel logic
   puzzles, scheduling, counting things in a list. Nothing in training contains YOUR
   specific answer; the model must derive it while predicting, and each step is a chance
   to slip.
4. Analogy: recall is a musician playing a song they've heard a thousand times; reasoning
   is sight-reading a brand-new score — possible, but errors creep in, especially at speed.
5. Failure signatures differ: recall failures look like hallucination (wrong fact, stated
   smoothly). Reasoning failures look like a wrong total, a miscount, a contradicted
   earlier step.
6. The lever: asking the model to "show its work step by step" improves reasoning tasks —
   writing intermediate steps gives each step context to build on. (Just plant the idea;
   module 04 makes it a technique.)
7. `<Callout kind="info">` Newer models blur this line — many now do internal step-by-step
   thinking on their own. The recall/reasoning distinction still tells you where to be
   skeptical.
8. Quiz anchor: `<Exercise id="quiz-reason-recall" />`
9. Guided playground: watch step-by-step help a reasoning task.
   Playground anchor: `<Exercise id="pg-steps" />`

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-reason-recall",
  "title": "Check: reasoning vs recall",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "Which task relies mostly on RECALL?",
      "options": [
        { "id": "a", "text": "Computing the total cost of 17 items with different prices and a 12% discount" },
        { "id": "b", "text": "Explaining what photosynthesis is" },
        { "id": "c", "text": "Working out a fair chore schedule for 5 roommates with conflicting constraints" },
        { "id": "d", "text": "Counting how many times the letter 'e' appears in a paragraph" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Photosynthesis explanations appear countless times in training text — prediction alone nails it. The other three require constructing an answer specific to your inputs (arithmetic, constraint-juggling, counting), which is reasoning, where step-by-step errors creep in."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "Why are multi-step math problems harder for a next-word predictor than famous historical facts?",
      "options": [
        { "id": "a", "text": "Math was excluded from the training data" },
        { "id": "b", "text": "The specific answer isn't in training text — it must be constructed step by step, and each step can slip" },
        { "id": "c", "text": "Models dislike numbers" },
        { "id": "d", "text": "Historical facts are simpler than all math" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Your particular numbers never appeared in training, so prediction can't just retrieve the answer — it must derive it, and every intermediate step is a chance for error. Math is well represented in training (a); this is about construction vs retrieval, not difficulty of the subject (d)."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "The model gives you a wrong total in a budget calculation. What kind of failure is this, and what helps?",
      "options": [
        { "id": "a", "text": "A recall failure — provide the correct fact in your prompt" },
        { "id": "b", "text": "A reasoning failure — ask it to show its work step by step and check the steps" },
        { "id": "c", "text": "A knowledge-cutoff problem — paste in a newer article" },
        { "id": "d", "text": "Random bad luck — just rerun until the total looks right" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Wrong totals are the signature of reasoning slips. Asking for step-by-step work both improves accuracy and lets YOU spot exactly where it slipped. It's not a missing fact (a) or stale knowledge (c), and rerunning blind (d) leaves you unable to tell a right answer from a lucky-looking wrong one."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-steps",
  "title": "Make it show its work",
  "instructions": "Give the model a small reasoning problem and force step-by-step work. Write a prompt that (1) poses a multi-step word problem you invent (e.g. splitting a dinner bill unevenly, comparing two phone plans over a year, or days between two dates — include real numbers), (2) explicitly asks the model to solve it step by step, showing each intermediate calculation before the final answer, and (3) asks it to state the final answer on its own labeled last line (e.g. 'Final answer: ...') so it's easy to check.",
  "rubric": [
    { "id": "problem", "description": "The prompt contains a concrete multi-step problem with specific numbers.", "weight": 35 },
    { "id": "steps", "description": "The prompt explicitly requests step-by-step working with intermediate calculations shown.", "weight": 40 },
    { "id": "final-line", "description": "The prompt asks for the final answer on a clearly labeled final line.", "weight": 25 }
  ],
  "passingScore": 70
}
```

### Lesson 04-confidence-vs-correctness — "Confidence Is Not Correctness" (~13 min)

**Frontmatter objectives:**
- Explain why fluency and confidence carry no evidence of truth
- Apply a stakes-based rule for when to verify AI answers
- Classify tasks as trust / verify / wrong-tool

**Narrative outline:**
1. Open with the trap: humans use confidence as a shortcut for competence. A hesitant
   friend gets fact-checked; a fluent one doesn't. LLMs break this heuristic completely.
2. Mechanism: the model was trained on text that mostly sounds sure of itself (articles,
   textbooks, explanations). Confident phrasing is the most likely CONTINUATION STYLE —
   it's produced the same way whether the underlying fact is right or invented. Tone is
   part of the prediction, not a report on certainty.
3. Vivid framing: the model is a fluent narrator, not a sworn witness. Both its right and
   wrong answers come out in the same polished voice.
4. So how do you operate? A stakes-based rule: **low stakes** (brainstorm, drafts, ideas) —
   just use it; **medium stakes** (facts you'll repeat, plans you'll follow) — verify the
   load-bearing facts against a source; **high stakes** (medical, legal, financial,
   safety) — AI is an assistant to a professional or primary source, never a substitute.
5. Verification moves that work: ask for sources and CHECK one; ask the same question a
   second time in a fresh conversation and compare (module 01's randomness as a tool:
   confident-but-inconsistent answers are a red flag); paste in an authoritative document
   and ask again grounded in it.
6. `<Callout kind="warning">` "It sounded really sure" is never a reason to skip checking.
   Certainty of tone is the cheapest thing a language model produces.
7. Quiz anchor: `<Exercise id="quiz-confidence" />`
8. Module close: recap the four edges (attention budget, cutoff, reasoning limits,
   confident wrongness) and frame the payoff — knowing the edges is what lets you use
   the tool boldly everywhere else.

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-confidence",
  "title": "Check: confidence vs correctness",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "Why do wrong answers from an LLM usually sound just as confident as right ones?",
      "options": [
        { "id": "a", "text": "The model is trained to deceive users" },
        { "id": "b", "text": "Confident phrasing is the most likely continuation style in its training text, produced the same way whether the fact is right or invented" },
        { "id": "c", "text": "The model is always at least 90% sure of what it says" },
        { "id": "d", "text": "Wrong answers actually do sound noticeably more hesitant" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Training text — articles, textbooks, explanations — overwhelmingly sounds sure of itself, so confident tone is simply the likeliest style to predict. Tone is part of the output, not a self-report of certainty. There's no deception motive (a) and no reliable hesitancy signal (d)."
    },
    {
      "id": "q2",
      "kind": "multi",
      "prompt": "Which situations call for verifying the model's answer before acting on it? Select all that apply.",
      "options": [
        { "id": "a", "text": "It suggested a medication dosage for your child" },
        { "id": "b", "text": "It brainstormed 20 names for your book club" },
        { "id": "c", "text": "It stated a statistic you're about to put in a presentation" },
        { "id": "d", "text": "It gave you a deadline for a government form you must file" },
        { "id": "e", "text": "It drafted a silly birthday poem" }
      ],
      "correctOptionIds": ["a", "c", "d"],
      "explanation": "Dosages and filing deadlines are high-stakes (and for medical questions, AI should only assist a professional or primary source, never replace one); a statistic you'll repeat publicly is medium-stakes and worth checking. Brainstormed names (b) and a poem (e) are low-stakes — usefulness is the only test, so verification adds nothing."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "You ask the same factual question in two fresh conversations and get confident but CONTRADICTORY answers. What should you conclude?",
      "options": [
        { "id": "a", "text": "The first answer is right because it came first" },
        { "id": "b", "text": "At least one confident answer is wrong — treat the fact as unverified and check a real source" },
        { "id": "c", "text": "Average the two answers" },
        { "id": "d", "text": "The longer, more detailed answer is the correct one" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Contradiction under reruns is a hallucination red flag: the model is sampling plausible-sounding answers, not retrieving a solid fact. Order (a), averaging (c), and length or detail (d) carry no evidence — detail is generated as fluently as everything else. Go to a primary source."
    },
    {
      "id": "q4",
      "kind": "single",
      "prompt": "Which is the best use of the 'trust / verify / wrong-tool' rule?",
      "options": [
        { "id": "a", "text": "Trust everything from the model that sounds professional" },
        { "id": "b", "text": "Verify every single output no matter how trivial, or don't use AI at all" },
        { "id": "c", "text": "Match your checking effort to the stakes: use drafts freely, verify facts you'll rely on, and keep AI as assistant-only for medical, legal, and financial decisions" },
        { "id": "d", "text": "Only use AI for questions you already know the answer to" }
      ],
      "correctOptionIds": ["c"],
      "explanation": "Stakes-based checking is the working professional's approach: it keeps the speed benefits for low-stakes work while protecting you where errors are costly. Blanket trust (a) ignores everything this lesson showed; blanket verification (b) or only-known-answers (d) throws away most of the tool's value."
    }
  ]
}
```

## Sandbox templates

None — this module has no terminal or challenge exercises.

## Verifiers to implement

None.

## Tone & vocabulary

- Voice: plain-language, honest, non-alarmist. The goal is a calibrated user, not a
  scared one. Everyday analogies (windowless room, phone book, sight-reading musician,
  fluent narrator).
- May introduce (define on first use): **context window**, **attention budget** (KEEP
  THIS EXACT PHRASE — module 10 builds on it), **knowledge cutoff**, **recall**,
  **reasoning**, **step-by-step**, **verify/verification**.
- Assumed from module 01: LLM, next-word prediction, token, training, hallucination,
  randomness.
- BANNED: context engineering, context rot, compaction, RAG, chain-of-thought (say
  "step-by-step" instead), temperature, system prompt, API, code, terminal.

## Done checklist

- [ ] `module.json` + 4 lessons + exercises.json files created and schema-valid
- [ ] Every exercise has an `<Exercise id/>` anchor in its lesson.mdx
- [ ] The phrase "attention budget" appears prominently in lesson 01
- [ ] All rubric weights sum to 100; quiz single/multi rules hold
- [ ] `npm run validate` passes; `npx tsc --noEmit` clean
- [ ] Both playgrounds smoke-tested with passing and failing prompts
- [ ] curriculum.json status flipped `"spec"` → `"built"` for 03-capabilities-limits only
