/**
 * BEAT COMPILER — pure logic (REQ-CP-02).
 *
 * Produces the compiled beat model frozen by `.program/interfaces/beat-model.md`. That
 * contract is BUILT TO here, never edited: this module is the "Beat Compiler … produces
 * this shape" consumer named in it. The segmentation and id-derivation algorithm is fixed
 * by ADR-0011 and is deliberately NOT redesigned here.
 *
 * PURITY. Nothing in this file touches the filesystem, the clock, a counter, or a random
 * source — that is invariant S2 (deterministic rebuild) expressed as a code property
 * rather than a test. `src/lib/content.ts` owns all I/O and calls in here.
 *
 * WHAT A COMPILED BEAT IS NOT. The field set is `{ beatId, type, persistent?, completion }`
 * and nothing else (REQ-CP-02's literal declaration; beat-model.md "Field shape is frozen").
 * Consequently:
 *   - no beat CONTENT travels in a beat — the prose/exercise payload is rendered from the
 *     Velite-compiled MDX and from exercises.json, joined by `beatId`;
 *   - no `itemRevision` — content-change detection is a sidecar keyed by beat id
 *     (ADR-0011 #6, REQ-CP-05, ROOT.1.1.3/4). Adding either field would be a breaking
 *     contract change requiring the steward.
 *   - no per-learner state — `completion` is a PREDICATE ("how is this beat completed?"),
 *     identical for every learner, never written at runtime (beat-model.md, normative).
 */

// ---------- The compiled shape (beat-model.md "Beat Type Shape") ----------

/** Closed vocabulary, frozen by ADR-0005. */
export type BeatType =
  | "prose"
  | "quiz"
  | "playground"
  | "terminal"
  | "challenge"
  | "widget";

export type CompletionPredicate = "passed" | "verified" | "attempted";

export type Beat = {
  /** Stable across rebuilds (REQ-CP-02 scenario 2; invariants S1–S4). */
  beatId: string;
  type: BeatType;
  /** Absent === false. MUST be true for terminal/streaming beats. */
  persistent?: boolean;
  /** A predicate, not state. */
  completion: CompletionPredicate;
};

/**
 * Predicate × type mapping — the closure table in beat-model.md.
 *
 * COMPILER-ENFORCED IN TWO PLACES, deliberately:
 *   1. At TYPE level: `Record<BeatType, …>` is total, so `npx tsc --noEmit` fails if a
 *      `BeatType` is ever added without deciding its predicate. That is the enforcement
 *      beat-model.md asks for ("a compiler-enforced convention … not expressible in the
 *      TypeScript types above" — expressible here because the table, not the Beat type,
 *      carries it).
 *   2. At BUILD level: `assertValidBeats()` re-checks every emitted beat and throws, so a
 *      violation is a build failure rather than a bad bundle.
 *
 * Widening a row is a steward decision (ROOT.1.2 while open, ROOT.7.1 after) and is
 * additive; this compiler never widens one on its own.
 */
export const COMPLETION_BY_BEAT_TYPE: Record<BeatType, CompletionPredicate> = {
  prose: "attempted",
  quiz: "passed",
  playground: "attempted",
  terminal: "attempted",
  challenge: "verified",
  widget: "attempted",
};

/**
 * Beat types that MUST carry `persistent: true` (REQ-CP-02 scenario 3).
 *
 * beat-model.md requires `true` for "every beat of `type: "terminal"`, and every streaming
 * beat … (terminal sessions, agent runs, SSE-fed widgets)". In the authored corpus only
 * `terminal` qualifies, and the exclusion of `playground` is a deliberate, evidenced call
 * rather than an oversight:
 *   - `src/components/lesson/Playground.tsx` does stream its run output
 *     (`res.body.getReader()` on `/api/playground/run`), but the persistence obligations
 *     the flag imposes are SESSION-survival obligations — stay mounted across beat
 *     transitions and route changes, never `display:none`, reserve min-height so xterm
 *     `fit()` is safe (beat-model.md "Persistent Beats" + "Portal-Slot Contract",
 *     REQ-LX-03 / REQ-TX-01). A playground run is request-scoped: it completes, its output
 *     is ordinary client state, and there is no session identity to restore.
 *   - Marking it `true` would impose portal-slot obligations on ROOT.4.2/ROOT.4.6 that
 *     nothing in their specs asks for, which is not this leaf's call to make.
 * Should the steward or the curriculum lane later declare a streaming playground/widget,
 * adding it to this set is additive and changes no `beatId`.
 */
