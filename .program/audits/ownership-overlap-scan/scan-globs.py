import io, glob, re, os, json, itertools

# ---- load every item -------------------------------------------------------
items = {}
for p in sorted(glob.glob(".program/ledger/items/*.md")):
    t = io.open(p, encoding="utf-8").read()
    fm = t.split("---", 2)[1] if t.startswith("---") else ""

    def g(k):
        m = re.search(r"^" + k + r":\s*(.*)$", fm, re.M)
        return m.group(1).strip() if m else ""

    def lst(k):
        v = g(k)
        if not v or v in ("[]", "~", "null"):
            return []
        v = v.strip()
        if v.startswith("["):
            try:
                return json.loads(v)
            except Exception:
                return [x.strip().strip('"').strip("'") for x in v[1:-1].split(",") if x.strip()]
        # block list form
        out = []
        m = re.search(r"^" + k + r":\s*$((?:\n\s+-.*)+)", fm, re.M)
        if m:
            out = [l.strip()[1:].strip().strip('"').strip("'") for l in m.group(1).strip().split("\n")]
        return out or [v.strip('"')]

    iid = g("id") or os.path.basename(p)[:-3]
    items[iid] = dict(
        id=iid, status=g("status"), type=g("type"), title=g("title"),
        parent=g("parent"), own=lst("file_ownership"),
        dep=lst("depends_on"), blocks=lst("blocks"), children=lst("children"),
    )

print("items loaded:", len(items))

# ---- glob overlap test -----------------------------------------------------
def seg_to_re(g_):
    """Translate a path glob to a regex, ** spanning separators."""
    out, i = "", 0
    g_ = g_.replace("\\", "/")
    while i < len(g_):
        c = g_[i]
        if g_.startswith("**", i):
            out += ".*"
            i += 2
            if g_.startswith("/", i):
                i += 1
        elif c == "*":
            out += "[^/]*"
            i += 1
        elif c == "?":
            out += "[^/]"
            i += 1
        else:
            out += re.escape(c)
            i += 1
    return out

def can_overlap(a, b):
    """True if some concrete path could match both globs."""
    if a == b:
        return True, a
    ra, rb = re.compile(seg_to_re(a) + "$"), re.compile(seg_to_re(b) + "$")
    # a literal that matches the other's pattern
    if "*" not in a and "?" not in a and rb.match(a):
        return True, a
    if "*" not in b and "?" not in b and ra.match(b):
        return True, b
    # both contain wildcards: test structural prefix containment
    if "*" in a or "*" in b:
        pa, pb = a.split("**")[0], b.split("**")[0]
        if "**" in a and (pb.startswith(pa) or pa.startswith(pb)):
            probe = (pb if len(pb) > len(pa) else pa).rstrip("/")
            for cand in (probe + "/x", probe + "/x/y", probe + "x"):
                if ra.match(cand) and rb.match(cand):
                    return True, cand + "  (constructed witness)"
        if "**" in b and (pa.startswith(pb) or pb.startswith(pa)):
            probe = (pa if len(pa) > len(pb) else pb).rstrip("/")
            for cand in (probe + "/x", probe + "/x/y", probe + "x"):
                if ra.match(cand) and rb.match(cand):
                    return True, cand + "  (constructed witness)"
        # e.g. velite.config.*  vs  velite.config.ts
        base_a, base_b = a.rsplit("/", 1)[-1], b.rsplit("/", 1)[-1]
        dir_a, dir_b = a.rsplit("/", 1)[0] if "/" in a else "", b.rsplit("/", 1)[0] if "/" in b else ""
        if dir_a == dir_b and ("*" in base_a or "*" in base_b):
            stem = base_a.replace("*", "zz") if "*" in base_a else base_b.replace("*", "zz")
            cand = (dir_a + "/" if dir_a else "") + stem
            if ra.match(cand) and rb.match(cand):
                return True, cand + "  (constructed witness)"
    return False, None

# ---- dependency closure: is one item ordered before the other? -------------
dep = {i: set(v["dep"]) for i, v in items.items()}
for i, v in items.items():                     # normalize 'blocks' into dep edges
    for b in v["blocks"]:
        if b in dep:
            dep[b].add(i)

def ancestors(i, seen=None):
    seen = seen or set()
    for d in dep.get(i, ()):
        if d not in seen:
            seen.add(d)
            ancestors(d, seen)
    return seen

closure = {i: ancestors(i) for i in items}

def is_ancestor_item(a, b):
    """True if a is an ancestor of b in the parent/child tree (parents legitimately
    own the union of their children's paths)."""
    cur = items.get(b, {}).get("parent", "")
    while cur:
        if cur == a:
            return True
        cur = items.get(cur, {}).get("parent", "")
    return False

