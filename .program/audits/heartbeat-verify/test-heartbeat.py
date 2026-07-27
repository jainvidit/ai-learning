"""Standalone verification of the heartbeat + denial logging in role-write-scope.py.

Run from an EXTERNAL shell before trusting a new hook version live (the hook's own
docstring makes this a prerequisite, not a good practice).

Asserts:
  1. A restricted role's ALLOWED call produces exactly one heartbeat row.
  2. A second allowed call from the same (session, agent) produces NO second row.
  3. A different agent_id of the same role in the same session gets its OWN row.
  4. The same agent in a DIFFERENT session gets its own row (per-session liveness).
  5. Unrestricted roles produce NO rows of any kind, allowed or denied.
  6. Denials still log, and carry kind="denial".
  7. Every decision is still emitted and parseable (the hook must never block).

Usage: python test-heartbeat.py
Exit 0 = all assertions pass.
"""
import io
import json
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
# HERE is <repo>/.program/audits/heartbeat-verify -> three levels up is the repo.
REPO = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
HOOK = os.path.join(REPO, ".claude", "hooks", "role-write-scope.py")
LOG = os.path.join(REPO, ".program", "audits", "hook-denials.jsonl")
STATE = os.path.join(REPO, ".program", "audits", ".heartbeat-state")

failures = []


def check(label, cond):
    print(("  PASS  " if cond else "  FAIL  ") + label)
    if not cond:
        failures.append(label)


def call(role, tool, target, session, agent_id):
    ti = {"command": target} if tool == "Bash" else {"file_path": target}
    payload = json.dumps({
        "session_id": session, "agent_type": role, "agent_id": agent_id,
        "cwd": REPO, "tool_name": tool, "tool_input": ti})
    p = subprocess.run([sys.executable, HOOK], input=payload,
                       capture_output=True, text=True)
    try:
        d = json.loads(p.stdout)["hookSpecificOutput"]["permissionDecision"]
    except Exception:
        d = "UNPARSEABLE(%r)" % (p.stdout[:80],)
    return d


def rows():
    if not os.path.exists(LOG):
        return []
    out = []
    with io.open(LOG, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


# Isolate: work against a pristine heartbeat state, and measure only new rows.
if os.path.isdir(STATE):
    shutil.rmtree(STATE)
base = len(rows())
print("baseline rows: %d" % base)


def new():
    return rows()[base:]


print("\n1-2. restricted role, allowed calls, one heartbeat per agent")
check("reviewer read #1 allowed",
      call("dream-reviewer-primary", "Bash", "ls -la docs/", "S1", "AG-REV") == "allow")
check("reviewer read #2 allowed",
      call("dream-reviewer-primary", "Bash", "cat AGENTS.md", "S1", "AG-REV") == "allow")
check("reviewer write INSIDE audits allowed",
      call("dream-reviewer-primary", "Write",
           ".program/audits/ok.md", "S1", "AG-REV") == "allow")
hb = [r for r in new() if r.get("kind") == "heartbeat"]
check("exactly 1 heartbeat after 3 allowed calls (got %d)" % len(hb), len(hb) == 1)

print("\n3. a second agent of the same role in the same session")
call("dream-reviewer-primary", "Bash", "ls", "S1", "AG-REV2")
hb = [r for r in new() if r.get("kind") == "heartbeat"]
check("2 heartbeats, one per agent_id (got %d)" % len(hb), len(hb) == 2)

print("\n4. same agent, different session")
call("dream-reviewer-primary", "Bash", "ls", "S2", "AG-REV")
hb = [r for r in new() if r.get("kind") == "heartbeat"]
check("3 heartbeats, per-session liveness (got %d)" % len(hb), len(hb) == 3)

print("\n5. all four restricted families heartbeat")
for role in ("dream-verifier", "dream-ledger-auditor", "dream-reader-lookup",
             "dream-reviewer-secondary", "dream-ledger-auditor-deep",
             "dream-verifier-deep", "dream-reader-corpus",
             "dream-reviewer-adversarial"):
    check("%s allowed on a read" % role,
          call(role, "Bash", "grep -n foo AGENTS.md", "S3", "AG-" + role) == "allow")
fams = set(r["agent_type"] for r in new() if r.get("kind") == "heartbeat")
check("all 8 restricted roles produced a heartbeat (got %d)" % len(fams - {"dream-reviewer-primary"}),
      len(fams) == 9)

print("\n6. unrestricted roles log NOTHING")
before = len(new())
for role in ("dream-implementer-standard", "dream-implementer-hardened",
             "dream-implementer-critical", "dream-implementer-isolated",
             "dream-implementer-suite", "dream-coordinator",
             "dream-coordinator-recovery", "dream-director",
             "dream-gate-verifier", "dream-collector", "dream-reporter"):
    d = call(role, "Bash", "echo hi > src/x.ts", "S4", "AG-" + role)
    check("%s allowed to write freely" % role, d == "allow")
    call(role, "Write", "src/y.ts", "S4", "AG-" + role)
check("unrestricted roles added 0 rows (added %d)" % (len(new()) - before),
      len(new()) == before)

print("\n   note: dream-gate-verifier must be UNRESTRICTED - it writes an evidence doc.")
print("   (NO_WRITES_PREFIXES is 'dream-verifier', which does not prefix-match it.)")

print("\n7. denials still log, tagged kind=denial")
before_den = len([r for r in new() if r.get("kind") == "denial"])
check("reviewer redirect outside audits denied",
      call("dream-reviewer-primary", "Bash", "echo x > zz.txt", "S1", "AG-REV") == "deny")
check("verifier denied even inside audits",
      call("dream-verifier", "Bash", "echo x > .program/audits/zz.txt", "S1",
           "AG-VER") == "deny")
check("reviewer Write outside audits denied",
      call("dream-reviewer-primary", "Write", "src/z.ts", "S1", "AG-REV") == "deny")
den = [r for r in new() if r.get("kind") == "denial"]
check("3 new denial rows (got %d)" % (len(den) - before_den),
      len(den) - before_den == 3)

print("\n8. log integrity + no stray files")
allrows = rows()
check("every row parses (%d rows)" % len(allrows), True)
check("every new row has a kind", all("kind" in r for r in new()))
check("every new row carries session_id", all(r.get("session_id") for r in new()))
check("no probe file was actually created",
      not os.path.exists(os.path.join(REPO, "zz.txt"))
      and not os.path.exists(os.path.join(REPO, "src", "x.ts")))

print("\n" + "=" * 62)
if failures:
    print("FAILURES (%d):" % len(failures))
    for f in failures:
        print("  -", f)
    sys.exit(1)
print("ALL ASSERTIONS PASS")
print("new rows written by this test: %d (heartbeats %d, denials %d)"
      % (len(new()),
         len([r for r in new() if r.get("kind") == "heartbeat"]),
         len([r for r in new() if r.get("kind") == "denial"])))
