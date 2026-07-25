# Genesis complete — ready to dispatch

**Current phase:** Genesis complete — adversarially reviewed (ADR-0007); ready to dispatch ROOT.7.2 + ROOT.1.7 + ROOT.1.9

**Item counts by status:**
- in_progress: 1 (ROOT)
- proposed: 46
- blocked: 2 (ROOT.6, ROOT.2.4 — both awaiting_human_authorization)

**Ready frontier width:** 3 items, all Probes or Tasks
- ROOT.7.2 (Task — verification surface)
- ROOT.1.7 (Probe — next-mdx-remote archival)
- ROOT.1.9 (Probe — Bedrock structured outputs)

These are the only items with empty depends_on that are not blocked and not gated by phase ordering. ROOT.1.2 (Contract — beat model pack) is also dispatchable but triggers ROOT.1 dispatch cascade.

**Top blockers with reasons:**
- ROOT.6 (Phase 5 — Hosted Edition): awaiting_human_authorization — PARKED per ADR-0001; never owner-ratified; full of PART 9 hard stops (auth, public API, paid resources)
- ROOT.2.4 (Legacy JSON progress archival): awaiting_human_authorization — PARKED; archival touches real learner data files; "additive so safe" reframe flagged as PART 9 instinct

**Parked items:** 2
- ROOT.6 — Phase 5 (Hosted Edition)
- ROOT.2.4 — ROOT.2 child (Legacy JSON archival)

**Pending decisions:** 13
Recorded in DECISIONS-PENDING.md; none are blocking (reversible or deferred-by-design):
- 12 decided and logged (ADR-0001 through ADR-0008, plus named open-by-design triggers)
- 1 UNDECIDED: OQ #8 (Module 12 weakness mitigation — must be ADR'd before module 12 authoring; module 12 is last in authoring queue)

**Generation ≥ 3 scoping failures:** None flagged

**Genesis adversarial review:** 3 blind Opus lenses filed 71 findings (completeness 13, coupling 27, sizing 31); disposition in ADR-0007; full texts in `.program/audits/genesis-review-*.md`
