# Dream Program — Status Report

**Phase**: Phase 0 executing. **ROOT.1.1.3 DONE (gen2 approved)**; frontier = ROOT.1.1.4
(re-dispatch is the gen42 first action — see handoff ROOT-41).
**Counts (total 57)**: done 13 | in_progress 6 | proposed 36 | blocked 2

Derived 2026-07-27 ~09:25Z by `.program/audits/headline-regen/{count-ledger,ready-frontier}.py`.

## Item counts (total 57)
- **done (13)**: ROOT.1.1.1, ROOT.1.1.2, **ROOT.1.1.3 (gen2)**, ROOT.1.2 + six children (1.2.1–1.2.6), ROOT.1.7, ROOT.1.9, ROOT.7.2
- **in_progress (6)**: ROOT (gen15), ROOT.1, ROOT.1.1 (gen2 coordinator), ROOT.1.1.4, ROOT.7, ROOT.7.1
- **blocked (2)**: ROOT.2.4, ROOT.6 [both awaiting_human_authorization]

## Ready frontier: 1 item
**ROOT.1.1.4** (bundle emitter + static routes) — depends_on now satisfied; gen1
re-dispatch note + carried finding are in its item file (hardened, package.json chain
serialized). NOT yet re-dispatched: rotation budget hit first.

**Gate-open, NOT dispatchable**: ROOT.2.1, ROOT.3.1, ROOT.4.1, ROOT.4.5, ROOT.4.7,
ROOT.5.1, ROOT.5.3 (ROOT.1.8 + later gates). **Read the frontier from `ready-frontier.py`.**

## Top blockers with reasons
1. **ROOT.1.1.4 re-dispatch** — last open leaf under ROOT.1.1; then 1.1 assembly review.
2. **ROOT.1.8** (Phase 0 Gate, proposed) — gates Phases 1–4 entirely.

## Parked items
- **ROOT.6** — Hosted Edition; ADR-0001 | **ROOT.2.4** — legacy JSON archival; REQ-MS-03
- **ROOT.5.1** — pre-auth flag on nightly Workshop backup (flag, not status)

## Pending decisions
ROOT.1.1.3 gen2 approved with 2 NON-BLOCKING minors carried (GEN2-1 Array-subclass
admission, GEN2-2 array symbol/expando asymmetry) — steward/cleanup candidates, see
ROOT-41. Unfalsifiable-criteria survey: 8 clear matches in Phase 1–4 shards, 3
borderline — enumerate per-shard before each owning phase decomposes (survey
2026-07-27T0540). OQ #8 still undecided. Steward backlog 1, 2, 5 open.

## Generation >= 3 — SCOPING FAILURE
**ROOT gen15** (ADR-0012) and **ROOT.1.2 gen3** (done).
