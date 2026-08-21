import { cookies } from "next/headers";
import { getProfileStorage } from "@/lib/storage";
import type { Profile, ProfileRegistry } from "./schema";

export const PROFILE_COOKIE = "profileId";

const storage = getProfileStorage();

export async function loadRegistry(): Promise<ProfileRegistry> {
  return storage.loadRegistry();
}

export async function createProfile(name: string): Promise<Profile> {
  return storage.createProfile(name);
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  return storage.getProfile(id);
}

export async function touchProfile(id: string): Promise<void> {
  return storage.touchProfile(id);
}

export async function deleteProfile(id: string): Promise<void> {
  return storage.deleteProfile(id);
}

/** Resolve the active profile from the request cookie. Returns undefined if none/invalid. */
export async function getActiveProfile(): Promise<Profile | undefined> {
  const store = await cookies();
  const id = store.get(PROFILE_COOKIE)?.value;
  if (!id) return undefined;
  return getProfile(id);
}

/** For API routes: resolve active profile or throw a 401-style error object. */
export async function requireActiveProfile(): Promise<Profile> {
  const profile = await getActiveProfile();
  if (!profile) throw new NoProfileError();
  return profile;
}

export class NoProfileError extends Error {
  constructor() {
    super("No active profile — visit /profiles to pick one");
  }
}
