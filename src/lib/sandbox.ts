import fs from "node:fs";
import path from "node:path";
import { clearSession, sessionKey } from "./claudeSpawn";

/**
 * Sandbox working directories for terminal/challenge exercises.
 * Layout:
 *   sandbox/templates/<templateName>  — pristine seeds (checked in)
 *   sandbox/live/<profileId>/<lessonId> — per-profile working copies
 */

const SANDBOX_ROOT = path.join(process.cwd(), "sandbox");
const LIVE_ROOT = path.join(SANDBOX_ROOT, "live");
const TEMPLATES_ROOT = path.join(SANDBOX_ROOT, "templates");

const ID_RE = /^[a-zA-Z0-9-]+$/;

function assertSafeId(value: string, label: string): void {
  if (!ID_RE.test(value)) {
    throw new Error(
      `Invalid ${label} "${value}" — only letters, digits, and hyphens are allowed.`
    );
  }
}

/** Resolve the live sandbox dir for a profile+lesson, guarding against path traversal. */
export function sandboxDir(profileId: string, lessonId: string): string {
  assertSafeId(profileId, "profileId");
  assertSafeId(lessonId, "lessonId");
  const dir = path.resolve(LIVE_ROOT, profileId, lessonId);
  if (!dir.startsWith(path.resolve(LIVE_ROOT) + path.sep)) {
    throw new Error("Resolved sandbox path escapes the sandbox/live root.");
  }
  return dir;
}

/** Seed the live sandbox from a template if it doesn't exist yet. Returns the dir. */
export function ensureSandbox(
  profileId: string,
  lessonId: string,
  templateName: string
): string {
  assertSafeId(templateName, "templateName");
  const dir = sandboxDir(profileId, lessonId);
  if (!fs.existsSync(dir)) {
    const template = path.join(TEMPLATES_ROOT, templateName);
    if (!fs.existsSync(template)) {
      throw new Error(
        `Sandbox template "${templateName}" not found at ${template}. ` +
          `Create it under sandbox/templates/.`
      );
    }
    fs.cpSync(template, dir, { recursive: true });
  }
  return dir;
}

/** Wipe the live sandbox, reseed from the template, and drop any stored Claude session. */
export function resetSandbox(
  profileId: string,
  lessonId: string,
  templateName: string
): string {
  const dir = sandboxDir(profileId, lessonId);
  fs.rmSync(dir, { recursive: true, force: true });
  clearSession(sessionKey(profileId, lessonId));
  return ensureSandbox(profileId, lessonId, templateName);
}
