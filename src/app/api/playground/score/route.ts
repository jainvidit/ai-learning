import { NextResponse } from "next/server";
import { requireActiveProfile, NoProfileError } from "@/lib/profiles";
import { getExercise } from "@/lib/content";
import { recordExerciseAttempt, recordPlaygroundRun } from "@/lib/progress";
import { judgePrompt } from "@/lib/judge";

export const runtime = "nodejs";

const PROMPT_MAX_CHARS = 8000;
const MODEL_OUTPUT_MAX_CHARS = 12000;

interface ScoreRequestBody {
  moduleId?: unknown;
  lessonId?: unknown;
  exerciseId?: unknown;
  prompt?: unknown;
  modelOutput?: unknown;
}

export async function POST(request: Request) {
  let profile;
  try {
    profile = await requireActiveProfile();
  } catch (err) {
    if (err instanceof NoProfileError) {
      return NextResponse.json({ error: "no-profile" }, { status: 401 });
    }
    throw err;
  }

  let body: ScoreRequestBody;
  try {
    body = (await request.json()) as ScoreRequestBody;
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { moduleId, lessonId, exerciseId, prompt, modelOutput } = body;
  if (
    typeof moduleId !== "string" ||
    typeof lessonId !== "string" ||
    typeof exerciseId !== "string" ||
    typeof prompt !== "string" ||
    typeof modelOutput !== "string"
  ) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  let exercise;
  try {
    exercise = getExercise(moduleId, lessonId, exerciseId);
  } catch {
    return NextResponse.json({ error: "exercise-not-found" }, { status: 404 });
  }
  if (!exercise) {
    return NextResponse.json({ error: "exercise-not-found" }, { status: 404 });
  }
  if (exercise.type !== "playground") {
    return NextResponse.json(
      { error: "not-a-playground-exercise" },
      { status: 400 }
    );
  }

  const truncatedPrompt = prompt.slice(0, PROMPT_MAX_CHARS);
  const truncatedOutput = modelOutput.slice(0, MODEL_OUTPUT_MAX_CHARS);

  let result;
  try {
    result = await judgePrompt(exercise, truncatedPrompt, truncatedOutput);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "judge-request-failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { lessonCompleted } = await recordExerciseAttempt(
    profile.id,
    moduleId,
    lessonId,
    exerciseId,
    result.passed,
    result.score
  );
  await recordPlaygroundRun(
    profile.id,
    lessonId,
    exerciseId,
    truncatedPrompt,
    result.score
  );

  return NextResponse.json({ ...result, lessonCompleted });
}
