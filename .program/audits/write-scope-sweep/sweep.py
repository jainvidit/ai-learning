"""Auditor check 13 — ADR-0014 write-scope breach detection.

Sweeps every subagent transcript and reports any write by a reviewer, auditor, reader
or verifier role that landed outside `.program/audits/**`.

WHY THIS IS A SCRIPT AND NOT AN INLINE HEREDOC
    Backslashes do not survive being pasted into a bash heredoc through the agent tool
    layer: `'\\'` arrives as `'\'` and Python dies with an unterminated string literal.
    This has broken agent-authored scripts repeatedly in this program. Path normalization
    inherently needs a backslash, so this check lives in a file and is invoked by path.
    Same reason and same pattern as check 5's `scan-globs.py`.

WHY TRANSCRIPTS AND NOT GIT
    The relauncher's `git add -A` destroyed per-agent git attribution (ADR-0012). The
    transcripts carry `attributionAgent` per RECORD, which is the only surviving source of
    exact per-agent attribution.

WHY THIS EXISTS AT ALL, GIVEN THE HOOK PREVENTS THESE WRITES
    Defence in depth. The hook's write-verb list is an enumeration, and no enumeration is
    provably complete — a `tee` pipeline already defeated one path-based deny rule. A hit
    here means the hook has a hole.

Usage:  python .program/audits/write-scope-sweep/sweep.py
Exit:   0 = no breaches, 1 = at least one candidate breach (BLOCKING)
"""

import glob
import io
import json
import os
import re
import sys

ROLE_PREFIXES = ("dream-reviewer-", "dream-ledger-auditor",
                 "dream-reader-", "dream-verifier")

ALLOWED = ".program/audits/"

FILE_TOOLS = ("Write", "Edit", "NotebookEdit", "MultiEdit")

# Deliberately broader than the hook's list: this is detection, so a false positive is
# cheap and gets corroborated below, while a miss is the whole point of the check.
WRITE_VERB = re.compile(
    r">>?(?!&)"
    r"|\btee\b|\bcp\b|\bmv\b|\bdd\b|\binstall\b|\btruncate\b|\btouch\b"
    r"|\bsed\b[^|;]*\s-[A-Za-z]*i|\bperl\b[^|;]*\s-[A-Za-z]*i"
    r"|\b(python|python3|py|node|ruby|php)\b[^|;]*\s-(e|c)\b"
    r"|Out-File|Set-Content|Add-Content|New-Item|Copy-Item|Move-Item"
)

# Redirects that write nothing. These MUST be stripped before matching, or the check
# reports every `ls ... 2>/dev/null` in the program and gets ignored as noise — a check
# that cries wolf is worse than no check, because it trains the reader to skim past it.
NOISE = re.compile(
    r"2\s*>\s*&\s*1"                       # 2>&1
    r"|&?\s*>\s*&?\s*/dev/null"            # >/dev/null, &>/dev/null
    r"|2\s*>\s*/dev/null"                  # 2>/dev/null
    r"|2\s*>\s*nul\b"                      # 2>nul  (cmd)
    r"|>\s*NUL\b"                          # >NUL   (cmd)
)


def denoise(cmd):
    return NOISE.sub(" ", str(cmd))

TRANSCRIPTS = ("C:/Users/jainv/.claude/projects/"
               "C--Users-jainv-workplace-ai-learning-app/*/subagents/agent-*.jsonl")

DENIAL_LOG = ".program/audits/hook-denials.jsonl"


def normalize(p):
    return str(p).replace(os.sep, "/").replace("\\", "/")


def inside_allowed(path):
    n = normalize(path)
    if ".." in n.split("/"):
        return False
    return ALLOWED in n


def load_denials():
    """Commands the hook already blocked — a match means enforcement worked."""
    out = []
    try:
        for line in io.open(DENIAL_LOG, encoding="utf-8"):
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except Exception:
                continue
    except IOError:
        pass
    return out


def main():
    denials = load_denials()
    denied_cmds = set(str(d.get("command") or "") for d in denials)

    files = glob.glob(TRANSCRIPTS)
    breaches = []

    for path in files:
        for lineno, line in enumerate(
                io.open(path, encoding="utf-8", errors="replace"), 1):
            if not line.strip():
                continue
            try:
                rec = json.loads(line)
            except Exception:
                continue
            who = str(rec.get("attributionAgent") or "")
            if not who.startswith(ROLE_PREFIXES):
                continue
            msg = rec.get("message")
            blocks = (msg or {}).get("content") if isinstance(msg, dict) else None
            if not isinstance(blocks, list):
                continue
            for b in blocks:
                if not isinstance(b, dict) or b.get("type") != "tool_use":
                    continue
                name = b.get("name")
                inp = b.get("input") if isinstance(b.get("input"), dict) else {}
                target, vector = None, None
                if name in FILE_TOOLS:
                    target = inp.get("file_path") or inp.get("notebook_path")
                    vector = name
                elif name == "Bash":
                    cmd = str(inp.get("command") or "")
                    m = WRITE_VERB.search(denoise(cmd))
                    if m:
                        target, vector = cmd, "Bash(%s)" % m.group(0).strip()
                if not target:
                    continue
                if inside_allowed(target):
                    continue
                breaches.append({
                    "agent": who,
                    "vector": vector,
                    "target": normalize(target)[:300],
                    "transcript": os.path.basename(path),
                    "line": lineno,
                    "hook_logged_a_denial": str(target) in denied_cmds,
                })

    print("transcript files swept: %d" % len(files))
    print("denial-log rows loaded: %d" % len(denials))
    print("candidate breaches: %d" % len(breaches))
    for x in breaches:
        print("")
        print("  BREACH  %s  via %s" % (x["agent"], x["vector"]))
        print("    target      : %s" % x["target"])
        print("    transcript  : %s line %d" % (x["transcript"], x["line"]))
        print("    hook denied : %s" % x["hook_logged_a_denial"])
        if not x["hook_logged_a_denial"]:
            print("    ^^ NOT in the denial log — corroborate by checking whether the")
            print("       file exists. If it does, the write bypassed enforcement.")

    return 1 if breaches else 0


if __name__ == "__main__":
    sys.exit(main())
