import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loadRegistry, createProfile, PROFILE_COOKIE } from "@/lib/profiles";
import { loadProgress } from "@/lib/progress";
import { loadCurriculum, moduleCompletionPercent } from "@/lib/content";

export async function GET() {
  const registry = loadRegistry();
  const builtModules = loadCurriculum().modules.filter(
    (m) => m.status === "built"
  );
  const profiles = registry.profiles.map((profile) => {
    const progress = loadProgress(profile.id);
    const completion =
      builtModules.length === 0
        ? 0
        : Math.round(
            builtModules.reduce(
              (sum, m) => sum + moduleCompletionPercent(progress, m.id),
              0
            ) / builtModules.length
          );
    return { ...profile, completion };
  });
  const store = await cookies();
  const cookieId = store.get(PROFILE_COOKIE)?.value;
  const activeId =
    cookieId && registry.profiles.some((p) => p.id === cookieId)
      ? cookieId
      : null;
  return NextResponse.json({ profiles, activeId });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  const name =
    typeof (body as { name?: unknown })?.name === "string"
      ? ((body as { name: string }).name ?? "").trim()
      : "";
  if (!name) {
    return NextResponse.json({ error: "name-required" }, { status: 400 });
  }
  const profile = createProfile(name);
  const store = await cookies();
  store.set(PROFILE_COOKIE, profile.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return NextResponse.json({ profile }, { status: 201 });
}
