"""Structural compaction count — closes the 17-vs-154 dispute.

Counts compact_boundary ONLY as a structural marker: a top-level JSON field value
(type=='system' and subtype=='compact_boundary', or type=='compact_boundary').
Never as a substring — transcripts of agents that GREP for the string contain it
in command/output fields, which is how substring scans inflate every successive
audit's count (grep-contamination).

Also reports, for contrast, the substring file count so the contamination
hypothesis is checkable from one run. Attribution: first item-ID-shaped token
(ROOT[.N]*) and any dream-* role name in the first 5 parseable lines.

Run: python .program/audits/compaction-attribution/structural-count.py
Read-only; prints a bounded summary. Output stays small regardless of corpus size.
"""
import io, json, glob, os, re, sys

BASE = r"C:/Users/jainv/.claude/projects/C--Users-jainv-workplace-ai-learning-app"
ITEM_RE = re.compile(r"\bROOT(?:\.\d+)*\b")
ROLE_RE = re.compile(r"\bdream-[a-z-]+\b")

files = sorted(glob.glob(BASE + "/**/*.jsonl", recursive=True))
total_true = 0
substring_files = 0
unparseable_total = 0
hits = []  # (path, count, pretokens_vals, item, role)

for p in files:
    true_count = 0
    pretok = []
    has_substring = False
    head = []
    unparseable = 0
    try:
        with io.open(p, encoding="utf-8", errors="replace") as f:
            for line in f:
                if not line.strip():
                    continue
                if "compact_boundary" in line:
                    has_substring = True
                try:
                    rec = json.loads(line)
                except Exception:
                    unparseable += 1
                    continue
                if len(head) < 5:
                    head.append(line[:2000])
                if not isinstance(rec, dict):
                    continue
                if rec.get("type") == "compact_boundary" or (
                    rec.get("type") == "system" and rec.get("subtype") == "compact_boundary"
                ):
                    true_count += 1
                    for k in ("preTokens", "pre_tokens", "preCompactTokens"):
                        v = rec.get(k) or (rec.get("compactMetadata") or {}).get(k)
                        if v is not None:
                            pretok.append((k, v))
    except OSError as e:
        print("UNREADABLE", p, e)
        continue
    unparseable_total += unparseable
    if has_substring:
        substring_files += 1
    if true_count:
        total_true += true_count
        blob = "\n".join(head)
        item_m = ITEM_RE.search(blob)
        role_m = ROLE_RE.search(blob)
        rel = os.path.relpath(p, BASE)
        hits.append((rel, true_count, pretok, item_m.group(0) if item_m else "NON-ITEM",
                     role_m.group(0) if role_m else "?"))

print(f"files scanned: {len(files)}")
print(f"TRUE structural compact_boundary records: {total_true} in {len(hits)} file(s)")
print(f"files containing the SUBSTRING anywhere: {substring_files}  (substring - structural = contamination)")
print(f"unparseable lines skipped: {unparseable_total}")
print()
print("file | true_count | preTokens | attributed item | role")
for rel, c, pt, item, role in hits:
    pts = ";".join(f"{k}={v}" for k, v in pt) if pt else "absent"
    print(f"{rel} | {c} | {pts} | {item} | {role}")