# ---- scan every pair -------------------------------------------------------
def phase_of(i):
    """Top-level phase, e.g. ROOT.1.1.4 -> 1. ROOT itself -> None."""
    p = i.split(".")
    return p[1] if len(p) > 1 and p[1].isdigit() else None

ORDERED = {"1", "2", "3", "4", "5"}   # ROOT.1..ROOT.5 strictly ordered; ROOT.6 parked, ROOT.7 standing

def phase_serialized(a, b):
    pa, pb = phase_of(a), phase_of(b)
    return pa in ORDERED and pb in ORDERED and pa != pb

def descends_from(x, p):
    cur = items.get(x, {}).get("parent", "")
    while cur:
        if cur == p:
            return True
        cur = items.get(cur, {}).get("parent", "")
    return False

def parent_completion_serialized(a, b):
    """A parent may not be `done` while any child is not done (ledger invariant).
    So if A depends on P and B is a descendant of P, B necessarily finishes before A
    becomes ready — even though no direct depends_on edge exists between A and B."""
    for x, y in ((a, b), (b, a)):
        for d in closure.get(x, ()):
            if descends_from(y, d):
                return True
    return False

ACTIVE = ("in_progress", "ready", "in_review", "changes_requested", "interrupted")
rows = []
for a, b in itertools.combinations(sorted(items), 2):
    A, B = items[a], items[b]
    if not A["own"] or not B["own"]:
        continue
    hits = []
    for ga in A["own"]:
        for gb in B["own"]:
            ok, w = can_overlap(ga, gb)
            if ok:
                hits.append((ga, gb, w))
    if not hits:
        continue
    dep_serialized = (a in closure.get(b, ())) or (b in closure.get(a, ()))
    ph_serialized = phase_serialized(a, b)
    pc_serialized = parent_completion_serialized(a, b)
    # a `done` item never writes again, so it cannot race anything
    done_serialized = A["status"] == "done" and B["status"] == "done"
    serialized = dep_serialized or ph_serialized or pc_serialized or done_serialized
    nested = is_ancestor_item(a, b) or is_ancestor_item(b, a)
    both_active = A["status"] in ACTIVE and B["status"] in ACTIVE
    rows.append(dict(a=a, b=b, sa=A["status"], sb=B["status"], hits=hits,
                     serialized=serialized, dep_serialized=dep_serialized,
                     ph_serialized=ph_serialized, pc_serialized=pc_serialized,
                     done_serialized=done_serialized, nested=nested, both_active=both_active))

def show(title, pred):
    sel = [r for r in rows if pred(r)]
    print("\n" + "=" * 78)
    print(f"{title}  ({len(sel)} pairs)")
    print("=" * 78)
    for r in sel:
        flags = []
        if r["nested"]:
            flags.append("parent/child")
        if r["dep_serialized"]:
            flags.append("serialized by depends_on")
        if r["ph_serialized"]:
            flags.append("serialized by phase order")
        if r["pc_serialized"]:
            flags.append("serialized by parent-completion")
        if r["done_serialized"]:
            flags.append("both done - neither writes again")
        f = ("  [" + ", ".join(flags) + "]") if flags else "  [UNSERIALIZED]"
        print(f"\n{r['a']} ({r['sa']})  <->  {r['b']} ({r['sb']}){f}")
        for ga, gb, w in r["hits"][:6]:
            print(f"    {ga}   ~   {gb}" + (f"      witness: {w}" if w and "witness" in str(w) else ""))
        if len(r["hits"]) > 6:
            print(f"    ... +{len(r['hits'])-6} more glob pairs")

show("A. BOTH CURRENTLY ACTIVE — live collision risk now",
     lambda r: r["both_active"] and not r["nested"] and not r["serialized"])
show("B. BOTH CURRENTLY ACTIVE — parent/child or already serialized (benign)",
     lambda r: r["both_active"] and (r["nested"] or r["serialized"]))
show("C. LATENT — would collide if both became ready; NOT serialized, NOT nested",
     lambda r: not r["both_active"] and not r["nested"] and not r["serialized"])

print("\n" + "=" * 78)
print("SUMMARY")
print("=" * 78)
print("pairs sharing at least one path:", len(rows))
print("  live + unserialized (must fix):",
      len([r for r in rows if r["both_active"] and not r["nested"] and not r["serialized"]]))
print("  latent + unserialized (report):",
      len([r for r in rows if not r["both_active"] and not r["nested"] and not r["serialized"]]))
print("  benign (parent/child or serialized):",
      len([r for r in rows if r["nested"] or r["serialized"]]))
