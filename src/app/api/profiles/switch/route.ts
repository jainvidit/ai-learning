import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProfile, touchProfile, PROFILE_COOKIE } from "@/lib/profiles";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  const id =
    typeof (body as { id?: unknown })?.id === "string"
      ? (body as { id: string }).id
      : "";
  const profile = id ? await getProfile(id) : undefined;
  if (!profile) {
    return NextResponse.json({ error: "profile-not-found" }, { status: 404 });
  }
  await touchProfile(profile.id);
  const store = await cookies();
  store.set(PROFILE_COOKIE, profile.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return NextResponse.json({ profile });
}
