import { z } from "zod";

/**
 * THE AUTHORING CONTRACT.
 * Every content file (curriculum.json, module.json, exercises.json, lesson.mdx
 * frontmatter) must validate against these schemas. Run `npm run validate`.
 * Authoring agents: see specs/AUTHORING-GUIDE.md.
 */

export const TrackSchema = z.enum(["fundamentals", "prompting", "claude-code"]);
export type Track = z.infer<typeof TrackSchema>;

// ---------- Authoring contract extensions (REQ-CP-03) ----------
//
// Everything in this section is ADDITIVE and OPTIONAL at every use site: content
// authored against the original contract keeps validating verbatim (REQ-CP-03
// scenario 1). Well-formed values are accepted, malformed ones are rejected by
// `npm run validate` (REQ-CP-03 scenario 3).
//
// Deliberately NOT in this file:
//   - Beat model types (`beatId`/`type`/`completion`) — those are compiler OUTPUT
//     (REQ-CP-02), not an authoring surface; see .program/interfaces/beat-model.md.
//   - The module skill REGISTRY declaration (4–6 named skills per module,
//     REQ-MM-01). Only `skillIds` REFERENCES are authored here; the registry's
//     declaration site and reference resolution belong to the mastery-model lane
//     and REQ-CP-06 CI gates.
//   - Artifact runtime state (`status`, `moduleOfOrigin`, `provenanceEventId` from
//     REQ-WA-03) — that is projection state on the event log, not authored content.

/**
 * Reference to a skill in the module's skill registry (REQ-MM-01).
 * Shape only: registry membership is resolved by the CI gate (REQ-CP-06 scenario 2),
 * never here, so that schema validation stays context-free.
 */
export const SkillIdSchema = z.string().min(1);
export type SkillId = z.infer<typeof SkillIdSchema>;

/** Difficulty tier (REQ-CP-03). Exactly three values — anything else fails parse. */
export const DifficultyTierSchema = z.enum(["intro", "core", "stretch"]);
export type DifficultyTier = z.infer<typeof DifficultyTierSchema>;

/**
 * Role flag carried by an EXISTING exercise type (REQ-BT-01) — boss is not a new
 * exercise type. "exactly one boss per module" is a CI gate (REQ-CP-06 scenario 3).
 */
export const ExerciseRoleSchema = z.enum(["boss"]);
export type ExerciseRole = z.infer<typeof ExerciseRoleSchema>;

/**
 * Misconception tag carried by a single quiz distractor (REQ-CP-03 scenario 2) —
 * per-option, not per-question, so a wrong answer names the belief it diagnoses.
 */
export const MisconceptionTagSchema = z.string().min(1);
export type MisconceptionTag = z.infer<typeof MisconceptionTagSchema>;

/**
 * One authored rung of the four-rung hint ladder (REQ-CH-03):
 * 1 reflective question, 2 micro-explanation, 3 worked example in another domain,
 * 4 full guided walkthrough. Authored rungs are the fallback the server serves when
 * the tutor's leak check fails (REQ-CH-05); ladder POSITION is server-held state,
 * never authored.
 */
export const HintRungSchema = z.object({
  rung: z.number().int().min(1).max(4),
  text: z.string().min(1),
});
export type HintRung = z.infer<typeof HintRungSchema>;

export const HintLadderSchema = z
  .array(HintRungSchema)
  .min(1)
  .max(4)
  .refine((rungs) => new Set(rungs.map((r) => r.rung)).size === rungs.length, {
    message: "hint ladder rungs must be unique",
  });
export type HintLadder = z.infer<typeof HintLadderSchema>;

/**
 * Precondition predicate, e.g. "artifact:claude-md:healthy" (REQ-WA-05 scenario 4).
 * Form is "<namespace>:<id>:<state>". Shape is validated here; whether the referenced
 * artifact/verifier exists is a CI/registry question (REQ-CP-06), not a schema one.
 */
