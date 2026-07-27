"""Append one event line to a ledger event log, atomically.

USAGE
    python .program/ledger/append-event.py <ITEM_ID> <EVENT_JSON>

    python .program/ledger/append-event.py ROOT.1.2 '{"ts":"2026-07-27T04:00:00Z",
      "item":"ROOT.1.2","event":"status_change","by":"director-gen40","from":"proposed",
      "to":"ready","detail":"deps met"}'

    Pass the event as ONE argument of valid JSON. Do not build the line by hand in the
    shell; let your serializer produce it, or type it as literal JSON and let this script
    validate it. Exit 0 = appended and verified. Any non-zero exit = NOTHING was appended.

WHY THIS EXISTS — TWO DISTINCT DEFECTS, TWO DISTINCT FIXES (ADR-0015)
    Phase 3 found 7 unparseable lines. They were NOT the same defect:

      * ROOT.1.1.4.jsonl (2 lines) — RAW CONTROL CHARACTERS inside a string value.
        Fixed by: serializing with json.dumps instead of hand-assembling, and validating
        that the composed line parses BEFORE it touches the file.

      * ROOT.jsonl (4 lines) — records TRUNCATED mid-write, missing the closing brace.
        Validate-before-append does NOT prevent this. The line was already valid when the
        write began; the process died partway through the append, leaving a partial line
        in the file. No amount of pre-validation helps, because the corruption happens
        during the write, not before it.

    The truncation fix is this script's actual contribution: compose, validate, write the
    complete line to a TEMP FILE, fsync it, and only then append the temp file's bytes to
    the log in ONE operation. A kill before the final append leaves the log untouched; a
    kill after it leaves the log complete. The window in which a partial line can exist is
    closed, not merely narrowed.

    Both fixes are needed. Neither substitutes for the other.

CAVEAT, HONESTLY STATED
    A single write() of a short line to a local file is not a filesystem-level atomicity
    guarantee — POSIX makes no such promise for regular files, and this is Windows besides.
    What this removes is the multi-step, interpreter-level window that actually produced the
    four truncated records: JSON serialization, string building and encoding all complete
    before the log is opened for append. That is where the process died. If exact atomicity
    is ever required, the mechanism to reach for is a lock file, not a longer comment.
"""

import io
import json
import os
import sys
import tempfile

REQUIRED_KEYS = ("ts", "item", "event", "by")


def die(msg):
    sys.stderr.write("append-event: %s\n" % msg)
    sys.stderr.write("append-event: NOTHING WAS APPENDED.\n")
    sys.exit(1)


def sweep_stale_temps(events_dir):
    """Remove staging files orphaned by a killed writer. Never fatal."""
    import glob as _glob
    for t in _glob.glob(os.path.join(events_dir, ".append-*.tmp")):
        try:
            os.unlink(t)
        except OSError:
            pass


def main(argv):
    if len(argv) != 3:
        die("usage: append-event.py <ITEM_ID> <EVENT_JSON>")

    item_id, raw = argv[1], argv[2]

    # Resolve the log relative to THIS SCRIPT, not to the caller's cwd. The worktree
    # implementers (-isolated, -hardened, -critical) run with cwd inside a git worktree but
    # must write ledger events to the main checkout; a cwd-relative path would silently
    # create a second events tree inside the worktree, invisible to their parent.
    repo = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    log = os.path.join(repo, ".program", "ledger", "events", item_id + ".jsonl")

    # --- 1. compose + validate (fixes the ESCAPING defect) -------------------
    try:
        event = json.loads(raw)
    except Exception as e:
        die("event is not valid JSON: %r\n"
            "  Build it with a serializer (json.dumps), not by hand." % (e,))

    if not isinstance(event, dict):
        die("event must be a JSON object, got %s" % type(event).__name__)

    missing = [k for k in REQUIRED_KEYS if not event.get(k)]
    if missing:
        die("event is missing required key(s): %s" % ", ".join(missing))

    if event.get("item") != item_id:
        die("event['item'] is %r but the target log is %s.jsonl — one of them is wrong"
            % (event.get("item"), item_id))

    # Re-serialize from the parsed object: this is what guarantees escaping is correct
    # regardless of how the caller produced the input.
    line = json.dumps(event, ensure_ascii=False)
    if "\n" in line or "\r" in line:
        die("serialized line contains a raw newline — refusing to write")

    # Prove the exact bytes we are about to append parse on their own.
    try:
        json.loads(line)
    except Exception as e:
        die("composed line does not parse: %r" % (e,))

    if not os.path.isdir(os.path.dirname(log)):
        die("no events directory at %s" % os.path.dirname(log))

    # A process killed between mkstemp and the unlink in `finally` leaves its staging file
    # behind. Harmless — nothing reads them, and check 12 globs `*.jsonl` — but they
    # accumulate, and an unexplained dotfile next to the crash-recovery record invites
    # exactly the wrong guess during an incident. Sweep them first.
    sweep_stale_temps(os.path.dirname(log))

    # --- 2. stage the complete line in a temp file (fixes the TRUNCATION defect) ---
    tmp_dir = os.path.dirname(log)
    fd, tmp = tempfile.mkstemp(prefix=".append-", suffix=".tmp", dir=tmp_dir)
    os.close(fd)
    try:
        with io.open(tmp, "w", encoding="utf-8", newline="") as f:
            f.write(line + "\n")
            f.flush()
            os.fsync(f.fileno())

        payload = io.open(tmp, "rb").read()
        if not payload.endswith(b"\n"):
            die("staged line is incomplete — refusing to append")
        try:
            json.loads(payload.decode("utf-8").strip())
        except Exception as e:
            die("staged line does not parse: %r" % (e,))

        # --- 3. one append of already-complete bytes ------------------------
        with io.open(log, "ab") as f:
            f.write(payload)
            f.flush()
            os.fsync(f.fileno())
    finally:
        try:
            os.unlink(tmp)
        except OSError:
            pass

    # --- 4. verify the whole file still parses line-by-line -----------------
    bad = []
    total = 0
    for i, l in enumerate(io.open(log, encoding="utf-8"), 1):
        if not l.strip():
            continue
        total += 1
        try:
            json.loads(l)
        except Exception as e:
            bad.append((i, str(e)))

    if bad:
        sys.stderr.write("append-event: APPENDED, BUT THE FILE IS NOW MALFORMED:\n")
        for i, e in bad:
            sys.stderr.write("  line %d: %s\n" % (i, e))
        sys.stderr.write("append-event: repair %s before doing anything else.\n" % log)
        sys.exit(2)

    print("appended + parses (%s, %d records)" % (log, total))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
