/**
 * Beat compiler tests (ROOT.1.1.2 / REQ-CP-02).
 *
 * The four `describe` blocks named "step 1".."step 4" are beat-model.md's "How to test it"
 * procedure, implemented literally and in order. The remaining blocks cover REQ-CP-02
 * scenarios 1 and 3 and the compiler-enforced gates (ADR-0011 #3, the predicate x type
 * mapping table).
 *
 * `tests/beats.test.ts` matches the existing vitest convention (`include:
 * ['tests/**\/*.test.*', 'src/**\/*.test.*']`, vitest.config.ts) — no colocation deviation.
 */

import { describe, it, expect } from "vitest";
import {
  compileBeats,
  assertValidBeats,
  slugifyHeading,
  BeatCompileError,
  COMPLETION_BY_BEAT_TYPE,
  INTRO_BEAT_ID,
  type Beat,
  type BeatType,
} from "@/lib/beats";
import {
  FIXTURE_EXERCISES,
  FIXTURE_BASELINE,
  FIXTURE_PROSE_EDITED,
  FIXTURE_BEAT_INSERTED,
  FIXTURE_BEAT_DELETED,
} from "./fixtures/beats-fixture-lesson";

const LESSON_KEY = "99-fixture/01-fixture-lesson";

const compile = (mdx: string): Beat[] =>
  compileBeats(mdx, FIXTURE_EXERCISES, LESSON_KEY);

const ids = (beats: readonly Beat[]): string[] => beats.map((b) => b.beatId);

/** The closed BeatType set (ADR-0005), as the contract lists it. */
const CLOSED_BEAT_TYPES: BeatType[] = [
  "prose",
  "quiz",
  "playground",
  "terminal",
  "challenge",
  "widget",
];
const VALID_PREDICATES = ["passed", "verified", "attempted"];

// ---------------------------------------------------------------------------
// beat-model.md "How to test it", step 1
// "Compile a fixture lesson -> record the ordered beatId list."
// ---------------------------------------------------------------------------

describe("beat-model.md step 1 — compile a fixture lesson and record the ordered beatId list", () => {
  const baseline = compile(FIXTURE_BASELINE);

  it("emits the beats in source order with ADR-0011 keys", () => {
    expect(ids(baseline)).toEqual([
      INTRO_BEAT_ID,
      "prose:getting-started",
      "prose:what-a-token-is-not",
      "ex:quiz-basics",
      "prose:play-with-it",
      "ex:playground-explore",
      "prose:open-a-shell",
      "ex:terminal-session",
      "ex:challenge-final",
      "prose:wrap-up",
    ]);
  });

  it("keys the pre-first-h2 region as prose:intro (ADR-0011 #2)", () => {
    expect(baseline[0].beatId).toBe("prose:intro");
    expect(baseline[0].type).toBe("prose");
  });

  it("does not treat h3 headings or fenced-code decoys as beat boundaries", () => {
    // The fixture contains "### A sub-heading is not a beat boundary" plus a fenced block
    // holding a decoy "## …" line and a decoy <Exercise id="decoy-inside-fence" />.
    expect(ids(baseline)).not.toContain("prose:a-sub-heading-is-not-a-beat-boundary");
    expect(ids(baseline)).not.toContain(
      "prose:this-heading-is-inside-a-fence-and-must-be-ignored"
    );
    expect(ids(baseline)).not.toContain("ex:decoy-inside-fence");
  });

  it("is deterministic — recompiling unchanged source is byte-identical (S2)", () => {
    expect(compile(FIXTURE_BASELINE)).toEqual(baseline);
    expect(JSON.stringify(compile(FIXTURE_BASELINE))).toBe(
      JSON.stringify(baseline)
    );
  });
});

// ---------------------------------------------------------------------------
// step 2 — "Apply a prose-only edit to a middle beat, recompile -> assert the full
// beatId list is unchanged (S1, S2)."  Also REQ-CP-02 scenario 2.
// ---------------------------------------------------------------------------