export const PERSISTENT_BEAT_TYPES: ReadonlySet<BeatType> = new Set<BeatType>([
  "terminal",
]);

/** beatId prefixes (ADR-0011 #2). Lesson-scoped, authored-identity-based. */
export const EXERCISE_BEAT_ID_PREFIX = "ex:";
export const PROSE_BEAT_ID_PREFIX = "prose:";
/** beatId of the segment preceding the first `h2` (ADR-0011 #2). */
export const INTRO_BEAT_ID = "prose:intro";

/**
 * A beat-compile failure. Every throw site is a BUILD failure by contract — a bundle with
 * duplicate beat ids, an unresolvable anchor, an unsluggable heading, or a terminal beat
 * missing `persistent: true` is "a compiler defect and a build failure, not a runtime
 * condition to be patched" (beat-model.md).
 */
export class BeatCompileError extends Error {
  readonly lessonKey?: string;

  constructor(message: string, lessonKey?: string) {
    super(lessonKey ? `${lessonKey}: ${message}` : message);
    this.name = "BeatCompileError";
    this.lessonKey = lessonKey;
  }
}

/**
 * The only thing the compiler needs to know about an authored exercise: its id and its
 * type. Structural on purpose — `src/lib/schema.ts` is steward-owned and its `Exercise`
 * union satisfies this shape, so `content.ts` passes exercises straight through while this
 * module stays free of the authoring contract (and of Zod).
 */
export type BeatSourceExercise = {
  id: string;
  type: string;
};

/** Exercise types that map 1:1 onto a beat type (ADR-0011 #1). */
const EXERCISE_BEAT_TYPES: ReadonlySet<string> = new Set([
  "quiz",
  "playground",
  "terminal",
  "challenge",
]);

// ---------- Heading slugs ----------

/**
 * Slug of an `h2`'s text — half of the prose beatId key (ADR-0011 #2).
 *
 * Pure and positionless, which is what makes it satisfy S1–S4: inline markup is unwrapped
 * before slugging so that italicising or bolding a word inside a heading (a prose edit)
 * does not move the identity, and nothing about the heading's POSITION enters the key.
 * Renaming the heading text itself is I3 — retire + create — which the contract sanctions.
 */
