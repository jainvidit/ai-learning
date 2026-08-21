import fs from "node:fs";
import path from "node:path";
import {
  ProgressStore,
  emptyProgress,
  ExerciseProgress,
} from "./schema";
import { lessonKey, allExercisesPassed } from "./content";

const PROGRESS_DIR = path.join(process.cwd(), "data", "progress");

// Single Next server, so an in-process mutex-by-serialization is sufficient.
let writeLock: Promise<void> = Promise.resolve();

function progressPath(profileId: string) {
  return path.join(PROGRESS_DIR, `${profileId}.json`);
}

export function loadProgress(profileId: string): ProgressStore {
  const p = progressPath(profileId);
  if (!fs.existsSync(p)) return emptyProgress();
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function atomicSave(profileId: string, store: ProgressStore) {
  fs.mkdirSync(PROGRESS_DIR, { recursive: true });
  const p = progressPath(profileId);
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, p);
}

/** Serialized read-modify-write. All progress mutations MUST go through this. */
export async function updateProgress(
  profileId: string,
  mutate: (store: ProgressStore) => void
): Promise<ProgressStore> {
  const result = writeLock.then(() => {
    const store = loadProgress(profileId);
    mutate(store);
    atomicSave(profileId, store);
    return store;
  });
  writeLock = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

/**
 * Record an exercise attempt. Marks the lesson complete when every exercise
 * in it has passed (per content definitions).
 */
export async function recordExerciseAttempt(
  profileId: string,
  moduleId: string,
  lessonId: string,
  exerciseId: string,
  passed: boolean,
  score?: number
): Promise<{ store: ProgressStore; lessonCompleted: boolean }> {
  let lessonCompleted = false;
  const store = await updateProgress(profileId, (s) => {
    const key = lessonKey(moduleId, lessonId);
    const lesson = (s.lessons[key] ??= { exercises: {} });
    lesson.startedAt ??= new Date().toISOString();
    const prev = lesson.exercises[exerciseId];
    const next: ExerciseProgress = {
      status: passed || prev?.status === "passed" ? "passed" : "attempted",
      bestScore:
        score !== undefined
          ? Math.max(score, prev?.bestScore ?? 0)
          : prev?.bestScore,
      attempts: (prev?.attempts ?? 0) + 1,
      lastAttemptAt: new Date().toISOString(),
    };
    lesson.exercises[exerciseId] = next;
    if (!lesson.completedAt && allExercisesPassed(s, moduleId, lessonId)) {
      lesson.completedAt = new Date().toISOString();
      lessonCompleted = true;
    }
  });
  return { store, lessonCompleted };
}

export async function recordPlaygroundRun(
  profileId: string,
  lessonId: string,
  exerciseId: string,
  prompt: string,
  score: number
) {
  await updateProgress(profileId, (s) => {
    s.playgroundHistory.push({
      lessonId,
      exerciseId,
      prompt: prompt.slice(0, 2000),
      score,
      at: new Date().toISOString(),
    });
    if (s.playgroundHistory.length > 200) {
      s.playgroundHistory = s.playgroundHistory.slice(-200);
    }
  });
}
