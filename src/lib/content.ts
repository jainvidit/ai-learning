import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  Curriculum,
  CurriculumSchema,
  CurriculumEntry,
  ModuleMeta,
  ModuleMetaSchema,
  Exercise,
  ExercisesFileSchema,
  LessonFrontmatter,
  LessonFrontmatterSchema,
  ProgressStore,
} from "./schema";

export const ROOT = process.cwd();
export const CONTENT_DIR = path.join(ROOT, "content");
export const MODULES_DIR = path.join(CONTENT_DIR, "modules");

export function loadCurriculum(): Curriculum {
  const raw = JSON.parse(
    fs.readFileSync(path.join(CONTENT_DIR, "curriculum.json"), "utf-8")
  );
  return CurriculumSchema.parse(raw);
}

export function getModuleEntry(moduleId: string): CurriculumEntry | undefined {
  return loadCurriculum().modules.find((m) => m.id === moduleId);
}

export function loadModuleMeta(moduleId: string): ModuleMeta {
  const raw = JSON.parse(
    fs.readFileSync(path.join(MODULES_DIR, moduleId, "module.json"), "utf-8")
  );
  return ModuleMetaSchema.parse(raw);
}

export function loadLesson(
  moduleId: string,
  lessonId: string
): { frontmatter: LessonFrontmatter; mdx: string; exercises: Exercise[] } {
  const dir = path.join(MODULES_DIR, moduleId, "lessons", lessonId);
  const source = fs.readFileSync(path.join(dir, "lesson.mdx"), "utf-8");
  const { data, content } = matter(source);
  const frontmatter = LessonFrontmatterSchema.parse(data);
  const exercisesPath = path.join(dir, "exercises.json");
  const exercises = fs.existsSync(exercisesPath)
    ? ExercisesFileSchema.parse(
        JSON.parse(fs.readFileSync(exercisesPath, "utf-8"))
      )
    : [];
  return { frontmatter, mdx: content, exercises };
}

export function getExercise(
  moduleId: string,
  lessonId: string,
  exerciseId: string
): Exercise | undefined {
  return loadLesson(moduleId, lessonId).exercises.find(
    (e) => e.id === exerciseId
  );
}

// ---------- Gating ----------

export function lessonKey(moduleId: string, lessonId: string): string {
  return `${moduleId}/${lessonId}`;
}

export function isLessonComplete(
  progress: ProgressStore,
  moduleId: string,
  lessonId: string
): boolean {
  return Boolean(progress.lessons[lessonKey(moduleId, lessonId)]?.completedAt);
}

export function isModuleComplete(
  progress: ProgressStore,
  moduleId: string
): boolean {
  const entry = getModuleEntry(moduleId);
  if (!entry || entry.status !== "built") return false;
  const meta = loadModuleMeta(moduleId);
  return meta.lessons.every((l) => isLessonComplete(progress, moduleId, l.id));
}

export function isModuleUnlocked(
  progress: ProgressStore,
  moduleId: string
): boolean {
  const entry = getModuleEntry(moduleId);
  if (!entry) return false;
  return entry.requires.every((req) => isModuleComplete(progress, req));
}

/** Lessons unlock sequentially within a module. */
export function isLessonUnlocked(
  progress: ProgressStore,
  moduleId: string,
  lessonId: string
): boolean {
  if (!isModuleUnlocked(progress, moduleId)) return false;
  const meta = loadModuleMeta(moduleId);
  const idx = meta.lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) return false;
  return meta.lessons
    .slice(0, idx)
    .every((l) => isLessonComplete(progress, moduleId, l.id));
}

/** Check whether every exercise in a lesson is passed; if so the lesson is complete. */
export function allExercisesPassed(
  progress: ProgressStore,
  moduleId: string,
  lessonId: string
): boolean {
  const { exercises } = loadLesson(moduleId, lessonId);
  const lp = progress.lessons[lessonKey(moduleId, lessonId)];
  if (!lp) return exercises.length === 0;
  return exercises.every((ex) => lp.exercises[ex.id]?.status === "passed");
}

export function moduleCompletionPercent(
  progress: ProgressStore,
  moduleId: string
): number {
  const entry = getModuleEntry(moduleId);
  if (!entry || entry.status !== "built") return 0;
  const meta = loadModuleMeta(moduleId);
  if (meta.lessons.length === 0) return 0;
  const done = meta.lessons.filter((l) =>
    isLessonComplete(progress, moduleId, l.id)
  ).length;
  return Math.round((done / meta.lessons.length) * 100);
}
