# Dream Program — Status Report

**Phase**: Phase 0 executing — **preflight complete 2026-07-27; dispatch HELD pending owner go-ahead.**
**Counts (total 57)**: done 12 | in_progress 6 | proposed 36 | blocked 2 | changes_requested 1

Derived 2026-07-27 ~05:25Z by `.program/audits/headline-regen/{count-ledger,ready-frontier}.py`.
Statuses are the ledger's own; `interrupted` does not exist in any item file.

## Item counts (total 57)
- **done (12)**: ROOT.1.1.1, ROOT.1.1.2, ROOT.1.2 + all six children (1.2.1–1.2.6), ROOT.1.7, ROOT.1.9, ROOT.7.2
- **changes_requested (1)**: ROOT.1.1.3 — REOPENED 2026-07-27 on first-ever adversarial review
  (1 critical: canonicalStringify collapses distinct contents; 2 major). Tier raised 1→2.
- **in_progress (6)**: ROOT (gen15), ROOT.1, ROOT.1.1 (gen2 coordinator), ROOT.1.1.4, ROOT.7, ROOT.7.1
- **blocked (2)**: ROOT.2.4, ROOT.6 — both `awaiting_human_authorization`

## Ready frontier: 1 item
**ROOT.1.1.3** (changes_requested) — fix cycle against
`.program/audits/ROOT.1.1.3-adversarial-review.md`; adversarial reviewer owns fix
verification. **ROOT.1.1.4 is NO LONGER ready**: its `depends_on` (ROOT.1.1.3) is not
`done` — re-dispatch only after the fix cycle closes.

**Gate-open, NOT dispatchable** despite satisfied `depends_on`: ROOT.2.1, ROOT.3.1,
ROOT.4.1, ROOT.4.5, ROOT.4.7, ROOT.5.1, ROOT.5.3 — waiting on ROOT.1.8 (and later gates).
**Read the frontier from `ready-frontier.py`; never derive it by hand.**

## Top blockers with reasons
1. **Dispatch hold** — owner-directed preflight hold; overrides everything below.
2. **ROOT.1.1.3 fix cycle** — gates ROOT.1.1.4, which gates the rest of the 1.1 subtree.
3. **ROOT.1.8** (Phase 0 Gate, proposed) — depends on all ten ROOT.1.x; gates Phases 1–4.

## Parked items
- **ROOT.6** — Hosted Edition; ADR-0001; routed around
- **ROOT.2.4** — legacy JSON archival; REQ-MS-03 never-delete; routed around
- **ROOT.5.1** — pre-auth flag on nightly Workshop backup (flag, not status)

## Pending decisions
15 decided-and-logged in DECISIONS-PENDING.md; open-by-design OQ #10/#11/#12; undecided
OQ #8 (Module-12 mitigation — ADR required before module 12 authoring). Preflight 2026-07-27:
evidence sweep clean (0 fabrication, 2 clean-run bookkeeping defects remediated); true
subagent compaction rate 0% (prior counts were substring contamination); audit checks
hardened to content-level; hook liveness proven; 4 latent overlaps unchanged.

## Generation >= 3 — SCOPING FAILURE
**ROOT gen15** (38-generation director storm, ADR-0012) and **ROOT.1.2 gen3** (done).
