# Dream Program — Status Report

**Phase**: Phase 0 executing. Decision backlog (ROOT.7.3.*) fully activated this gen:
3 more DONE (7.3.1, 7.3.10, 7.3.11); 8 in review cycles. **ROOT.1.1.5 tier-2 SPLIT** —
adversarial lens found 3 NEW majors; gen1 fix is the gen44 first action.
**Counts (total 70)**: done 17 | in_progress 6 | in_review 4 | changes_requested 5 |
proposed 36 | blocked 2

Derived 2026-07-28 ~02:50Z by `.program/audits/headline-regen/{count-ledger,ready-frontier}.py`.

## Item counts (total 70)
- **done (17)**: ROOT.1.1.1–1.1.4, ROOT.1.2 + six children, ROOT.1.7, ROOT.1.9, ROOT.7.2,
  ROOT.7.3.1 (ADR-0019), ROOT.7.3.10 (ADR-0028), ROOT.7.3.11 (ADR-0029)
- **in_progress (6)**: ROOT (gen15), ROOT.1, ROOT.1.1, ROOT.7, ROOT.7.1, ROOT.7.3
- **in_review (4)**: ROOT.7.3.2, ROOT.7.3.3, ROOT.7.3.8 (gen1 fixes done, fix-verify owed),
  ROOT.7.3.5 (gen1 fix done, fix-verify owed)
- **changes_requested (5)**: ROOT.1.1.5 (adversarial: 3 new majors), ROOT.7.3.4,
  ROOT.7.3.6, ROOT.7.3.9 (gen1 fixes owed), ROOT.7.3.7 (gen2 — second failed cycle)
- **blocked (2)**: ROOT.2.4, ROOT.6 [awaiting_human_authorization]

## Ready frontier: 9 items (per ready-frontier.py) — ALL are review-cycle continuations
ROOT.1.1.5 + ROOT.7.3.2–7.3.9 (fix dispatches and fix-verifies; no fresh implementation).

**Gate-open, NOT dispatchable**: ROOT.2.1, ROOT.3.1, ROOT.5.3.

## Top blockers with reasons
1. **ROOT.1.1.5 gen1** — 3 new adversarial majors (proto-pollution hole bypass, getter
   impurity, Proxy admission); blocks ROOT.1.1 assembly review → ROOT.1.4/1.6.
2. **ROOT.7.3.2/7.3.3 fix-verify** — 7.3.2 blocks ROOT.2.3; arbitration ruled in-band
   counts toward struggle-halt, ADR-0021 owns the counter.
3. **In-flight at rotation**: ledger auditor + ROOT.7.3.4 gen1 fix (see ROOT-43 handoff).

## Parked items
- **ROOT.6** — Hosted Edition; ADR-0001 | **ROOT.2.4** — legacy JSON archival; REQ-MS-03
- **ROOT.5.1** — pre-auth flag on nightly Workshop backup (flag, not status)

## Pending decisions / carries
ADR-0028's 4 MS-03 baseline violations NOW LEDGERED WITH OWNERS: ROOT.4.5 (sandbox.ts:65,
seed-sandboxes.ts:33) + ROOT.4.10 (profiles.ts:69/70) as acceptance criteria. ADR-0025
re-run bound into ROOT.4.5 + ROOT.4.9 rows. Path-guard denied 6+ in-allowlist reviewer
writes this gen — auditor diagnosis in flight. OQ #8 undecided. Steward backlogs 1,2,5 open.

## Generation >= 3 — SCOPING FAILURE
**ROOT gen15** (ADR-0012) and **ROOT.1.2 gen3** (done).
