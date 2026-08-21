import fs from "node:fs";
import { NextResponse } from "next/server";
import { requireActiveProfile, NoProfileError } from "@/lib/profiles";
import { getExercise, lessonKey } from "@/lib/content";
import { recordExerciseAttempt, loadProgress } from "@/lib/progress";
import { verifiers, type VerifyResult } from "@/lib/verifiers";
import { sandboxDir } from "@/lib/sandbox";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const profile = await requireActiveProfile();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid-json" }, { status: 400 });
    }
    const { moduleId, lessonId, exerciseId } = (body ?? {}) as {
      moduleId?: string;
      lessonId?: string;
      exerciseId?: string;
    };
    if (
      typeof moduleId !== "string" ||
      typeof lessonId !== "string" ||
      typeof exerciseId !== "string"
    ) {
      return NextResponse.json(
        { error: "moduleId, lessonId and exerciseId are required" },
        { status: 400 }
      );
    }

    let ex;
    try {
      ex = getExercise(moduleId, lessonId, exerciseId);
    } catch {
      return NextResponse.json({ error: "exercise-not-found" }, { status: 404 });
    }
    if (!ex || ex.type !== "challenge") {
      return NextResponse.json(
        { error: "Exercise not found or not a challenge" },
        { status: 404 }
      );
    }

    const verifier = verifiers[ex.verifierId];
    if (!verifier) {
      return NextResponse.json(
        {
          error: `No verifier registered for id "${ex.verifierId}". Register it in src/lib/verifiers/index.ts.`,
        },
        { status: 500 }
      );
    }

    // Resolve + run against the learner's sandbox. If the sandbox hasn't been
    // created yet (terminal exercise not started), report a clean failure
    // without recording an attempt or unlocking hints.
    let result: VerifyResult | null = null;
    try {
      const dir = sandboxDir(profile.id, lessonId);
      if (!fs.existsSync(dir)) throw new Error("sandbox missing");
      result = await verifier(dir);
    } catch {
      result = null;
    }

    if (result === null) {
      const notStarted = "Sandbox not started — run the terminal first";
      const progress = await loadProgress(profile.id);
      const ep =
        progress.lessons[lessonKey(moduleId, lessonId)]?.exercises[exerciseId];
      const attempts = ep?.attempts ?? 0;
      const failedSoFar = ep?.status === "passed"
        ? Math.max(0, attempts - 1)
        : attempts;
      return NextResponse.json({
        pass: false,
        criteria: ex.criteria.map((description) => ({
          description,
          pass: false,
          detail: notStarted,
        })),
        attempts,
        hintsUnlocked: (ex.hints ?? []).slice(0, failedSoFar),
        lessonCompleted: false,
      });
    }

    const { store, lessonCompleted } = await recordExerciseAttempt(
      profile.id,
      moduleId,
      lessonId,
      exerciseId,
      result.pass
    );

    const ep =
      store.lessons[lessonKey(moduleId, lessonId)]?.exercises[exerciseId];
    const attempts = ep?.attempts ?? 1;
    // One hint unlocks per failed verify. Per-attempt outcomes aren't stored,
    // so: on a fail every attempt so far counts (a prior pass wouldn't be
    // re-verified in practice); on a pass, keep hints from earlier failures.
    const failedAttemptCount = result.pass ? Math.max(0, attempts - 1) : attempts;
    const hintsUnlocked = (ex.hints ?? []).slice(0, failedAttemptCount);

    return NextResponse.json({
      pass: result.pass,
      criteria: result.criteria,
      attempts,
      hintsUnlocked,
      lessonCompleted,
    });
  } catch (err) {
    if (err instanceof NoProfileError) {
      return NextResponse.json({ error: "no-profile" }, { status: 401 });
    }
    throw err;
  }
}
