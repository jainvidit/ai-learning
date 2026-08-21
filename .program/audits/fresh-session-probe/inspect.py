"""Did the write-scope hook load in the fresh (headless) session?

The probe's restricted agents both self-declined, so the hook was never handed a
write command and no denial row could appear. That leaves the question open, and
the transcript is the only other place to look: a hook_success attachment proves
the hook was INVOKED, independent of what any agent reported.

Usage: python inspect.py <transcript.jsonl> [...]
"""
import json
import sys


def walk(o):
    """Yield every dict nested anywhere in o."""
    if isinstance(o, dict):
        yield o
        for v in o.values():
            for d in walk(v):
                yield d
    elif isinstance(o, list):
        for v in o:
            for d in walk(v):
                yield d


for path in sys.argv[1:]:
    hooks = []
    sids = set()
    sidechain = 0
    tools = {}
    with open(path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except ValueError:
                continue
            if rec.get("sessionId"):
                sids.add(rec["sessionId"])
            if rec.get("isSidechain"):
                sidechain += 1
            for d in walk(rec):
                t = d.get("type")
                if t in ("hook_success", "hook_error", "hook_blocked"):
                    hooks.append((t, d.get("hookName"), (d.get("content") or "")))
                if t == "tool_use" and d.get("name"):
                    tools[d["name"]] = tools.get(d["name"], 0) + 1

    print("=" * 70)
    print(path.rsplit("/", 1)[-1])
    print("  session ids   :", ", ".join(sorted(sids)) or "(none)")
    print("  sidechain recs:", sidechain)
    print("  tool calls    :", ", ".join("%s=%d" % kv for kv in sorted(tools.items())))
    print("  hook records  :", len(hooks))
    banner = 0
    for t, name, content in hooks:
        flag = ""
        if "Microsoft Windows" in content or "More?" in content:
            banner += 1
            flag = "  <-- CMD BANNER"
        print("    %-13s %-22s content=%-5s%s"
              % (t, name, repr(content)[:40], flag))
    print("  cmd banners   :", banner, "(0 = launcher reached cleanly)")
