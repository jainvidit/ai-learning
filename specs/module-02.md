# Module 02 — Talking to AI: Prompting Basics

## Meta

| Field    | Value                  |
|----------|------------------------|
| id       | `02-prompting-basics`  |
| track    | `prompting`            |
| requires | `["01-how-llms-work"]` |
| minutes  | ~50 (4 lessons: 12+13+12+13) |

`module.json`:

```json
{
  "id": "02-prompting-basics",
  "title": "Talking to AI: Prompting Basics",
  "track": "prompting",
  "description": "Learn the four habits that separate a frustrating AI conversation from a great one: be specific about what you want, give the model context and a role, show it the format you expect, and treat the first answer as a first draft. You'll practice each habit in a live playground and get graded feedback on your prompts.",
  "lessons": [
    { "id": "01-be-specific", "title": "Be Specific" },
    { "id": "02-context-and-role", "title": "Give Context and a Role" },
    { "id": "03-show-the-format", "title": "Show the Format You Want" },
    { "id": "04-iterate", "title": "Iterate: The First Answer Is a Draft" }
  ]
}
```

## Audience state

Finished module 01 only. They know: an LLM predicts the next word, reads text as tokens,
was trained on internet text, can hallucinate, and gives different answers on reruns.
They have NEVER written code, never used a terminal, and have never been taught how to
phrase a request to an AI. Playground exercises are their first hands-on prompting; the
instructions must fully spell out what a passing prompt contains.

## Learning objectives

1. Explain why vague prompts produce generic answers, using the next-word-prediction mental model.
2. Write a prompt that states the task, the audience, and the constraints explicitly.
3. Write a prompt that supplies background context and assigns the model a role.
4. Write a prompt that specifies the exact output format (length, structure, style) it wants.
5. Improve a weak prompt across two rounds by naming what was wrong with the first output.

## Lessons

### Lesson 01-be-specific — "Be Specific" (~12 min)

**Frontmatter objectives:**
- Explain why vague prompts get vague answers
- Identify the missing details in an under-specified prompt
- Write a prompt that states task, audience, and constraints

**Narrative outline:**
1. Open with a relatable scene: you text a friend "get me food" vs "get me a medium veggie
   burrito from the place on 5th, no onions." Same friend, wildly different odds of getting
   what you want. AI is the same — except it won't even ask follow-up questions unless you invite it to.
2. Connect to module 01: the model predicts likely continuations. A vague prompt like
   "write about dogs" has thousands of likely continuations, so you get the statistical
   average — generic, safe, forgettable. Specificity narrows the prediction space.
