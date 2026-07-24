# Module Spec: 08-how-ai-systems-are-built

## Meta

- **id:** `08-how-ai-systems-are-built`
- **title:** How AI Products Are Built
- **track:** `fundamentals`
- **requires:** `["04-core-prompt-techniques"]`
- **minutes:** ~55 total (5 lessons: 12 + 10 + 12 + 9 + 12)

`module.json`:

```json
{
  "id": "08-how-ai-systems-are-built",
  "title": "How AI Products Are Built",
  "track": "fundamentals",
  "description": "Pull back the curtain on AI products. You'll see how apps talk to models through APIs, read a real slice of this app's own source code, learn how tool use turns a text predictor into an agent, build intuition for RAG and embeddings, weigh fine-tuning against prompting, and understand what tokens actually cost.",
  "lessons": [
    { "id": "01-apis-and-system-prompts", "title": "APIs & System Prompts: A Peek at This App" },
    { "id": "02-tool-use-agent-loop", "title": "Tool Use & the Agent Loop" },
    { "id": "03-rag-and-embeddings", "title": "RAG & Embeddings: The Library Index" },
    { "id": "04-fine-tuning-vs-prompting", "title": "Fine-Tuning vs Prompting" },
    { "id": "05-tokens-and-cost", "title": "Tokens, Pricing & Cost" }
  ]
}
```

## Audience state

Learner has finished modules 1-4 minimum (curriculum requires 04). They understand next-word prediction, tokens, hallucination, context windows, and solid prompting (few-shot, XML tags, CoT, system vs user prompts). They may NOT have touched Claude Code yet (05/07 are on a parallel track) — do not assume terminal comfort. This is a fundamentals module: no terminal exercises, only quizzes and one playground.

## Learning objectives

1. Explain what an LLM API is: a request with messages in, a completion out — and that every AI product is a wrapper around such calls.
2. Read a real API route from this app and identify the system prompt, the user content, and the response handling.
3. Describe the agent loop: model proposes a tool call → app executes it → result goes back into context → repeat until done.
4. Explain RAG with the library-index analogy and say what an embedding is in one sentence.
5. Choose between prompting, RAG, and fine-tuning for a given problem.
6. Estimate rough cost of an API call from token counts and per-million-token pricing.

---

## Lesson 1: `01-apis-and-system-prompts` — APIs & System Prompts: A Peek at This App

Frontmatter: minutes 12; objectives: know what an API request/response looks like; identify system vs user message in real code; explain why the system prompt is the product's "personality and rules"; realize this app is itself an AI product they can read.

### Narrative beats