export const PreconditionSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9-]*:[a-z0-9][a-z0-9._-]*:[a-z][a-z0-9-]*$/,
    'precondition must be "<namespace>:<id>:<state>", e.g. "artifact:claude-md:healthy"'
  );
export type Precondition = z.infer<typeof PreconditionSchema>;

/** Artifact kind (REQ-WA-03). */
export const ArtifactKindSchema = z.enum([
  "config",
  "doc",
  "skill",
  "hook",
  "feature",
]);
export type ArtifactKind = z.infer<typeof ArtifactKindSchema>;

/**
 * Authored artifact/verifier declaration: what a Workshop exercise pass produces and
 * which capability verifier asserts it stays healthy (REQ-WA-03, REQ-WA-05).
 * `benefit` is the one-line plain-language line the artifact shelf renders (REQ-WA-04).
 */
export const ArtifactDeclarationSchema = z.object({
  id: z.string().min(1),
  kind: ArtifactKindSchema,
  title: z.string().min(1),
  paths: z.array(z.string().min(1)).min(1),
  verifierId: z.string().min(1),
  benefit: z.string().min(1).optional(),
});
export type ArtifactDeclaration = z.infer<typeof ArtifactDeclarationSchema>;

/**
 * Test-out ("Prove it") probe declaration (REQ-BT-02). A boss-equivalent probe reuses
 * the boss's verifier/rubric against a DIFFERENT fixture (scenario 4), hence
 * `sourceExerciseId` + required `fixture` for that kind. Shape only — no runtime
 * behaviour, no seeding semantics, live here.
 */
export const TestOutProbeKindSchema = z.enum([
  "boss-equivalent",
  "concept-quiz",
  "hands-on",
]);
export type TestOutProbeKind = z.infer<typeof TestOutProbeKindSchema>;

export const TestOutProbeSchema = z
  .object({
    id: z.string().min(1),
    kind: TestOutProbeKindSchema,
    /**
     * Exercise whose verifier/rubric this probe reuses (the module boss for
     * boss-equivalent). Optional overall — concept-quiz probes sample lessons
     * and need no source exercise (REQ-BT-02) — but required for
     * boss-equivalent (see refine below).
     */
    sourceExerciseId: z.string().min(1).optional(),
    /** The different fixture the reused verifier/rubric runs against. */
    fixture: z.string().min(1).optional(),
    /** Lesson this probe samples, for per-lesson concept quizzes. */
    lessonId: z.string().min(1).optional(),
    skillIds: z.array(SkillIdSchema).min(1).optional(),
  })
  .refine((probe) => probe.kind !== "boss-equivalent" || !!probe.fixture, {
    message:
      'test-out probe of kind "boss-equivalent" must declare a fixture (same verifier/rubric, different fixture)',
  })
  .refine((probe) => probe.kind !== "boss-equivalent" || !!probe.sourceExerciseId, {
    message:
      'test-out probe of kind "boss-equivalent" must declare a sourceExerciseId (the boss exercise whose verifier/rubric it reuses)',
  });
export type TestOutProbe = z.infer<typeof TestOutProbeSchema>;

export const TestOutDeclarationSchema = z.object({
  probes: z.array(TestOutProbeSchema).min(1),
});
export type TestOutDeclaration = z.infer<typeof TestOutDeclarationSchema>;

/**
 * The optional authoring fields every EXISTING exercise type gains, spread verbatim
 * into each so the four types cannot drift apart.
 */
