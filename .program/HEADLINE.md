# Dream Program — Status Report

**Phase**: Phase 0 executing. **ROOT.1.1.4 DONE** (tier-2 both lenses approve);
**ROOT.1.1.5 + ROOT.7.3.1 in_review** — review dispatch is the gen43 first action.
**Counts (total 70)**: done 15 | in_progress 6 | in_review 2 | proposed 45 | blocked 2

Derived 2026-07-27 ~23:45Z by `.program/audits/headline-regen/{count-ledger,ready-frontier}.py`.

## Item counts (total 70)
- **done (15)**: ROOT.1.1.1–1.1.4, ROOT.1.2 + six children, ROOT.1.7, ROOT.1.9, ROOT.7.2,
  **ROOT.7.3.10 (ADR-0028)**
- **in_progress (6)**: ROOT (gen15), ROOT.1, ROOT.1.1, ROOT.7, ROOT.7.1, ROOT.7.3
- **in_review (2)**: ROOT.1.1.5 (merged, needs tier-2 pair), ROOT.7.3.1 (gen1 fix done,
  needs fix-verify)
- **blocked (2)**: ROOT.2.4, ROOT.6 [awaiting_human_authorization]

## Ready frontier: 11 items (per ready-frontier.py)
ROOT.1.1.5 + ROOT.7.3.1 (both in_review — reviews, not implementation) and Decision items
ROOT.7.3.2–7.3.9, 7.3.11 (enumeration ADRs per ADR-0018; 7.3.2 next-urgent, blocks
ROOT.2.3).

**Gate-open, NOT dispatchable**: ROOT.2.1, ROOT.3.1, ROOT.5.3. **Read the frontier from
`ready-frontier.py`.**

## Top blockers with reasons
1. **ROOT.1.1.5 + ROOT.1.1 assembly review** — last open leaf under 1.1, then closure
   unlocks ROOT.1.4/1.6.
2. **ROOT.1.8** (Phase 0 Gate) — now also depends on ROOT.7.3.10 (done ✔). Gates Phases 1–4.
3. ROOT.7.3.1 fix-verify — blocks ROOT.1.3.

## Parked items
- **ROOT.6** — Hosted Edition; ADR-0001 | **ROOT.2.4** — legacy JSON archival; REQ-MS-03
- **ROOT.5.1** — pre-auth flag on nightly Workshop backup (flag, not status)

## Pending decisions / carries
ADR-0018: 11 enumeration Decision items scheduled (ROOT.7.3.*), edges on blocked
capabilities. ADR-0028 baseline found **4 pre-existing MS-03 violations** (fs.rmSync on
data/** & sandbox/live/**) — Gate ROOT.1.8 must cite them as recorded baseline. GEN2-1/
GEN2-2 ruled DEFECTS → fixed in ROOT.1.1.5 (in_review). OQ #8 undecided. Steward
backlogs 1, 2, 5 open.

## Generation >= 3 — SCOPING FAILURE
**ROOT gen15** (ADR-0012) and **ROOT.1.2 gen3** (done).