1. **Every AI product is a wrapper.** ChatGPT, Claude.ai, that "AI summarize" button in your email — under the hood, each sends an HTTPS request to a model API: a list of messages goes in, generated text comes out. No magic middle layer.
2. **Anatomy of a request.** Show a simplified JSON request: `model`, `max_tokens`, `system` (the product's standing instructions), `messages` (the conversation). Connect to module 04: "system vs user prompts" — now they see where each literally lives in the payload.
3. **You are inside an AI product right now.** Meta-reveal: the playground exercises they've been doing in this course are graded by a real model call. Walk through (as a simplified, inline code excerpt in the MDX — do not make the learner open files) the app's own grading pipeline: `src/app/api/playground/score/route.ts` receives their prompt, and `src/lib/judge.ts` builds a judge request. Quote 2 real fragments in the lesson: (a) the first lines of `JUDGE_SYSTEM_PROMPT` ("You are a strict but encouraging prompt-engineering instructor grading a beginner's prompt against a rubric..."), and (b) the `messages: [{ role: "user", content: userContent }]` call shape. Point out: the rubric is injected as XML tags — exactly the technique they learned in module 04, running in production code that graded THEM.
4. **Why the system prompt matters commercially.** It encodes tone, guardrails, output format (the judge demands strict JSON). Products differ mostly in their system prompts, tools, and UI — the underlying model is often the same.
5. **Reliability tricks in real code.** The judge retries once on unparseable JSON and computes the score in code, not trusting the model's arithmetic. Lesson: production systems trust the model for judgment, and code for math and control flow.

Anchors: `<Exercise id="quiz-apis" />` then `<Exercise id="pg-system-prompt" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-apis",
    "title": "Quiz: APIs & System Prompts",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-what-is-api",
        "kind": "single",
        "prompt": "When you use an AI feature inside any app, what is actually happening under the hood?",
        "options": [
          { "id": "a", "text": "The app has its own small AI model built into your device's app files" },
          { "id": "b", "text": "The app sends a request containing messages to a model API over the internet and receives generated text back" },
          { "id": "c", "text": "A human reviewer answers most requests, with AI for overflow" },
          { "id": "d", "text": "The app searches a database of pre-written answers" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Nearly every AI product is a wrapper around a model API: messages in, completion out. The product's value lives in what it puts around that call — the system prompt, tools, and interface."
      },
      {
        "id": "q2-system-role",
        "kind": "single",
        "prompt": "In an API request, what is the system prompt for?",
        "options": [
          { "id": "a", "text": "It's the user's most recent question" },
          { "id": "b", "text": "It's a debugging log the model ignores" },
          { "id": "c", "text": "It's the product's standing instructions — role, rules, tone, and output format — applied before any user message" },
          { "id": "d", "text": "It configures which GPU the model runs on" }
        ],
        "correctOptionIds": ["c"],
        "explanation": "The system prompt is where a product encodes its personality and rules. This app's judge system prompt tells the model it is 'a strict but encouraging prompt-engineering instructor' and demands JSON-only output — that IS the grading product."
      },
      {
        "id": "q3-this-app",
        "kind": "single",
        "prompt": "When this app grades one of your playground prompts, what does its judge code do with the rubric?",
        "options": [
          { "id": "a", "text": "It injects the rubric into the model's request wrapped in XML tags, and asks for a JSON verdict per criterion" },
          { "id": "b", "text": "It compares your prompt to a stored answer key character by character" },
          { "id": "c", "text": "It counts keywords in your prompt without calling a model" },
          { "id": "d", "text": "It emails the rubric to a human grader" }
        ],
        "correctOptionIds": ["a"],
        "explanation": "The judge builds a user message with <exercise_instructions>, <rubric>, <student_prompt>, and <model_output> XML blocks — the exact tagging technique you learned in module 04 — and parses the model's JSON reply."
      },
      {
        "id": "q4-trust-split",
        "kind": "multi",
        "prompt": "This app's judge computes your numeric score in code (summing rubric weights), while the model only decides met/not-met per criterion. Which lessons does that design reflect? (select all that apply)",
        "options": [
          { "id": "a", "text": "Trust the model for judgment calls, but code for arithmetic and control flow" },
          { "id": "b", "text": "Models can produce malformed output, so production systems validate and retry" },
          { "id": "c", "text": "Models are always better than code at math" },
          { "id": "d", "text": "Keeping the model's job small and structured makes its output more reliable" }
        ],
        "correctOptionIds": ["a", "b", "d"],
        "explanation": "Production AI engineering splits work: the model does fuzzy judgment; deterministic code does math, parsing, and scoring. The judge even retries once if the JSON doesn't parse. Option c is backwards — LLMs are famously unreliable at arithmetic."
      }
    ]
  },
  {
    "type": "playground",
    "id": "pg-system-prompt",
    "title": "Playground: Write a Product's System Prompt",
    "instructions": "You're building 'RecipeRescue', an app where users type ingredients they have and get one dinner suggestion. Write the SYSTEM PROMPT for its API calls. It must: give the model a clear role, set a friendly-but-brief tone, force a fixed output format (recipe name, 3-6 numbered steps, one substitution tip), and include at least one guardrail (e.g., decline non-food requests, flag allergy uncertainty). Test it: the user message will be 'chicken thighs, half a lemon, rice, and a sad-looking zucchini'.",
    "starterPrompt": "You are...",
    "maxTokens": 1024,
    "rubric": [
      { "id": "role", "description": "The prompt assigns the model a clear role/persona appropriate to a recipe-suggestion product", "weight": 20 },
      { "id": "format", "description": "The prompt specifies a concrete output format including a recipe name, numbered steps, and a substitution tip", "weight": 30 },
      { "id": "tone", "description": "The prompt sets an explicit tone or length constraint (e.g., friendly, brief, no rambling)", "weight": 20 },
      { "id": "guardrail", "description": "The prompt includes at least one guardrail: off-topic refusal, allergy/safety caution, or similar standing rule", "weight": 30 }
    ],
    "passingScore": 70
  }
]
```

Note for the builder: the playground runs the learner's text as the prompt; per this app's judge, the grade is on the PROMPT itself, with the model output as evidence. The instructions above tell the learner their prompt will be exercised against a fixed user message — include that user message inside their prompt scenario if the playground has no separate system slot; either way the rubric still grades the system-prompt content they wrote.

---

## Lesson 2: `02-tool-use-agent-loop` — Tool Use & the Agent Loop

Frontmatter: minutes 10; objectives: explain why a bare LLM can't act; describe a tool definition; trace one full agent-loop iteration; recognize the loop in products they know.

### Narrative beats

1. **A bare LLM can only emit text.** It cannot browse, read files, or send email. So how does any AI "do" anything? Answer: the app around it does, on the model's behalf.
2. **Tools are offers.** The app tells the model, in the API request, "these functions exist: `get_weather(city)`, `read_file(path)`...". The model can reply not with prose but with a structured request: "call `get_weather` with `city: 'Delhi'`".
3. **The loop.** App executes the function → appends the result to the conversation → calls the model again → model either calls another tool or writes the final answer. Diagram this as a cycle: think → act → observe → think.
4. **The model never executes anything.** Only the app runs code; the model only asks. That's why permissioning (which they'll meet as Claude Code power users) lives in the app layer.
5. **Foreshadow:** Claude Code is exactly this loop with tools like Read, Edit, and Bash. If they've done module 05/07, the tool names they saw scroll by in the terminal ARE these tool calls.

