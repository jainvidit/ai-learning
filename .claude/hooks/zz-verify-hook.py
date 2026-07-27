"""Standalone verifier for role-write-scope.py.

Runs the candidate as a SUBPROCESS with real stdin, exactly as the harness does.
Asserts decision, exit code 0, and parseable stdout for every case.
"""
import json
import subprocess
import sys
import os

HOOK = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                    "role-write-scope.py")
CWD = os.path.abspath(os.path.join(os.path.dirname(HOOK), "..", ".."))

REVIEWER = "dream-reviewer-primary"
AUDITOR = "dream-ledger-auditor"
READER = "dream-reader-lookup"
VERIFIER = "dream-verifier"
IMPL = "dream-implementer-standard"
DIRECTOR = "dream-director"
COORD = "dream-coordinator"

def payload(agent_type, tool, tin):
    return {"session_id": "test", "cwd": CWD, "agent_type": agent_type,
            "agent_id": "ag_test", "hook_event_name": "PreToolUse",
            "tool_name": tool, "tool_input": tin}

def bash(agent_type, cmd):
    return payload(agent_type, "Bash", {"command": cmd})

def write(agent_type, path):
    return payload(agent_type, "Write", {"file_path": path, "content": "x"})

CASES = []
def case(name, pl, expect, raw=None):
    CASES.append((name, pl, expect, raw))

# --- audits_only: reviewers + auditors --------------------------------------
case("reviewer Write inside audits", write(REVIEWER, ".program/audits/reviewer-x.md"), "allow")
case("reviewer Write abs inside audits", write(REVIEWER, CWD + "/.program/audits/reviewer-y.md"), "allow")
case("reviewer Write outside (src)", write(REVIEWER, "src/lib/schema.ts"), "deny")
case("reviewer Write outside (ledger item)", write(REVIEWER, ".program/ledger/items/ROOT.1.md"), "deny")
case("reviewer Write traversal", write(REVIEWER, ".program/audits/../ledger/items/ROOT.1.md"), "deny")
case("reviewer Write outside repo abs", write(REVIEWER, "C:/Windows/Temp/x.txt"), "deny")
case("auditor Write outside", write(AUDITOR, "package.json"), "deny")
case("auditor Write inside audits", write(AUDITOR, ".program/audits/audit-1.md"), "allow")
case("reviewer Bash read-only grep", bash(REVIEWER, "grep -n foo src/lib/schema.ts"), "allow")
case("reviewer Bash npm test", bash(REVIEWER, "npm test"), "allow")
case("reviewer Bash build", bash(REVIEWER, "npm run build"), "allow")
case("reviewer Bash redirect outside", bash(REVIEWER, "echo BREACH > src/x.ts"), "deny")
case("reviewer Bash redirect inside", bash(REVIEWER, "echo ok > .program/audits/note.txt"), "allow")
case("reviewer Bash append outside", bash(REVIEWER, "echo BREACH >> .program/ledger/events/ROOT.jsonl"), "deny")
case("reviewer Bash tee outside", bash(REVIEWER, "printf BREACH | tee src/x.ts"), "deny")
case("reviewer Bash tee inside", bash(REVIEWER, "printf ok | tee .program/audits/n.txt"), "allow")
case("reviewer Bash cp outside", bash(REVIEWER, "cp .program/audits/a.md src/a.md"), "deny")
case("reviewer Bash mv outside", bash(REVIEWER, "mv src/a.ts src/b.ts"), "deny")
case("reviewer Bash install", bash(REVIEWER, "install -m 644 a.md src/a.md"), "deny")
case("reviewer Bash dd", bash(REVIEWER, "dd if=/dev/zero of=src/x.bin"), "deny")
case("reviewer Bash sed -i", bash(REVIEWER, "sed -i 's/a/b/' src/x.ts"), "deny")
case("reviewer Bash python -c write", bash(REVIEWER, "python -c \"open('src/x.ts','w').write('B')\""), "deny")
case("reviewer Bash node -e write", bash(REVIEWER, "node -e \"require('fs').writeFileSync('src/x.ts','B')\""), "deny")
case("reviewer Bash Out-File", bash(REVIEWER, "'BREACH' | Out-File src/x.ts"), "deny")
case("reviewer Bash Set-Content", bash(REVIEWER, "Set-Content -Path src/x.ts -Value BREACH"), "deny")
case("reviewer Bash rm", bash(REVIEWER, "rm src/x.ts"), "deny")
case("reviewer Bash git add", bash(REVIEWER, "git add -A"), "deny")
case("reviewer Bash redirect unresolvable var", bash(REVIEWER, "echo x > $TARGET"), "deny")
case("reviewer Bash empty command", payload(REVIEWER, "Bash", {"command": ""}), "deny")
case("reviewer Bash missing command", payload(REVIEWER, "Bash", {}), "deny")
case("reviewer Write missing path", payload(REVIEWER, "Write", {"content": "x"}), "deny")
case("reviewer stderr redirect only", bash(REVIEWER, "npm run lint 2>&1"), "allow")

