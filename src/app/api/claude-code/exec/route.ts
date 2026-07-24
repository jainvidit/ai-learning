import { NextResponse } from "next/server";
import { requireActiveProfile, NoProfileError } from "@/lib/profiles";
import { getExercise } from "@/lib/content";
import { recordExerciseAttempt } from "@/lib/progress";
import { ensureSandbox } from "@/lib/sandbox";
import {
  spawnClaude,
  claudeAvailable,
  getSession,
  setSession,
  sessionKey,
  isRunning,
  type TermEvent,
} from "@/lib/claudeSpawn";

export const runtime = "nodejs";

interface ExecBody {
  moduleId?: string;
  lessonId?: string;
  exerciseId?: string;
  prompt?: string;
  continueSession?: boolean;
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

  let body: ExecBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  const { moduleId, lessonId, exerciseId, prompt, continueSession } = body;
  if (!moduleId || !lessonId || !exerciseId || !prompt?.trim()) {
    return NextResponse.json(
      { error: "moduleId, lessonId, exerciseId and prompt are required" },
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

  if (!claudeAvailable()) {
    return NextResponse.json(
      {
        error: "claude-cli-missing",
        hint: "Claude Code CLI not found. Install @anthropic-ai/claude-code globally or set the CLAUDE_EXE env var to the claude.exe path.",
      },
      { status: 503 }
    );
  }

  const key = sessionKey(profile.id, lessonId);
  if (isRunning(key)) {
    return NextResponse.json({ error: "run-in-flight" }, { status: 409 });
  }

  let cwd: string;
  try {
    cwd = ensureSandbox(profile.id, lessonId, exercise.sandboxTemplate);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }

  const resumeSessionId = continueSession ? getSession(key) : undefined;
  const profileId = profile.id;
  const exerciseType = exercise.type;
  const { allowedTools, maxTurns } = exercise;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (ev: TermEvent & { lessonCompleted?: boolean }) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
      };
      try {
        for await (const ev of spawnClaude({
          cwd,
          prompt: prompt.trim(),
          allowedTools,
          maxTurns,
          resumeSessionId,
          signal: request.signal,
          key,
        })) {
          if (ev.type === "result") {
            if (ev.sessionId) setSession(key, ev.sessionId);
            let lessonCompleted = false;
            // Terminal exercises auto-pass on the first successful result.
            if (exerciseType === "terminal") {
              try {
                const res = await recordExerciseAttempt(
                  profileId,
                  moduleId,
                  lessonId,
                  exerciseId,
                  true
                );
                lessonCompleted = res.lessonCompleted;
              } catch {
                // progress write failure shouldn't break the stream
              }
            }
            send({ ...ev, lessonCompleted });
          } else {
            send(ev);
          }
        }
      } catch (err) {
        try {
          send({ type: "error", message: (err as Error).message });
        } catch {
          // controller already closed (client aborted)
        }
      } finally {
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
