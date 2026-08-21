#!/usr/bin/env python
"""PreToolUse hook - enforces the ADR-0014 per-role write scope.

WHY THIS EXISTS
    ADR-0014 narrowed the reviewer/auditor "read-only" guarantee to a PATH rule:
    reviewers and auditors may write only under `.program/audits/**`; readers and
    verifiers write nothing. Two other mechanisms were tried and rejected
    (evidence in ADR-0014):

      * `tools:` frontmatter      - cannot express it; these roles keep Bash
                                    deliberately, and Bash writes anywhere.
      * settings.json deny rules  - session-wide, so they cannot say "reviewers
                                    only" without also binding the director,
                                    who must write the ledger.

    A PreToolUse hook is the only mechanism that sees WHICH agent is calling:
    the payload carries `agent_type` and `agent_id`.

THE GUARD SPLIT - read this before editing
    Two kinds of uncertainty, two opposite defaults:

      * Uncertain about the COMMAND, hook working  -> DENY (fail closed).
        A restricted role issuing something this script cannot decompose does
        not get the benefit of the doubt.
      * Uncertain about the HOOK - bad payload, internal exception, any bug
        -> ALLOW (fail open), and log it.
        This hook runs on EVERY Write/Edit/Bash call by EVERY agent. A hook that
        fails closed on its own bug is a total program outage, not a safety
        measure. Recovery from a hook lockout requires an EXTERNAL shell: with
        the hook denying Bash and Write, the session cannot repair the file that
        is breaking it, and the Edit deny rule on settings*.json closes the other
        route. This has happened once already (ADR-0014).

    Consequences enforced below:
      * main() wraps EVERYTHING in try/except and always prints a valid
        decision. This script must never exit non-zero and never print nothing;
        either is treated as "block" by the harness.
      * Unrestricted roles short-circuit before any command analysis, so a bug
        in the analyzer cannot stop an implementer, coordinator or the director.

    NEVER reference a new version of this file from settings.json before running
    it standalone from an external shell. Verification first is a prerequisite,
    not a good practice.

BASH INSPECTION
    Inspect the whole command string, not just paths: a path-based deny rule was
    defeated by `tee` in testing (ADR-0014), so write verbs are enumerated.

HEARTBEAT - why allows are logged too
    Finding credited to `dream-reviewer-primary`, which raised it unprompted when
    asked to probe its own deny branch (2026-07-27):

        Zero denials is AMBIGUOUS. It reads identically as "every restricted role
        complied" and "the hook is not firing at all". A reader cannot tell the
        two apart, and a silent hook is indistinguishable from an absent one.

    That is not hypothetical: 49 invocations of this hook once returned
    unparseable output, every one of which the harness read as allow, and no
    artifact anywhere recorded it. The reviewer also declined to manufacture a
    violation to close the gap, correctly - the fix belongs in the evidence
    design, not in an agent breaking a rule to prove the rule is enforced.

    So one HEARTBEAT record is written per (session, agent) the first time a
    restricted role's call is allowed. Presence of a heartbeat proves the hook
    ran for that role in that session; absence is now a finding (auditor
    check 14) rather than an absence of evidence.

    Restricted roles ONLY. Implementers, coordinators and the director
    short-circuit before this point and are never logged: they generate the bulk
    of all tool calls, and logging them would bury the signal this exists to
    surface. One row per agent per session, not one per call, for the same
    reason.

    KNOWN LIMIT: the settings.json matcher is `Write|Edit|NotebookEdit|Bash`, so
    a restricted role that works purely through Read/Grep/Glob never reaches this
    hook and emits no heartbeat. Observed with a live reviewer answering from
    `Read` alone. Absence of a heartbeat therefore means "the hook did not run for
    a matched tool call", not "the role did nothing" - auditor check 14 has to
    check the role's tool calls before treating absence as a failure.
"""

import io
import json
import os
import re
import sys

# --- policy -----------------------------------------------------------------
# Keyed on agent_type prefix. AUDITS_ONLY and NO_WRITES are disjoint; a role
# matching neither is unrestricted and is never examined further.

