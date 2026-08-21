import Link from "next/link";
import { loadCurriculum, isModuleComplete, isModuleUnlocked } from "@/lib/content";
import { getActiveProfile } from "@/lib/profiles";
import { loadProgress } from "@/lib/progress";
import ThemeToggle from "@/components/nav/ThemeToggle";
import type { Track } from "@/lib/schema";

const TRACK_LABEL: Record<Track, string> = {
  fundamentals: "AI Fundamentals",
  prompting: "Prompt Engineering",
  "claude-code": "Claude Code",
};

const TRACK_DOT: Record<Track, string> = {
  fundamentals: "bg-sky-500",
  prompting: "bg-emerald-500",
  "claude-code": "bg-violet-500",
};

export default async function Sidebar() {
  const curriculum = loadCurriculum();
  const profile = await getActiveProfile();
  const progress = profile ? loadProgress(profile.id) : null;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            🧠 AI Mastery
          </Link>
          <ThemeToggle />
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
          {profile ? (
            <>
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ backgroundColor: profile.avatarColor }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
                {profile.name}
              </span>
              <Link
                href="/profiles"
                className="ml-auto shrink-0 hover:underline"
              >
                Switch
              </Link>
            </>
          ) : (
            <Link href="/profiles" className="hover:underline">
              Pick a profile →
            </Link>
          )}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {curriculum.modules.map((m, i) => {
            // Determine module status based on progress
            const isComplete = progress ? isModuleComplete(progress, m.id) : false;
            const isUnlocked = progress ? isModuleUnlocked(progress, m.id) : i === 0; // First module always unlocked
            const isBuilt = m.status === "built";
            const isAccessible = isBuilt && isUnlocked;

            // Build tooltip for locked modules
            let lockReason = "";
            if (isBuilt && !isUnlocked && m.requires.length > 0) {
              const incomplete = m.requires.filter(
                req => !progress || !isModuleComplete(progress, req)
              );
              const reqTitles = incomplete.map(reqId => {
                const reqModule = curriculum.modules.find(mod => mod.id === reqId);
                return reqModule?.title || reqId;
              });
              lockReason = `Complete first: ${reqTitles.join(", ")}`;
            }

            return (
              <li key={m.id} title={lockReason || undefined}>
                <Link
                  href={isAccessible ? `/learn/${m.id}` : "#"}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                    isAccessible
                      ? "hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      : "cursor-default opacity-45"
                  }`}
                >
                  {/* Status icon */}
                  <span className="mt-1 shrink-0 text-base leading-none">
                    {isComplete ? (
                      <span className="text-green-600 dark:text-green-400" title="Complete">✓</span>
                    ) : isAccessible ? (
                      <span className="text-zinc-400" title="Available">•</span>
                    ) : isBuilt ? (
                      <span title={lockReason}>🔒</span>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-600" title="Coming soon">⋯</span>
                    )}
                  </span>

                  {/* Track indicator dot */}
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TRACK_DOT[m.track]}`}
                    title={TRACK_LABEL[m.track]}
                  />

                  {/* Module title */}
                  <span>
                    <span className="text-zinc-400">{i + 1}.</span> {m.title}
                    {m.status === "spec" && (
                      <span className="ml-1 text-[10px] uppercase tracking-wide text-zinc-400">
                        soon
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-zinc-200 p-3 text-[11px] text-zinc-400 dark:border-zinc-800">
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            {(Object.keys(TRACK_LABEL) as Track[]).map((t) => (
              <span key={t} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${TRACK_DOT[t]}`} />
                {TRACK_LABEL[t]}
              </span>
            ))}
          </div>
          {progress && (
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-green-600 dark:text-green-400">✓</span> Complete
              <span className="text-zinc-400">•</span> Available
              <span>🔒</span> Locked
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
