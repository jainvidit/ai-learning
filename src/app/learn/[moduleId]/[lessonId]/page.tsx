import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getModuleEntry,
  loadModuleMeta,
  loadLesson,
  isLessonUnlocked,
  isLessonComplete,
  loadCurriculum,
} from "@/lib/content";
import { loadProgress } from "@/lib/progress";
import { getActiveProfile } from "@/lib/profiles";
import LessonRenderer from "@/components/lesson/LessonRenderer";
import NextLessonBar from "@/components/lesson/NextLessonBar";

/** Where "Next lesson" should point: the next lesson in this module, else the
 * first lesson of the next built module, else nothing (nothing built yet). */
function findNext(
  moduleId: string,
  lessonId: string
): { href: string | null; label: string | null } {
  const meta = loadModuleMeta(moduleId);
  const idx = meta.lessons.findIndex((l) => l.id === lessonId);
  const nextInModule = meta.lessons[idx + 1];
  if (nextInModule) {
    return {
      href: `/learn/${moduleId}/${nextInModule.id}`,
      label: nextInModule.title,
    };
  }

  const modules = loadCurriculum().modules;
  const modIdx = modules.findIndex((m) => m.id === moduleId);
  const nextModule = modules
    .slice(modIdx + 1)
    .find((m) => m.status === "built");
  if (!nextModule) return { href: null, label: null };

  const nextMeta = loadModuleMeta(nextModule.id);
  const firstLesson = nextMeta.lessons[0];
  if (!firstLesson) {
    return { href: `/learn/${nextModule.id}`, label: nextModule.title };
  }
  return {
    href: `/learn/${nextModule.id}/${firstLesson.id}`,
    label: `${nextModule.title}: ${firstLesson.title}`,
  };
}

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
  const { href: nextHref, label: nextLabel } = findNext(moduleId, lessonId);

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

      <NextLessonBar
        initiallyComplete={isLessonComplete(progress, moduleId, lessonId)}
        nextHref={nextHref}
        nextLabel={nextLabel}
      />
    </article>
  );
}