AUDITS_ONLY_PREFIXES = ("dream-reviewer-", "dream-ledger-auditor")
NO_WRITES_PREFIXES = ("dream-reader-", "dream-verifier")

ALLOWED_WRITE_ROOT = ".program/audits/"

# Resolve the log relative to THIS FILE, not the caller's cwd. Worktree
# implementers and any agent that cd's elsewhere would otherwise scatter
# evidence into a second tree - and check 14 reads absence as failure, so a
# misplaced log is worse than none.
_REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DENIAL_LOG = os.path.join(_REPO, ".program", "audits", "hook-denials.jsonl")

# Marker directory for "this (session, agent) already has a heartbeat". Kept out
# of .program/audits/ so it never looks like evidence; it is bookkeeping.
HEARTBEAT_STATE = os.path.join(_REPO, ".program", "audits", ".heartbeat-state")

FILE_TOOLS = ("Write", "Edit", "NotebookEdit", "MultiEdit")

# Bash constructs that can create or modify a file.
WRITE_VERB_PATTERNS = [
    (r">>?(?!&)", "redirect"),                       # > and >> but not >&2
    (r"\btee\b", "tee"),                             # defeated the deny rule
    (r"\bcp\b", "cp"),
    (r"\bmv\b", "mv"),
    (r"\binstall\b", "install"),
    (r"\bdd\b", "dd"),
    (r"\bsed\b[^|;]*\s-[A-Za-z]*i", "sed -i"),
    (r"\bperl\b[^|;]*\s-[A-Za-z]*i", "perl -i"),
    (r"\btruncate\b", "truncate"),
    (r"\btouch\b", "touch"),
    (r"\bmkdir\b", "mkdir"),
    (r"\brm\b", "rm"),
    (r"\brmdir\b", "rmdir"),
    (r"\bln\b", "ln"),
    (r"\bchmod\b", "chmod"),
    (r"\bchown\b", "chown"),
    (r"\bgit\b\s+(add|commit|checkout|apply|restore|reset|rm|mv|stash|push)",
     "git write"),
    (r"\bnpm\b\s+(install|i|ci|publish|version|link)", "npm write"),
    (r"\bpip\b\s+install", "pip install"),
    (r"\b(python|python3|py|node|ruby|php)\b[^|;]*\s-(e|c)\b",
     "interpreter -e/-c"),
    (r"open\s*\([^)]*['\"][wax]", "python open(w)"),
    (r"writeFileSync|appendFileSync|createWriteStream|promises\.writeFile",
     "node fs write"),
    # PowerShell, in case the shell is pwsh rather than bash.
    (r"Out-File", "Out-File"),
    (r"Set-Content", "Set-Content"),
    (r"Add-Content", "Add-Content"),
    (r"New-Item", "New-Item"),
    (r"Copy-Item", "Copy-Item"),
    (r"Move-Item", "Move-Item"),
    (r"Remove-Item", "Remove-Item"),
    (r"Set-ItemProperty", "Set-ItemProperty"),
    (r"\[IO\.File\]::|System\.IO\.File", "dotnet IO.File"),
]


def policy_for(agent_type):
    """'audits_only', 'no_writes', or None (unrestricted)."""
    if not agent_type:
        return None
    at = str(agent_type)
    if at.startswith(AUDITS_ONLY_PREFIXES):
        return "audits_only"
    if at.startswith(NO_WRITES_PREFIXES):
        return "no_writes"
    return None


def normalize(path, cwd):
    """Absolute -> repo-relative, forward slashes, no leading './'."""
    if not path:
        return ""
    p = str(path).replace("\\", "/")
    cwdn = (cwd or "").replace("\\", "/").rstrip("/")
    if cwdn and p.lower().startswith(cwdn.lower() + "/"):
        p = p[len(cwdn) + 1:]
    elif cwdn and p.lower() == cwdn.lower():
        p = ""
    while p.startswith("./"):
        p = p[2:]
    return p


