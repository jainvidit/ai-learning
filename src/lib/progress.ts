import { kv } from "@vercel/kv";
import {
  ProgressStore,
  emptyProgress,
  ExerciseProgress,
} from "./schema";
import { lessonKey, allExercisesPassed } from "./content";

// Global write lock for serializing progress updates
let writeLock: Promise<void> = Promise.resolve();

function progressKey(profileId: string): string {
  return `progress:${profileId}`;
}

export async function loadProgress(profileId: string): Promise<ProgressStore> {
  try {
    const data = await kv.get(progressKey(profileId));
    if (!data) return emptyProgress();
    return data as ProgressStore;
  } catch {
    return emptyProgress();
  }
}

async function save(profileId: string, store: ProgressStore) {
  try {
    await kv.set(progressKey(profileId), store);
  } catch (err) {
    console.error(`Failed to save progress for profile ${profileId}:`, err);
  }
}

/** Serialized read-modify-write. All progress mutations MUST go through this. */
export async function updateProgress(
  profileId: string,
  mutate: (store: ProgressStore) => void
): Promise<ProgressStore> {
  const result = writeLock.then(async () => {
    const store = await loadProgress(profileId);
    mutate(store);
    await save(profileId, store);
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
