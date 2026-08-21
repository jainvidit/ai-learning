/**
 * Fixture lesson for the beat-compiler stability tests (ROOT.1.1.2).
 *
 * beat-model.md's "How to test it" steps 2–4 each require a MUTATED version of a baseline
 * lesson (prose-only edit / insert / delete). The fixture is therefore a TypeScript module
 * returning strings rather than an on-disk `.mdx` file: the four steps then differ only by
 * an argument, and no test ever writes into `content/**` (which would race the real Velite
 * build and could leave the authored corpus dirty if a test aborted mid-run).
 *
 * The baseline deliberately covers every branch of the compiler that the authored corpus
 * cannot: `terminal` and `challenge` exercises (module 01 has only quiz + playground), an
 * intro region before the first h2, inline markup inside a heading, and a fenced code block
 * containing decoy `## heading` and `<Exercise />` lines.
 */

import type { BeatSourceExercise } from "@/lib/beats";

/** Exercise bank the fixture's anchors resolve against — one per exercise beat type. */
export const FIXTURE_EXERCISES: BeatSourceExercise[] = [
  { id: "quiz-basics", type: "quiz" },
  { id: "playground-explore", type: "playground" },
  { id: "terminal-session", type: "terminal" },
  { id: "challenge-final", type: "challenge" },
];

/**
 * STEP 1 baseline. Structure, in source order:
 *   intro prose (before the first h2)   -> prose:intro
 *   ## Getting started                  -> prose:getting-started
 *   ## What a token is *not*             -> prose:what-a-token-is-not   (inline markup)
 *   <Exercise id="quiz-basics" />        -> ex:quiz-basics
 *   ## Play with it                      -> prose:play-with-it
 *   <Exercise id="playground-explore" /> -> ex:playground-explore
 *   ## Open a shell                      -> prose:open-a-shell
 *   <Exercise id="terminal-session" />   -> ex:terminal-session
 *   <Exercise id="challenge-final" />    -> ex:challenge-final
 *   ## Wrap up                           -> prose:wrap-up
 */
export const FIXTURE_BASELINE = `Welcome to the fixture lesson. This paragraph sits before any heading, so it is the
intro region.

## Getting started

Some ordinary prose here.

### A sub-heading is not a beat boundary

Only h2 headings and exercise anchors split beats.

## What a token is *not*

Inline emphasis in the heading above must not affect the slug.

<Exercise id="quiz-basics" />

## Play with it

\`\`\`md
## This heading is inside a fence and must be ignored
<Exercise id="decoy-inside-fence" />
\`\`\`

<Exercise id="playground-explore" />

## Open a shell

<Exercise id="terminal-session" />

<Exercise id="challenge-final" />

## Wrap up

Closing prose.
`;

/**
 * STEP 2 — prose-only edit to a MIDDLE beat. Rewrites the body text under
 * "## What a token is *not*" and fixes a typo in the intro. No heading text, no anchor, no
 * ordering, no types touched (S1 + S2).
 */
export const FIXTURE_PROSE_EDITED = FIXTURE_BASELINE.replace(
  "Inline emphasis in the heading above must not affect the slug.",
  `This paragraph has been completely rewritten, made longer, and given **bold** text,
a [link](https://example.com), and a second sentence. None of that is structural.`
).replace(
  "Welcome to the fixture lesson.",
  "Welcome to the fixture lesson (typo fixed)."
);

/**
 * STEP 3 — INSERT a new beat between beats 2 and 3 of the baseline
 * (`prose:getting-started` and `prose:what-a-token-is-not`).
 */
export const FIXTURE_BEAT_INSERTED = FIXTURE_BASELINE.replace(
  "## What a token is *not*",
  `## Newly authored section

Brand new prose that did not exist at build A.

## What a token is *not*`
);

/**
 * STEP 4 — DELETE a beat: the `## Play with it` prose beat, heading and body together.
 * Its anchor-bearing neighbours are left in place so the test can check that no SURVIVING
 * beat took the retired id.
 */
export const FIXTURE_BEAT_DELETED = FIXTURE_BASELINE.replace(
  `## Play with it

\`\`\`md
## This heading is inside a fence and must be ignored
<Exercise id="decoy-inside-fence" />
\`\`\`

`,
  ""
);
