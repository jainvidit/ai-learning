import crypto from "node:crypto";
import type { Profile } from "@/lib/schema";

export const AVATAR_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

/** Construct a new profile record. `existingCount` picks the avatar color. */
export function buildNewProfile(name: string, existingCount: number): Profile {
  return {
    id: crypto.randomUUID().slice(0, 8),
    name: name.trim().slice(0, 40),
    avatarColor: AVATAR_COLORS[existingCount % AVATAR_COLORS.length],
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
}

/**
 * Serializes async read-modify-write calls so concurrent updateProgress
 * calls for the same profile can't race and clobber each other. Each
 * progress storage implementation composes one of these rather than
 * reimplementing the queue.
 */
export function createWriteQueue(): <T>(fn: () => Promise<T>) => Promise<T> {
  let tail: Promise<void> = Promise.resolve();
  return function enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const result = tail.then(fn);
    tail = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  };
}
