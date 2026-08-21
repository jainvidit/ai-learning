import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteProfile, setProfileTheme, PROFILE_COOKIE } from "@/lib/profiles";
import { ThemePreferenceSchema } from "@/lib/schema";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteProfile(id);
  const store = await cookies();
  if (store.get(PROFILE_COOKIE)?.value === id) {
    store.delete(PROFILE_COOKIE);
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  const parsed = ThemePreferenceSchema.safeParse(
    (body as { theme?: unknown })?.theme
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-theme" }, { status: 400 });
  }
  await setProfileTheme(id, parsed.data);
  return NextResponse.json({ ok: true });
}
