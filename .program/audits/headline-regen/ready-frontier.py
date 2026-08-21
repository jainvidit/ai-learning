r"""THE ready frontier. Authoritative - the director reads this, never derives it by hand.

WHY THIS SCRIPT IS THE DEFINITION, NOT A REPORT
    Readiness has TWO conditions, and the obvious one is not sufficient:

      (1) every id in `depends_on` is `done`, AND
      (2) the item's PHASE GATE is closed.

    Condition (2) was missing from the readiness rule until 2026-07-27, and the gap is a
    correctness bug rather than a display one. Seven items - ROOT.2.1, ROOT.3.1, ROOT.4.1,
    ROOT.4.5, ROOT.4.7, ROOT.5.1, ROOT.5.3 - have every `depends_on` edge satisfied while
    Phase 0 is still open. A director computing readiness from `depends_on` alone offers all
    seven as dispatchable and starts Phases 1-4 concurrently with Phase 0, which the
    glossary forbids: "Phases ROOT.1-ROOT.5 are strictly ordered: Phase N+1 may not start
    before Phase N's Gate passes."

    The edges are not wrong, and adding more of them is not the fix. Phase ordering is a
    property of the phase, not of any one item's dependency list; encoding it as edges would
    mean fanning every cross-phase pair into every item file and keeping them in sync.

GATE MAP (from the item files; type: Gate, one per ordered phase)
    Phase 0  ROOT.1 -> ROOT.1.8      Phase 3  ROOT.4 -> ROOT.4.9
    Phase 1  ROOT.2 -> ROOT.2.5      Phase 4  ROOT.5 -> ROOT.5.6
    Phase 2  ROOT.3 -> ROOT.3.6

    An item in phase N is gated by the gates of phases 0..N-1, all of which must be `done`.
    Phase 0 items have no entry gate. ROOT.6 (Phase 5) is parked (ADR-0001). ROOT.7 is a
    phase-typed container EXEMPT from ordering (ADR-0007): it holds cross-phase stewardship
    and the verification surface, and its children carry their own edges.

    A Gate item sits in its own phase, so it is gated only by the phases before it -
    ROOT.1.8 is dispatchable during Phase 0, which is the entire point of it.

Exit 0 always; this reports, it does not judge. Auditor check 15 is what makes a dispatch
past an open gate a BLOCKING finding.
"""
import glob
import io
import os
import re

ITEMS = os.path.join(".program", "ledger", "items")

# Phase -> the Gate item that closes it. Ordered.
PHASE_GATES = [
    ("ROOT.1", "ROOT.1.8"),
    ("ROOT.2", "ROOT.2.5"),
    ("ROOT.3", "ROOT.3.6"),
    ("ROOT.4", "ROOT.4.9"),
    ("ROOT.5", "ROOT.5.6"),
]
EXEMPT_PHASES = {"ROOT.7"}   # ADR-0007
PARKED_PHASES = {"ROOT.6"}   # ADR-0001

status, deps, children, title, itype = {}, {}, {}, {}, {}

for p in sorted(glob.glob(os.path.join(ITEMS, "*.md"))):
    item = os.path.basename(p)[:-3]
    head = io.open(p, encoding="utf-8", errors="replace").read()[:4000]
    m = (re.search(r"^\s*status\s*:\s*[\"']?([A-Za-z_]+)", head, re.M | re.I)
         or re.search(r"^\s*\*\*Status:?\*\*\s*:?\s*([A-Za-z_]+)", head, re.M | re.I))
    status[item] = m.group(1).lower() if m else "unknown"
    t = re.search(r"^\s*title\s*:\s*(.+)$", head, re.M)
    title[item] = t.group(1).strip() if t else ""
    ty = re.search(r"^\s*type\s*:\s*(\w+)", head, re.M)
    itype[item] = ty.group(1) if ty else "?"
    d = re.search(r"^\s*depends_on\s*:\s*\[(.*?)\]", head, re.M | re.S)
    deps[item] = [x.strip().strip("\"'") for x in d.group(1).split(",") if x.strip()] if d else []
    c = re.search(r"^\s*children\s*:\s*\[(.*?)\]", head, re.M | re.S)
    children[item] = [x.strip().strip("\"'") for x in c.group(1).split(",") if x.strip()] if c else []


def phase_of(item):
    """Top-level ancestor: ROOT.4.5.2 -> ROOT.4. ROOT itself has no phase."""
    parts = item.split(".")
    return ".".join(parts[:2]) if len(parts) >= 2 else None


def open_entry_gates(item):
    """Gates that must be `done` before this item's phase may start, and are not."""
    ph = phase_of(item)
    if ph is None or ph in EXEMPT_PHASES:
        return []
    if ph in PARKED_PHASES:
        return ["<phase parked: %s>" % ph]
    names = [g[0] for g in PHASE_GATES]
    if ph not in names:
        return []
    return [gate for _, gate in PHASE_GATES[:names.index(ph)] if status.get(gate) != "done"]


def sk(i):
    return [int(x) if x.isdigit() else x for x in i.split(".")]


ready, gated, unmet = [], [], []

for i in sorted(status, key=sk):
    if status[i] in ("done", "cancelled", "blocked") or children.get(i):
        continue
    bad_deps = [d for d in deps[i] if status.get(d) != "done"]
    gates = open_entry_gates(i)
    if bad_deps:
        unmet.append((i, bad_deps))
    elif gates:
        gated.append((i, gates))
    else:
        ready.append(i)

print("READY FRONTIER: %d item(s)  -- depends_on satisfied AND phase gate closed" % len(ready))
for i in ready:
    print("   %-14s %-10s %-11s %s" % (i, itype[i], status[i], title[i][:56]))

print("\nNOT READY - depends_on satisfied but PHASE GATE OPEN: %d item(s)" % len(gated))
print("   These are the ones a depends_on-only scan offers wrongly. Do NOT dispatch them.")
for i, g in gated:
    print("   %-14s %-12s open gate(s): %s" % (i, status[i], ", ".join(g)))

print("\nNOT READY - unmet depends_on: %d item(s)" % len(unmet))
for i, d in unmet:
    print("   %-14s waiting on %s" % (i, ", ".join(d)))

print("\nGATE STATUS")
for ph, gate in PHASE_GATES:
    print("   %-8s gate %-10s %-10s (phase %s)" % (ph, gate, status.get(gate, "MISSING"),
                                                   status.get(ph, "?")))
print("   ROOT.7   exempt from ordering (ADR-0007);  ROOT.6 parked (ADR-0001)")