export const ExerciseAuthoringExtensionsSchema = z.object({
  /** Skills this exercise provides evidence for (REQ-MM-01). */
  skillIds: z.array(SkillIdSchema).min(1).optional(),
  tier: DifficultyTierSchema.optional(),
  role: ExerciseRoleSchema.optional(),
  hintLadder: HintLadderSchema.optional(),
  /**
   * Preconditions this exercise needs, e.g. ["artifact:claude-md:healthy"]
   * (REQ-WA-05 scenario 4). Named `preconditions` (not `requires`) so it can
   * never be conflated with CurriculumEntry.requires, which lists prerequisite
   * MODULE ids.
   */
  preconditions: z.array(PreconditionSchema).optional(),
  /** Artifacts a pass produces, each with the verifier that re-asserts it. */
  produces: z.array(ArtifactDeclarationSchema).min(1).optional(),
});
export type ExerciseAuthoringExtensions = z.infer<
  typeof ExerciseAuthoringExtensionsSchema
>;

export const CurriculumEntrySchema = z.object({
  id: z.string().regex(/^\d{2}-[a-z0-9-]+$/),
  title: z.string().min(1),
  track: TrackSchema,
  summary: z.string().min(1),
  status: z.enum(["built", "spec"]),
  requires: z.array(z.string()),
});
export type CurriculumEntry = z.infer<typeof CurriculumEntrySchema>;

export const CurriculumSchema = z.object({
  modules: z.array(CurriculumEntrySchema),
});
export type Curriculum = z.infer<typeof CurriculumSchema>;

export const ModuleMetaSchema = z.object({
  id: z.string(),
  title: z.string(),
  track: TrackSchema,
  description: z.string(),
  lessons: z.array(z.object({ id: z.string(), title: z.string() })),
  // --- additive (REQ-CP-03) ---
  /** Test-out ("Prove it") probe declarations for this module (REQ-BT-02). */
  testOut: TestOutDeclarationSchema.optional(),
});
export type ModuleMeta = z.infer<typeof ModuleMetaSchema>;

/**
 * Per-objective skill mapping (REQ-MM-01). Additive sidecar rather than a retype of
 * `objectives`, which stays `string[]` verbatim so every existing consumer and every
 * authored lesson keeps working. `objective` repeats the objective text verbatim;
 * checking that it matches a declared objective is a CI gate (REQ-CP-06), keeping
 * schema validation context-free.
 */
export const ObjectiveSkillsSchema = z.object({
  objective: z.string().min(1),
  skillIds: z.array(SkillIdSchema).min(1),
});
export type ObjectiveSkills = z.infer<typeof ObjectiveSkillsSchema>;

export const LessonFrontmatterSchema = z.object({
  id: z.string(),
  title: z.string(),
  minutes: z.number().int().positive(),
  objectives: z.array(z.string()).min(1).max(6),
  // --- additive (REQ-CP-03) ---
  /** Skill ids for the lesson as a whole. */
  skillIds: z.array(SkillIdSchema).min(1).optional(),
  /** Skill ids attached to individual objectives ("per-objective skillIds"). */
  objectiveSkills: z.array(ObjectiveSkillsSchema).min(1).max(6).optional(),
  tier: DifficultyTierSchema.optional(),
});
export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>;

// ---------- Exercises ----------

/**
 * A quiz option. Distractors (options not in `correctOptionIds`) may carry a
 * `misconception` tag naming the false belief that option diagnoses — REQ-CP-03
 * scenario 2, per-option rather than per-question.
 */
export const QuizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  // --- additive (REQ-CP-03 scenario 2) ---
  misconception: MisconceptionTagSchema.optional(),
});
export type QuizOption = z.infer<typeof QuizOptionSchema>;

