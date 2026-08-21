import { redirect } from "next/navigation";
import { isModuleComplete, isModuleUnlocked } from "@/lib/content";
import { getActiveProfile } from "@/lib/profiles";
import { loadProgress } from "@/lib/progress";
import { loadLatestBundle } from "@/lib/bundle";
import DependencyGraph from "@/components/curriculum/DependencyGraph";

export default async function Dashboard() {
  const bundle = await loadLatestBundle();
  const profile = await getActiveProfile();

  if (!profile) redirect("/profiles");

  const progress = await loadProgress(profile.id);

  // Calculate completed and unlocked modules
  const completedModules = new Set<string>();
  const unlockedModules = new Set<string>();

  bundle.curriculum.nodes.forEach((m, i) => {
    if (isModuleComplete(progress, m.id)) {
      completedModules.add(m.id);
    }
    // First module is always unlocked
    if (i === 0 || isModuleUnlocked(progress, m.id)) {
      unlockedModules.add(m.id);
    }
  });

  // Calculate progress metrics
  const builtModules = bundle.curriculum.nodes.filter((m) => m.status === "built");
  const completed = completedModules.size;
  const total = builtModules.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 px-6 pt-6">
        <h1 className="text-3xl font-bold">Your learning path</h1>
        <p className="mt-2 text-zinc-500">
          From non-technical beginner to prompt-engineering and Claude Code
          expert — {bundle.curriculum.nodes.length} modules across three tracks.
        </p>

        {/* Progress Overview */}
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Your Progress
              </div>
              <div className="mt-1 text-2xl font-bold">
                {completed} of {total} complete
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {percent}%
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          <strong>Interactive graph:</strong> Scroll to zoom, drag to pan, click modules to open.
          Arrows show prerequisites—complete any path!
        </p>
      </div>

      <div className="flex-1 px-6 pb-6">
        <DependencyGraph
          bundle={bundle}
          completedModules={completedModules}
          unlockedModules={unlockedModules}
        />
      </div>

      <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-sky-400" />
            Fundamentals
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            Prompting
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-violet-400" />
            Claude Code
          </span>
          <span className="mx-2 text-zinc-300">|</span>
          <span className="flex items-center gap-1">
            <span className="text-green-600 dark:text-green-400">✓</span> Complete
          </span>
          <span className="flex items-center gap-1">
            <span className="text-zinc-400">•</span> Available
          </span>
          <span className="flex items-center gap-1">
            <span>🔒</span> Locked
          </span>
          <span className="flex items-center gap-1">
            <span className="text-zinc-300 dark:text-zinc-600">⋯</span> Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
