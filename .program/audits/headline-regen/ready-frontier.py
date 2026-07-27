r"""Derive the ready frontier: items not done/blocked whose depends_on are all done.

HEADLINE.md's "Ready frontier" line is what a fresh director dispatches from, so it
must come from depends_on edges, not from the previous HEADLINE.
"""
import glob, io, os, re

ITEMS = os.path.join(".program", "ledger", "items")
status, deps, children, title = {}, {}, {}, {}

for p in sorted(glob.glob(os.path.join(ITEMS, "*.md"))):
    item = os.path.basename(p)[:-3]
    head = io.open(p, encoding="utf-8", errors="replace").read()[:4000]
    m = (re.search(r"^\s*status\s*:\s*[\"']?([A-Za-z_]+)", head, re.M | re.I)
         or re.search(r"^\s*\*\*Status:?\*\*\s*:?\s*([A-Za-z_]+)", head, re.M | re.I))
    status[item] = m.group(1).lower() if m else "unknown"
    t = re.search(r"^\s*title\s*:\s*(.+)$", head, re.M)
    title[item] = t.group(1).strip() if t else ""
    d = re.search(r"^\s*depends_on\s*:\s*\[(.*?)\]", head, re.M | re.S)
    deps[item] = [x.strip().strip('"\'') for x in d.group(1).split(",") if x.strip()] if d else []
    c = re.search(r"^\s*children\s*:\s*\[(.*?)\]", head, re.M | re.S)
    children[item] = [x.strip().strip('"\'') for x in c.group(1).split(",") if x.strip()] if c else []

def sk(i):
    return [int(x) if x.isdigit() else x for x in i.split(".")]

print("READY (proposed, leaf, all depends_on done):")
for i in sorted(status, key=sk):
    if status[i] != "proposed" or children.get(i):
        continue
    unmet = [d for d in deps[i] if status.get(d) != "done"]
    if not unmet:
        print("   %-14s %s" % (i, title[i][:70]))

print("\nNOT-DONE non-leaf containers:")
for i in sorted(status, key=sk):
    if children.get(i) and status[i] != "done":
        print("   %-14s %-12s children=%d" % (i, status[i], len(children[i])))

print("\nIN-PROGRESS with unmet deps:")
for i in sorted(status, key=sk):
    if status[i] == "in_progress":
        unmet = [d for d in deps[i] if status.get(d) != "done"]
        print("   %-14s deps=%s unmet=%s" % (i, deps[i] or "-", unmet or "none"))
