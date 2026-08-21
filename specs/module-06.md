# Module 06 — Advanced Prompting

## Meta

| Field    | Value                            |
|----------|----------------------------------|
| id       | `06-advanced-prompting`          |
| track    | `prompting`                      |
| requires | `["04-core-prompt-techniques"]`  |
| minutes  | ~53 (4 lessons: 13+14+12+14)     |

`module.json`:

```json
{
  "id": "06-advanced-prompting",
  "title": "Advanced Prompting",
  "track": "prompting",
  "description": "Push past the core techniques: learn when a quick answer will do and when to ask the model to think deeply, break big jobs into chained prompts that hand off cleanly, build personas that go far beyond 'act as', and pull back the curtain on how this app has been grading your prompts since module 02 — then write rubric-aware prompts of your own.",
  "lessons": [
    { "id": "01-extended-thinking", "title": "Thinking Deeply: Extended Thinking & Effort" },
    { "id": "02-prompt-chaining", "title": "Prompt Chaining: Big Jobs in Small Steps" },
    { "id": "03-personas-in-depth", "title": "Personas in Depth" },
    { "id": "04-rubrics-and-judges", "title": "Rubrics & Judges: How This App Grades You" }
  ]
}
```

## Audience state

Finished modules 01, 02, and 04 (03 not guaranteed). They can write few-shot prompts,
structure with XML tags, request step-by-step reasoning with `<thinking>`/`<answer>`
tags, constrain output to strict JSON/lists, and distinguish system from user prompts.
Still non-programmers, no terminal skills — this module is playground-and-quiz only.
Module 04's lesson 03 planted one forward reference ("extended thinking — you'll meet
it properly in a later module"); this module pays it off. Lesson 04 is a meta-lesson:
it explains the grading machinery of THIS APP's playgrounds, which the learner has
experienced since module 02 without knowing how it works.

## Learning objectives

1. Explain the difference between visible step-by-step reasoning and extended (internal) thinking, and when each helps.
2. Choose and request an appropriate thinking effort for a task, including where to aim the thinking.
3. Design a prompt chain: split a big task into steps where each step's output is shaped to feed the next.
4. Write a full persona (expertise, audience, constraints, boundaries) that goes beyond "act as X".
5. Explain the LLM-as-judge pattern and how this app's playground grading works.
6. Write a prompt that deliberately satisfies every criterion of a given rubric.

## Lessons

### Lesson 01-extended-thinking — "Thinking Deeply: Extended Thinking & Effort" (~13 min)

**Frontmatter objectives:**
- Distinguish visible step-by-step reasoning from extended (internal) thinking
- Explain thinking budgets: what more thinking buys and what it costs
- Match the requested effort to the difficulty of the task

**Narrative outline:**
1. Pay off module 04's promise: you learned to ask for steps written INTO the reply.
   Newer models can also think privately before a single word of the answer appears —
   a scratchpad you don't see. That's **extended thinking**.
2. Analogy (verbatim): asking for a quick answer is catching a colleague in the
   hallway; asking for extended thinking is booking them a quiet hour with a
   whiteboard. Same colleague, very different depth — and the hour costs more.
3. The two are different tools: visible steps (module 04) are for YOU to audit — you
   can point at step 3 and correct it. Extended thinking is for the MODEL — it explores,
   backtracks, and self-corrects before committing. You can ask for both: think deeply,
   then show a short reasoned summary.
4. **Thinking budget**, conceptually: apps and products often let you dial how much
   internal thinking the model may do (sometimes labeled effort: low/medium/high).
   More budget = more exploration = better answers on genuinely hard problems — and
   slower, costlier ones. On easy questions extra thinking buys nothing.
