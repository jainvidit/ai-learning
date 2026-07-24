# Module 04 — Core Prompt Engineering

## Meta

| Field    | Value                          |
|----------|--------------------------------|
| id       | `04-core-prompt-techniques`    |
| track    | `prompting`                    |
| requires | `["02-prompting-basics"]`      |
| minutes  | ~63 (5 lessons: 13+12+13+13+12) |

`module.json`:

```json
{
  "id": "04-core-prompt-techniques",
  "title": "Core Prompt Engineering",
  "track": "prompting",
  "description": "Level up from good habits to real techniques: teach by example with few-shot prompts, organize complex prompts with XML tags, unlock reasoning with step-by-step thinking, lock outputs into exact shapes like JSON, and understand the split between system and user prompts.",
  "lessons": [
    { "id": "01-few-shot", "title": "Teach by Example: Few-Shot Prompting" },
    { "id": "02-xml-structure", "title": "Structure with XML Tags" },
    { "id": "03-step-by-step", "title": "Think Step by Step" },
    { "id": "04-constrain-output", "title": "Constraining Output: JSON & Lists" },
    { "id": "05-system-vs-user", "title": "System vs User Prompts" }
  ]
}
```

## Audience state

Finished modules 01 and 02 (03 not guaranteed). They can write specific prompts with
context, roles, formats, and iterate. Still non-programmers: JSON and XML must be
introduced from zero as "text with labels", never assumed. No terminal skills.
This is the most playground-heavy module — every lesson has a rubric-graded playground.

## Learning objectives

1. Write a few-shot prompt whose 2–3 examples teach a format and style without describing them.
2. Organize a multi-part prompt with XML tags separating instructions, context, and examples.
3. Elicit step-by-step reasoning and a clearly separated final answer.
4. Constrain output to an exact machine-friendly shape (JSON with named fields, or a strict list).
5. Explain the difference between system and user prompts and write an effective system prompt.

## Lessons

### Lesson 01-few-shot — "Teach by Example: Few-Shot Prompting" (~13 min)

**Frontmatter objectives:**
- Explain why examples often beat descriptions
- Write a few-shot prompt with 2–3 consistent examples
- Avoid the classic few-shot mistakes (inconsistent examples, examples that leak wrong patterns)

**Narrative outline:**
1. Hook: in module 02 you learned to SHOW the format with one example. Turn that up:
   what if the examples ARE the instructions? Show a zero-explanation prompt that works:
   two input→output pairs, then a bare third input — the model completes the pattern.
2. Name it: **few-shot prompting** — "shots" are examples. Zero-shot = just ask.
   Few-shot = show 2–5 worked examples first. Ground it in module 01: the model is a
   pattern continuer; examples create an irresistible pattern.
3. What examples teach that words struggle to: tone ("punchy but kind"), judgment calls
   (what counts as "important"), edge handling (show an example OF the weird case).
4. Rules for good shots: (a) consistent format across all examples, (b) cover variety —
   don't make every example the same difficulty or category, (c) the model copies
   EVERYTHING, including your mistakes: sloppy example, sloppy output.
5. `<Callout kind="tip">` 2–3 well-chosen examples usually beat 10 mediocre ones —
   remember the attention budget: examples spend tokens too. (If learner skipped module
   03, the sentence still reads fine as "examples cost space".)
6. Worked demo in prose: turning customer feedback into a one-line "mood: summary" label,
   3 examples, then the pattern continues.