Anchor: `<Exercise id="quiz-agent-loop" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-agent-loop",
    "title": "Quiz: Tool Use & the Agent Loop",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-bare-llm",
        "kind": "single",
        "prompt": "Why can't a bare LLM check today's weather by itself?",
        "options": [
          { "id": "a", "text": "Weather data is too complicated for language models" },
          { "id": "b", "text": "An LLM can only generate text — it has no ability to fetch data or run code; the surrounding app must do that" },
          { "id": "c", "text": "It can, as long as you ask politely" },
          { "id": "d", "text": "Weather APIs block AI traffic" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "The model is a text generator. To act on the world, the app offers it tools; the model requests a call, and the app executes it and feeds the result back."
      },
      {
        "id": "q2-loop-order",
        "kind": "single",
        "prompt": "Put the agent loop in order: (1) app executes the tool and returns the result, (2) model requests a tool call, (3) model reads the result and decides next step, (4) app sends the user's task plus tool definitions.",
        "options": [
          { "id": "a", "text": "4 → 2 → 1 → 3, repeating from 2 until the model answers in plain text" },
          { "id": "b", "text": "1 → 2 → 3 → 4, exactly once" },
          { "id": "c", "text": "2 → 4 → 3 → 1, repeating forever" },
          { "id": "d", "text": "4 → 1 → 2 → 3, with the model executing step 1" }
        ],
        "correctOptionIds": ["a"],
        "explanation": "The app frames the task and available tools; the model proposes a call; the app runs it; the result re-enters the context; the model thinks again. The loop ends when the model responds with a final text answer instead of another tool call."
      },
      {
        "id": "q3-who-executes",
        "kind": "single",
        "prompt": "In tool use, who actually runs the code — the model or the app?",
        "options": [
          { "id": "a", "text": "The model runs it on the API provider's servers" },
          { "id": "b", "text": "The app runs it; the model only sends a structured request asking for the call" },
          { "id": "c", "text": "They each run it and compare results" },
          { "id": "d", "text": "Neither — tools are hypothetical" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "The model emits a structured 'please call X with these arguments' message. Execution — and therefore permissioning and safety — is entirely the app's job. This is why Claude Code can ask you before running a command."
      },
      {
        "id": "q4-recognize",
        "kind": "multi",
        "prompt": "Which of these are real examples of the agent loop? (select all that apply)",
        "options": [
          { "id": "a", "text": "Claude Code reading a file, editing it, then running the tests" },
          { "id": "b", "text": "A chatbot that answers purely from its training, with no tools" },
          { "id": "c", "text": "An AI assistant that searches the web, reads two pages, then writes a summary" },
          { "id": "d", "text": "This app's terminal exercises, where you watch tool names stream by as Claude works" }
        ],
        "correctOptionIds": ["a", "c", "d"],
        "explanation": "a, c, and d all cycle through think → act → observe. A tool-less chatbot (b) is a single model call — useful, but not an agent."
      }
    ]
  }
]
```

