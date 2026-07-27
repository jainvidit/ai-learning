# Dream Program — Status Report

**Phase**: Phase 0 executing. Frontier = ROOT.1.1.3 (gen2 fix cycle IN FLIGHT,
dream-implementer-critical, scoped per ADR-0017 Amendment 1).
**Counts (total 57)**: done 12 | in_progress 7 | proposed 36 | blocked 2

Derived 2026-07-27 ~07:10Z by `.program/audits/headline-regen/{count-ledger,ready-frontier}.py`.

## Item counts (total 57)
- **done (12)**: ROOT.1.1.1, ROOT.1.1.2, ROOT.1.2 + six children (1.2.1–1.2.6), ROOT.1.7, ROOT.1.9, ROOT.7.2
- **in_progress (7)**: ROOT (gen15), ROOT.1, ROOT.1.1 (gen2 coordinator), ROOT.1.1.3 (gen2), ROOT.1.1.4, ROOT.7, ROOT.7.1
- **blocked (2)**: ROOT.2.4, ROOT.6 [both awaiting_human_authorization]

## Ready frontier: 1 item
**ROOT.1.1.3** — gen2 fix cycle dispatched (director-gen41) after ADR-0017 Amendment 1
(aef4db2) closed both spec gaps. Scope: EXACTLY fixverify NEW-1 (sparse holes, major) +
NEW-2 (depth bound, minor) + A1.3 closed-world allowlist. Frozen contract + pinned-hash
rules carried forward. On approve: ROOT.1.1.4 re-dispatch unlocks.

**Gate-open, NOT dispatchable**: ROOT.2.1, ROOT.3.1, ROOT.4.1, ROOT.4.5, ROOT.4.7,
ROOT.5.1, ROOT.5.3 (ROOT.1.8 + later gates). **Read the frontier from `ready-frontier.py`.**

## Top blockers with reasons
1. **ROOT.1.1.3 gen2 outcome** — gates ROOT.1.1.4 → all of ROOT.1.1 → Phase 0.
2. **ROOT.1.8** (Phase 0 Gate, proposed) — gates Phases 1–4 entirely.

## Parked items
- **ROOT.6** — Hosted Edition; ADR-0001 | **ROOT.2.4** — legacy JSON archival; REQ-MS-03
- **ROOT.5.1** — pre-auth flag on nightly Workshop backup (flag, not status)

## Pending decisions
ADR-0017 Amendment 1 accepted (holes rejected, MAX_HASH_DEPTH=64, closed-world) —
implemented by the in-flight gen2 cycle. Unfalsifiable-criteria survey: 8 clear matches
in Phase 1–4 shards, 3 borderline — enumerate per-shard before each owning phase
decomposes (survey 2026-07-27T0540). OQ #8 still undecided (Module-12, pre-authoring).
Steward batch 2 confirmed complete 07-25T19:08Z (3/3); backlog 1, 2, 5 open.

## Generation >= 3 — SCOPING FAILURE
**ROOT gen15** (ADR-0012) and **ROOT.1.2 gen3** (done).