7. Quiz anchor: `<Exercise id="quiz-few-shot" />`
8. Playground anchor: `<Exercise id="pg-few-shot" />`

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-few-shot",
  "title": "Check: few-shot prompting",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "Why do a few worked examples often beat a paragraph describing what you want?",
      "options": [
        { "id": "a", "text": "Examples make the prompt longer, and longer is better" },
        { "id": "b", "text": "The model is a pattern continuer — a demonstrated pattern constrains the output more tightly than a description" },
        { "id": "c", "text": "Descriptions are ignored by the model" },
        { "id": "d", "text": "Examples turn off the model's randomness" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "A demonstrated input→output pattern is the strongest possible signal to a next-word predictor: continuing the pattern is the most likely thing to do. Descriptions still work (c is wrong), length alone is irrelevant (a), and randomness isn't disabled (d) — it's just channeled."
    },
    {
      "id": "q2",
      "kind": "multi",
      "prompt": "Which are real few-shot mistakes to avoid? Select all that apply.",
      "options": [
        { "id": "a", "text": "Examples that each use a slightly different format" },
        { "id": "b", "text": "Examples that are all nearly identical, covering no variety" },
        { "id": "c", "text": "An example containing the exact sloppy habit you don't want copied" },
        { "id": "d", "text": "Using only two or three examples instead of ten" }
      ],
      "correctOptionIds": ["a", "b", "c"],
      "explanation": "Inconsistent formats blur the pattern, identical examples teach nothing about range, and the model faithfully copies flaws — it can't tell your mistakes from your intentions. Two or three GOOD examples (d) is not a mistake; it's usually the sweet spot."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "You want short, warm replies to customer reviews, but the model keeps writing stiff corporate ones. Which fix uses few-shot prompting?",
      "options": [
        { "id": "a", "text": "Add \"be warm!\" in capital letters" },
        { "id": "b", "text": "Include two example reviews each followed by the kind of warm, short reply you want, then the new review" },
        { "id": "c", "text": "Ask the model to imagine being warm before answering" },
        { "id": "d", "text": "Rerun the prompt until a warm one appears" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Tone is exactly what examples teach best — 'warm' means something specific once it's demonstrated twice. Shouting an adjective (a) or asking for imagination (c) leaves 'warm' undefined, and rerolling (d) is gambling, not prompting."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-few-shot",
  "title": "Build a few-shot prompt",
  "instructions": "Create a few-shot prompt that turns plain product review text into a one-line label of the form 'MOOD — five-word summary' (e.g. 'HAPPY — loves the battery life'). Your prompt must (1) contain at least two complete examples, each showing an input review and its labeled output, (2) use the exact same output format in every example, (3) include one example with a NEGATIVE or MIXED review so the pattern covers more than happy cases, and (4) end with a new, unlabeled review for the model to complete. Keep instructions minimal — let the examples do the teaching.",
  "rubric": [
    { "id": "two-examples", "description": "The prompt contains at least two complete input→output example pairs.", "weight": 30 },
    { "id": "consistent", "description": "All examples use the same output format ('MOOD — short summary').", "weight": 25 },
    { "id": "variety", "description": "At least one example covers a negative or mixed review.", "weight": 20 },
    { "id": "final-input", "description": "The prompt ends with a new unlabeled review for the model to label.", "weight": 25 }
  ],
  "passingScore": 70
}
```

### Lesson 02-xml-structure — "Structure with XML Tags" (~12 min)

**Frontmatter objectives:**
- Explain why labeled sections help the model parse a complex prompt
- Wrap instructions, context, and examples in XML tags
- Refer to tagged sections by name inside instructions

**Narrative outline:**
1. Problem scene: your prompts now contain instructions + background + an email to
   rewrite + examples. Pasted together, where does the email end and the instruction
   begin? The model sometimes rewrites your INSTRUCTIONS. You need labeled boxes.
2. Introduce XML tags from zero — they're just labels in angle brackets around a section:
   `<email> ... </email>`. Opening tag, closing tag with a slash, name them anything
   sensible. No programming knowledge required; it's the text equivalent of putting
   things in labeled envelopes.
3. Why it works: models saw enormous amounts of tagged text in training and treat tags as
   strong section boundaries. Claude in particular is trained to respect them.
4. The classic layout, shown in a fenced code block: `<instructions>`, `<context>`,
   `<document>` (or `<email>`, `<notes>` — name by content), `<examples>` with
   `<example>` children.
5. Power move: refer to sections by name — "Rewrite the text in `<email>` following the
   rules in `<instructions>`." Cross-references remove the last ambiguity.
6. `<Callout kind="tip">` Any time a prompt contains pasted material longer than a couple
   of lines, wrap it in a tag. It's the cheapest reliability upgrade in prompting.
7. Quiz anchor: `<Exercise id="quiz-xml" />`
8. Playground anchor: `<Exercise id="pg-xml" />`

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-xml",
  "title": "Check: XML structure",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "What problem do XML tags solve in a prompt?",
      "options": [
        { "id": "a", "text": "They make the prompt run faster" },
        { "id": "b", "text": "They mark clear boundaries so the model can't confuse your instructions with the material you pasted in" },
        { "id": "c", "text": "They are required syntax — untagged prompts are rejected" },
        { "id": "d", "text": "They encrypt sensitive sections" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Tags are labeled envelopes: the model treats them as strong section boundaries, so it stops rewriting your instructions when you meant it to rewrite your email. They're optional (c), have no speed effect (a), and hide nothing (d)."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "Which prompt uses tags correctly?",
      "options": [
        { "id": "a", "text": "<email>Rewrite this politely</email> followed by the pasted email with no tag" },
        { "id": "b", "text": "<instructions>Rewrite the text in <email> to be politer.</instructions> then <email>...pasted email...</email>" },
        { "id": "c", "text": "<email>...pasted email... (no closing tag, instructions mixed inside)" },
        { "id": "d", "text": "Wrapping every individual sentence of the prompt in its own tag" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Option b labels each section by its content, closes every tag, and cross-references the <email> section by name from the instructions. (a) puts the instruction in the email envelope, (c) never closes the envelope, and (d) is noise — tag SECTIONS, not sentences."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "You're asking for a summary of meeting notes and also including two example summaries you like. What's the best tag layout?",
      "options": [
        { "id": "a", "text": "No tags — short prompts don't need them" },
        { "id": "b", "text": "<instructions>, <notes> for the pasted notes, and <examples> containing the two samples" },
        { "id": "c", "text": "One giant <everything> tag around the whole prompt" },
        { "id": "d", "text": "<a>, <b>, <c> — the names don't matter" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Three kinds of content, three labeled envelopes. One tag around everything (c) draws no boundaries at all. And while tags don't have reserved names, DESCRIPTIVE names (b) beat meaningless ones (d) — the name itself tells the model what the section is."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-xml",
  "title": "Tag a messy prompt",
  "instructions": "You need the model to turn rough interview notes into three polished FAQ entries. Write a prompt with clear XML structure: (1) an <instructions> section stating the task and the output format (question line + 2–3 sentence answer), (2) a <notes> section containing invented rough notes (5+ lines of fragmented notes about, say, a community garden's rules), (3) an <example> section with ONE example FAQ entry in your desired format, and (4) inside <instructions>, refer to the other sections by their tag names (e.g. 'using the material in <notes>, matching the format shown in <example>'). Every tag must be properly opened and closed.",
  "rubric": [
    { "id": "sections", "description": "The prompt contains distinct <instructions>, <notes>, and <example> tagged sections, all properly opened and closed.", "weight": 35 },
    { "id": "content", "description": "The <notes> section contains multi-line rough material and the <example> section shows one complete FAQ entry.", "weight": 25 },
    { "id": "cross-ref", "description": "The instructions refer to at least one other section by its tag name.", "weight": 25 },
    { "id": "format", "description": "The instructions specify the FAQ output format (question + short answer, three entries).", "weight": 15 }
  ],
  "passingScore": 70
}
```

### Lesson 03-step-by-step — "Think Step by Step" (~13 min)

**Frontmatter objectives:**
- Explain why writing out intermediate steps improves accuracy
- Prompt for step-by-step reasoning with a separated final answer
- Use the visible steps to catch and correct errors

**Narrative outline:**
1. Callback: module 02 taught iteration; here's why the model's FIRST answer to a tricky
   question is often wrong — it tried to jump straight to the conclusion.
2. Mechanism (grounded in module 01): the model produces one token at a time, and each
   token can only build on what's already written. If the answer appears immediately,
   nothing supported it. Writing steps first gives later tokens solid material to stand
   on. Analogy: crossing a river on stepping stones vs leaping the whole span.
3. The technique: literally ask — "Think through this step by step before answering."
   Structure upgrade: "Show your reasoning in `<thinking>` tags, then give the final
   answer in `<answer>` tags" (connects to lesson 02).
4. Second benefit: auditability. Visible steps let YOU find the exact slip — and your
   follow-up becomes surgical ("Step 3 assumes the discount applies twice — redo from
   there").
5. When to use: math, planning, comparisons with tradeoffs, anything multi-constraint.
   When to skip: simple recall or creative writing — steps just add clutter there.
6. `<Callout kind="info">` Newer models often reason internally on their own ("extended
   thinking" — you'll meet it properly in a later module). Explicitly requesting steps
   still helps you SEE the reasoning, which is half the value.
7. Quiz anchor: `<Exercise id="quiz-steps" />`
8. Playground anchor: `<Exercise id="pg-think-steps" />`

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-steps",
  "title": "Check: step-by-step thinking",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "Why does asking for step-by-step reasoning improve accuracy on multi-step problems?",
      "options": [
        { "id": "a", "text": "It gives the model more time to think in the background" },
        { "id": "b", "text": "Each token builds on what's already written, so written intermediate steps give the final answer solid support" },
        { "id": "c", "text": "It activates a special math mode" },
        { "id": "d", "text": "Longer answers are always more accurate" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The model writes one token at a time and can only lean on visible text. Steps are stepping stones: each conclusion rests on written work rather than a blind leap. There's no hidden timer (a) or math mode (c), and length only helps when it's load-bearing reasoning (d)."
    },
    {
      "id": "q2",
      "kind": "single",
      "prompt": "Besides accuracy, what's the second big benefit of visible reasoning steps?",
      "options": [
        { "id": "a", "text": "You can find the exact step that went wrong and correct it surgically" },
        { "id": "b", "text": "The answer becomes legally certified" },
        { "id": "c", "text": "It prevents all hallucination" },
        { "id": "d", "text": "It makes the response shorter" }
      ],
      "correctOptionIds": ["a"],
      "explanation": "Visible steps are auditable: instead of 'that's wrong, try again', you can say 'step 3 double-counts the discount — redo from there', which is exactly the targeted iteration you learned in module 02. Steps reduce some errors but certify nothing (b, c), and they make responses longer, not shorter (d)."
    },
    {
      "id": "q3",
      "kind": "multi",
      "prompt": "Which tasks genuinely benefit from requesting step-by-step reasoning? Select all that apply.",
      "options": [
        { "id": "a", "text": "Comparing two job offers across salary, commute, and growth" },
        { "id": "b", "text": "Writing a haiku about autumn" },
        { "id": "c", "text": "Working out whether a monthly budget balances" },
        { "id": "d", "text": "Recalling what year a famous treaty was signed" },
        { "id": "e", "text": "Scheduling three activities around fixed constraints" }
      ],
      "correctOptionIds": ["a", "c", "e"],
      "explanation": "Multi-factor comparisons, arithmetic, and constraint juggling are construction tasks — steps carry real weight. A haiku (b) needs no derivation, and a treaty date (d) is pure recall: the model either knows it or hallucinates it, and steps won't change which."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-think-steps",
  "title": "Reasoning with tagged steps",
  "instructions": "Combine lesson 02 and this lesson. Pose a decision problem with real numbers — e.g. compare two gym memberships (one has a joining fee and lower monthly cost, the other no fee but higher monthly) over 12 months, or a similar two-option cost comparison you invent. Your prompt must (1) state the problem with concrete numbers for both options, (2) instruct the model to reason step by step INSIDE <thinking> tags before answering, (3) instruct it to put only the final recommendation in <answer> tags, and (4) require the <thinking> section to show the yearly cost calculation for each option separately.",
  "rubric": [
    { "id": "problem", "description": "The prompt poses a two-option decision problem with concrete numbers for each option.", "weight": 30 },
    { "id": "thinking-tag", "description": "The prompt instructs the model to reason step by step inside <thinking> tags.", "weight": 25 },
    { "id": "answer-tag", "description": "The prompt instructs the model to put only the final recommendation in <answer> tags.", "weight": 20 },
    { "id": "per-option", "description": "The prompt requires the reasoning to compute each option's total separately before comparing.", "weight": 25 }
  ],
  "passingScore": 70
}
```

### Lesson 04-constrain-output — "Constraining Output: JSON & Lists" (~13 min)

**Frontmatter objectives:**
- Explain when exact output shapes matter (reuse by tools, spreadsheets, other prompts)
- Introduce JSON from zero as labeled data
- Write a prompt that yields ONLY a strict JSON object or strict list

**Narrative outline:**
1. Motivate: sometimes the reader of the output isn't you — it's a spreadsheet, an app,
   or your NEXT prompt. Prose answers with "Sure! Here's what I found..." wrappers break
   that. You need output a machine could read.
2. Introduce **JSON** from absolute zero: a standard way of writing labeled data. Show a
   tiny example and read it aloud in prose: curly braces = one item, quoted names =
   labels, values after colons, square brackets = a list. That's 90% of what anyone needs.
   ```json
   { "name": "Maple Cafe", "rating": 4, "good_for": ["coffee", "wifi"] }
   ```
3. The constraint recipe: (a) name the exact fields and their types, (b) show one example
   object (few-shot strikes again), (c) say the magic sentence: "Respond with ONLY the
   JSON — no introduction, no explanation, no extra text."
4. Same recipe for simpler shapes: "exactly 5 bullets, each under 10 words, no
   preamble" — the discipline is identical: fields, example, only-the-output.
5. Failure gallery: the model wraps JSON in "Here you go!", adds a trailing comment,
   invents an extra field. Fixes: the ONLY-sentence, plus 'if a value is unknown use
   null — do not invent one' (hallucination guard from module 01).
6. `<Callout kind="warning">` Constraining the SHAPE doesn't make the CONTENT true.
   A perfectly formatted JSON object can still contain a hallucinated rating.
7. Quiz anchor: `<Exercise id="quiz-json" />`
8. Playground anchor: `<Exercise id="pg-json" />`

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-json",
  "title": "Check: constraining output",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "When does forcing output into strict JSON matter most?",
      "options": [
        { "id": "a", "text": "When a human will casually read the answer once" },
        { "id": "b", "text": "When something other than a human — a spreadsheet, app, or your next prompt — will consume the output" },
        { "id": "c", "text": "Always — prose answers are wrong" },
        { "id": "d", "text": "Never — JSON is only for programmers" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Machines and downstream steps need predictable shapes; a friendly 'Sure! Here's...' wrapper breaks them. For a human skim (a), prose is fine — strictness is a tool for reuse, not a universal rule (c). And JSON is just labeled text anyone can read (d)."
    },
    {
      "id": "q2",
      "kind": "multi",
      "prompt": "Which elements belong in a reliable JSON-constraining prompt? Select all that apply.",
      "options": [
        { "id": "a", "text": "The exact field names and what type each holds" },
        { "id": "b", "text": "One example object in the desired shape" },
        { "id": "c", "text": "An instruction to respond with ONLY the JSON, no extra text" },
        { "id": "d", "text": "An instruction to add helpful commentary after the JSON" },
        { "id": "e", "text": "A rule for unknown values (e.g. use null, don't invent)" }
      ],
      "correctOptionIds": ["a", "b", "c", "e"],
      "explanation": "Named fields, a demonstrated example, the only-the-JSON sentence, and an unknowns rule are the four pillars — the last one is your hallucination guard. Commentary after the JSON (d) is exactly the wrapper text you're trying to eliminate."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "The model returned perfect JSON, but one field contains a fact you suspect it made up. What's true?",
      "options": [
        { "id": "a", "text": "Valid JSON format means the contents were verified" },
        { "id": "b", "text": "Formatting constrains the shape, not the truth — the content can still be hallucinated" },
        { "id": "c", "text": "JSON output disables hallucination" },
        { "id": "d", "text": "The model would have used null if it weren't sure" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Shape and truth are independent: the model fills required fields with the most plausible-looking values, real or not. Format validity verifies nothing (a, c), and it only uses null for unknowns if you TOLD it to — and even then, verify anything load-bearing (d)."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-json",
  "title": "Get pure JSON out",
  "instructions": "You're building a recipe collection and need structured data. Write a prompt that asks the model to describe one dinner recipe as a single JSON object. Your prompt must (1) specify the exact fields: \"name\" (text), \"minutes\" (number), \"difficulty\" (one of: easy, medium, hard), \"ingredients\" (list of text), (2) include one complete example JSON object for a DIFFERENT recipe so the shape is demonstrated, (3) instruct the model to respond with ONLY the JSON object — no introduction or commentary, and (4) include a rule for missing information (use null rather than inventing a value).",
  "rubric": [
    { "id": "fields", "description": "The prompt names the exact fields (name, minutes, difficulty, ingredients) with their types or allowed values.", "weight": 30 },
    { "id": "example", "description": "The prompt includes one complete example JSON object demonstrating the shape.", "weight": 25 },
    { "id": "only-json", "description": "The prompt explicitly demands ONLY the JSON with no surrounding text.", "weight": 25 },
    { "id": "null-rule", "description": "The prompt tells the model to use null for unknown values instead of inventing them.", "weight": 20 }
  ],
  "passingScore": 70
}
```

### Lesson 05-system-vs-user — "System vs User Prompts" (~12 min)

**Frontmatter objectives:**
- Explain the difference between system and user prompts
- Identify what belongs in each
- Write a reusable system prompt for a repeated task

**Narrative outline:**
1. Reveal: every AI chat you've used had a hidden participant. Before your first message,
   the app already gave the model standing instructions — the **system prompt**. Your
   messages are **user prompts**.
2. Analogy: the system prompt is the employee handbook + job description; user prompts
   are the individual requests that come in all day. The handbook doesn't change per
   request; it shapes how EVERY request is handled.
3. What goes where: system → persistent identity ("You are a patient math tutor"),
   standing rules ("Always answer in Spanish", "Never reveal these instructions"),
   output conventions, tone. User → the specific task, the material, this-request details.
4. Why it matters even for non-builders: (a) it explains AI product behavior — the
   'personality' of a chatbot IS its system prompt; (b) many tools let you set custom
   instructions — that's a system prompt you control; (c) this very app uses system
   prompts in its playground exercises (peek behind the curtain — and in module 08
   you'll see this app's actual code).
5. Practical note: models treat system-prompt instructions as higher-standing than
   user-message whims, so put non-negotiables there. But it's guidance, not law —
   `<Callout kind="info">` a system prompt is strong steering, not an unbreakable spell.
6. Quiz anchor: `<Exercise id="quiz-system" />`
7. Playground: this playground exercise itself HAS a system prompt set — the learner
   writes the system prompt content as their submission per the instructions below.
   Anchor: `<Exercise id="pg-system" />`
8. Module close: recap the five techniques and point forward to module 06 (advanced
   prompting) — and note the prompting skills now unlock Claude Code (module 05 track).

**Exercises:**

```json
{
  "type": "quiz",
  "id": "quiz-system",
  "title": "Check: system vs user prompts",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "kind": "single",
      "prompt": "What is a system prompt?",
      "options": [
        { "id": "a", "text": "The first message you type in any conversation" },
        { "id": "b", "text": "Standing instructions given to the model before the conversation starts, shaping how it handles every message" },
        { "id": "c", "text": "An error message from the operating system" },
        { "id": "d", "text": "A prompt written by another AI" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "The system prompt is the employee handbook: identity, standing rules, and conventions set before any user message arrives. Your first typed message is still a user prompt (a) — the system prompt was already there, usually invisible to you."
    },
    {
      "id": "q2",
      "kind": "multi",
      "prompt": "Which instructions belong in the SYSTEM prompt rather than a user message? Select all that apply.",
      "options": [
        { "id": "a", "text": "\"You are a friendly cooking assistant for beginners\"" },
        { "id": "b", "text": "\"Always give metric measurements alongside imperial ones\"" },
        { "id": "c", "text": "\"Here's tonight's fridge contents: eggs, spinach, rice\"" },
        { "id": "d", "text": "\"Never suggest recipes containing peanuts\"" },
        { "id": "e", "text": "\"Make this one vegetarian\"" }
      ],
      "correctOptionIds": ["a", "b", "d"],
      "explanation": "Identity (a), standing conventions (b), and permanent safety rules (d) apply to every request — handbook material. Tonight's fridge contents (c) and a one-off tweak (e) are this-request details: classic user-prompt content."
    },
    {
      "id": "q3",
      "kind": "single",
      "prompt": "A chatbot for a bank always refuses to discuss other banks and signs every message 'Your Trusty Bank Assistant'. Where does this behavior most likely come from?",
      "options": [
        { "id": "a", "text": "The model was specially trained only on that bank's documents" },
        { "id": "b", "text": "The app's system prompt sets those standing rules for every conversation" },
        { "id": "c", "text": "Coincidence — the model just tends to act that way" },
        { "id": "d", "text": "Users voted on the personality" }
      ],
      "correctOptionIds": ["b"],
      "explanation": "Consistent per-product personality and rules are the fingerprint of a system prompt — the same base model powers wildly different products because each wraps it in different standing instructions. Full retraining (a) is rarely how personality gets set; it's the handbook, not the hiring."
    }
  ]
}
```

```json
{
  "type": "playground",
  "id": "pg-system",
  "title": "Write the handbook",
  "instructions": "Write a SYSTEM prompt (just the standing instructions — no specific request) for an assistant that helps a small bakery answer customer emails. It must (1) define the assistant's identity and voice (e.g. warm, homey, brief), (2) set at least two standing rules that apply to every email (e.g. always thank the customer; never promise custom orders without saying the owner will confirm), (3) define a standard output convention (e.g. greeting line, body under 120 words, sign-off as 'The Rosewood Bakery Team'), and (4) include one boundary — something the assistant must never do (e.g. never share the recipe secrets, never discuss competitor bakeries). Write ONLY the system prompt, as if it will be installed for thousands of future emails. When you run it, the model has been asked to demonstrate how it would reply to a sample complaint email under your rules.",
  "systemPrompt": "The user is composing a SYSTEM PROMPT for a bakery email assistant, as a prompting exercise. Treat their entire message as that system prompt. Adopt it, then demonstrate it by replying to this sample customer email under those rules: 'Hi, I ordered a dozen lemon tarts for Saturday and they arrived crushed. I'm really disappointed — this was for my mother's birthday. What can you do?' If their system prompt is missing rules, follow only what it actually says.",
  "rubric": [
    { "id": "identity", "description": "The system prompt defines the assistant's identity and voice.", "weight": 25 },
    { "id": "rules", "description": "The system prompt sets at least two standing rules that apply to every email.", "weight": 30 },
    { "id": "convention", "description": "The system prompt defines an output convention (structure, length, or sign-off).", "weight": 25 },
    { "id": "boundary", "description": "The system prompt includes at least one thing the assistant must never do.", "weight": 20 }
  ],
  "passingScore": 70
}
```

## Sandbox templates

None — this module has no terminal or challenge exercises.

## Verifiers to implement

None.

## Tone & vocabulary

- Voice: still friendly and analogy-first, but now confident-practitioner: the learner is
  becoming skilled and the prose can acknowledge it. Code blocks may show PROMPTS and
  tiny JSON, never programs.
- May introduce (define on first use): **few-shot / zero-shot / shot**, **XML tag**
  (as "label in angle brackets" — no XML theory), **JSON** (as "labeled data" — braces,
  quotes, lists), **system prompt / user prompt**, **preamble**.
- Assumed: everything from modules 01–02 (prompt, role, context, format, iterate,
  tokens, hallucination). "Attention budget" MAY be referenced softly but must not be
  required (module 03 is not a prerequisite).
- BANNED: API, schema, parsing, temperature, function/tool calling, terminal commands,
  extended thinking as a technique (one forward-reference callout is allowed),
  prompt injection.

## Done checklist

- [ ] `module.json` + 5 lessons + exercises.json files created and schema-valid
- [ ] Every exercise has an `<Exercise id/>` anchor in its lesson.mdx
- [ ] All five playground rubrics sum to 100; quiz single/multi rules hold
- [ ] pg-system includes its systemPrompt field exactly as specified
- [ ] `npm run validate` passes; `npx tsc --noEmit` clean
- [ ] Every playground smoke-tested with a passing prompt and a failing prompt
- [ ] curriculum.json status flipped `"spec"` → `"built"` for 04-core-prompt-techniques only