3. Anatomy of a specific prompt: **task** (what to do), **audience** (who it's for),
   **constraints** (length, tone, what to include/avoid). Show a before/after pair:
   "write about dogs" → "Write 3 tips for first-time dog owners in an apartment,
   friendly tone, under 100 words."
4. `<Callout kind="tip">` A good self-check: could two reasonable people read your prompt
   and produce very different things? If yes, it's too vague.
5. Beat on the cost of vagueness: you don't save time with a short prompt; you spend it
   reading an answer you can't use.
6. Quiz anchor: `<Exercise id="quiz-specificity" />`
7. Transition to practice: "your turn — take a vague prompt and sharpen it."
8. Playground anchor: `<Exercise id="pg-sharpen-prompt" />`
9. Close: specificity is habit #1 of 4; preview that next lesson adds context and role.

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-specificity",
  "title": "Check: why specificity works",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "Why does a vague prompt like \"write about dogs\" tend to produce a generic answer?",
      "options": [
        { "id": "a", "text": "The AI is being lazy and saving effort for harder questions" },
        { "id": "b", "text": "Many different continuations are equally likely, so the model lands on the statistical average" },
        { "id": "c", "text": "The AI doesn't know much about dogs" },
        { "id": "d", "text": "Short prompts are processed with less computing power" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The model predicts likely next words. With a vague prompt, thousands of continuations are plausible, so you get the most average one. It isn't lazy (a) and prompt length doesn't change how much compute it gets (d) — the problem is that YOU haven't narrowed down what 'good' looks like."
    },
    {
      "id": "q2",
      "kind": "multi",
      "prompt": "Which of these are missing from the prompt \"Summarize this article\"? Select all that apply.",
      "options": [
        { "id": "a", "text": "How long the summary should be" },
        { "id": "b", "text": "Who the summary is for" },
        { "id": "c", "text": "The article itself (or a clear pointer to it)" },
        { "id": "d", "text": "A polite greeting" },
        { "id": "e", "text": "What to emphasize or leave out" }
      ],
      "correctOptionIds": ["a", "b", "c", "e"],
      "explanation": "Length, audience, the actual article, and emphasis are all real gaps — the model would have to guess each one. Politeness (d) is fine to include but doesn't change what the model produces; it's the one option that isn't a missing specification."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "Which rewrite of \"help me with my email\" is most specific?",
      "options": [
        { "id": "a", "text": "Please please help me with my email, it's really important" },
        { "id": "b", "text": "Help me write an email quickly" },
        { "id": "c", "text": "Rewrite this email to my landlord to sound firm but polite, under 150 words: [email text]" },
        { "id": "d", "text": "You are an email expert. Help me with my email." }
      ],
      "correctOptionIds": ["c"],
      "explanation": "Option c states the task (rewrite), audience (landlord), tone (firm but polite), a length limit, and includes the material. Urgency (a) and speed (b) add no specification, and a role alone (d) doesn't fix a vague task — roles help, but only on top of a clear request."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-sharpen-prompt",
  "title": "Sharpen a vague prompt",
  "instructions": "The starter prompt below is too vague: \"give me a workout plan\". Rewrite it into a specific prompt. Your prompt must (1) describe the person the plan is for (fitness level, and available time or equipment), (2) state a concrete goal, (3) set constraints on the plan itself (how many days per week, session length, or format), and (4) say anything to avoid or include (e.g. no gym, bad knees, must include stretching). Then run it and see how much better the answer gets.",
  "starterPrompt": "give me a workout plan",
  "rubric": [
    { "id": "person", "description": "The prompt describes who the plan is for: a fitness level plus available time and/or equipment.", "weight": 30 },
    { "id": "goal", "description": "The prompt states a concrete goal (e.g. run a 5k, build strength, lose weight, feel less stiff).", "weight": 25 },
    { "id": "constraints", "description": "The prompt constrains the plan: days per week, session length, and/or output format.", "weight": 30 },
    { "id": "include-avoid", "description": "The prompt names at least one thing to include or avoid (injury, equipment limit, exercise preference).", "weight": 15 }
  ],
  "passingScore": 70
}
```

### Lesson 02-context-and-role — "Give Context and a Role" (~13 min)

**Frontmatter objectives:**
- Explain why the model can't read your mind about background facts
- Write a prompt that supplies relevant context
- Assign the model a useful role or persona

**Narrative outline:**
1. Analogy: asking a brilliant stranger for advice. They know a lot about the world but
   NOTHING about you. "Should I take the job?" is unanswerable without your situation.
   The model is that stranger on every single message.
2. Context = the background facts the answer depends on. Show a pair: "Is this email too
   harsh?" vs "I'm writing to a coworker who missed a deadline for the second time; we're
   peers and generally friendly. Is this email too harsh? [email]".
3. What context to include: your situation, what you've already tried, who's involved,
   what a good outcome looks like. What to skip: irrelevant life story (recall from module
   01 that models read everything you send — don't bury the question).
4. Roles: "You are an experienced pediatric nurse" shifts which continuations are likely —
   it borrows the vocabulary, priorities, and caution of that role from training data.
   Roles aren't magic; they're a fast way to load a bundle of context.
5. `<Callout kind="warning">` A role never makes the model actually qualified — "you are a
   doctor" doesn't create medical judgment, it creates medical-SOUNDING text. Keep the
   hallucination lesson from module 01 in mind for high-stakes topics.
6. Quiz anchor: `<Exercise id="quiz-context-role" />`
7. Practice setup: a scenario where the learner must feed in the background themselves.
8. Playground anchor: `<Exercise id="pg-context-role" />`
9. Close: specificity says WHAT you want; context and role say the world it lives in.

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-context-role",
  "title": "Check: context and roles",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "Why does the model need you to spell out background facts it 'should' obviously need?",
      "options": [
        { "id": "a", "text": "It forgets everything between conversations and knows nothing about your situation unless you say it" },
        { "id": "b", "text": "It's a privacy feature you can turn off" },
        { "id": "c", "text": "It knows the facts but is required to ask anyway" },
        { "id": "d", "text": "Typing more words makes the model try harder" }
      ],
      "correctOptionIds": ["a"],
      "explanation": "The model only sees the text in front of it. It has no memory of you and no access to your life — like a brilliant stranger. It doesn't secretly know your situation (c), and extra words help only when they carry relevant facts, not effort (d)."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "What does giving the model a role like \"You are an experienced high-school chemistry teacher\" actually do?",
      "options": [
        { "id": "a", "text": "Unlocks a hidden teacher database inside the model" },
        { "id": "b", "text": "Makes likely continuations sound like that role — its vocabulary, priorities, and way of explaining" },
        { "id": "c", "text": "Guarantees the answer is factually correct about chemistry" },
        { "id": "d", "text": "Nothing — roles are a superstition" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "A role steers prediction toward text that a person in that role would plausibly write — tone, depth, and framing. There's no hidden database (a) and no correctness guarantee (c): a confident teacher voice can still hallucinate. But roles measurably shape output, so (d) is wrong too."
    },
    {
      "id": "q3",
      "kind": "multi",
      "prompt": "You're asking for help replying to a difficult message from your sister. Which details are worth including as context? Select all that apply.",
      "options": [
        { "id": "a", "text": "What the disagreement is about and how long it's been going on" },
        { "id": "b", "text": "The message she sent you" },
        { "id": "c", "text": "The outcome you want (e.g. make peace without giving in on the money)" },
        { "id": "d", "text": "Your full family history since childhood" }
      ],
      "correctOptionIds": ["a", "b", "c"],
      "explanation": "The dispute, the actual message, and your desired outcome are the facts the reply depends on. A full life history (d) buries the question in text the model must wade through — include background only when the answer depends on it."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-context-role",
  "title": "Brief the stranger",
  "instructions": "Scenario: you want advice on asking your manager to work from home two days a week. Write a prompt that (1) assigns the model a relevant role (e.g. an experienced HR advisor or negotiation coach), (2) gives at least three pieces of background context — such as your job type, how long you've been there, your manager's known concerns, or a past precedent, (3) states the outcome you want, and (4) asks for a specific deliverable (e.g. talking points, or a short script for the conversation).",
  "rubric": [
    { "id": "role", "description": "The prompt assigns the model a relevant role or persona.", "weight": 20 },
    { "id": "context", "description": "The prompt includes at least three distinct pieces of background context about the situation.", "weight": 35 },
    { "id": "outcome", "description": "The prompt states the desired outcome of the conversation with the manager.", "weight": 20 },
    { "id": "deliverable", "description": "The prompt requests a specific deliverable (talking points, script, email draft, etc.).", "weight": 25 }
  ],
  "passingScore": 70
}
```

### Lesson 03-show-the-format — "Show the Format You Want" (~12 min)

**Frontmatter objectives:**
- Explain why describing or demonstrating a format beats hoping for one
- Specify output length, structure, and style in a prompt
- Include a small example of the desired output shape

**Narrative outline:**
1. Analogy: ordering a cake. "Something nice" vs handing the baker a photo. Formats are
   photos. The model happily produces essays when you wanted a table, unless you say so.
2. Three levers: **length** ("under 100 words", "exactly 5 bullets"), **structure**
   ("a table with columns X/Y/Z", "numbered steps", "subject line + 3 short paragraphs"),
   **style** ("plain language, no jargon", "formal", "like a friendly text message").
3. The strongest move: SHOW a tiny example. "Format each item like: `Name — one-line
   why it matters`". The model is a pattern continuer (module 01!) — give it a pattern.
4. Before/after demo in prose: same request for travel-packing help, once free-form,
   once with "give me a checklist grouped under Clothes / Toiletries / Documents,
   max 5 items per group."
5. `<Callout kind="tip">` If you'll reuse the output somewhere (a spreadsheet, an email,
   a slide), describe THAT destination — "formatted so I can paste it into a spreadsheet"
   does a lot of work.
6. Quiz anchor: `<Exercise id="quiz-format" />`
7. Playground anchor: `<Exercise id="pg-format" />`
8. Close: you now control what it says (specificity), what it knows (context), and what
   it looks like (format). Last habit: what to do when the answer still isn't right.

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-format",
  "title": "Check: formats",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "Why is showing a small example of the format you want especially effective?",
      "options": [
        { "id": "a", "text": "The model is a pattern continuer, so a demonstrated pattern strongly shapes what comes next" },
        { "id": "b", "text": "Examples make the prompt longer, and longer prompts always get better answers" },
        { "id": "c", "text": "The model copies your example word for word into the answer" },
        { "id": "d", "text": "Examples are required — the model errors without one" }
      ],
      "correctOptionIds": ["a"],
      "explanation": "Models continue patterns, so one concrete demonstration often beats a paragraph of description. Length alone doesn't help (b) — relevance does. The model follows the SHAPE of your example, not its words (c), and examples are optional, just powerful (d)."
    },
    {
      "id": "q2",
      "kind": "multi",
      "prompt": "Which are format instructions (rather than task or context)? Select all that apply.",
      "options": [
        { "id": "a", "text": "\"Answer in a table with columns Option / Cost / Risk\"" },
        { "id": "b", "text": "\"I'm choosing between three apartments\"" },
        { "id": "c", "text": "\"Keep it under 150 words\"" },
        { "id": "d", "text": "\"Use plain language a 12-year-old could follow\"" },
        { "id": "e", "text": "\"Compare the apartments for me\"" }
      ],
      "correctOptionIds": ["a", "c", "d"],
      "explanation": "Structure (a), length (c), and style (d) are the three format levers. \"I'm choosing between three apartments\" is context (b), and \"compare them\" is the task itself (e). Great prompts usually contain all three kinds."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "You asked for meal ideas and got a 600-word essay when you wanted a quick list. What's the best fix?",
      "options": [
        { "id": "a", "text": "Ask the exact same question again and hope for a shorter answer" },
        { "id": "b", "text": "Re-ask with explicit format: \"Give me 7 dinner ideas as a bulleted list, one line each\"" },
        { "id": "c", "text": "Give up — the model can only write essays" },
        { "id": "d", "text": "Add \"please\" to the original question" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Naming the structure (bulleted list), count (7), and length (one line each) removes the guesswork. Re-rolling the same prompt (a) just samples another essay-shaped answer; politeness (d) doesn't specify anything; and (c) — the model formats however you ask, once you actually ask."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-format",
  "title": "Design the output",
  "instructions": "Ask the model to plan a simple weekend trip to a city of your choice — but YOU design the output. Your prompt must (1) state the trip request with at least one preference (budget, food, walking pace, interests), (2) specify the structure of the answer (e.g. a day-by-day plan, a table, or grouped sections — name the sections or columns), (3) set a length limit (word count, item count, or lines per item), and (4) include a one-line example showing the format of a single entry, like: \"9am — Coffee at a local cafe (cheap, near hotel)\".",
  "rubric": [
    { "id": "task-pref", "description": "The prompt requests the trip plan and includes at least one personal preference or constraint.", "weight": 20 },
    { "id": "structure", "description": "The prompt names an explicit output structure (sections, columns, or day-by-day breakdown).", "weight": 30 },
    { "id": "length", "description": "The prompt sets a concrete length limit (word count, item count, or per-item length).", "weight": 20 },
    { "id": "example", "description": "The prompt includes a one-line example demonstrating the format of a single entry.", "weight": 30 }
  ],
  "passingScore": 70
}
```

### Lesson 04-iterate — "Iterate: The First Answer Is a Draft" (~13 min)

**Frontmatter objectives:**
- Treat the first response as a draft, not a verdict
- Give targeted feedback that names what to keep and what to change
- Know when to refine in-place vs start a fresh prompt

**Narrative outline:**
1. Reframe: pros don't write perfect prompts — they iterate fast. Getting a so-so first
   answer isn't failure; it's the normal first step. Analogy: a haircut. You don't walk
   out at the first snip; you say "shorter on the sides."
2. Bad iteration: "no, that's wrong, try again." The model re-rolls (module 01: randomness)
   with no new information and you get a different flavor of the same miss.
3. Good iteration = targeted feedback: name what to KEEP, what to CHANGE, and (ideally)
   WHY. "Keep the friendly tone. The second paragraph is too apologetic — make it more
   confident, and cut the last line entirely."
4. The conversation is context: everything said so far stays in front of the model, so a
   follow-up can be short — it builds on what's there.
5. When to start over instead: if you've steered 3–4 times and it keeps missing, the
   conversation is full of wrong turns. Start a fresh prompt that bakes in everything you
   learned. `<Callout kind="tip">` Your failed conversation is research: it taught you
   exactly what to specify up front next time.
6. Quiz anchor: `<Exercise id="quiz-iterate" />`
7. Practice: a two-round exercise — the learner writes an IMPROVED prompt in response to
   a flawed draft shown in the instructions.
8. Playground anchor: `<Exercise id="pg-iterate" />`
9. Module close: recap the four habits — specific, context+role, format, iterate — and
   point forward: module 04 turns these habits into pro techniques.

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-iterate",
  "title": "Check: iterating",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "The answer you got was decent but too formal. What's the most effective follow-up?",
      "options": [
        { "id": "a", "text": "\"Try again.\"" },
        { "id": "b", "text": "\"That's wrong.\"" },
        { "id": "c", "text": "\"Keep the structure and the second point, but rewrite it in a casual, friendly voice — like a message to a coworker you like.\"" },
        { "id": "d", "text": "Repeat your original prompt with more exclamation marks" }
      ],
      "correctOptionIds": ["c"],
      "explanation": "Option c names what to keep AND what to change, with a concrete target for the new tone. \"Try again\" (a) and \"that's wrong\" (b) add zero information, so the model just re-rolls — you learned in module 01 that reruns vary randomly, not intelligently."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "Why can a follow-up message be much shorter than your first prompt?",
      "options": [
        { "id": "a", "text": "The model gets smarter as the conversation goes on" },
        { "id": "b", "text": "Everything already said in the conversation is still in front of the model, so follow-ups build on it" },
        { "id": "c", "text": "Short messages are processed faster and more accurately" },
        { "id": "d", "text": "It can't — every message must repeat the full request" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The whole conversation so far is the model's working context, so \"make the middle section shorter\" is fully understandable. The model isn't getting smarter (a) — it just has more of your intent in view. Speed (c) is irrelevant to quality here."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "You've corrected the model four times and it keeps drifting back to the same mistakes. Best move?",
      "options": [
        { "id": "a", "text": "Keep correcting — the fifth time is the charm" },
        { "id": "b", "text": "Start a fresh conversation with a new prompt that includes everything you learned to specify" },
        { "id": "c", "text": "Conclude the task is impossible for AI" },
        { "id": "d", "text": "Ask the model why it is being difficult" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "A long conversation full of wrong turns keeps steering predictions back toward those wrong turns. A fresh start with an upgraded prompt — specific, with context and format baked in — usually beats a fifth correction (a). The failure taught you the spec; use it."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-iterate",
  "title": "Fix the draft with targeted feedback",
  "instructions": "Imagine you asked for a short bio for your neighborhood book-club page and got this draft:\n\n\"Jordan Lee is a dynamic, passionate, results-oriented individual who loves leveraging literature to synergize community engagement. With a plethora of books under their belt, Jordan is a true bibliophile extraordinaire.\"\n\nIt's buzzword soup. Write ONE follow-up message that iterates on it. Your message must (1) name at least one thing to keep (e.g. the length, mentioning community), (2) name at least two specific problems to fix (e.g. buzzwords like 'synergize', the boastful tone), (3) give a concrete direction for the rewrite (target tone, audience, or an example phrase), and (4) state the length you want.",
  "rubric": [
    { "id": "keep", "description": "The message names at least one specific thing from the draft to keep.", "weight": 20 },
    { "id": "problems", "description": "The message identifies at least two specific problems with the draft (naming words or qualities, not just 'make it better').", "weight": 35 },
    { "id": "direction", "description": "The message gives a concrete direction for the rewrite: a target tone, audience, or example phrasing.", "weight": 30 },
    { "id": "length", "description": "The message states a desired length.", "weight": 15 }
  ],
  "passingScore": 70
}
```

## Sandbox templates

None — this module has no terminal or challenge exercises.

## Verifiers to implement

None.

## Tone & vocabulary

- Voice: warm, plain-language, zero jargon, everyday analogies (food orders, strangers,
  haircuts, cakes). Second person. Short paragraphs.
- May introduce (define on first use): **prompt**, **role/persona**, **context** (in the
  everyday "background info" sense — NOT "context window", that's module 03), **iterate**,
  **format/structure**.
- Assumed from module 01: LLM, next-word prediction, token, training data, hallucination,
  randomness/rerun variation.
- BANNED: context window, system prompt, few-shot, XML tags, temperature, API, terminal,
  code of any kind, "chain of thought".

## Done checklist

- [ ] `module.json` + 4 lessons + exercises.json files created and schema-valid
- [ ] Every exercise has an `<Exercise id/>` anchor in its lesson.mdx
- [ ] All rubric weights sum to 100; quiz single/multi rules hold
- [ ] `npm run validate` passes; `npx tsc --noEmit` clean
- [ ] Each playground smoke-tested with a passing prompt and a failing prompt
- [ ] curriculum.json status flipped `"spec"` → `"built"` for 02-prompting-basics only
