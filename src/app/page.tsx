import Link from "next/link";
import { loadCurriculum } from "@/lib/content";
import { Card } from "@/components/ui";

export default function Dashboard() {
  const curriculum = loadCurriculum();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold">Your learning path</h1>
      <p className="mt-2 text-zinc-500">
        From non-technical beginner to prompt-engineering and Claude Code
        expert — {curriculum.modules.length} modules across three tracks.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {curriculum.modules.map((m, i) => (
          <Card
            key={m.id}
            className={m.status === "spec" ? "opacity-50" : ""}
          >
            <div className="text-xs uppercase tracking-wide text-zinc-400">
              Module {i + 1} · {m.track}
            </div>
            <h2 className="mt-1 font-semibold">
              {m.status === "built" ? (
                <Link href={`/learn/${m.id}`} className="hover:underline">
                  {m.title}
                </Link>
              ) : (
                m.title
              )}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">{m.summary}</p>
            {m.status === "spec" && (
              <div className="mt-2 text-xs font-medium text-amber-600">
                Coming soon — being built
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
