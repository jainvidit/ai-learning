import Link from "next/link";
import { loadCurriculum } from "@/lib/content";
import { getActiveProfile } from "@/lib/profiles";
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
          {curriculum.modules.map((m, i) => (
            <li key={m.id}>
              <Link
                href={m.status === "built" ? `/learn/${m.id}` : "#"}
                className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                  m.status === "built"
                    ? "hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    : "cursor-default opacity-45"
                }`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TRACK_DOT[m.track]}`}
                  title={TRACK_LABEL[m.track]}
                />
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
          ))}
        </ul>
      </nav>
      <div className="border-t border-zinc-200 p-3 text-[11px] text-zinc-400 dark:border-zinc-800">
        <div className="flex gap-3">
          {(Object.keys(TRACK_LABEL) as Track[]).map((t) => (
            <span key={t} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${TRACK_DOT[t]}`} />
              {TRACK_LABEL[t]}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
