import { z } from "zod";

/**
 * THE AUTHORING CONTRACT.
 * Every content file (curriculum.json, module.json, exercises.json, lesson.mdx
 * frontmatter) must validate against these schemas. Run `npm run validate`.
 * Authoring agents: see specs/AUTHORING-GUIDE.md.
 */

export const TrackSchema = z.enum(["fundamentals", "prompting", "claude-code"]);
export type Track = z.infer<typeof TrackSchema>;

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
});
export type ModuleMeta = z.infer<typeof ModuleMetaSchema>;

export const LessonFrontmatterSchema = z.object({
  id: z.string(),
  title: z.string(),
  minutes: z.number().int().positive(),
  objectives: z.array(z.string()).min(1).max(6),
});
export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>;

// ---------- Exercises ----------

export const QuizQuestionSchema = z.object({
  id: z.string(),
  kind: z.enum(["single", "multi"]),
  prompt: z.string(),
  options: z.array(z.object({ id: z.string(), text: z.string() })).min(2),
  correctOptionIds: z.array(z.string()).min(1),
  explanation: z.string(),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizExerciseSchema = z.object({
  type: z.literal("quiz"),
  id: z.string(),
  title: z.string(),
  passingScore: z.number().min(0).max(100),
  questions: z.array(QuizQuestionSchema).min(1),
});
export type QuizExercise = z.infer<typeof QuizExerciseSchema>;

export const RubricCriterionSchema = z.object({
  id: z.string(),
  description: z.string(),
  weight: z.number().positive(),
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
  hints: z.array(z.string()).optional(),
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
