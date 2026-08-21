"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, Spinner } from "@/components/ui";
import type { ChallengeExercise } from "@/lib/schema";
import { LESSON_COMPLETE_EVENT } from "@/components/lesson/NextLessonBar";

interface CriterionResult {
  description: string;
  pass: boolean;
  detail?: string;
}

interface VerifyResponse {
  pass: boolean;
  criteria: CriterionResult[];
  attempts: number;
  hintsUnlocked: string[];
  lessonCompleted: boolean;
}

export default function Challenge({
  moduleId,
  lessonId,
  exercise,
}: {
  moduleId: string;
  lessonId: string;
  exercise: ChallengeExercise;
}) {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  async function verify() {
    setVerifying(true);
    setError(null);
    setNeedsProfile(false);
    try {
      const res = await fetch("/api/challenge/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, lessonId, exerciseId: exercise.id }),
      });
      if (res.status === 401) {
        setNeedsProfile(true);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body?.error === "string"
            ? body.error
            : "Verification failed. Please try again."
        );
      }
      const data = (await res.json()) as VerifyResponse;
      setResult(data);
      if (data.lessonCompleted) {
        window.dispatchEvent(new Event(LESSON_COMPLETE_EVENT));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setVerifying(false);
    }
  }

  // Line up server results with the authored criteria list by index; before
  // the first verify every criterion is neutral.
  const criteriaRows = exercise.criteria.map((description, i) => {
    const r = result?.criteria[i];
    return {
      description: r?.description ?? description,
      state: r ? (r.pass ? "pass" : "fail") : ("neutral" as const),
      detail: r?.detail,
    };
  });

  return (
    <Card className="my-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">🏆 {exercise.title}</h3>
        {result && (
          <span className="shrink-0 text-xs text-zinc-500">
            {result.attempts} attempt{result.attempts === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="mt-3 whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
        {exercise.instructions}
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Do the work in the Terminal exercise panel above — it shares this
        challenge&apos;s sandbox. When you think you&apos;re done, come back
        here and verify.
      </p>

      <div className="mt-4">
        <div className="text-sm font-medium">Success criteria</div>
        <ul className="mt-2 space-y-2">
          {criteriaRows.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span
                className={
                  c.state === "pass"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : c.state === "fail"
                      ? "text-red-600 dark:text-red-400"
                      : "text-zinc-400"
                }
              >
                {c.state === "pass" ? "✅" : c.state === "fail" ? "❌" : "○"}
              </span>
              <span>
                {c.description}
                {c.detail && c.state === "fail" && (
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    {c.detail}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {result && result.hintsUnlocked.length > 0 && (
        <div className="mt-4 space-y-2">
          {result.hintsUnlocked.map((hint, i) => (
            <div
              key={i}
              className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950"
            >
              <span className="font-semibold">💡 Hint {i + 1}:</span> {hint}
            </div>
          ))}
        </div>
      )}

      {result?.pass && (
        <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          Challenge passed!
          {result.lessonCompleted && (
            <span className="ml-2 font-normal text-emerald-700 dark:text-emerald-300">
              Lesson complete — the next one is unlocked.
            </span>
          )}
        </div>
      )}

      {needsProfile && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          No active profile —{" "}
          <Link href="/profiles" className="font-medium underline">
            pick one on the profiles page
          </Link>{" "}
          and try again.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={verify} disabled={verifying || result?.pass === true}>
          {verifying ? (
            <span className="flex items-center gap-2">
              <Spinner /> Verifying…
            </span>
          ) : result?.pass ? (
            "Passed"
          ) : result ? (
            "Verify again"
          ) : (
            "Verify my work"
          )}
        </Button>
        {result && !result.pass && (
          <span className="text-xs text-zinc-400">
            Keep working in the terminal, then verify again.
          </span>
        )}
      </div>
    </Card>
  );
}
