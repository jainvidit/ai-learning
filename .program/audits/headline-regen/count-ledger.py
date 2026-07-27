r"""Derive real item counts/statuses from .program/ledger/items/ for HEADLINE.md.

HEADLINE.md is agent-read context, so a stale count is not cosmetic - a director
reading "Done: 12" plans against a ledger that says something else. This reads the
item files rather than trusting the previous HEADLINE.

Status lives in YAML-ish frontmatter or a `**Status:**`/`status:` line depending on
the item's vintage, so both shapes are handled.
"""
import glob
import io
import os
import re
from collections import Counter, defaultdict

ITEMS = os.path.join(".program", "ledger", "items")

status_of = {}
gen_of = {}
blocked_reason = {}

for p in sorted(glob.glob(os.path.join(ITEMS, "*.md"))):
    item = os.path.basename(p)[:-3]
    text = io.open(p, encoding="utf-8", errors="replace").read()
    head = text[:4000]

    m = (re.search(r"^\s*status\s*:\s*[\"']?([A-Za-z_]+)", head, re.M | re.I)
         or re.search(r"^\s*\*\*Status:?\*\*\s*:?\s*([A-Za-z_]+)", head, re.M | re.I))
    status_of[item] = (m.group(1).lower() if m else "unknown")

    g = re.search(r"^\s*generation\s*:\s*(\d+)", head, re.M | re.I)
    if g:
        gen_of[item] = int(g.group(1))

    b = re.search(r"^\s*blocked_reason\s*:\s*[\"']?([^\"'\n]+)", head, re.M | re.I)
    if b:
        blocked_reason[item] = b.group(1).strip()

counts = Counter(status_of.values())
print("total items: %d" % len(status_of))
for s, n in counts.most_common():
    print("  %-28s %d" % (s, n))

by_status = defaultdict(list)
for k, v in status_of.items():
    by_status[v].append(k)


def sort_key(i):
    return [int(x) if x.isdigit() else x for x in re.split(r"[.]", i)]


for s in sorted(by_status):
    if s in ("proposed",):
        print("\n%s (%d): <omitted, too many>" % (s, len(by_status[s])))
        continue
    print("\n%s (%d):" % (s, len(by_status[s])))
    for i in sorted(by_status[s], key=sort_key):
        extra = ""
        if i in blocked_reason:
            extra = "  [%s]" % blocked_reason[i]
        if i in gen_of and gen_of[i] >= 3:
            extra += "  gen%d" % gen_of[i]
        print("   ", i, extra)

hi = [(g, i) for i, g in gen_of.items() if g >= 3]
print("\ngeneration >= 3: %s" % (sorted(hi, reverse=True) or "none"))
