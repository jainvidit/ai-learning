import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getModuleEntry,
  loadModuleMeta,
  loadLesson,
  isLessonUnlocked,
} from "@/lib/content";
import { loadProgress } from "@/lib/progress";
import { getActiveProfile } from "@/lib/profiles";
import LessonRenderer from "@/components/lesson/LessonRenderer";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>;
}) {
  const { moduleId, lessonId } = await params;

  const profile = await getActiveProfile();
  if (!profile) redirect("/profiles");

  const entry = getModuleEntry(moduleId);
  if (!entry || entry.status !== "built") notFound();

  const meta = loadModuleMeta(moduleId);
  if (!meta.lessons.some((l) => l.id === lessonId)) notFound();

  const progress = loadProgress(profile.id);
  if (!isLessonUnlocked(progress, moduleId, lessonId)) {
    redirect(`/learn/${moduleId}`);
  }

  const { frontmatter, mdx, exercises } = loadLesson(moduleId, lessonId);

  return (
    <article className="mx-auto max-w-3xl">
      <nav className="text-sm text-zinc-500">
        <Link
          href={`/learn/${moduleId}`}
          className="hover:text-indigo-600 hover:underline"
        >
          ← {meta.title}
        </Link>
      </nav>

      <header className="mt-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <h1 className="text-3xl font-bold">{frontmatter.title}</h1>
        <div className="mt-2 text-sm text-zinc-500">
          ~{frontmatter.minutes} min
        </div>
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            What you&apos;ll learn
          </div>
          <ul className="mt-2 space-y-1">
            {frontmatter.objectives.map((obj, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <span className="text-indigo-500">•</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="mt-6">
        <LessonRenderer
          mdx={mdx}
          moduleId={moduleId}
          lessonId={lessonId}
          exercises={exercises}
        />
      </div>
    </article>
  );
}
