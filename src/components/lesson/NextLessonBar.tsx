"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/** Dispatched by Quiz/Challenge on a submission that completes the lesson. */
export const LESSON_COMPLETE_EVENT = "lesson-complete";

export default function NextLessonBar({
  initiallyComplete,
  nextHref,
  nextLabel,
}: {
  initiallyComplete: boolean;
  nextHref: string | null;
  nextLabel: string | null;
}) {
  const [complete, setComplete] = useState(initiallyComplete);

  useEffect(() => {
    if (complete) return;
    const onComplete = () => setComplete(true);
    window.addEventListener(LESSON_COMPLETE_EVENT, onComplete);
    return () => window.removeEventListener(LESSON_COMPLETE_EVENT, onComplete);
  }, [complete]);

  if (!complete) return null;

  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
      <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
        🎉 Lesson complete!
      </span>
      {nextHref ? (
        <Link
          href={nextHref}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          {nextLabel ?? "Next lesson"} →
        </Link>
      ) : (
        <span className="text-sm text-emerald-700 dark:text-emerald-300">
          That&apos;s every lesson built so far — more are on the way.
        </span>
      )}
    </div>
  );
}
