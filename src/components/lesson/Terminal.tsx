"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TerminalExercise } from "@/lib/schema";
import "@xterm/xterm/css/xterm.css";

type XTerm = import("@xterm/xterm").Terminal;

interface TermEvent {
  type: "text" | "tool" | "result" | "error";
  text?: string;
  name?: string;
  sessionId?: string;
  costUsd?: number;
  numTurns?: number;
  message?: string;
  lessonCompleted?: boolean;
}

const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

/** xterm needs \r\n; streamed text deltas only carry \n. */
function toCRLF(text: string): string {
  return text.replace(/\r?\n/g, "\r\n");
}

export default function Terminal({
  moduleId,
  lessonId,
  exercise,
}: {
  moduleId: string;
  lessonId: string;
  exercise: TerminalExercise;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [continueSession, setContinueSession] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "error" | "auth";
    text: string;
  } | null>(null);

  // Mount xterm (browser-only; dynamic import inside the effect).
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      const [{ Terminal: XTermCtor }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ]);
      if (disposed || !containerRef.current) return;
      const term = new XTermCtor({
        convertEol: false,
        cursorBlink: false,
        disableStdin: true,
        fontSize: 13,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        theme: {
          background: "#18181b", // zinc-900
          foreground: "#e4e4e7", // zinc-200
          cursor: "#6366f1", // indigo-500
        },
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(containerRef.current);
      fit.fit();
      term.writeln(
        `${ANSI.dim}Sandbox terminal ready. Send a prompt to run Claude Code.${ANSI.reset}`
      );
      termRef.current = term;
      const onResize = () => fit.fit();
      window.addEventListener("resize", onResize);
      cleanup = () => {
        window.removeEventListener("resize", onResize);
        term.dispose();
        termRef.current = null;
      };
    })();
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  // Abort any in-flight run on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  const write = (s: string) => termRef.current?.write(s);

  const send = useCallback(async () => {
    const text = prompt.trim();
    if (!text || running) return;
    setNotice(null);
    setRunning(true);
    const controller = new AbortController();
    abortRef.current = controller;

    write(`\r\n${ANSI.cyan}> ${toCRLF(text)}${ANSI.reset}\r\n`);

    function handleEvent(ev: TermEvent) {
      switch (ev.type) {
        case "text":
          write(toCRLF(ev.text ?? ""));
          break;
        case "tool":
          write(
            `\r\n${ANSI.dim}[tool] ${ev.name ?? "unknown"}${ANSI.reset}\r\n`
          );
          break;
        case "result": {
          const cost = (ev.costUsd ?? 0).toFixed(4);
          write(
            `\r\n${ANSI.green}✔ Done — ${ev.numTurns ?? 0} turn(s), $${cost}` +
              `${ev.lessonCompleted ? " — lesson complete!" : ""}${ANSI.reset}\r\n`
          );
          setHasSession(true);
          setContinueSession(true); // auto-check after first successful run
          break;
        }
        case "error":
          write(
            `\r\n${ANSI.red}[error] ${ev.message ?? "unknown"}${ANSI.reset}\r\n`
          );
          break;
      }
    }

    try {
      const res = await fetch("/api/claude-code/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          lessonId,
          exerciseId: exercise.id,
          prompt: text,
          continueSession,
        }),
        signal: controller.signal,
      });

      if (res.status === 401) {
        setNotice({ kind: "auth", text: "No active profile." });
        return;
      }
      if (res.status === 409) {
        setNotice({
          kind: "error",
          text: "A run is already in progress for this lesson — wait for it to finish.",
        });
        return;
      }
      if (res.status === 503) {
        const body = await res.json().catch(() => null);
        setNotice({
          kind: "error",
          text:
            body?.hint ??
            "Claude Code CLI not found. Install @anthropic-ai/claude-code or set CLAUDE_EXE.",
        });
        return;
      }
      if (!res.ok || !res.body) {
        setNotice({ kind: "error", text: `Request failed (${res.status}).` });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let sep: number;
        while ((sep = buf.indexOf("\n\n")) !== -1) {
          const frame = buf.slice(0, sep);
          buf = buf.slice(sep + 2);
          const dataLine = frame
            .split("\n")
            .find((l) => l.startsWith("data: "));
          if (!dataLine) continue;
          let ev: TermEvent;
          try {
            ev = JSON.parse(dataLine.slice(6));
          } catch {
            continue;
          }
          handleEvent(ev);
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        write(
          `\r\n${ANSI.red}[error] ${(err as Error).message}${ANSI.reset}\r\n`
        );
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }, [prompt, running, moduleId, lessonId, exercise.id, continueSession]);

  const reset = useCallback(async () => {
    if (running || resetting) return;
    setResetting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/claude-code/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, lessonId, exerciseId: exercise.id }),
      });
      if (res.status === 401) {
        setNotice({ kind: "auth", text: "No active profile." });
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setNotice({
          kind: "error",
          text: body?.error ?? `Reset failed (${res.status}).`,
        });
        return;
      }
      setHasSession(false);
      setContinueSession(false);
      termRef.current?.clear();
      write(`${ANSI.dim}Sandbox reset to template state.${ANSI.reset}\r\n`);
    } finally {
      setResetting(false);
    }
  }, [running, resetting, moduleId, lessonId, exercise.id]);

  return (
    <div className="my-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {exercise.title}
      </h3>
      <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
        {exercise.instructions}
      </p>

      {exercise.suggestedPrompts && exercise.suggestedPrompts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {exercise.suggestedPrompts.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => setPrompt(sp)}
              disabled={running}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
            >
              {sp}
            </button>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="mt-4 h-80 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 p-2"
      />

      {notice && (
        <div
          className={`mt-3 rounded-lg border p-3 text-sm ${
            notice.kind === "error"
              ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
              : "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
          }`}
        >
          {notice.text}{" "}
          {notice.kind === "auth" && (
            <a href="/profiles" className="font-medium underline">
              Pick a profile
            </a>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Tell Claude Code what to do in the sandbox…"
          disabled={running}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <button
          type="button"
          onClick={send}
          disabled={running || !prompt.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {running ? "Running…" : "Send"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={running || resetting}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          {resetting ? "Resetting…" : "Reset sandbox"}
        </button>
      </div>

      <label className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={continueSession}
          onChange={(e) => setContinueSession(e.target.checked)}
          disabled={running || !hasSession}
          className="h-3.5 w-3.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
        />
        Continue session {!hasSession && "(available after the first run)"}
      </label>
    </div>
  );
}
