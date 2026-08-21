import { NextResponse } from "next/server";
import { requireActiveProfile, NoProfileError } from "@/lib/profiles";
import { loadProgress, updateProgress } from "@/lib/progress";
import type { LessonProgress } from "@/lib/schema";

export async function GET() {
  try {
    const profile = await requireActiveProfile();
    return NextResponse.json({
      profile,
      progress: loadProgress(profile.id),
    });
  } catch (err) {
    if (err instanceof NoProfileError) {
      return NextResponse.json({ error: "no-profile" }, { status: 401 });
    }
    throw err;
  }
}

export async function PUT(request: Request) {
  try {
    const profile = await requireActiveProfile();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid-json" }, { status: 400 });
    }
    const lessons = (body as { lessons?: Record<string, LessonProgress> })
      ?.lessons;
    if (lessons !== undefined && (typeof lessons !== "object" || lessons === null)) {
      return NextResponse.json({ error: "invalid-lessons" }, { status: 400 });
    }
    const progress = await updateProgress(profile.id, (store) => {
      if (lessons) {
        Object.assign(store.lessons, lessons);
      }
    });
    return NextResponse.json({ profile, progress });
  } catch (err) {
    if (err instanceof NoProfileError) {
      return NextResponse.json({ error: "no-profile" }, { status: 401 });
    }
    throw err;
  }
}
