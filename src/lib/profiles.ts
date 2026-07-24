import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { Profile, ProfileRegistry } from "./schema";

const DATA_DIR = path.join(process.cwd(), "data");
const REGISTRY_PATH = path.join(DATA_DIR, "profiles.json");
export const PROFILE_COOKIE = "profileId";

const AVATAR_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

function atomicWrite(filePath: string, data: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, filePath);
}

export function loadRegistry(): ProfileRegistry {
  if (!fs.existsSync(REGISTRY_PATH)) return { profiles: [] };
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
}

function saveRegistry(registry: ProfileRegistry) {
  atomicWrite(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

export function createProfile(name: string): Profile {
  const registry = loadRegistry();
  const profile: Profile = {
    id: crypto.randomUUID().slice(0, 8),
    name: name.trim().slice(0, 40),
    avatarColor:
      AVATAR_COLORS[registry.profiles.length % AVATAR_COLORS.length],
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  registry.profiles.push(profile);
  saveRegistry(registry);
  return profile;
}

export function getProfile(id: string): Profile | undefined {
  return loadRegistry().profiles.find((p) => p.id === id);
}

export function touchProfile(id: string) {
  const registry = loadRegistry();
  const p = registry.profiles.find((p) => p.id === id);
  if (p) {
    p.lastActiveAt = new Date().toISOString();
    saveRegistry(registry);
  }
}

export function deleteProfile(id: string) {
  const registry = loadRegistry();
  registry.profiles = registry.profiles.filter((p) => p.id !== id);
  saveRegistry(registry);
  // remove progress + sandboxes for this profile
  fs.rmSync(path.join(DATA_DIR, "progress", `${id}.json`), { force: true });
  fs.rmSync(path.join(process.cwd(), "sandbox", "live", id), {
    recursive: true,
    force: true,
  });
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
