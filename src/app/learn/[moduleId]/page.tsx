import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getModuleEntry,
  loadModuleMeta,
  isLessonComplete,
  isLessonUnlocked,
  moduleCompletionPercent,
} from "@/lib/content";
import { loadProgress } from "@/lib/progress";
import { getActiveProfile } from "@/lib/profiles";
import { Card, ProgressRing } from "@/components/ui";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;

  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");

  const entry = getModuleEntry(moduleId);
  if (!entry) notFound();

  if (entry.status !== "built") {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">{entry.title}</h1>
        <p className="mt-2 text-zinc-500">{entry.summary}</p>
        <Card className="mt-8">
          <div className="text-sm font-medium text-amber-600">
            Coming soon — this module is still being built.
          </div>
        </Card>
      </div>
    );
  }

  const meta = loadModuleMeta(moduleId);
  const progress = loadProgress(profile.id);
  const percent = moduleCompletionPercent(progress, moduleId);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-xs uppercase tracking-wide text-zinc-400">
        {entry.track}
      </div>
      <h1 className="mt-1 text-3xl font-bold">{meta.title}</h1>
      <p className="mt-2 text-zinc-500">{meta.description}</p>
      <div className="mt-4">
        <ProgressRing percent={percent} />
      </div>

      <ol className="mt-8 space-y-3">
        {meta.lessons.map((lesson, i) => {
          const complete = isLessonComplete(progress, moduleId, lesson.id);
          const unlocked = isLessonUnlocked(progress, moduleId, lesson.id);
          return (
            <li key={lesson.id}>
              {unlocked ? (
                <Link
                  href={`/learn/${moduleId}/${lesson.id}`}
                  className="block"
                >
                  <Card className="flex items-center gap-4 transition-colors hover:border-indigo-400 dark:hover:border-indigo-600">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        complete
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                          : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                      }`}
                    >
                      {complete ? "✓" : i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold">{lesson.title}</div>
                      <div className="text-xs text-zinc-500">
                        {complete ? "Completed" : "Ready to start"}
                      </div>
                    </div>
                  </Card>
                </Link>
              ) : (
                <Card className="flex items-center gap-4 opacity-60">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm dark:bg-zinc-800">
                    🔒
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-500">
                      {lesson.title}
                    </div>
                    <div className="text-xs text-zinc-400">
                      Complete the previous lesson to unlock
                    </div>
                  </div>
                </Card>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
