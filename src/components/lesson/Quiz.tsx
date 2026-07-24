"use client";

import { useState } from "react";
import { Button, Card, Spinner } from "@/components/ui";

/** Quiz question with answers/explanations stripped (safe for the client). */
export interface ClientQuizQuestion {
  id: string;
  kind: "single" | "multi";
  prompt: string;
  options: { id: string; text: string }[];
}

/** Quiz exercise sanitized for the client: no correctOptionIds / explanation. */
export interface ClientQuizExercise {
  type: "quiz";
  id: string;
  title: string;
  passingScore: number;
  questions: ClientQuizQuestion[];
}

interface QuestionResult {
  questionId: string;
  correct: boolean;
  correctOptionIds: string[];
  explanation: string;
}

interface SubmitResponse {
  score: number;
  passed: boolean;
  results: QuestionResult[];
  lessonCompleted?: boolean;
}

export default function Quiz({
  moduleId,
  lessonId,
  exercise,
}: {
  moduleId: string;
  lessonId: string;
  exercise: ClientQuizExercise;
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultFor = (questionId: string) =>
    result?.results.find((r) => r.questionId === questionId);

  function toggleOption(q: ClientQuizQuestion, optionId: string) {
    if (result?.passed) return;
    setAnswers((prev) => {
      const current = prev[q.id] ?? [];
      if (q.kind === "single") {
        return { ...prev, [q.id]: [optionId] };
      }
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [q.id]: next };
    });
  }

  const allAnswered = exercise.questions.every(
    (q) => (answers[q.id]?.length ?? 0) > 0
  );

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          lessonId,
          exerciseId: exercise.id,
          answers,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.error === "no-profile"
            ? "No active profile — visit /profiles to pick one."
            : "Something went wrong submitting the quiz. Please try again."
        );
      }
      setResult((await res.json()) as SubmitResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setResult(null);
    setAnswers({});
    setError(null);
  }

  return (
    <div className="my-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">📝 {exercise.title}</h3>
        <span className="shrink-0 text-xs text-zinc-500">
          Pass: {exercise.passingScore}%
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {exercise.questions.map((q, qi) => {
          const qResult = resultFor(q.id);
          const selected = answers[q.id] ?? [];
          return (
            <Card key={q.id} className="p-4">
              <fieldset>
              <legend className="text-sm font-medium">
                {qi + 1}. {q.prompt}
                {q.kind === "multi" && (
                  <span className="ml-2 text-xs font-normal text-zinc-400">
                    (select all that apply)
                  </span>
                )}
              </legend>
              <div className="mt-2 space-y-1.5">
                {q.options.map((opt) => {
                  const isSelected = selected.includes(opt.id);
                  const isCorrectOption = qResult?.correctOptionIds.includes(
                    opt.id
                  );
                  let optionStyle =
                    "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600";
                  if (qResult) {
                    if (isCorrectOption) {
                      optionStyle =
                        "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950";
                    } else if (isSelected) {
                      optionStyle =
                        "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950";
                    } else {
                      optionStyle = "border-zinc-200 dark:border-zinc-800";
                    }
                  } else if (isSelected) {
                    optionStyle =
                      "border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950";
                  }
                  return (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${optionStyle} ${
                        qResult ? "cursor-default" : ""
                      }`}
                    >
                      <input
                        type={q.kind === "single" ? "radio" : "checkbox"}
                        name={`${exercise.id}-${q.id}`}
                        checked={isSelected}
                        disabled={Boolean(qResult) || submitting}
                        onChange={() => toggleOption(q, opt.id)}
                        className="accent-indigo-600"
                      />
                      <span>{opt.text}</span>
                    </label>
                  );
                })}
              </div>
              {qResult && (
                <div
                  className={`mt-2 rounded-lg p-3 text-sm ${
                    qResult.correct
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                  }`}
                >
                  <span className="font-semibold">
                    {qResult.correct ? "✓ Correct" : "✗ Not quite"}
                  </span>{" "}
                  — {qResult.explanation}
                </div>
              )}
              </fieldset>
            </Card>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        {!result ? (
          <>
            <Button onClick={submit} disabled={!allAnswered || submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Grading…
                </span>
              ) : (
                "Submit answers"
              )}
            </Button>
            {!allAnswered && (
              <span className="text-xs text-zinc-400">
                Answer every question to submit.
              </span>
            )}
          </>
        ) : result.passed ? (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              🎉 Passed! {result.score}%
            </span>
            {result.lessonCompleted && (
              <span className="text-sm text-zinc-500">
                Lesson complete — the next one is unlocked.
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
              {result.score}% — you need {exercise.passingScore}% to pass
            </span>
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
