import { NextResponse } from "next/server";
import { requireActiveProfile, NoProfileError } from "@/lib/profiles";
import { getExercise } from "@/lib/content";
import { resetSandbox } from "@/lib/sandbox";

export const runtime = "nodejs";

interface ResetBody {
  moduleId?: string;
  lessonId?: string;
  exerciseId?: string;
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

  let body: ResetBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  const { moduleId, lessonId, exerciseId } = body;
  if (!moduleId || !lessonId || !exerciseId) {
    return NextResponse.json(
      { error: "moduleId, lessonId and exerciseId are required" },
      { status: 400 }
    );
  }

  let exercise;
  try {
    exercise = getExercise(moduleId, lessonId, exerciseId);
  } catch {
    return NextResponse.json({ error: "exercise-not-found" }, { status: 404 });
  }
  if (
    !exercise ||
    (exercise.type !== "terminal" && exercise.type !== "challenge")
  ) {
    return NextResponse.json({ error: "exercise-not-found" }, { status: 404 });
  }

  try {
    // resetSandbox also clears the stored Claude session for this key.
    resetSandbox(profile.id, lessonId, exercise.sandboxTemplate);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
