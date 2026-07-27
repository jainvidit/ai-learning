# Audit checks 1–15: existence-level vs content-level classification

Run: 2026-07-27 ~04:58Z, agent dream-reader-corpus (read-only). Persisted by
director-gen40. Trigger: a 0-byte evidence file on ROOT.1.1.3 passed one review and two
routine audits because every layer checked that the file EXISTS, not what it CONTAINS.

## Classification (8 weak: 3 existence-level, 5 hybrid — all upgraded cheaply except check 2)

| # | Class | Weakness | Disposition |
|---|---|---|---|
| 1 | EXISTENCE | cited evidence file may be 0 bytes / unparseable | **FIXED** — size check + EXIT_CODE-line rule added to role file |
| 2 | EXISTENCE | artifact exists but could be stub/wrong content | **STRUCTURAL** — spec-aware inspection; deliberately left to review, limit documented in role file |
| 3 | CONTENT | — | clean (graph walked from parsed front matter) |
| 4 | HYBRID | heartbeat may be unparseable timestamp | **FIXED** — fromisoformat parse required |
| 5 | CONTENT | — | clean (scan-globs.py parses + tests overlaps) |
| 6 | CONTENT | — | clean |
| 7 | HYBRID | frontmatter may be malformed YAML → silent inherit | **FIXED** — yaml.safe_load required, YAMLError = BLOCKING |
| 8 | HYBRID | byte-identical corrupt pair passes diff | **FIXED** — UTF-8 decode + `---` fence check |
| 9 | EXISTENCE | handoff file may be ~empty | **FIXED** — <50 chars = same finding as missing |
| 10 | CONTENT | — | clean (line-by-line JSON parse) |
| 11 | CONTENT | — | clean (frontmatter memory-key search) |
| 12 | CONTENT | — | clean (explicit json.loads per line) |
| 13 | CONTENT | — | clean (sweep.py parses transcript records) |
| 14 | CONTENT | — | clean (check-liveness.py parses records) |
| 15 | HYBRID | spawn event may lack parseable ts | **FIXED** — undatable spawn is itself a finding |

## Fixes applied by director (2026-07-27)

Role file `.program/roles/dream-ledger-auditor.md` amended on checks 1, 2 (limit
documented), 4, 7, 8, 9, 15; user-scope copy regenerated from the mirror. Check 2's
content-level upgrade is structural (per-artifact-type spec-aware inspection) and is NOT
adopted — blind review remains the content check for artifacts; the role file now states
this limit explicitly so no future audit claims coverage it doesn't have.

Standing rule (from the same incident, recorded in routine-audit-2 and the ROOT.1.1.3
events): all future evidence captures use `{ <command>; echo "EXIT_CODE=$?"; } > file 2>&1`
so a clean silent run is distinguishable from a never-ran.
