# Dream Program — Status Report

**Phase**: Phase 0 executing | **Done**: 10 | **In progress**: 4 | **Proposed**: 49 | **Blocked**: 4

## Item counts (total 67)

- **Done**: ROOT.1.7, 1.9, 1.2 (+ 6 children), 7.2
- **In progress**: ROOT, ROOT.1, ROOT.7, 7.1
- **Blocked**: ROOT.1.1, 1.1.1, 2.4, 6 (all awaiting_human_authorization)

## Ready frontier: 4 items

ROOT.1.1 subtree holds front. Next unlocks: 1.1.2→1.1.3→1.1.4 (serial), then 1.6 then 1.3/1.4.

## Top blockers (parked)

1. **ROOT.1.1** — npm/npx permission denied. Build-broken WIP (package.json swapped to velite, LessonRenderer still imports next-mdx-remote). Director resolved repo state via git checkout. **Action**: Grant permission.
2. **ROOT.6** — Hosted Edition: never ratified (ADR-0001); PART 9 hard stops. Routed around.
3. **ROOT.2.4** — Legacy JSON archival: real learner data + REQ-MS-03 never-delete. Routed around.
4. **ROOT.5.1** — Nightly git-bundle backup: PART 9-adjacent, flagged. Routed around.

## Pending decisions

- **Decided**: 14 total (13 logged as ADRs 0001–0010, plus 0008/0009/0010)
- **Undecided**: OQ #8 (Module 12 mitigation) — must ADR before ROOT.5.5
- **Open-by-design**: OQ #10 (trigger: ROOT.1.1), #11 (ROOT.4.8), #12 (cosmetic)
- **Genesis review**: 3 blind opus; 71 findings; confirmed parks above; no new irreversible

## Generation ≥3: None current

ROOT.1.2 gen3 = infra-death (budget exhaustion), not scoping failure. Closed.
