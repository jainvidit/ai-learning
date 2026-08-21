import { NextResponse } from "next/server";
import { requireActiveProfile, NoProfileError } from "@/lib/profiles";
import { getExercise } from "@/lib/content";
import { bedrock, PLAYGROUND_MODEL } from "@/lib/bedrock";

export const runtime = "nodejs";

const encoder = new TextEncoder();

function sseEvent(payload: unknown): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function POST(request: Request) {
  try {
    await requireActiveProfile();
  } catch (err) {
    if (err instanceof NoProfileError) {
      return NextResponse.json({ error: "no-profile" }, { status: 401 });
    }
    throw err;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { moduleId, lessonId, exerciseId, prompt } = (body ?? {}) as {
    moduleId?: unknown;
    lessonId?: unknown;
    exerciseId?: unknown;
    prompt?: unknown;
  };
  if (
    typeof moduleId !== "string" ||
    typeof lessonId !== "string" ||
    typeof exerciseId !== "string" ||
    typeof prompt !== "string" ||
    prompt.trim().length === 0
  ) {
    return NextResponse.json({ error: "invalid-request" }, { status: 400 });
  }

  let exercise;
  try {
    exercise = getExercise(moduleId, lessonId, exerciseId);
  } catch {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }
  if (!exercise || exercise.type !== "playground") {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  // NEVER trust the client for systemPrompt/maxTokens — always take them
  // from the exercise definition on disk.
  const systemPrompt = exercise.systemPrompt;
  const maxTokens = exercise.maxTokens ?? 1024;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const messageStream = bedrock.messages.stream(
          {
            model: PLAYGROUND_MODEL,
            max_tokens: maxTokens,
            ...(systemPrompt ? { system: systemPrompt } : {}),
            messages: [{ role: "user", content: prompt }],
          },
          { signal: request.signal }
        );

        messageStream.on("text", (delta) => {
          controller.enqueue(sseEvent({ type: "text", text: delta }));
        });

        const finalMessage = await messageStream.finalMessage();
        controller.enqueue(
          sseEvent({
            type: "done",
            usage: {
              inputTokens: finalMessage.usage.input_tokens,
              outputTokens: finalMessage.usage.output_tokens,
            },
          })
        );
      } catch (err) {
        // If the client aborted, there is nobody left to read the stream.
        if (!request.signal.aborted) {
          const message =
            err instanceof Error ? err.message : "Model request failed";
          try {
            controller.enqueue(sseEvent({ type: "error", message }));
          } catch {
            // controller already closed
          }
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
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
