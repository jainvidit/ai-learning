@echo off
setlocal
rem Launcher for role-write-scope.py (ADR-0014).
rem
rem WHY A LAUNCHER EXISTS AT ALL
rem   Two failure modes kill the interpreter before any Python runs, so no
rem   in-script guard can cover them:
rem     * script file missing     -> python exits 2
rem     * script syntax error     -> python exits 1
rem   Claude Code treats a non-zero exit as BLOCK, which denies every matched
rem   tool call for every agent, including the director. Recovering from that
rem   requires an external shell. This launcher converts "interpreter or script
rem   unavailable" into an explicit allow, and always exits 0.
rem
rem WHY cmd, AND WHY A HARDCODED INTERPRETER
rem   python3 on this machine is the Microsoft Store shim: it prints "Python was
rem   not found" and exits non-zero. sh exists only via the Git-for-Windows PATH
rem   entry, so it is not guaranteed. cmd.exe is the only interpreter always
rem   present on Windows. C:\Python314\python.exe is hardcoded deliberately: a
rem   PATH lookup is exactly the kind of environment dependency that bricks this.
rem   If Python moves, update this line.
rem
rem STDERR IS DISCARDED (2>nul)
rem   Python's stderr must never reach stdout. In the fallback case the harness
rem   reads stdout as the hook's JSON decision; one stream merge away, an error
rem   line prepended to that JSON makes the output unparseable, which reads as a
rem   failure and locks the session again. Diagnostics are logged by the policy
rem   script itself, to .program/audits/hook-denials.jsonl.
"C:\Python314\python.exe" "%~dp0role-write-scope.py" 2>nul
if errorlevel 1 (
  echo {"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"launcher fallback: interpreter or script unavailable"}}
)
exit /b 0