def inside_allowed(path, cwd):
    p = normalize(path, cwd)
    if not p:
        return False
    if ".." in p.split("/"):
        return False
    # An absolute path that did not reduce to repo-relative is outside the repo.
    if re.match(r"^(/|[A-Za-z]:)", p):
        return False
    return p.startswith(ALLOWED_WRITE_ROOT)


def bash_targets(cmd):
    """Path-ish tokens that could be write targets."""
    tokens = re.findall(r"[A-Za-z0-9_./\\:${}~*?-]+", cmd)
    out = []
    for t in tokens:
        if t.startswith("-"):
            continue
        if "/" in t or "\\" in t or re.search(r"\.[A-Za-z0-9]+$", t):
            out.append(t)
    return out


def decide(payload):
    """(decision, reason, tool). Fail CLOSED here - caller handles hook bugs."""
    agent_type = payload.get("agent_type")
    pol = policy_for(agent_type)
    if pol is None:
        # Short-circuit: never touch unrestricted roles.
        return "allow", "role not restricted by ADR-0014", None

    tool = payload.get("tool_name") or ""
    tin = payload.get("tool_input")
    if not isinstance(tin, dict):
        tin = {}
    cwd = payload.get("cwd") or ""

    if tool in FILE_TOOLS:
        if pol == "no_writes":
            return ("deny",
                    "%s writes nothing, anywhere (ADR-0014); return findings as "
                    "your result instead" % agent_type, tool)
        path = tin.get("file_path") or tin.get("notebook_path") or ""
        if not path:
            return ("deny",
                    "no file_path to check; failing closed (ADR-0014)", tool)
        if inside_allowed(path, cwd):
            return "allow", "within .program/audits/**", tool
        return ("deny",
                "%s may write only under .program/audits/** (ADR-0014); "
                "refused: %s" % (agent_type, normalize(path, cwd)), tool)

    if tool == "Bash":
        cmd = tin.get("command")
        if not isinstance(cmd, str) or not cmd.strip():
            return ("deny",
                    "unreadable Bash command from a restricted role; failing "
                    "closed (ADR-0014)", tool)
        hits = sorted(set(name for pat, name in WRITE_VERB_PATTERNS
                          if re.search(pat, cmd)))
        if not hits:
            return "allow", "no write verb detected", tool
        if pol == "no_writes":
            return ("deny",
                    "%s writes nothing, anywhere (ADR-0014); command contains: "
                    "%s" % (agent_type, ", ".join(hits)), tool)
        targets = bash_targets(cmd)
        if not targets:
            return ("deny",
                    "%s: write verb (%s) with no resolvable target; failing "
                    "closed (ADR-0014)" % (agent_type, ", ".join(hits)), tool)
        # Unresolvable tokens (variables, globs) count as outside.
        outside = [t for t in targets if not inside_allowed(t, cwd)]
        if outside:
            return ("deny",
                    "%s may write only under .program/audits/** (ADR-0014); %s "
                    "targeting: %s"
                    % (agent_type, ", ".join(hits), " ".join(outside[:6])),
                    tool)
        return "allow", "write confined to .program/audits/**", tool

    return "allow", "tool cannot write", tool


def log_record(record):
    """Append one evidence row. Never let logging turn a decision into a crash."""
    try:
        d = os.path.dirname(DENIAL_LOG)
        if d:
            os.makedirs(d, exist_ok=True)
        line = json.dumps(record, ensure_ascii=True)
        json.loads(line)          # ADR-0015 invariant: validate before append
        with io.open(DENIAL_LOG, "a", encoding="utf-8", newline="\n") as f:
            f.write(line + "\n")
    except Exception:
        pass


