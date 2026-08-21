import { NextResponse } from "next/server";
import { requireActiveProfile, NoProfileError } from "@/lib/profiles";
import { getExercise } from "@/lib/content";
import { recordExerciseAttempt } from "@/lib/progress";

interface SubmitBody {
  moduleId: string;
  lessonId: string;
  exerciseId: string;
  answers: Record<string, string[]>;
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((x) => setB.has(x));
}

export async function POST(request: Request) {
  try {
    const profile = await requireActiveProfile();

    let body: SubmitBody;
    try {
      body = (await request.json()) as SubmitBody;
    } catch {
      return NextResponse.json({ error: "invalid-json" }, { status: 400 });
    }

    const { moduleId, lessonId, exerciseId, answers } = body ?? {};
    if (
      typeof moduleId !== "string" ||
      typeof lessonId !== "string" ||
      typeof exerciseId !== "string" ||
      typeof answers !== "object" ||
      answers === null
    ) {
      return NextResponse.json({ error: "invalid-body" }, { status: 400 });
    }

    let exercise;
    try {
      exercise = getExercise(moduleId, lessonId, exerciseId);
    } catch {
      return NextResponse.json({ error: "not-found" }, { status: 404 });
    }
    if (!exercise || exercise.type !== "quiz") {
      return NextResponse.json({ error: "not-found" }, { status: 404 });
    }

    const results = exercise.questions.map((q) => {
      const submitted = Array.isArray(answers[q.id]) ? answers[q.id] : [];
      const correct = sameSet(submitted, q.correctOptionIds);
      return {
        questionId: q.id,
        correct,
        correctOptionIds: q.correctOptionIds,
        explanation: q.explanation,
      };
    });

    const correctCount = results.filter((r) => r.correct).length;
    const score = Math.round((100 * correctCount) / exercise.questions.length);
    const passed = score >= exercise.passingScore;

    const { lessonCompleted } = await recordExerciseAttempt(
      profile.id,
      moduleId,
      lessonId,
      exerciseId,
      passed,
      score
    );

    return NextResponse.json({ score, passed, results, lessonCompleted });
  } catch (err) {
    if (err instanceof NoProfileError) {
      return NextResponse.json({ error: "no-profile" }, { status: 401 });
    }
    throw err;
  }
}
