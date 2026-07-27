"""Auditor check 14 - is the ADR-0014 write-scope hook actually running?

THE QUESTION THIS ANSWERS
    "Zero denials" is ambiguous. It reads identically as:
        (a) every restricted role complied, and
        (b) the hook never fired at all.
    (b) is not hypothetical. This hook once ran 49 times returning unparseable
    output, every one of which the harness read as ALLOW, and nothing anywhere
    recorded it. Subagent hook invocations leave no transcript record on this
    build, so a role's own self-restraint and a hook denial are indistinguishable
    from outside. Only a row in hook-denials.jsonl tells them apart.

    So the hook now emits a HEARTBEAT: one row per (session, agent) on a
    restricted role's first ALLOWED call. Presence proves it ran. Absence, when
    restricted roles were dispatched, means it is broken - which is exactly the
    failure that survived 38 generations undetected.

    Finding credited to dream-reviewer-primary, which raised it unprompted rather
    than manufacture a violation to test the deny branch.

USAGE
    python check-liveness.py <SESSION_ID>   # audit one session (the normal case)
    python check-liveness.py                # per-session coverage for the whole log

EXIT CODES
    0  rows found for the named session (hook live), or no session named
    1  the log is missing/unparseable, or the named session has ZERO rows
       -> BLOCKING per check 14, UNLESS no restricted role ran in that session,
          which this script cannot know. The auditor must confirm that before
          reporting it as a finding.
"""
import io
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
# HERE is <repo>/.program/audits/hook-liveness -> three levels up is the repo.
REPO = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
LOG = os.path.join(REPO, ".program", "audits", "hook-denials.jsonl")

RESTRICTED_PREFIXES = ("dream-reviewer-", "dream-ledger-auditor",
                       "dream-reader-", "dream-verifier")


def is_restricted(agent_type):
    return bool(agent_type) and str(agent_type).startswith(RESTRICTED_PREFIXES)


def main():
    want = sys.argv[1] if len(sys.argv) > 1 else None

    if not os.path.exists(LOG):
        print("BLOCKING: %s does not exist." % LOG)
        print("The hook has never written a record. It is not running, or its")
        print("log path is wrong. Check settings.json and the hook's DENIAL_LOG.")
        return 1

    rows, bad = [], 0
    with io.open(LOG, encoding="utf-8") as fh:
        for i, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except ValueError as e:
                bad += 1
                print("MALFORMED line %d: %s" % (i, e))

    print("log: %s" % LOG)
    print("rows: %d parsed, %d malformed" % (len(rows), bad))
    if bad:
        print("\nBLOCKING: the evidence log itself is corrupt. Repair before")
        print("trusting any liveness conclusion (ADR-0015 governs the format).")
        return 1

    # Per-session coverage. A session counts as covered if it has ANY row from a
    # restricted role - heartbeat or denial, both prove the hook ran.
    sessions = {}
    for r in rows:
        sid = r.get("session_id") or "(none)"
        s = sessions.setdefault(sid, {"heartbeat": 0, "denial": 0,
                                      "untagged": 0, "roles": set()})
        kind = r.get("kind")
        if kind in ("heartbeat", "denial"):
            s[kind] += 1
        else:
            # Rows written before the heartbeat change carry no `kind`. They are
            # all denials by construction - only denials were logged then.
            s["untagged"] += 1
        if is_restricted(r.get("agent_type")):
            s["roles"].add(r["agent_type"])

    print("\n%-40s %5s %5s %5s  %s"
          % ("session_id", "hb", "deny", "old", "restricted roles seen"))
    for sid in sorted(sessions):
        s = sessions[sid]
        print("%-40s %5d %5d %5d  %s"
              % (sid[:40], s["heartbeat"], s["denial"], s["untagged"],
                 ", ".join(sorted(s["roles"])) or "-"))

    if not want:
        print("\nNo session_id given, so this is coverage only, NOT a verdict.")
        print("Check 14 is per-session: rerun with the session under audit.")
        return 0

    s = sessions.get(want)
    total = 0 if not s else s["heartbeat"] + s["denial"] + s["untagged"]
    print("\n--- verdict for session %s ---" % want)
    if total:
        print("PASS: %d record(s) from restricted roles (%d heartbeat, %d denial,"
              " %d pre-heartbeat)."
              % (total, s["heartbeat"], s["denial"], s["untagged"]))
        print("The hook demonstrably ran for %s in this session."
              % (", ".join(sorted(s["roles"])) or "at least one restricted role"))
        return 0

    print("ZERO records from restricted roles in this session.")
    print("")
    print("This is BLOCKING **if** any restricted role was dispatched - confirm")
    print("that first; a session that dispatched none is not a finding, and must")
    print("be reported as neither pass nor fail. If one did run, the hook is not")
    print("firing. Check in order:")
    print("  1. .claude/settings.json PreToolUse command still resolves")
    print("  2. hasTrustDialogAccepted is true for this workspace in")
    print("     C:\\Users\\jainv\\.claude.json  (false drops hooks SILENTLY)")
    print("  3. the hook file still parses:")
    print("     python -c \"import ast,io;ast.parse(io.open("
          "'.claude/hooks/role-write-scope.py',encoding='utf-8').read())\"")
    return 1


if __name__ == "__main__":
    sys.exit(main())