5. You also steer effort with words: "think hard about this before answering",
   "take your time and consider edge cases", "double-check the arithmetic". And you
   can AIM the thinking: name the part that deserves it ("the tricky part is the
   overlapping schedules — think carefully there").
6. `<Callout kind="tip">` Match effort to stakes and difficulty. A restaurant pick
   needs hallway effort; a contract comparison deserves the whiteboard hour. Asking
   for deep thought on trivia just makes you wait.
7. `<Callout kind="info">` You usually can't read the internal scratchpad — so keep
   the module 04 habit of asking for a visible summary of the reasoning when you need
   to check it.
8. Quiz anchor: `<Exercise id="quiz-extended-thinking" />`
9. Playground anchor: `<Exercise id="pg-deep-thinking" />`

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-extended-thinking",
  "title": "Check: extended thinking & effort",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "How does extended thinking differ from asking for step-by-step reasoning in the reply?",
      "options": [
        { "id": "a", "text": "They're the same thing with different names" },
        { "id": "b", "text": "Extended thinking happens privately before the answer, letting the model explore and self-correct; written steps appear in the reply for YOU to audit" },
        { "id": "c", "text": "Extended thinking is only for math problems" },
        { "id": "d", "text": "Written steps are always better because they're visible" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Visible steps are an audit trail for you; extended thinking is a private whiteboard for the model, where it can backtrack without cluttering the answer. They serve different readers, which is why they combine well (think deeply, then summarize the reasoning) — neither is strictly better (d), and both apply far beyond math (c)."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "What does a bigger thinking budget buy, and what does it cost?",
      "options": [
        { "id": "a", "text": "It buys more exploration and self-correction on hard problems; it costs time and money" },
        { "id": "b", "text": "It buys access to newer training data; it costs nothing" },
        { "id": "c", "text": "It guarantees a correct answer; it costs one retry" },
        { "id": "d", "text": "It makes every answer longer; it costs readability" }
      ],
      "correctOptionIds": ["a"],
      "explanation": "The budget is the whiteboard hour: more room to try approaches, catch mistakes, and reconsider — valuable exactly when the problem is hard, and paid for in wait time and compute. It doesn't add knowledge (b), guarantee correctness (c), or necessarily change the final answer's length (d) — the thinking is separate from the reply."
    },
    {
      "id": "q3",
      "kind": "multi",
      "prompt": "Which requests genuinely deserve asking for deep, careful thinking? Select all that apply.",
      "options": [
        { "id": "a", "text": "Comparing two apartment leases with different fees, terms, and break clauses" },
        { "id": "b", "text": "What's the capital of France?" },
        { "id": "c", "text": "Planning a conference schedule where speakers have overlapping availability" },
        { "id": "d", "text": "Rewriting one sentence to sound friendlier" },
        { "id": "e", "text": "Finding the flaw in a budget that somehow doesn't balance" }
      ],
      "correctOptionIds": ["a", "c", "e"],
      "explanation": "Multi-constraint comparisons, scheduling puzzles, and hunt-the-error tasks reward exploration and self-checking — whiteboard work. A capital city (b) is instant recall and a one-sentence rewrite (d) is hallway-level; deep thinking there just adds waiting."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-deep-thinking",
  "title": "Aim the whiteboard hour",
  "instructions": "Invent a genuinely hard planning or comparison problem and write a prompt that requests deep thinking — aimed where it counts. Your prompt must (1) state a concrete problem with at least three interacting constraints or factors (real numbers, dates, or rules — e.g. planning a shared family visit around three people's conflicting schedules and a budget), (2) explicitly ask the model to think deeply and carefully before answering, (3) name the specific part of the problem that deserves the most careful thought (the trickiest constraint or interaction), and (4) ask for a CONCISE final answer — a short recommendation plus a brief summary of the key reasoning, not a wall of text.",
  "rubric": [
    { "id": "hard-problem", "description": "The prompt states a concrete problem with at least three interacting constraints or factors.", "weight": 30 },
    { "id": "request-thinking", "description": "The prompt explicitly asks the model to think deeply/carefully before answering.", "weight": 25 },
    { "id": "aim-thinking", "description": "The prompt names the specific part of the problem that deserves the most careful thought.", "weight": 25 },
    { "id": "concise-answer", "description": "The prompt asks for a concise final answer with a brief reasoning summary.", "weight": 20 }
  ],
  "passingScore": 70
}
```

### Lesson 02-prompt-chaining — "Prompt Chaining: Big Jobs in Small Steps" (~14 min)

**Frontmatter objectives:**
- Explain why one giant prompt often loses to a chain of focused ones
- Split a big task into steps where each output feeds the next input
- Shape a step's output for clean machine-style handoff

**Narrative outline:**
1. Failure scene: "Read these 20 survey responses, find the themes, pick the top three,
   and write an executive summary with recommendations" — one prompt, four jobs. The
   model juggles them all at once and does each a bit worse.
2. Name it: **prompt chaining** — break the big task into steps and run them as
   separate prompts, where the OUTPUT of one step becomes the INPUT of the next.
   Analogy (verbatim): a relay race — each runner runs one short leg at full speed and
   hands over a clean baton. The baton is the output; a fumbled handoff loses the race.
3. Why it wins: each prompt has ONE job (specificity, module 02), you INSPECT the baton
   between legs — catch a wrong theme at step 1 before it poisons steps 2 and 3 — and
   you can rerun just the failed leg instead of the whole race.
4. The handoff rule: a step's output must be shaped for the NEXT prompt, not for a
   human. This is module 04's constraining lesson doing its real job: strict list or
   JSON, exact fields, no preamble — because the next prompt will contain it verbatim,
   pasted inside an XML tag like `<step1_output>`.
5. Worked example in prose: survey chain — step 1: responses in, JSON list of themes
   with counts out. Step 2: themes in, top three with one-line justification out.
   Step 3: top three in, 150-word executive summary out. Show step 2's prompt sketch
   with `<themes>` tag holding step 1's output.
6. `<Callout kind="tip">` A good chain step passes the sticky-note test: you can
   describe its job in one sentence and its output shape in another. If you can't,
   split it again.
7. `<Callout kind="info">` When NOT to chain: simple tasks — every handoff adds work,
   and a task one good prompt handles shouldn't become three.
8. Quiz anchor: `<Exercise id="quiz-chaining" />`
9. Playground anchor: `<Exercise id="pg-chain" />`

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-chaining",
  "title": "Check: prompt chaining",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "What is prompt chaining?",
      "options": [
        { "id": "a", "text": "Sending the same prompt repeatedly until the answer improves" },
        { "id": "b", "text": "Breaking a big task into separate prompts, where each step's output becomes the next step's input" },
        { "id": "c", "text": "Writing one very long prompt with every instruction chained together" },
        { "id": "d", "text": "Linking several AI products in one browser window" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "A chain is a relay race: focused legs, clean baton handoffs. Repeating one prompt (a) is rerolling, and one giant prompt (c) is exactly the juggling act chaining exists to avoid — the model does four jobs at once and each a bit worse."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "Why should a chain step's output be a strict shape (exact list or JSON, no preamble)?",
      "options": [
        { "id": "a", "text": "Strict shapes make the model smarter" },
        { "id": "b", "text": "The output gets pasted into the next prompt verbatim — a friendly 'Sure! Here are the themes...' wrapper pollutes the next step's input" },
        { "id": "c", "text": "Chains only work with JSON" },
        { "id": "d", "text": "Humans find strict shapes easier to read" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The reader of a chain step's output isn't you — it's the next prompt. A clean baton (predictable shape, no chatter) hands off perfectly; wrapper text and commentary ride along into step 2 as noise. Strict lists work as well as JSON (c), and human readability (d) is beside the point mid-chain."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "Besides focus, what's the big practical advantage of running steps separately instead of one giant prompt?",
      "options": [
        { "id": "a", "text": "You can inspect the output between steps and catch a mistake before it poisons everything downstream" },
        { "id": "b", "text": "Separate prompts are always cheaper in total" },
        { "id": "c", "text": "The model remembers each step forever" },
        { "id": "d", "text": "Chains never produce wrong answers" }
      ],
      "correctOptionIds": ["a"],
      "explanation": "Checking the baton between legs is the superpower: a wrong theme caught after step 1 costs one rerun; the same mistake inside a giant prompt silently corrupts the summary and you may never spot where. Chains can cost more total (b) and still err (d) — they just make errors visible and cheap to fix."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-chain",
  "title": "Design a chain",
  "instructions": "A neighborhood association collected 15 messy free-text survey responses about improving the local park, and wants a short summary for the next meeting. Design a chain and write its first step. Submit BOTH parts in one message: (1) a <plan> section listing 2–3 numbered steps, where each step names its one job AND the exact shape of its output (the baton it hands to the next step), and (2) a complete <step1> section containing the full, runnable first prompt: it must include 4–6 invented survey responses inside an XML tag, instruct the model to extract the shaped output your plan promised (e.g. a strict JSON list of themes with counts), and demand ONLY that output with no preamble or commentary.",
  "rubric": [
    { "id": "plan", "description": "The prompt contains a <plan> section with 2–3 numbered steps, each stating one job and its output shape.", "weight": 25 },
    { "id": "step1-complete", "description": "The <step1> section is a complete runnable prompt including invented survey responses inside an XML tag.", "weight": 25 },
    { "id": "handoff-shape", "description": "Step 1's requested output is a strict machine-friendly shape (exact list or JSON with named fields) matching what the plan promised.", "weight": 30 },
    { "id": "only-output", "description": "Step 1 demands ONLY the shaped output, with no preamble or commentary.", "weight": 20 }
  ],
  "passingScore": 70
}
```

### Lesson 03-personas-in-depth — "Personas in Depth" (~12 min)

**Frontmatter objectives:**
- Explain what a full persona adds beyond "act as X"
- Specify expertise, audience, constraints, and boundaries in a persona
- Recognize what personas can and cannot do (steering, not knowledge)

**Narrative outline:**
1. Callback: module 02 gave you roles ("act as a chef") and module 04 gave you system
   prompts (the employee handbook). Now merge and deepen them: a **persona** is a full
   character brief, not a costume. Analogy (verbatim): "act as a doctor" hands the
   model a costume; a persona brief is the whole character sheet — training, who
   they're talking to, how they behave, and where they stop.
2. The four parts, each with a before/after example:
   **Expertise** — not "a doctor" but "a physical therapist with 15 years treating
   running injuries": domain, depth, even a specialty, which steers vocabulary and
   judgment.
   **Audience** — who the persona is talking to changes everything: the same
   physical therapist explains a knee injury differently to a 10-year-old, a marathon
   runner, and a surgeon.
   **Constraints** — standing behavioral rules: "always give home-care steps first",
   "keep answers under 150 words", "use no medical jargon without a plain-language
   gloss".
   **Boundaries** — where the persona stops: "for anything involving medication,
   say that's outside your lane and recommend seeing a doctor". Boundaries make
   personas trustworthy.
3. Where the persona lives: it's classic system-prompt material (module 04) — standing
   identity for many requests — but works inside a single user prompt too.
4. What personas do NOT do — the honest limit: a persona steers style, vocabulary,
   emphasis, and caution; it does not add knowledge. Telling the model it's a "world
   expert" doesn't make its facts truer (module 01: confidence is not correctness).
5. `<Callout kind="warning">` A persona can make wrong answers SOUND more
   authoritative. The more expert the character, the more the trust-but-verify rule
   applies to what it says.
6. `<Callout kind="tip">` Write the audience line even when it feels obvious — it's
   the highest-leverage sentence in most personas, because register and depth follow
   from it automatically.
7. Quiz anchor: `<Exercise id="quiz-personas" />`
8. Playground anchor: `<Exercise id="pg-persona" />`

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-personas",
  "title": "Check: personas in depth",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "What does a full persona add beyond 'act as a lawyer'?",
      "options": [
        { "id": "a", "text": "Legal authority for the answers" },
        { "id": "b", "text": "Specific expertise, a defined audience, behavioral constraints, and boundaries — a character sheet instead of a costume" },
        { "id": "c", "text": "Longer answers" },
        { "id": "d", "text": "Access to legal databases" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The costume ('a lawyer') barely narrows anything; the character sheet — 'a contracts lawyer explaining to a first-time freelancer, plain language, always flags what needs a real attorney' — steers vocabulary, depth, tone, and caution all at once. It grants no authority (a) or new data sources (d): steering, not knowledge."
    },
    {
      "id": "q2",
      "kind": "multi",
      "prompt": "Which elements belong in a well-built persona? Select all that apply.",
      "options": [
        { "id": "a", "text": "Specific expertise: domain, depth, and specialty" },
        { "id": "b", "text": "A defined audience the persona is speaking to" },
        { "id": "c", "text": "Standing behavioral constraints (tone, length, always/never rules)" },
        { "id": "d", "text": "A claim that the persona is never wrong, to boost accuracy" },
        { "id": "e", "text": "Boundaries: topics where the persona defers or declines" }
      ],
      "correctOptionIds": ["a", "b", "c", "e"],
      "explanation": "Expertise, audience, constraints, and boundaries are the four parts of the character sheet. Declaring the persona infallible (d) changes nothing about accuracy — it can't, since personas steer style rather than add knowledge — and it actively fights the boundaries that make a persona safe to rely on."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "You give the model a persona as a 'world-renowned economist'. What effect does this have on factual accuracy?",
      "options": [
        { "id": "a", "text": "Facts become more reliable because the persona is an expert" },
        { "id": "b", "text": "None on the facts themselves — it steers vocabulary, framing, and confidence, and can make errors SOUND more authoritative" },
        { "id": "c", "text": "The model gains access to economic data it didn't have" },
        { "id": "d", "text": "It disables hallucination for economics questions" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The persona changes the voice, not the knowledge — the model knows exactly what it knew before. The real danger is the opposite of (a): expert framing polishes wrong answers into confident-sounding ones, which is why boundaries and your own verification matter more as the persona gets grander."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-persona",
  "title": "Write the character sheet",
  "instructions": "Build a full persona for an assistant that helps first-time gardeners plan a small balcony vegetable garden. Write it as standing instructions (system-prompt style — no specific question yet). Your persona must include (1) specific expertise: not just 'a gardener' but a defined depth and specialty (e.g. an urban horticulturist specializing in container vegetables in small spaces), (2) a defined audience: complete beginners with a small balcony, limited budget, and no gardening vocabulary, (3) at least two standing behavioral constraints (e.g. always suggest the cheapest option first; keep every answer under 150 words; explain any technical term in plain language), and (4) one clear boundary — something the persona should decline or redirect (e.g. pest-poison dosages or anything safety-critical gets 'check the product label or ask your local garden center'). When you run it, the model will demonstrate your persona by answering a sample beginner question under those rules.",
  "systemPrompt": "The user is composing a PERSONA (standing instructions) for a balcony-gardening assistant, as a prompting exercise. Treat their entire message as that persona. Adopt it, then demonstrate it by answering this sample question under those rules: 'I have a tiny balcony that gets sun in the morning only. Can I grow tomatoes? What do I need to buy?' If their persona is missing rules, follow only what it actually says.",
  "rubric": [
    { "id": "expertise", "description": "The persona defines specific expertise: domain, depth, and a specialty (more than a bare job title).", "weight": 25 },
    { "id": "audience", "description": "The persona defines the audience it is speaking to (beginners, small balcony, limited budget).", "weight": 25 },
    { "id": "constraints", "description": "The persona sets at least two standing behavioral constraints.", "weight": 30 },
    { "id": "boundary", "description": "The persona includes at least one boundary where it defers or declines.", "weight": 20 }
  ],
  "passingScore": 70
}
```

### Lesson 04-rubrics-and-judges — "Rubrics & Judges: How This App Grades You" (~14 min)

**Frontmatter objectives:**
- Explain the LLM-as-judge pattern in plain language
- Explain how this app's playgrounds have graded you since module 02
- Write observable rubric criteria and sensible weights
- Write a prompt that deliberately satisfies every criterion of a given rubric

**Narrative outline:**
1. Pull back the curtain: every playground exercise since module 02 ended with a graded
   checklist. Who graded you? Not a human — another AI. Time to meet your teacher.
2. The **rubric**: a list of criteria, each with a **weight**, weights summing to 100 —
   the grading sheet a teacher fills in. Show a real rubric from this module (reprint
   pg-persona's four criteria and weights in a table) — "you were graded on exactly
   this."
3. The **LLM-as-judge** pattern: the app hands a second model your prompt, the rubric,
   and instructions to return met/not-met per criterion with feedback. A judge with a
   grading sheet — the same trick that graded essays, code review, and quality checks
   across the AI industry use.
4. The key design rule, and why it matters to YOU as a prompter: judges are only
   reliable when criteria are OBSERVABLE — checkable by pointing at the text. "The
   prompt names a specific audience" is checkable; "the prompt is good" is a vibe.
   Notice every rubric in this app judges your PROMPT text, never the model's reply —
   the reply varies run to run; your prompt is the stable evidence.
5. Weights are priorities: the core skill weighs most, and the passing score is set so
   you can miss the lowest-weight criterion and still pass — deliberate design, not
   accident.
6. Flip it around — rubric-aware prompting: when you know the grading sheet, satisfy it
   explicitly, criterion by criterion. This is also how experts work with AI: state
   your own success criteria IN the prompt and ask the model to check its answer
   against them before finishing.
7. `<Callout kind="info">` Judges aren't perfect — they're models too, and can misread.
   That's why good rubrics stick to observable criteria and why real systems spot-check
   the judge. (Module 13 goes deep on writing evaluation rubrics for production.)
8. Quiz anchor: `<Exercise id="quiz-rubrics" />`
9. Playground anchor: `<Exercise id="pg-beat-rubric" />` — the rubric is printed IN the
   instructions and is identical to the actual grading rubric, so the meta-lesson lands:
   grade sheet in hand, ace the test.
10. Module close: recap the four techniques; point forward — module 10 (context
    engineering) for the prompting track, and module 13 where you'll design rubrics
    and evals yourself.

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-rubrics",
  "title": "Check: rubrics and LLM-as-judge",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "What is the LLM-as-judge pattern?",
      "options": [
        { "id": "a", "text": "A model that settles legal disputes" },
        { "id": "b", "text": "Using a model, given a rubric of criteria, to grade a piece of text and report which criteria are met" },
        { "id": "c", "text": "Two models debating until one wins" },
        { "id": "d", "text": "A human judge assisted by autocomplete" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "It's a judge with a grading sheet: text in, rubric in, met/not-met per criterion out — the pattern behind this app's playground feedback and countless real-world quality checks. No courtroom (a), no debate (c), no human in the loop for each grade (d)."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "Which rubric criterion is well-written for an LLM judge?",
      "options": [
        { "id": "a", "text": "\"The prompt is high quality\"" },
        { "id": "b", "text": "\"The prompt feels professional\"" },
        { "id": "c", "text": "\"The prompt names a specific audience for the output\"" },
        { "id": "d", "text": "\"The model's answer will probably be good\"" }
      ],
      "correctOptionIds": ["c"],
      "explanation": "A good criterion is observable — you can point at the words that satisfy it. 'Names a specific audience' is checkable by reading; 'high quality' (a) and 'feels professional' (b) are vibes the judge must guess at, and (d) judges a future output instead of the text in hand."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "In this app's playgrounds, what does the judge actually grade?",
      "options": [
        { "id": "a", "text": "The model's reply to your prompt" },
        { "id": "b", "text": "Your PROMPT text — the reply is shown as evidence, but the rubric judges what you wrote" },
        { "id": "c", "text": "How fast you typed" },
        { "id": "d", "text": "Whether you used the suggested wording" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The skill being taught is prompt-writing, and the reply varies run to run even for the same prompt — so your prompt is the stable evidence, and every criterion is checkable from it alone. That's why criteria read like 'the prompt includes...' rather than 'the answer is...' (a)."
    },
    {
      "id": "q4",
      "kind": "single",
      "prompt": "A rubric gives 'names the audience' weight 30 and 'sets a length limit' weight 10, with a passing score of 70. What does this tell you?",
      "options": [
        { "id": "a", "text": "The length limit is three times harder to achieve" },
        { "id": "b", "text": "Naming the audience is the higher priority, and you can miss the length limit and still pass" },
        { "id": "c", "text": "You must satisfy both criteria to pass" },
        { "id": "d", "text": "Weights are decorative and don't affect the score" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Weights encode priorities — the core skill weighs most — and the passing score is deliberately set below 100 so missing the lowest-weight criterion isn't fatal (c). Weight measures importance to the grade, not difficulty (a), and your score is literally the sum of the weights you earned (d)."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-beat-rubric",
  "title": "Grade sheet in hand",
  "instructions": "You've seen the machinery — now use it deliberately. Below is the EXACT rubric that will grade you (yes, really — this is the real one). Write a prompt asking the model to draft a short announcement for a community library launching a free 'seed library' (borrow vegetable seeds in spring, return saved seeds in autumn). Satisfy every criterion explicitly:\n\n- audience (weight 25): the prompt names a specific audience for the announcement (e.g. local families new to gardening).\n- format (weight 25): the prompt specifies the output format AND a length limit (e.g. a friendly noticeboard poster under 120 words with a headline).\n- facts (weight 30): the prompt supplies at least three concrete facts the announcement must include (invent them: launch date, how borrowing works, where to sign up).\n- self-check (weight 20): the prompt lists its own requirements and asks the model to check the draft against them before finishing.\n\nPassing is 70 — but you have the grade sheet, so aim for 100.",
  "rubric": [
    { "id": "audience", "description": "The prompt names a specific audience for the announcement.", "weight": 25 },
    { "id": "format", "description": "The prompt specifies the output format and a length limit.", "weight": 25 },
    { "id": "facts", "description": "The prompt supplies at least three concrete facts the announcement must include.", "weight": 30 },
    { "id": "self-check", "description": "The prompt asks the model to check its draft against the stated requirements before finishing.", "weight": 20 }
  ],
  "passingScore": 70
}
```

## Sandbox templates

None — this module has no terminal or challenge exercises.

## Verifiers to implement

None.

## Tone & vocabulary

- Voice: peer-practitioner. The learner has real technique now; the prose can be
  denser and assume module 04 fluency. Lesson 04 may be playfully conspiratorial
  ("meet your teacher", "grade sheet in hand") — the reveal is the fun of it.
  Code blocks show PROMPTS, rubric tables, and tiny JSON only — never programs.
- May introduce (define on first use): **extended thinking**, **thinking budget /
  effort**, **prompt chain / chaining**, **handoff** (the baton metaphor), **persona**
  (as an upgrade of module 02's "role"), **rubric**, **criterion / weight**,
  **LLM-as-judge**.
- Assumed: all of modules 01, 02, and 04 (few-shot, XML tags, step-by-step,
  `<thinking>`/`<answer>` tags, JSON, system vs user prompts, hallucination,
  confidence ≠ correctness). "Attention budget" may be referenced softly but never
  required (module 03 is not a prerequisite).
- BANNED: API, temperature, tokens-as-cost math, tool/function calling, terminal,
  Claude Code specifics, prompt injection (module 13), eval/eval suite as terms
  (one forward-reference to module 13 is allowed), context rot, subagent.

## Done checklist

- [ ] `module.json` + 4 lessons + exercises.json files created and schema-valid
- [ ] Every exercise has an `<Exercise id/>` anchor in its lesson.mdx
- [ ] All four playground rubrics sum to 100; quiz single/multi rules hold
- [ ] pg-persona includes its systemPrompt field exactly as specified
- [ ] pg-beat-rubric's printed rubric in instructions matches its actual rubric verbatim
- [ ] Lesson 04 reprints pg-persona's real rubric table accurately
- [ ] `npm run validate` passes; `npx tsc --noEmit` clean
- [ ] Every playground smoke-tested with a passing prompt and a failing prompt
- [ ] curriculum.json status flipped `"spec"` → `"built"` for 06-advanced-prompting only
