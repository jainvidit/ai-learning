"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { PlaygroundExercise } from "@/lib/schema";
import { Button, Card, Spinner } from "@/components/ui";

interface ScoreCriterion {
  id: string;
  description: string;
  met: boolean;
  feedback: string;
}

interface ScoreResponse {
  score: number;
  passed: boolean;
  criteria: ScoreCriterion[];
  overallFeedback: string;
  improvedPromptExample: string;
}

type RunPhase = "idle" | "running" | "done";

/** Render instructions as simple paragraphs, honouring blank-line breaks. */
function Instructions({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return (
    <div className="mt-2 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p.trim()}
        </p>
      ))}
    </div>
  );
}

export default function Playground({
  moduleId,
  lessonId,
  exercise,
}: {
  moduleId: string;
  lessonId: string;
  exercise: PlaygroundExercise;
}) {
  const [prompt, setPrompt] = useState(exercise.starterPrompt ?? "");
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [noProfile, setNoProfile] = useState(false);

  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResponse | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  // The prompt/output pair of the completed run (what gets scored).
  const lastRun = useRef<{ prompt: string; output: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function runPrompt() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPhase("running");
    setOutput("");
    setError(null);
    setNoProfile(false);
    setScoreResult(null);
    setScoreError(null);

    let accumulated = "";
    let finished = false;

    try {
      const res = await fetch("/api/playground/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          lessonId,
          exerciseId: exercise.id,
          prompt,
        }),
        signal: controller.signal,
      });

      if (res.status === 401) {
        setNoProfile(true);
        setPhase("idle");
        return;
      }
      if (!res.ok || !res.body) {
        throw new Error("The playground request failed. Please try again.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by blank lines.
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const rawEvent of events) {
          for (const line of rawEvent.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            let parsed: {
              type: string;
              text?: string;
              message?: string;
            };
            try {
              parsed = JSON.parse(line.slice(6));
            } catch {
              continue;
            }
            if (parsed.type === "text" && typeof parsed.text === "string") {
              accumulated += parsed.text;
              setOutput(accumulated);
            } else if (parsed.type === "done") {
              finished = true;
            } else if (parsed.type === "error") {
              throw new Error(
                parsed.message || "The model returned an error."
              );
            }
          }
        }
      }

      if (!finished && accumulated.length === 0) {
        throw new Error("The model returned no output. Please try again.");
      }

      lastRun.current = { prompt, output: accumulated };
      setPhase("done");
    } catch (err) {
      if (controller.signal.aborted) {
        setPhase("idle");
        return;
      }
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setPhase("idle");
    }
  }

  async function checkPrompt() {
    const run = lastRun.current;
    if (!run) return;
    setScoring(true);
    setScoreError(null);
    try {
      const res = await fetch("/api/playground/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          lessonId,
          exerciseId: exercise.id,
          prompt: run.prompt,
          modelOutput: run.output,
        }),
      });
      if (res.status === 401) {
        setNoProfile(true);
        return;
      }
      if (!res.ok) {
        throw new Error("Scoring failed. Please try again.");
      }
      setScoreResult((await res.json()) as ScoreResponse);
    } catch (err) {
      setScoreError(
        err instanceof Error ? err.message : "Scoring failed."
      );
    } finally {
      setScoring(false);
    }
  }

  const running = phase === "running";

  return (
    <Card className="my-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">🧪 {exercise.title}</h3>
        <span className="shrink-0 text-xs text-zinc-500">
          Pass: {exercise.passingScore}%
        </span>
      </div>

      <Instructions text={exercise.instructions} />

      <label
        htmlFor={`playground-prompt-${exercise.id}`}
        className="mt-4 block text-sm font-medium"
      >
        Your prompt
      </label>
      <textarea
        id={`playground-prompt-${exercise.id}`}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        disabled={running}
        className="mt-1 w-full rounded-lg border border-zinc-200 bg-white p-3 font-mono text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        placeholder="Write your prompt here…"
      />

      <div className="mt-3 flex items-center gap-3">
        <Button onClick={runPrompt} disabled={running || !prompt.trim()}>
          {running ? (
            <span className="flex items-center gap-2">
              <Spinner /> Running…
            </span>
          ) : (
            "Run prompt"
          )}
        </Button>
        {phase === "done" && !scoreResult && (
          <Button
            variant="secondary"
            onClick={checkPrompt}
            disabled={scoring}
          >
            {scoring ? (
              <span className="flex items-center gap-2">
                <Spinner /> Checking…
              </span>
            ) : (
              "Check my prompt"
            )}
          </Button>
        )}
      </div>

      {noProfile && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          No active profile —{" "}
          <Link href="/profiles" className="font-medium underline">
            pick a profile
          </Link>{" "}
          to use the playground.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {(output || running) && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wide text-zinc-400">
            Model output
          </div>
          <pre className="mt-1 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {output}
            {running && <span className="animate-pulse">▍</span>}
          </pre>
        </div>
      )}

      {scoreError && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {scoreError}
        </div>
      )}

      {scoreResult && (
        <div
          className={`mt-4 rounded-lg border p-4 ${
            scoreResult.passed
              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
              : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                scoreResult.passed
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {scoreResult.passed ? "🎉 Passed!" : "Not yet"} —{" "}
              {scoreResult.score}%
            </span>
            {!scoreResult.passed && (
              <span className="text-xs text-zinc-500">
                You need {exercise.passingScore}% to pass.
              </span>
            )}
          </div>

          <ul className="mt-3 space-y-2">
            {scoreResult.criteria.map((c) => (
              <li key={c.id} className="flex gap-2 text-sm">
                <span aria-hidden>{c.met ? "✅" : "❌"}</span>
                <span>
                  <span className="font-medium">{c.description}</span>
                  {c.feedback && (
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {" "}
                      — {c.feedback}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {scoreResult.overallFeedback && (
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
              {scoreResult.overallFeedback}
            </p>
          )}

          {scoreResult.improvedPromptExample && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                Show me a stronger prompt
              </summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-3 font-mono text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                {scoreResult.improvedPromptExample}
              </pre>
            </details>
          )}

          {!scoreResult.passed && (
            <div className="mt-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setScoreResult(null);
                  setPhase("idle");
                }}
              >
                Revise and try again
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