def _claim_heartbeat(session_id, agent_id, agent_type):
    """True if THIS call should write the heartbeat for this (session, agent).

    One row per agent per session. The claim must be atomic: several tool calls
    from the same agent can be in flight, and a check-then-write would emit
    duplicates. `os.open(O_CREAT|O_EXCL)` succeeds for exactly one caller.

    Fails OPEN in the logging sense - if the claim cannot be made for any
    reason, return False and write nothing. A missing heartbeat is a check-14
    finding, which is the correct failure direction: it reports a problem rather
    than hiding one.
    """
    try:
        os.makedirs(HEARTBEAT_STATE, exist_ok=True)
        key = "%s__%s__%s" % (session_id or "nosession",
                              agent_id or "noagent",
                              agent_type or "norole")
        key = re.sub(r"[^A-Za-z0-9_.-]", "_", key)[:180]
        fd = os.open(os.path.join(HEARTBEAT_STATE, key),
                     os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.close(fd)
        return True
    except FileExistsError:
        return False
    except Exception:
        return False


def _utc_now():
    import datetime
    return datetime.datetime.now(datetime.timezone.utc).strftime(
        "%Y-%m-%dT%H:%M:%SZ")


def emit(decision, reason):
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": decision,
        "permissionDecisionReason": reason}}))


def main():
    # Everything below fails OPEN. Uncertainty about the HOOK must not become a
    # program-wide outage; uncertainty about a COMMAND is handled in decide().
    try:
        raw = sys.stdin.read()
    except Exception as e:
        sys.stderr.write("role-write-scope: stdin unreadable: %r\n" % (e,))
        emit("allow", "hook could not read stdin; failing open")
        return

    try:
        payload = json.loads(raw)
        if not isinstance(payload, dict):
            raise ValueError("payload is not an object")
    except Exception as e:
        sys.stderr.write("role-write-scope: unparseable payload: %r\n" % (e,))
        log_record({"ts": _utc_now(), "agent_type": None, "agent_id": None,
                    "tool": None, "command": None,
                    "reason": "HOOK FAILURE (failed open): unparseable payload: "
                              "%r" % (e,), "session_id": None})
        emit("allow", "hook payload unparseable; failing open")
        return

    try:
        decision, reason, tool = decide(payload)
    except Exception as e:
        sys.stderr.write("role-write-scope: internal error: %r\n" % (e,))
        log_record({
            "ts": _utc_now(),
            "agent_type": payload.get("agent_type"),
            "agent_id": payload.get("agent_id"),
            "tool": payload.get("tool_name"),
            "command": None,
            "reason": "HOOK FAILURE (failed open): internal error: %r" % (e,),
            "session_id": payload.get("session_id"),
        })
        emit("allow", "hook internal error; failing open")
        return

    tin = payload.get("tool_input")
    if not isinstance(tin, dict):
        tin = {}

    if decision == "deny":
        log_record({
            "ts": payload.get("timestamp") or _utc_now(),
            "kind": "denial",
            "agent_type": payload.get("agent_type"),
            "agent_id": payload.get("agent_id"),
            "tool": tool,
            "command": tin.get("command") or tin.get("file_path")
                       or tin.get("notebook_path"),
            "reason": reason,
            "session_id": payload.get("session_id"),
        })
    elif policy_for(payload.get("agent_type")) is not None:
        # Allowed call by a RESTRICTED role -> heartbeat, once per (session,
        # agent). Unrestricted roles never reach here: decide() short-circuits
        # them, and policy_for() is re-checked so a future edit to decide()
        # cannot start logging implementer traffic by accident.
        if _claim_heartbeat(payload.get("session_id"),
                            payload.get("agent_id"),
                            payload.get("agent_type")):
            log_record({
                "ts": payload.get("timestamp") or _utc_now(),
                "kind": "heartbeat",
                "agent_type": payload.get("agent_type"),
                "agent_id": payload.get("agent_id"),
                "tool": tool,
                "command": None,
                "reason": "hook live for this role/session; first allowed call "
                          "(%s)" % reason,
                "session_id": payload.get("session_id"),
            })

    emit(decision, reason)


if __name__ == "__main__":
    try:
        main()
    except BaseException as e:            # absolute last resort
        try:
            sys.stderr.write("role-write-scope: fatal: %r\n" % (e,))
        except Exception:
            pass
        print('{"hookSpecificOutput":{"hookEventName":"PreToolUse",'
              '"permissionDecision":"allow",'
              '"permissionDecisionReason":"hook fatal error; failing open"}}')
        sys.exit(0)