---

## Lesson 3: `03-rag-and-embeddings` — RAG & Embeddings: The Library Index

Frontmatter: minutes 12; objectives: explain why models need retrieval; describe embeddings as "meaning coordinates"; walk through the RAG pipeline; know RAG's failure modes.

### Narrative beats

1. **The problem.** The model's knowledge is frozen at training time and it has never seen YOUR documents. Pasting your entire company wiki into every prompt won't fit the context window (module 03 callback) — and costs a fortune (foreshadow lesson 5).
2. **The library analogy.** A library doesn't hand you every book; a card index points you to the three shelves that matter. RAG = build an index of your documents; at question time, retrieve only the few passages that matter and paste JUST THOSE into the prompt.
3. **Embeddings = coordinates for meaning.** An embedding model turns text into a list of numbers such that similar meanings land near each other. "How do I reset my password?" lands near "Password recovery steps" even with zero shared keywords. One sentence definition to memorize: *an embedding is a point in space where distance means difference in meaning.*
4. **The pipeline.** Offline: chunk documents → embed each chunk → store. Online: embed the question → find nearest chunks → stuff them into the prompt with the question → model answers, citing the chunks.
5. **Failure modes.** Retrieval misses (right answer exists but wasn't fetched), stale index, and the model answering from its own guess when retrieval returns junk. RAG reduces hallucination but doesn't eliminate it.

Anchor: `<Exercise id="quiz-rag" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-rag",
    "title": "Quiz: RAG & Embeddings",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-why-rag",
        "kind": "single",
        "prompt": "Why do products use RAG instead of pasting all company documents into every prompt?",
        "options": [
          { "id": "a", "text": "Documents would fill (or overflow) the context window and cost far more per call — retrieval sends only the relevant passages" },
          { "id": "b", "text": "Models refuse to read more than one document" },
          { "id": "c", "text": "It's illegal to send documents to an API" },
          { "id": "d", "text": "RAG retrains the model on the documents each night" }
        ],
        "correctOptionIds": ["a"],
        "explanation": "Context is a scarce, priced resource. Like a library index, RAG fetches only the few passages that matter and puts just those in the prompt. It never retrains the model — that would be fine-tuning, next lesson."
      },
      {
        "id": "q2-embedding",
        "kind": "single",
        "prompt": "What is an embedding?",
        "options": [
          { "id": "a", "text": "A compressed zip file of a document" },
          { "id": "b", "text": "A list of numbers representing a text's meaning, so similar meanings end up numerically close together" },
          { "id": "c", "text": "A keyword list extracted from a document" },
          { "id": "d", "text": "A smaller copy of the language model" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Embeddings are coordinates for meaning. 'Reset my password' and 'password recovery steps' share almost no words but land near each other — which is why embedding search beats keyword search for questions."
      },
      {
        "id": "q3-pipeline",
        "kind": "single",
        "prompt": "At question time, what does a RAG system do FIRST with the user's question?",
        "options": [
          { "id": "a", "text": "Sends it straight to the LLM for an answer" },
          { "id": "b", "text": "Embeds the question and searches the index for the nearest document chunks" },
          { "id": "c", "text": "Asks the user to pick which document to search" },
          { "id": "d", "text": "Fine-tunes the model on the question" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Question → embedding → nearest-neighbor search → paste the retrieved chunks plus the question into the prompt → model answers grounded in those chunks."
      },
      {
        "id": "q4-failures",
        "kind": "multi",
        "prompt": "Which are real ways a RAG system can still give a wrong answer? (select all that apply)",
        "options": [
          { "id": "a", "text": "The retriever fetched the wrong passages, so the model never saw the answer" },
          { "id": "b", "text": "The index is stale — the documents changed after they were embedded" },
          { "id": "c", "text": "Retrieval returned junk and the model guessed from its training instead" },
          { "id": "d", "text": "RAG systems cannot give wrong answers" }
        ],
        "correctOptionIds": ["a", "b", "c"],
        "explanation": "RAG grounds answers but every stage can fail: bad retrieval, stale index, or the model improvising when the retrieved text doesn't contain the answer. Trust but verify — especially citations."
      }
    ]
  }
]
```

---

## Lesson 4: `04-fine-tuning-vs-prompting` — Fine-Tuning vs Prompting

Frontmatter: minutes 9; objectives: define fine-tuning; know the decision ladder prompt → few-shot → RAG → fine-tune; identify when fine-tuning is wrong.

### Narrative beats

1. **Fine-tuning defined.** Continue training an existing model on your own examples so its weights shift. Changes *behavior/style/format* reliably; poor at adding *facts* (facts belong in RAG; fine-tuning for knowledge is like tattooing your calendar on your arm — permanent, quickly stale).
2. **The ladder.** Try in order: better prompt (minutes, free) → few-shot examples (minutes) → RAG (days) → fine-tuning (weeks, data + eval + retrain on every base-model upgrade). Each rung costs 10x the previous; most teams never need the last rung.
3. **When fine-tuning wins.** Locked output formats at massive scale, a consistent brand voice, latency/cost pressure (a small fine-tuned model replacing a big prompted one).
4. **Callback:** everything the learner has done in this course so far is the first two rungs — and they got production-grade behavior from them.

Anchor: `<Exercise id="quiz-finetune" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-finetune",
    "title": "Quiz: Fine-Tuning vs Prompting",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-define",
        "kind": "single",
        "prompt": "What is fine-tuning?",
        "options": [
          { "id": "a", "text": "Writing a more detailed system prompt" },
          { "id": "b", "text": "Continuing to train an existing model on your own examples so its internal weights change" },
          { "id": "c", "text": "Adding a retrieval index to a model" },
          { "id": "d", "text": "Manually editing the model's answers after the fact" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Fine-tuning changes the model itself. Prompting and RAG change only what goes into the context. That's why fine-tuning is powerful for behavior and style but expensive and slow to iterate."
      },
      {
        "id": "q2-facts",
        "kind": "single",
        "prompt": "Your company's product catalog changes weekly and you want the AI to answer questions about it. Best approach?",
        "options": [
          { "id": "a", "text": "Fine-tune the model on the catalog every week" },
          { "id": "b", "text": "RAG — index the catalog and retrieve relevant entries per question" },
          { "id": "c", "text": "Hope the base model learned your catalog during training" },
          { "id": "d", "text": "Paste the full catalog into every prompt" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Changing facts belong in a retrieval index you can update instantly. Fine-tuning bakes knowledge into weights — stale within a week and costly to redo. Full-catalog pasting blows the context budget."
      },
      {
        "id": "q3-ladder",
        "kind": "single",
        "prompt": "A teammate's first idea for fixing an AI feature's inconsistent tone is 'let's fine-tune.' What's the better first step?",
        "options": [
          { "id": "a", "text": "Agree — fine-tuning is always the strongest fix" },
          { "id": "b", "text": "Climb the ladder: improve the system prompt and add few-shot examples of the desired tone first; they're 10-100x cheaper to try" },
          { "id": "c", "text": "Switch model providers" },
          { "id": "d", "text": "Add a RAG index of tone guidelines" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Prompt → few-shot → RAG → fine-tune, in that order. Tone is often fixable with a clear system prompt plus 2-3 examples — the same techniques you practiced in modules 02-04."
      },
      {
        "id": "q4-when-ft",
        "kind": "multi",
        "prompt": "When is fine-tuning genuinely the right call? (select all that apply)",
        "options": [
          { "id": "a", "text": "Enforcing a strict output format across millions of calls where every prompt token counts" },
          { "id": "b", "text": "Teaching the model this week's product prices" },
          { "id": "c", "text": "Distilling a consistent brand voice that prompting can't reliably hold" },
          { "id": "d", "text": "Replacing a large prompted model with a smaller, cheaper specialized one" }
        ],
        "correctOptionIds": ["a", "c", "d"],
        "explanation": "Fine-tuning shines for behavior, style, and efficiency at scale. Fresh facts (b) belong in RAG — weights are the wrong place for anything that changes."
      }
    ]
  }
]
```

---

## Lesson 5: `05-tokens-and-cost` — Tokens, Pricing & Cost

Frontmatter: minutes 12; objectives: recall tokens ≈ 3/4 word; read per-million-token pricing; compute a call's rough cost; explain why output tokens cost more and why long contexts multiply cost.

### Narrative beats

1. **Tokens redux.** Callback to module 01: models read tokens (~4 characters / ~0.75 words in English). Every API call is billed by tokens in (your prompt + injected context) and tokens out (the response).
2. **The pricing table.** Providers price per million tokens, with output typically several times input (generation is sequential and expensive; reading is parallel and cheap). Use illustrative numbers, clearly labeled as such: e.g., "$3 per million input, $15 per million output" — teach the arithmetic, not current price sheets.
3. **Worked example.** A support bot: 2,000-token system prompt + 500-token question + 4 retrieved chunks of 400 tokens = 4,100 in; 300 out. At $3/$15 per million: input ≈ $0.0123, output ≈ $0.0045 → ~1.7 cents per answer → 10,000 answers/day ≈ $168/day. Suddenly that 2,000-token system prompt is a budget line.
4. **Where money leaks.** Bloated system prompts repeated every call; over-retrieval in RAG; long conversations resending full history every turn (each new message re-bills everything before it). Mention prompt caching exists as a mitigation — module 13 covers it.
5. **Cost intuition = context intuition.** The same discipline that saves money also improves quality (foreshadow module 10: attention budget).

Anchor: `<Exercise id="quiz-cost" />`.

### Exercises

```json
[
  {
    "type": "quiz",
    "id": "quiz-cost",
    "title": "Quiz: Tokens & Cost",
    "passingScore": 75,
    "questions": [
      {
        "id": "q1-billing",
        "kind": "single",
        "prompt": "How are LLM API calls typically billed?",
        "options": [
          { "id": "a", "text": "A flat fee per API call regardless of size" },
          { "id": "b", "text": "By tokens: everything sent in (prompt + context) and everything generated out, priced per million tokens" },
          { "id": "c", "text": "By the seconds of compute time used" },
          { "id": "d", "text": "By the number of correct answers" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Input and output tokens are metered separately, priced per million. Every word of system prompt, retrieved document, and chat history is on the bill — every single call."
      },
      {
        "id": "q2-math",
        "kind": "single",
        "prompt": "At $3 per million input tokens and $15 per million output tokens, roughly what does a call with 10,000 input tokens and 1,000 output tokens cost?",
        "options": [
          { "id": "a", "text": "About $0.045 (4.5 cents)" },
          { "id": "b", "text": "About $4.50" },
          { "id": "c", "text": "About $0.0045 (half a cent)" },
          { "id": "d", "text": "About $45" }
        ],
        "correctOptionIds": ["a"],
        "explanation": "Input: 10,000 ÷ 1,000,000 × $3 = $0.03. Output: 1,000 ÷ 1,000,000 × $15 = $0.015. Total ≈ $0.045. Pennies per call — until you multiply by a million calls."
      },
      {
        "id": "q3-output-premium",
        "kind": "single",
        "prompt": "Why do output tokens usually cost several times more than input tokens?",
        "options": [
          { "id": "a", "text": "Output tokens are longer words" },
          { "id": "b", "text": "Generating tokens is sequential — one at a time, each requiring a full pass — while reading input can be processed in parallel" },
          { "id": "c", "text": "Providers charge more for whatever users want most" },
          { "id": "d", "text": "Output tokens include images" }
        ],
        "correctOptionIds": ["b"],
        "explanation": "Reading (prefill) parallelizes; generation is inherently one-token-at-a-time. That asymmetry in compute shows up directly in the price sheet — and is a reason to constrain response length."
      },
      {
        "id": "q4-leaks",
        "kind": "multi",
        "prompt": "Which habits leak money in an AI product? (select all that apply)",
        "options": [
          { "id": "a", "text": "A 3,000-token system prompt resent with every one of a million daily calls" },
          { "id": "b", "text": "Retrieving 20 document chunks when 3 would answer the question" },
          { "id": "c", "text": "Long chats that resend the entire conversation history each turn" },
          { "id": "d", "text": "Asking the model for a one-paragraph answer instead of an essay" }
        ],
        "correctOptionIds": ["a", "b", "c"],
        "explanation": "Repeated bloat, over-retrieval, and unbounded history are the classic leaks — each re-billed on every call. Constraining output length (d) SAVES money. Trimming context also tends to improve answer quality, as module 10 will show."
      }
    ]
  }
]
```

---

## Sandbox templates

None. This module uses only quizzes and one playground.

## Verifiers to implement

None. No challenge exercises in this module.

## Tone & vocabulary

- Same warm, analogy-first voice as module 01 (see `content/modules/01-how-llms-work/lessons/01-what-is-an-llm/lesson.mdx` for register). Plain language; every technical term defined on first use.
- Terms to introduce: API, request/response, system prompt (as payload field), tool use, agent loop, RAG, embedding, chunk, retrieval, fine-tuning, weights, input/output tokens, per-million pricing.
- The meta-thread ("you are inside an AI product right now") is this module's signature — use it in lessons 1 and 5, and set up module 09's "this app's terminal is headless Claude Code" reveal.
- Label all prices as illustrative. No provider price sheets quoted as fact.

## Done checklist

- [ ] `content/modules/08-how-ai-systems-are-built/module.json` matches the block above and `content/curriculum.json` entry (flip `status` to `built`).
- [ ] 5 `lesson.mdx` files with valid frontmatter (id, title, minutes, 1-6 objectives) and `<Exercise id/>` anchors matching `exercises.json` ids exactly.
- [ ] 5 `exercises.json` files: 5 quizzes + 1 playground; playground rubric weights sum to 100.
- [ ] Lesson 1 quotes the real `JUDGE_SYSTEM_PROMPT` opening line and describes `src/lib/judge.ts` / the playground scoring route accurately — re-check the source before quoting.
- [ ] `npm run validate` passes.
