# Dream Program — Status Report

**Phase**: Phase 0 executing — **HALTED for remediation (2026-07-27). No implementer may be dispatched until the owner resumes it.**
**Counts (total 57)**: done 13 | in_progress 6 | proposed 36 | blocked 2

Derived 2026-07-27 by `.program/audits/headline-regen/{count-ledger,ready-frontier}.py`. The
prior version was stale on every count and used a status (`interrupted`) no item file carries —
**statuses here are the ledger's own; do not reintroduce `interrupted`.**

## Item counts (total 57)
- **done (13)**: ROOT.1.1.1–1.1.3, ROOT.1.2 + all six children (1.2.1–1.2.6), ROOT.1.7, ROOT.1.9, ROOT.7.2
- **in_progress (6)**: ROOT (gen15), ROOT.1, ROOT.1.1 (gen2 coordinator), ROOT.1.1.4, ROOT.7, ROOT.7.1
- **blocked (2)**: ROOT.2.4, ROOT.6 — both `awaiting_human_authorization`

## Ready frontier: 1 item
**ROOT.1.1.4** — `depends_on: [ROOT.1.1.3]` satisfied; already `in_progress` with a gen1 owner,
so it needs re-dispatch, not fresh decomposition. A gen1 worktree implementation exists but its
evidence is contamination-flagged — read the ROOT.1.1 / ROOT.1.1.4 event logs before any review.

**Not the frontier, though `depends_on` is clear:** ROOT.2.1, ROOT.3.1, ROOT.4.1, ROOT.4.5,
ROOT.4.7, ROOT.5.1, ROOT.5.3 — **gated by phase ordering** (glossary: Phase N+1 may not start
before Phase N's Gate ROOT.1.8 passes). A depends_on-only scan offers these seven wrongly.

## Top blockers with reasons
1. **Remediation halt** — owner-directed; overrides everything below.
2. **ROOT.1.1.4** — carries ROOT.1.1.2's npm-run-build beat-validation requirement; prior evidence contaminated.
3. **ROOT.1.8** (Phase 0 Gate, proposed) — depends on all ten ROOT.1.x; blocks Phases 2–5.

## Parked items
- **ROOT.6** — Hosted Edition; ADR-0001; ASSUMPTIONS #32 unratified; routed around
- **ROOT.2.4** — legacy JSON archival; REQ-MS-03 never-delete; routed around
- **ROOT.5.1** — pre-auth flag on the nightly Workshop backup (a flag, not the item's status)

## Pending decisions
15 decided-and-logged in DECISIONS-PENDING.md; open-by-design OQ #10/#11/#12; **undecided OQ #8**
(Module-12 mitigation — ADR required before module 12 authoring; prior versions mislabelled this
"OQ #7", which is the monorepo split, **CLOSED by ADR-0002**). Standing non-blocking: tier-3 roles
unexercised; hook liveness provable only from `hook-denials.jsonl` (check 14); 4 latent overlaps.

## Generation >= 3 — SCOPING FAILURE
**ROOT gen15** (38-generation director storm, ADR-0012) and **ROOT.1.2 gen3** (done). The prior
version said "None" while ROOT sat at gen15.