export function slugifyHeading(headingText: string): string {
  return (
    headingText
      // Unwrap inline markup so `## What an LLM is *not*` and `## What an LLM is not`
      // slug identically.
      .replace(/`([^`]*)`/g, "$1")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_~]+/g, "")
      // Strip diacritics deterministically rather than dropping accented letters.
      // (Escaped range = U+0300–U+036F combining marks; kept escaped so the source stays
      // pure ASCII and no editor can silently normalise it away.)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

// ---------- Segmentation ----------

/** `## Heading`, but never `###`. Up to three leading spaces, optional closing hashes. */
const H2_PATTERN = /^ {0,3}##(?!#)\s+(.*?)\s*#*\s*$/;
/** `<Exercise id="…" />` — mirrors the anchor regex in scripts/validate-content.ts. */
const EXERCISE_ANCHOR_PATTERN = /<Exercise\s[^>]*?id=["']([^"']+)["'][^>]*>/g;
/** Fenced code block delimiter (``` or ~~~), up to three leading spaces. */
const FENCE_PATTERN = /^ {0,3}(`{3,}|~{3,})/;

type Segment =
  | { kind: "prose"; slug: string | null }
  | { kind: "exercise"; exerciseId: string };

/**
 * Walk the MDX body and emit the ordered structural segments (ADR-0011 #1: the two
 * boundaries are exercise anchors and `h2` headings).
 *
 * Fenced code blocks are skipped wholesale: a `## …` line or an `<Exercise …/>` inside a
 * fence is sample text, not structure, and treating it as a boundary would let a code
 * sample invent or rename a beat.
 *
 * ONE PROSE BEAT PER h2 SECTION. ADR-0011 #1 reads "each contiguous prose region yields
 * one prose beat per h2 section" — the section is the unit. So a section authored as
 * text → anchor → more text yields exactly ONE prose beat (positioned at its heading),
 * not two. The alternative reading (a beat per text run) would emit two beats keyed
 * `prose:<same-slug>` and therefore hit ADR-0011 #3's duplicate-key build failure on
 * perfectly reasonable content, which cannot be the intended reading. Every `h2` yields
 * its prose beat even when the section holds nothing but the heading, so adding or
 * removing sentences under a heading never creates or destroys a beat (S1).
 */
function segmentMdx(body: string): Segment[] {
  const segments: Segment[] = [];
  const lines = body.split(/\r?\n/);

  // `null` slug === the pre-first-h2 region. Only materialised if it holds content.
  let currentProseSlug: string | null = null;
  let introHasContent = false;
  let sawFirstHeading = false;
  let openFence: string | undefined;

  const pushProseForHeading = (slug: string) => {
    segments.push({ kind: "prose", slug });
  };

  for (const line of lines) {
    const fence = FENCE_PATTERN.exec(line);
    if (fence) {
      const marker = fence[1];
      if (openFence === undefined) {
        openFence = marker[0];
      } else if (marker[0] === openFence) {
        openFence = undefined;
      }
      if (!sawFirstHeading) introHasContent = true;
      continue;
    }
    if (openFence !== undefined) {
      if (!sawFirstHeading) introHasContent = true;
      continue;
    }

    const heading = H2_PATTERN.exec(line);
    if (heading) {
      sawFirstHeading = true;
      currentProseSlug = heading[1];
      pushProseForHeading(heading[1]);
      continue;
    }

    // A line may hold several anchors; take them in source order.
    EXERCISE_ANCHOR_PATTERN.lastIndex = 0;
    let anchor = EXERCISE_ANCHOR_PATTERN.exec(line);
    let lineHadAnchor = false;
    while (anchor) {
      lineHadAnchor = true;
      segments.push({ kind: "exercise", exerciseId: anchor[1] });
      anchor = EXERCISE_ANCHOR_PATTERN.exec(line);
    }
    if (lineHadAnchor) continue;

    if (line.trim().length > 0) {
      // Prose inside an h2 section is already represented by that section's beat
      // (pushed at the heading). Only the pre-heading region needs to be noticed here.
      if (!sawFirstHeading) introHasContent = true;
    }
  }
  void currentProseSlug;

  if (introHasContent) {
    segments.unshift({ kind: "prose", slug: null });
  }
  return segments;
}

// ---------- Compile ----------

/**
 * Compile one lesson's raw MDX body + its authored exercises into an ordered `Beat[]`.
 *
 * `mdxBody` is the RAW MDX body (frontmatter already stripped), NOT Velite's compiled
 * output. That is not a shortcut: Velite emits compiled MDX as a JS *function body*
 * (`outputFormat: 'function-body'`, velite.config.ts), in which an `h2` has already become
 * a `_jsx("h2", …)` call — segmenting it would mean parsing generated JavaScript. The
 * authored source is the only sound identity source, and `loadLesson()` already reads it.
 *
 * Throws `BeatCompileError` (a build failure) on: a duplicate beat key, an anchor naming
 * an exercise absent from exercises.json, an exercise type outside the closed mapping, or
 * a heading that slugs to the empty string.
 */
export function compileBeats(
  mdxBody: string,
  exercises: readonly BeatSourceExercise[],
  lessonKey?: string
): Beat[] {
  const exercisesById = new Map<string, BeatSourceExercise>();
  for (const exercise of exercises) {
    // Two exercises sharing an id would silently pick a winner here; that is an authoring
    // error worth failing on, since the beat's type would be arbitrary.
    if (exercisesById.has(exercise.id)) {
      throw new BeatCompileError(
        `exercises.json declares exercise id "${exercise.id}" more than once, so the ` +
          `beat type for anchor <Exercise id="${exercise.id}" /> is ambiguous.`,
        lessonKey
      );
    }
    exercisesById.set(exercise.id, exercise);
  }

  const beats: Beat[] = [];
  const seen = new Map<string, BeatType>();

  const push = (beat: Beat, source: string) => {
    const existing = seen.get(beat.beatId);
    if (existing !== undefined) {
      // ADR-0011 #3: duplicates are a build failure. NO ordinal suffixing — a `-2` suffix
      // would re-introduce positional identity and break S3.
      throw new BeatCompileError(
        `duplicate beatId "${beat.beatId}" (${source}). Beat ids are lesson-scoped and ` +
          `derived from authored identity, and are never disambiguated with an ordinal ` +
          `suffix (ADR-0011 #3, invariant S3). Rename the heading or the exercise id.`,
        lessonKey
      );
    }
    seen.set(beat.beatId, beat.type);
    beats.push(beat);
  };

  for (const segment of segmentMdx(mdxBody)) {
    if (segment.kind === "prose") {
      if (segment.slug === null) {
        push(makeBeat(INTRO_BEAT_ID, "prose"), "the segment before the first h2");
        continue;
      }
      const slug = slugifyHeading(segment.slug);
      if (slug.length === 0) {
        throw new BeatCompileError(
          `h2 heading "${segment.slug}" slugs to the empty string, so no stable beatId ` +
            `can be derived from it (ADR-0011 #2). Give the heading at least one ` +
            `alphanumeric character.`,
          lessonKey
        );
      }
      push(
        makeBeat(`${PROSE_BEAT_ID_PREFIX}${slug}`, "prose"),
        `h2 "${segment.slug}"`
      );
      continue;
    }

    const exercise = exercisesById.get(segment.exerciseId);
    if (!exercise) {
      // Anchor integrity in the other direction (an exercise with no anchor) is
      // scripts/validate-content.ts's gate (REQ-CP-06 scenario 1) and stays there; this
      // direction must fail here because an unresolvable anchor has no derivable type.
      throw new BeatCompileError(
        `anchor <Exercise id="${segment.exerciseId}" /> names an exercise that is not in ` +
          `exercises.json, so its beat type cannot be derived.`,
        lessonKey
      );
    }
    if (!EXERCISE_BEAT_TYPES.has(exercise.type)) {
      throw new BeatCompileError(
        `exercise "${exercise.id}" has type "${exercise.type}", which has no beat type. ` +
          `Exercise types map 1:1 onto beat types (ADR-0011 #1): ` +
          `${[...EXERCISE_BEAT_TYPES].join(", ")}.`,
        lessonKey
      );
    }
    push(
      makeBeat(
        `${EXERCISE_BEAT_ID_PREFIX}${exercise.id}`,
        exercise.type as BeatType
      ),
      `exercise "${exercise.id}"`
    );
  }

  // Belt and braces: the emitter above is correct by construction, and this re-checks the
  // emitted array anyway, so a future edit to it cannot quietly ship a bundle that
  // violates the mapping table or the persistence requirement.
  assertValidBeats(beats, lessonKey);
  return beats;
}

/** Build one beat, taking its predicate and persistence from the frozen tables. */
function makeBeat(beatId: string, type: BeatType): Beat {
  const beat: Beat = { beatId, type, completion: COMPLETION_BY_BEAT_TYPE[type] };
  // `persistent` is emitted ONLY when true: absent === false by contract, and writing
  // `false` explicitly adds noise consumers are required to treat identically.
  if (PERSISTENT_BEAT_TYPES.has(type)) beat.persistent = true;
  return beat;
}

/**
 * Validate a compiled beat array against every invariant the compiler owns. Throws
 * `BeatCompileError` — i.e. fails the build — on violation.
 *
 * Exported so downstream emitters (ROOT.1.1.3/4) and tests can assert the same gate
 * without re-deriving it.
 */
export function assertValidBeats(
  beats: readonly Beat[],
  lessonKey?: string
): void {
  const seen = new Set<string>();
  for (const beat of beats) {
    if (beat.beatId.length === 0) {
      throw new BeatCompileError("a beat has an empty beatId.", lessonKey);
    }
    if (seen.has(beat.beatId)) {
      throw new BeatCompileError(
        `duplicate beatId "${beat.beatId}" (ADR-0011 #3).`,
        lessonKey
      );
    }
    seen.add(beat.beatId);

    const required = COMPLETION_BY_BEAT_TYPE[beat.type];
    if (required === undefined) {
      throw new BeatCompileError(
        `beat "${beat.beatId}" has type "${beat.type}", which is outside the closed ` +
          `BeatType set (ADR-0005).`,
        lessonKey
      );
    }
    if (beat.completion !== required) {
      throw new BeatCompileError(
        `beat "${beat.beatId}" of type "${beat.type}" declares completion ` +
          `"${beat.completion}", but the predicate × type mapping fixes it to ` +
          `"${required}" (beat-model.md mapping table). Widening a row is a steward ` +
          `decision, not a compile-time choice.`,
        lessonKey
      );
    }
    if (PERSISTENT_BEAT_TYPES.has(beat.type) && beat.persistent !== true) {
      throw new BeatCompileError(
        `beat "${beat.beatId}" of type "${beat.type}" must carry persistent: true ` +
          `(REQ-CP-02 scenario 3). A missing flag here is a compiler defect and a build ` +
          `failure, never something a consumer patches at runtime.`,
        lessonKey
      );
    }
  }
}
