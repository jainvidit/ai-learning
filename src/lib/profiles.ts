import crypto from "node:crypto";
import { cookies } from "next/headers";
import { kv } from "@vercel/kv";
import type { Profile, ProfileRegistry } from "./schema";

export const PROFILE_COOKIE = "profileId";

const AVATAR_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const PROFILES_KEY = "profiles:registry";

export async function loadRegistry(): Promise<ProfileRegistry> {
  try {
    const data = await kv.get(PROFILES_KEY);
    if (!data) return { profiles: [] };
    return data as ProfileRegistry;
  } catch {
    return { profiles: [] };
  }
}

async function saveRegistry(registry: ProfileRegistry) {
  try {
    await kv.set(PROFILES_KEY, registry);
  } catch (err) {
    console.error("Failed to save profiles:", err);
  }
}

export async function createProfile(name: string): Promise<Profile> {
  const registry = await loadRegistry();
  const profile: Profile = {
    id: crypto.randomUUID().slice(0, 8),
    name: name.trim().slice(0, 40),
    avatarColor:
      AVATAR_COLORS[registry.profiles.length % AVATAR_COLORS.length],
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  registry.profiles.push(profile);
  await saveRegistry(registry);
  return profile;
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  const registry = await loadRegistry();
  return registry.profiles.find((p) => p.id === id);
}

export async function touchProfile(id: string) {
  const registry = await loadRegistry();
  const p = registry.profiles.find((p) => p.id === id);
  if (p) {
    p.lastActiveAt = new Date().toISOString();
    await saveRegistry(registry);
  }
}

export async function deleteProfile(id: string) {
  const registry = await loadRegistry();
  registry.profiles = registry.profiles.filter((p) => p.id !== id);
  await saveRegistry(registry);
  // also remove progress data for this profile
  await kv.del(`progress:${id}`);
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
