import fs from "node:fs";
import { spawn } from "node:child_process";

/**
 * Server-side wrapper around the Claude Code CLI for terminal/challenge
 * exercises. Spawns claude.exe headlessly, streams NDJSON stdout, and maps
 * it to a small TermEvent contract consumed by the exec API route.
 */

const KNOWN_CLAUDE_PATH =
  "C:\\Users\\jainv\\AppData\\Roaming\\npm\\node_modules\\@anthropic-ai\\claude-code\\bin\\claude.exe";

function resolveClaudeExe(): string | undefined {
  if (process.env.CLAUDE_EXE && fs.existsSync(process.env.CLAUDE_EXE)) {
    return process.env.CLAUDE_EXE;
  }
  if (fs.existsSync(KNOWN_CLAUDE_PATH)) return KNOWN_CLAUDE_PATH;
  return undefined;
}

export const CLAUDE_EXE: string | undefined = resolveClaudeExe();

export function claudeAvailable(): boolean {
  return Boolean(CLAUDE_EXE);
}

// ---------- Session registry (profileId:lessonId -> Claude session id) ----------

const sessionRegistry = new Map<string, string>();

export function sessionKey(profileId: string, lessonId: string): string {
  return `${profileId}:${lessonId}`;
}

export function getSession(key: string): string | undefined {
  return sessionRegistry.get(key);
}

export function setSession(key: string, sessionId: string): void {
  sessionRegistry.set(key, sessionId);
}

export function clearSession(key: string): void {
  sessionRegistry.delete(key);
}

// ---------- Concurrency guard ----------

const runningKeys = new Set<string>();

export function isRunning(key: string): boolean {
  return runningKeys.has(key);
}

// ---------- Spawn & stream ----------

export type TermEvent =
  | { type: "text"; text: string }
  | { type: "tool"; name: string }
  | { type: "result"; sessionId: string; costUsd: number; numTurns: number }
  | { type: "error"; message: string };

export interface SpawnClaudeOpts {
  cwd: string;
  prompt: string;
  allowedTools: string;
  maxTurns: number;
  resumeSessionId?: string;
  signal?: AbortSignal;
  /** Kill the child after this long. Default 5 minutes. */
  timeoutMs?: number;
  /** Concurrency-guard key (profileId:lessonId). If provided, a second
   * concurrent run for the same key is rejected. */
  key?: string;
}

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

/** Map one parsed NDJSON line from claude.exe to a TermEvent (or null). */
function mapLine(parsed: unknown): TermEvent | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const line = parsed as Record<string, unknown>;

  if (line.type === "stream_event") {
    const event = line.event as Record<string, unknown> | undefined;
    if (!event || typeof event !== "object") return null;
    const delta = event.delta as Record<string, unknown> | undefined;
    if (
      delta &&
      typeof delta === "object" &&
      delta.type === "text_delta" &&
      typeof delta.text === "string"
    ) {
      return { type: "text", text: delta.text };
    }
    if (event.type === "content_block_start") {
      const block = event.content_block as Record<string, unknown> | undefined;
      if (
        block &&
        typeof block === "object" &&
        block.type === "tool_use" &&
        typeof block.name === "string"
      ) {
        return { type: "tool", name: block.name };
      }
    }
    return null;
  }

  if (line.type === "result") {
    return {
      type: "result",
      sessionId: typeof line.session_id === "string" ? line.session_id : "",
      costUsd: typeof line.total_cost_usd === "number" ? line.total_cost_usd : 0,
      numTurns: typeof line.num_turns === "number" ? line.num_turns : 0,
    };
  }

  return null;
}

/**
 * Run the Claude Code CLI headlessly in `cwd` and yield TermEvents as they
 * stream in. Always terminates (result, error, timeout, or abort).
 */
export async function* spawnClaude(
  opts: SpawnClaudeOpts
): AsyncGenerator<TermEvent> {
  const exe = CLAUDE_EXE;
  if (!exe) {
    throw new Error(
      `Claude Code CLI not found at ${KNOWN_CLAUDE_PATH} — set CLAUDE_EXE env var to the claude.exe path.`
    );
  }

  const { key } = opts;
  if (key) {
    if (runningKeys.has(key)) {
      throw new ConcurrentRunError(key);
    }
    runningKeys.add(key);
  }

  try {
    if (opts.signal?.aborted) {
      yield { type: "error", message: "Run aborted before start." };
      return;
    }

    const args = [
      "-p",
      "--allowedTools",
      opts.allowedTools,
      "--permission-mode",
      "dontAsk",
      "--max-turns",
      String(opts.maxTurns),
      "--output-format",
      "stream-json",
      "--verbose",
      "--include-partial-messages",
    ];
    if (opts.resumeSessionId) {
      args.push("--resume", opts.resumeSessionId);
    }

    const child = spawn(exe, args, {
      cwd: opts.cwd,
      env: { ...process.env },
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Event plumbing: child callbacks push into a queue; the generator drains it.
    const queue: TermEvent[] = [];
    let wake: (() => void) | null = null;
    let closed = false;
    let sawResult = false;
    let stderrTail = "";
    let stdoutBuf = "";

    const push = (ev: TermEvent) => {
      if (ev.type === "result") sawResult = true;
      queue.push(ev);
      wake?.();
      wake = null;
    };
    const finish = () => {
      closed = true;
      wake?.();
      wake = null;
    };

    const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const timer = setTimeout(() => {
      push({
        type: "error",
        message: `Claude run timed out after ${Math.round(timeoutMs / 1000)}s.`,
      });
      child.kill();
    }, timeoutMs);

    const onAbort = () => {
      child.kill();
    };
    opts.signal?.addEventListener("abort", onAbort, { once: true });

    child.stdin.on("error", () => {
      /* ignore EPIPE if the child dies early */
    });
    child.stdin.write(opts.prompt);
    child.stdin.end();

    const handleLine = (rawLine: string) => {
      const trimmed = rawLine.trim();
      if (!trimmed) return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        return; // skip unparseable lines
      }
      const ev = mapLine(parsed);
      if (ev) push(ev);
    };

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdoutBuf += chunk;
      let idx: number;
      while ((idx = stdoutBuf.indexOf("\n")) !== -1) {
        const line = stdoutBuf.slice(0, idx);
        stdoutBuf = stdoutBuf.slice(idx + 1);
        handleLine(line);
      }
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderrTail = (stderrTail + chunk).slice(-4000);
    });

    child.on("error", (err) => {
      push({ type: "error", message: `Failed to spawn claude.exe: ${err.message}` });
      finish();
    });

    child.on("close", (code) => {
      if (stdoutBuf) {
        handleLine(stdoutBuf);
        stdoutBuf = "";
      }
      if (code !== 0 && !sawResult) {
        const tail = stderrTail.trim().slice(-1500);
        push({
          type: "error",
          message: tail || `claude.exe exited with code ${code ?? "unknown"}.`,
        });
      }
      finish();
    });

    try {
      while (true) {
        while (queue.length > 0) {
          yield queue.shift()!;
        }
        if (closed) break;
        await new Promise<void>((resolve) => {
          wake = resolve;
        });
      }
    } finally {
      clearTimeout(timer);
      opts.signal?.removeEventListener("abort", onAbort);
      if (!closed) child.kill();
    }
  } finally {
    if (key) runningKeys.delete(key);
  }
}

export class ConcurrentRunError extends Error {
  constructor(key: string) {
    super(`A Claude run is already in flight for ${key}.`);
  }
}