# --- no_writes: readers + verifiers -----------------------------------------
case("reader Write anywhere", write(READER, ".program/audits/x.md"), "deny")
case("reader Write src", write(READER, "src/x.ts"), "deny")
case("reader Bash grep", bash(READER, "grep -rn foo src/"), "allow")
case("reader Bash redirect", bash(READER, "echo x > .program/audits/x.md"), "deny")
case("reader Bash tee", bash(READER, "printf x | tee /tmp/x"), "deny")
case("verifier Write audits", write(VERIFIER, ".program/audits/v.md"), "deny")
case("verifier Bash npm test", bash(VERIFIER, "npm test"), "allow")
case("verifier Bash redirect", bash(VERIFIER, "npm test > out.txt"), "deny")
case("verifier-deep Write", write("dream-verifier-deep", ".program/audits/v.md"), "deny")
case("reader-corpus Bash write", bash("dream-reader-corpus", "echo x > x.txt"), "deny")

# --- unrestricted: must NEVER be blocked ------------------------------------
for role in (IMPL, DIRECTOR, COORD, "dream-implementer-hardened",
             "dream-implementer-isolated", "dream-implementer-critical",
             "dream-coordinator-recovery", "dream-gate-verifier",
             "dream-collector", "dream-reporter", "dream-implementer-suite"):
    case("UNRESTRICTED %s Write src" % role, write(role, "src/lib/schema.ts"), "allow")
    case("UNRESTRICTED %s Bash redirect" % role, bash(role, "echo x >> .program/ledger/events/ROOT.jsonl"), "allow")
    case("UNRESTRICTED %s git add" % role, bash(role, "git add -A && git commit -m x"), "allow")
case("UNRESTRICTED main session (no agent_type)", payload(None, "Write", {"file_path": "src/x.ts"}), "allow")
case("UNRESTRICTED unknown role", write("some-other-agent", "src/x.ts"), "allow")

# --- hook-failure cases: must fail OPEN -------------------------------------
case("HOOKFAIL not json", None, "allow", raw="this is not json")
case("HOOKFAIL empty stdin", None, "allow", raw="")
case("HOOKFAIL json array", None, "allow", raw="[1,2,3]")
case("HOOKFAIL tool_input not dict", payload(REVIEWER, "Write", None), "deny")

def run(pl, raw):
    data = raw if raw is not None else json.dumps(pl)
    p = subprocess.run([sys.executable, HOOK], input=data.encode("utf-8"),
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=CWD)
    return p

fails = []
for name, pl, expect, raw in CASES:
    p = run(pl, raw)
    if p.returncode != 0:
        fails.append((name, "EXIT %d (must be 0)" % p.returncode))
        continue
    try:
        out = json.loads(p.stdout.decode("utf-8").strip().splitlines()[-1])
        got = out["hookSpecificOutput"]["permissionDecision"]
    except Exception as e:
        fails.append((name, "unparseable stdout %r (%r)" % (p.stdout[:200], e)))
        continue
    if got != expect:
        fails.append((name, "expected %s got %s" % (expect, got)))

print("cases: %d   failures: %d" % (len(CASES), len(fails)))
for n, why in fails:
    print("  FAIL", n, "->", why)
sys.exit(1 if fails else 0)
