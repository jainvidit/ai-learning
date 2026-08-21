import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteProfile, PROFILE_COOKIE } from "@/lib/profiles";

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
