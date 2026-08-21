# Evidence-file sweep — all 13 done items (content-level)

Run: 2026-07-27 ~05:00–05:04Z, agent dream-ledger-auditor-deep. Persisted by
director-gen40. Trigger: ROOT.1.1.3 0-byte evidence finding; owner directed the same
check across every done item. Framing (owner's): empty ≠ fabrication — clean tsc/eslint
runs produce no output; the defect is a format that cannot distinguish clean-run from
never-ran. Re-runs establish which it was.

## Bottom line: 12 of 13 items fully sound after sweep; 0 fabrication; 2 bookkeeping
defects (both CLEAN-RUN-CONFIRMED by re-run), one of them already remediated.

| Item | Cited evidence | Classification | Re-run verdict | New capture |
|---|---|---|---|---|
| ROOT.1.1.1 | 16 md/txt files | all non-empty | n/a | — |
| ROOT.1.1.2 | 6 files | **tsc-noemit.txt 0B, eslint-owned-files.txt 0B**; 4 non-empty | **CLEAN-RUN-CONFIRMED exit 0** (both) | tsc-noemit-audit-20260727-ROOT.1.1.2.txt, eslint-owned-audit-20260727-ROOT.1.1.2.txt |
| ROOT.1.1.3 | 3 files | 2× 0B (originals) | already remediated 2026-07-27 (EXIT_CODE=0 captures) | existing |
| ROOT.1.2 | coordinator — no direct evidence (children carry it) | n/a | n/a | — |
| ROOT.1.2.1 | 9 txt in .program/evidence/ROOT.1.2.1/ | all non-empty | n/a | — |
| ROOT.1.2.2 | shape-typecheck.txt 3.2K | non-empty | n/a | — |
| ROOT.1.2.3 | objectiveskills-conformance.md 3.2K | non-empty | n/a | — |
| ROOT.1.2.4 | model-router.md 28K | non-empty doc | n/a-doc | — |
| ROOT.1.2.5 | contract-typecheck.md 9.9K | non-empty | n/a | — |
| ROOT.1.2.6 | gen1+gen2 verification.md | all non-empty | n/a | — |
| ROOT.1.7 | probes-mdx-archival.md 2.9K | non-empty doc | n/a-doc | — |
| ROOT.1.9 | probe doc 4.6K + 2 probe scripts | all non-empty | n/a | — |
| ROOT.7.2 | 9 txt files 278B–4.8K | all non-empty | n/a | — |

Full-suite re-runs during sweep (deduped once each): npm test 86/86 PASS; npx tsc
--noEmit exit 0; npm run build PASS (14/14 static pages, 15 routes); per-file eslint
exit 0 for both affected items. No UNRESOLVED-EXPENSIVE items (verify:e2e never cited
by an empty capture).

## Findings
- **ROOT.1.1.2 — low, bookkeeping**: same defect class as ROOT.1.1.3 (same gen0-era
  capture pattern). Work correct; new EXIT_CODE=0 captures written beside 0-byte
  originals, which are retained as defect evidence.
- **ROOT.1.1.3 — low, bookkeeping**: previously found and remediated; included for
  inventory completeness.

## Systemic root cause (confirmed program-wide, now closed)
No non-empty assertion on evidence capture. Closed by: (a) auditor check 1 hardened to
content-level (0-byte cited evidence = finding; missing EXIT_CODE line = minor-legacy),
(b) standing rule for all future dispatches: `{ <command>; echo "EXIT_CODE=$?"; } > file 2>&1`.