describe("beat-model.md step 2 — prose-only edit to a middle beat preserves every beatId (S1, S2)", () => {
  const before = compile(FIXTURE_BASELINE);
  const after = compile(FIXTURE_PROSE_EDITED);

  it("the fixture edit really did change the source (guards a vacuous test)", () => {
    expect(FIXTURE_PROSE_EDITED).not.toBe(FIXTURE_BASELINE);
  });

  it("asserts the FULL beatId list is unchanged", () => {
    expect(ids(after)).toEqual(ids(before));
  });

  it("preserves types, predicates and persistence too, not just ids", () => {
    expect(after).toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// step 3 — "Insert a new beat between beats 2 and 3, recompile -> assert every
// pre-existing beatId is unchanged, and the new beat's ID is not any retired ID (S3, I1)."
// ---------------------------------------------------------------------------

describe("beat-model.md step 3 — inserting a beat preserves every pre-existing beatId (S3, I1)", () => {
  const before = compile(FIXTURE_BASELINE);
  const after = compile(FIXTURE_BEAT_INSERTED);

  it("inserts exactly one beat, between beats 2 and 3", () => {
    expect(after).toHaveLength(before.length + 1);
    // Baseline beats 2 and 3 (1-indexed) are prose:getting-started and
    // prose:what-a-token-is-not; the new beat lands between them.
    expect(ids(after).slice(0, 4)).toEqual([
      INTRO_BEAT_ID,
      "prose:getting-started",
      "prose:newly-authored-section",
      "prose:what-a-token-is-not",
    ]);
  });

  it("asserts every pre-existing beatId is unchanged", () => {
    const afterIds = new Set(ids(after));
    for (const id of ids(before)) expect(afterIds.has(id)).toBe(true);
  });

  it("preserves each pre-existing beat's full shape, not merely its presence", () => {
    const afterById = new Map(after.map((b) => [b.beatId, b]));
    for (const beat of before) expect(afterById.get(beat.beatId)).toEqual(beat);
  });

  it("gives the new beat an id that is not any pre-existing id (I1)", () => {
    const beforeIds = new Set(ids(before));
    const fresh = ids(after).filter((id) => !beforeIds.has(id));
    expect(fresh).toEqual(["prose:newly-authored-section"]);
  });

  it("shifts no id positionally — identity is per-beat, never ordinal (S3)", () => {
    // The beats AFTER the insertion point all moved by one index and kept their ids.
    const movedBefore = ids(before).slice(2);
    const movedAfter = ids(after).slice(3);
    expect(movedAfter).toEqual(movedBefore);
  });
});

// ---------------------------------------------------------------------------
// step 4 — "Delete a beat, recompile -> assert no surviving beat took the deleted ID (I2)."
// ---------------------------------------------------------------------------

describe("beat-model.md step 4 — deleting a beat retires its id; no survivor takes it (I2)", () => {
  const before = compile(FIXTURE_BASELINE);
  const after = compile(FIXTURE_BEAT_DELETED);
  const deletedId = "prose:play-with-it";

  it("removed exactly the intended beat", () => {
    expect(ids(before)).toContain(deletedId);
    expect(after).toHaveLength(before.length - 1);
  });

  it("asserts no surviving beat took the deleted id", () => {
    expect(ids(after)).not.toContain(deletedId);
    for (const beat of after) expect(beat.beatId).not.toBe(deletedId);
  });

  it("leaves every surviving beat's id and shape untouched (S3)", () => {
    const survivors = before.filter((b) => b.beatId !== deletedId);
    expect(after).toEqual(survivors);
  });

  it("never reassigns the retired id on a later rebuild either", () => {
    // Recompiling the post-delete source again must not resurrect the id, and re-inserting
    // DIFFERENT content must not claim it.
    expect(ids(compile(FIXTURE_BEAT_DELETED))).not.toContain(deletedId);
    const withNewSection = FIXTURE_BEAT_DELETED.replace(
      "## Open a shell",
      "## A different section\n\nNew prose.\n\n## Open a shell"
    );
    expect(ids(compile(withNewSection))).not.toContain(deletedId);
  });
});

// ---------------------------------------------------------------------------
// REQ-CP-02 scenario 1 — shape of every beat
// ---------------------------------------------------------------------------

describe("REQ-CP-02 scenario 1 — every beat has a beatId, a closed-set type, and a predicate", () => {
  const baseline = compile(FIXTURE_BASELINE);

  it("holds for every beat of the fixture lesson", () => {
    expect(baseline.length).toBeGreaterThan(0);
    for (const beat of baseline) {
      expect(typeof beat.beatId).toBe("string");
      expect(beat.beatId.length).toBeGreaterThan(0);
      expect(CLOSED_BEAT_TYPES).toContain(beat.type);
      expect(VALID_PREDICATES).toContain(beat.completion);
    }
  });

  it("emits no field outside the frozen set {beatId, type, persistent?, completion}", () => {
    // Guards ADR-0011 #6: itemRevision (or any other field) must NOT appear on a Beat.
    for (const beat of baseline) {
      for (const key of Object.keys(beat)) {
        expect(["beatId", "type", "persistent", "completion"]).toContain(key);
      }
      expect(beat).not.toHaveProperty("itemRevision");
    }
  });

  it("maps each exercise type 1:1 onto its beat type (ADR-0011 #1)", () => {
    const byId = new Map(baseline.map((b) => [b.beatId, b]));
    expect(byId.get("ex:quiz-basics")?.type).toBe("quiz");
    expect(byId.get("ex:playground-explore")?.type).toBe("playground");
    expect(byId.get("ex:terminal-session")?.type).toBe("terminal");
    expect(byId.get("ex:challenge-final")?.type).toBe("challenge");
  });

  it("emits no widget beats yet (ADR-0011 #5) even though the type exists", () => {
    // The fixture's prose holds inline components; they stay inside prose beats.
    expect(baseline.map((b) => b.type)).not.toContain("widget");
    expect(CLOSED_BEAT_TYPES).toContain("widget");
  });

  it("orders beats as authored (an ordered array, not a set)", () => {
    const order = ids(baseline);
    expect(order.indexOf("ex:quiz-basics")).toBeLessThan(
      order.indexOf("ex:playground-explore")
    );
    expect(order.indexOf("ex:terminal-session")).toBeLessThan(
      order.indexOf("ex:challenge-final")
    );
  });
});

// ---------------------------------------------------------------------------
// REQ-CP-02 scenario 3 + the predicate x type mapping table
// ---------------------------------------------------------------------------

describe("REQ-CP-02 scenario 3 — terminal beats carry persistent: true", () => {
  const baseline = compile(FIXTURE_BASELINE);

  it("sets persistent: true on the terminal beat", () => {
    const terminal = baseline.find((b) => b.type === "terminal");
    expect(terminal).toBeDefined();
    expect(terminal?.persistent).toBe(true);
  });

  it("omits the flag on non-persistent beats (absent === false)", () => {
    for (const beat of baseline.filter((b) => b.type !== "terminal")) {
      expect(beat.persistent).toBeUndefined();
    }
  });

  it("fails the build when a terminal beat lacks the flag", () => {
    const bad: Beat[] = [
      { beatId: "ex:terminal-session", type: "terminal", completion: "attempted" },
    ];
    expect(() => assertValidBeats(bad, LESSON_KEY)).toThrow(BeatCompileError);
    expect(() => assertValidBeats(bad, LESSON_KEY)).toThrow(/persistent: true/);
  });
});

describe("predicate x type mapping is compiler-enforced (beat-model.md table)", () => {
  it("matches the contract table exactly", () => {
    expect(COMPLETION_BY_BEAT_TYPE).toEqual({
      prose: "attempted",
      quiz: "passed",
      playground: "attempted",
      terminal: "attempted",
      challenge: "verified",
      widget: "attempted",
    });
  });

  it("assigns the mapped predicate to every compiled beat", () => {
    for (const beat of compile(FIXTURE_BASELINE)) {
      expect(beat.completion).toBe(COMPLETION_BY_BEAT_TYPE[beat.type]);
    }
  });

  it("covers every member of the closed type set (total mapping)", () => {
    expect(Object.keys(COMPLETION_BY_BEAT_TYPE).sort()).toEqual(
      [...CLOSED_BEAT_TYPES].sort()
    );
  });

  it.each([
    ["prose", "passed"],
    ["prose", "verified"],
    ["quiz", "attempted"],
    ["quiz", "verified"],
    ["playground", "passed"],
    ["playground", "verified"],
    ["terminal", "passed"],
    ["terminal", "verified"],
    ["challenge", "passed"],
    ["challenge", "attempted"],
    ["widget", "passed"],
    ["widget", "verified"],
  ])("fails the build on an invalid pair: %s x %s", (type, completion) => {
    const bad = [
      {
        beatId: `x:${type}-${completion}`,
        type: type as BeatType,
        completion: completion as Beat["completion"],
        ...(type === "terminal" ? { persistent: true as const } : {}),
      },
    ];
    expect(() => assertValidBeats(bad, LESSON_KEY)).toThrow(BeatCompileError);
    expect(() => assertValidBeats(bad, LESSON_KEY)).toThrow(
      /predicate . type mapping|mapping table/
    );
  });
});

// ---------------------------------------------------------------------------
// Build-failure gates (ADR-0011 #3 and anchor/type integrity)
// ---------------------------------------------------------------------------

describe("duplicate beat keys are a build failure — never ordinal-suffixed (ADR-0011 #3)", () => {
  it("throws on two h2 headings that slug identically", () => {
    const mdx = "## Same heading\n\nA.\n\n## Same Heading\n\nB.\n";
    expect(() => compile(mdx)).toThrow(BeatCompileError);
    expect(() => compile(mdx)).toThrow(/duplicate beatId "prose:same-heading"/);
  });

  it("throws on the same exercise anchored twice", () => {
    const mdx =
      '## One\n\n<Exercise id="quiz-basics" />\n\n## Two\n\n<Exercise id="quiz-basics" />\n';
    expect(() => compile(mdx)).toThrow(/duplicate beatId "ex:quiz-basics"/);
  });

  it("never emits an ordinal-suffixed id as an escape hatch (S3)", () => {
    const mdx = "## Same heading\n\nA.\n\n## Same heading\n\nB.\n";
    let thrown: unknown;
    try {
      compile(mdx);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(BeatCompileError);
    // If the compiler ever "resolved" the clash it would have returned ids like
    // prose:same-heading-2; assert it threw instead.
    expect(() => compile(mdx)).toThrow();
  });

  it("throws on a duplicate exercise id in the exercise bank", () => {
    expect(() =>
      compileBeats('## One\n\n<Exercise id="dup" />\n', [
        { id: "dup", type: "quiz" },
        { id: "dup", type: "challenge" },
      ])
    ).toThrow(/more than once/);
  });
});

describe("anchor and type integrity", () => {
  it("throws when an anchor names an exercise absent from exercises.json", () => {
    expect(() => compile('## One\n\n<Exercise id="does-not-exist" />\n')).toThrow(
      /not in exercises.json/
    );
  });

  it("throws on an exercise type with no beat type", () => {
    expect(() =>
      compileBeats('## One\n\n<Exercise id="odd" />\n', [
        { id: "odd", type: "survey" },
      ])
    ).toThrow(/has no beat type/);
  });

  it("throws on an h2 that slugs to nothing", () => {
    expect(() => compile("## !!!\n\nProse.\n")).toThrow(/empty string/);
  });

  it("names the lesson in the error so the failing build is diagnosable", () => {
    expect(() => compile("## X\n\nA.\n\n## x\n\nB.\n")).toThrow(
      new RegExp(LESSON_KEY.replace("/", "\\/"))
    );
  });
});

describe("slugifyHeading is a pure, positionless function of the heading text", () => {
  it("ignores inline markup so formatting a word is a prose edit (S1)", () => {
    expect(slugifyHeading("What a token is *not*")).toBe("what-a-token-is-not");
    expect(slugifyHeading("What a token is not")).toBe("what-a-token-is-not");
    expect(slugifyHeading("Use `npm run build`")).toBe("use-npm-run-build");
    expect(slugifyHeading("See [the docs](https://example.com)")).toBe(
      "see-the-docs"
    );
  });

  it("normalises case, punctuation and diacritics deterministically", () => {
    expect(slugifyHeading("Tokens: How AI Reads")).toBe("tokens-how-ai-reads");
    expect(slugifyHeading("  Padded  --  Heading  ")).toBe("padded-heading");
    expect(slugifyHeading("Café naïve")).toBe("cafe-naive");
  });

  it("contains no counter, timestamp or random component (S2)", () => {
    expect(slugifyHeading("Stable")).toBe(slugifyHeading("Stable"));
    expect(slugifyHeading("Stable")).toBe("stable");
  });
});

describe("edge cases in segmentation", () => {
  it("emits no intro beat when the file opens with an h2", () => {
    const beats = compile("## First\n\nProse.\n");
    expect(ids(beats)).toEqual(["prose:first"]);
  });

  it("emits an intro beat for content before the first h2, including an h1 title", () => {
    const beats = compile("# Lesson Title\n\nLead paragraph.\n\n## First\n\nProse.\n");
    expect(ids(beats)).toEqual([INTRO_BEAT_ID, "prose:first"]);
  });

  it("emits one prose beat per h2 section even when the section is heading-only (S1)", () => {
    const bare = compile("## Alpha\n\n## Beta\n");
    const filled = compile("## Alpha\n\nText added later.\n\n## Beta\n\nMore.\n");
    expect(ids(bare)).toEqual(["prose:alpha", "prose:beta"]);
    expect(ids(filled)).toEqual(ids(bare));
  });

  it("emits ONE prose beat for a section whose text is split by an anchor", () => {
    // Text -> anchor -> more text under a single h2 must not yield two prose beats keyed
    // to the same slug (which ADR-0011 #3 would then reject).
    const beats = compile(
      '## Solo\n\nBefore.\n\n<Exercise id="quiz-basics" />\n\nAfter.\n'
    );
    expect(ids(beats)).toEqual(["prose:solo", "ex:quiz-basics"]);
  });

  it("compiles an empty body to an empty beat array without throwing", () => {
    expect(compile("")).toEqual([]);
    expect(compile("\n\n   \n")).toEqual([]);
  });

  it("handles CRLF line endings identically to LF (S2 across platforms)", () => {
    const lf = "## Alpha\n\nText.\n\n## Beta\n\nMore.\n";
    expect(compile(lf.replace(/\n/g, "\r\n"))).toEqual(compile(lf));
  });

  it("takes multiple anchors on one line in source order", () => {
    const beats = compile(
      '## Both\n\n<Exercise id="quiz-basics" /><Exercise id="challenge-final" />\n'
    );
    expect(ids(beats)).toEqual([
      "prose:both",
      "ex:quiz-basics",
      "ex:challenge-final",
    ]);
  });

  it("accepts single-quoted and attribute-reordered anchors", () => {
    const beats = compile(
      "## Q\n\n<Exercise id='quiz-basics' />\n\n## C\n\n<Exercise className=\"x\" id=\"challenge-final\" />\n"
    );
    expect(ids(beats)).toEqual([
      "prose:q",
      "ex:quiz-basics",
      "prose:c",
      "ex:challenge-final",
    ]);
  });

  it("treats a closing-hash ATX heading as an h2", () => {
    expect(ids(compile("## Alpha ##\n\nText.\n"))).toEqual(["prose:alpha"]);
  });
});

// ---------------------------------------------------------------------------
// The authored corpus — REQ-CP-02 scenario 1 says "given ANY built lesson"
// ---------------------------------------------------------------------------

describe("the real authored corpus compiles and conforms", () => {
  it("every built lesson yields a conforming, non-empty ordered Beat[]", async () => {
    // Imported lazily: this is the only test that touches the filesystem, and content.ts
    // resolves paths from process.cwd().
    const { compileAllLessonBeats } = await import("@/lib/content");
    const bundle = compileAllLessonBeats();
    const keys = Object.keys(bundle);
    expect(keys.length).toBeGreaterThan(0);

    for (const key of keys) {
      const beats = bundle[key];
      expect(beats.length, key).toBeGreaterThan(0);
      // Throws on any violation of the mapping table, persistence or uniqueness.
      expect(() => assertValidBeats(beats, key)).not.toThrow();
      for (const beat of beats) {
        expect(CLOSED_BEAT_TYPES, key).toContain(beat.type);
        expect(VALID_PREDICATES, key).toContain(beat.completion);
        expect(
          beat.beatId.startsWith("prose:") || beat.beatId.startsWith("ex:"),
          `${key} ${beat.beatId}`
        ).toBe(true);
      }
    }
  });

  it("is stable across a second compile of the unchanged corpus (S2)", async () => {
    const { compileAllLessonBeats } = await import("@/lib/content");
    expect(JSON.stringify(compileAllLessonBeats())).toBe(
      JSON.stringify(compileAllLessonBeats())
    );
  });

  it("keeps content.ts's pre-existing exports intact (REQ-CP-02 current-state note)", async () => {
    const content = await import("@/lib/content");
    for (const name of [
      "isModuleUnlocked",
      "lessonKey",
      "loadLesson",
      "getExercise",
      "loadCurriculum",
      "loadModuleMeta",
      "getCompiledLesson",
      "loadCompiledLessons",
      "isLessonComplete",
      "isModuleComplete",
      "isLessonUnlocked",
      "allExercisesPassed",
      "moduleCompletionPercent",
      "clearCompiledLessonsCache",
    ]) {
      expect(typeof (content as Record<string, unknown>)[name], name).toBe(
        "function"
      );
    }
    expect(content.lessonKey("m", "l")).toBe("m/l");
  });
});