export const QuizQuestionSchema = z.object({
  id: z.string(),
  kind: z.enum(["single", "multi"]),
  prompt: z.string(),
  options: z.array(QuizOptionSchema).min(2),
  correctOptionIds: z.array(z.string()).min(1),
  explanation: z.string(),
  // --- additive (REQ-CP-03) ---
  skillIds: z.array(SkillIdSchema).min(1).optional(),
  tier: DifficultyTierSchema.optional(),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizExerciseSchema = z.object({
  type: z.literal("quiz"),
  id: z.string(),
  title: z.string(),
  passingScore: z.number().min(0).max(100),
  questions: z.array(QuizQuestionSchema).min(1),
  // --- additive (REQ-CP-03) ---
  ...ExerciseAuthoringExtensionsSchema.shape,
});
export type QuizExercise = z.infer<typeof QuizExerciseSchema>;

export const RubricCriterionSchema = z.object({
  id: z.string(),
  description: z.string(),
  weight: z.number().positive(),
  // --- additive (REQ-MM-01: skills map from rubric criteria) ---
  skillIds: z.array(SkillIdSchema).min(1).optional(),
});
export type RubricCriterion = z.infer<typeof RubricCriterionSchema>;

export const PlaygroundExerciseSchema = z
  .object({
    type: z.literal("playground"),
    id: z.string(),
    title: z.string(),
    instructions: z.string(),
    starterPrompt: z.string().optional(),
    systemPrompt: z.string().optional(),
    maxTokens: z.number().int().positive().max(4096).optional(),
    rubric: z.array(RubricCriterionSchema).min(1),
    passingScore: z.number().min(0).max(100),
    // --- additive (REQ-CP-03) ---
    ...ExerciseAuthoringExtensionsSchema.shape,
  })
  .refine(
    (ex) => Math.abs(ex.rubric.reduce((s, c) => s + c.weight, 0) - 100) < 0.001,
    { message: "rubric weights must sum to 100" }
  );
export type PlaygroundExercise = z.infer<typeof PlaygroundExerciseSchema>;

export const TerminalExerciseSchema = z.object({
  type: z.literal("terminal"),
  id: z.string(),
  title: z.string(),
  instructions: z.string(),
  sandboxTemplate: z.string(),
  allowedTools: z.string(),
  maxTurns: z.number().int().positive().max(30),
  suggestedPrompts: z.array(z.string()).optional(),
  // --- additive (REQ-CP-03) ---
  ...ExerciseAuthoringExtensionsSchema.shape,
});
export type TerminalExercise = z.infer<typeof TerminalExerciseSchema>;

export const ChallengeExerciseSchema = z.object({
  type: z.literal("challenge"),
  id: z.string(),
  title: z.string(),
  instructions: z.string(),
  sandboxTemplate: z.string(),
  allowedTools: z.string(),
  maxTurns: z.number().int().positive().max(30),
  verifierId: z.string(),
  criteria: z.array(z.string()).min(1),
  /** Legacy flat progressive hints — survives verbatim; `hintLadder` is the rung-aware form. */
  hints: z.array(z.string()).optional(),
  // --- additive (REQ-CP-03) ---
  ...ExerciseAuthoringExtensionsSchema.shape,
});
export type ChallengeExercise = z.infer<typeof ChallengeExerciseSchema>;

export const ExerciseSchema = z.union([
  QuizExerciseSchema,
  PlaygroundExerciseSchema,
  TerminalExerciseSchema,
  ChallengeExerciseSchema,
]);
export type Exercise =
  | QuizExercise
  | PlaygroundExercise
  | TerminalExercise
  | ChallengeExercise;

export const ExercisesFileSchema = z.array(ExerciseSchema);

// ---------- Progress ----------

export interface ExerciseProgress {
  status: "passed" | "attempted";
  bestScore?: number;
  attempts: number;
  lastAttemptAt: string;
}

export interface LessonProgress {
  startedAt?: string;
  completedAt?: string;
  exercises: Record<string, ExerciseProgress>;
}

export interface ProgressStore {
  version: 1;
  lessons: Record<string, LessonProgress>; // key: "moduleId/lessonId"
  playgroundHistory: {
    lessonId: string;
    exerciseId: string;
    prompt: string;
    score: number;
    at: string;
  }[];
}

export function emptyProgress(): ProgressStore {
  return { version: 1, lessons: {}, playgroundHistory: [] };
}

// ---------- Profiles ----------

export interface Profile {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface ProfileRegistry {
  profiles: Profile[];
}
