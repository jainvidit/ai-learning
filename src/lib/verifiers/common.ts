import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { judgeCriterion } from "@/lib/judge";

/**
 * Shared helpers for challenge verifiers. Every helper takes the sandbox
 * directory as its first argument and treats `rel` as a path relative to it.
 * All file access is confined to the sandbox directory.
 */

/** Resolve `rel` inside `dir`, returning null if it escapes the sandbox. */
function safeResolve(dir: string, rel: string): string | null {
  const base = path.resolve(dir);
  const resolved = path.resolve(base, rel);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) return null;
  return resolved;
}

export function fileExists(dir: string, rel: string): boolean {
  const p = safeResolve(dir, rel);
  return p !== null && fs.existsSync(p) && fs.statSync(p).isFile();
}

export function readFile(dir: string, rel: string): string | null {
  const p = safeResolve(dir, rel);
  if (p === null) return null;
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

export function fileMatches(dir: string, rel: string, pattern: RegExp): boolean {
  const content = readFile(dir, rel);
  return content !== null && pattern.test(content);
}

export function readJson(dir: string, rel: string): unknown | null {
  const content = readFile(dir, rel);
  if (content === null) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

const RUN_TIMEOUT_MS = 10_000;

/**
 * Run `node <file> ...args` inside the sandbox. No shell, 10s timeout,
 * hidden window on Windows. Never rejects — errors surface via exitCode/stderr.
 */
export function runNode(
  dir: string,
  file: string,
  args: string[] = []
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd: dir,
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      stderr += "\n[verifier] Timed out after 10s — process killed.";
      child.kill();
    }, RUN_TIMEOUT_MS);

    const finish = (exitCode: number) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode });
    };

    child.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
    child.stderr.on("data", (d: Buffer) => (stderr += d.toString()));
    child.on("error", (err) => {
      stderr += `\n[verifier] Failed to start process: ${err.message}`;
      finish(-1);
    });
    child.on("close", (code) => finish(code ?? -1));
  });
}

const JUDGE_MAX_CHARS = 8_000;

/**
 * LLM-judge a single criterion against a sandbox file's content.
 * Fails (met: false) if the file is missing or unreadable.
 */
export async function judgeFile(
  dir: string,
  rel: string,
  criterion: string
): Promise<{ met: boolean; reason: string }> {
  const content = readFile(dir, rel);
  if (content === null) {
    return { met: false, reason: `File not found: ${rel}` };
  }
  return judgeCriterion(content.slice(0, JUDGE_MAX_CHARS), criterion);
}
