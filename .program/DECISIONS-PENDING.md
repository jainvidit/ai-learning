# Decisions pending owner input

Deferred ambiguities (decided-and-logged per PART 9 Rule 1 — work continues) and parked
irreversible items (PART 9 Rule 2 — work routed around). Nothing here stalls the program.

## Parked — awaiting human authorization

### ROOT.6 — Hosted Edition (Phase 5)
- **Action proposed:** decompose and build the hosted-edition.md shard (Postgres+Zero, Better Auth, CloudDriver).
- **Why parked:** never owner-ratified (ASSUMPTIONS #32 [INFERRED]; OPEN-QUESTIONS #6); contains PART 9 hard stops (auth, public API surface, paid resources). ADR-0001.
- **Blast radius if done:** public deployment surface, credentials, recurring cost.
- **Routed around:** all edition-invariant interfaces are built regardless; zero downstream items depend on ROOT.6.

### ROOT.2.4 — Legacy JSON progress cutover + archival
- **Action proposed:** switch reads from `data/progress/*.json` to projections after parity, then move JSON files to an archive location.
- **Why parked:** touches real learner data this program did not create; `data/**` is a standing never-delete flag (REQ-MS-03). The "additive so safe" reframe is the PART 9 signal to park.
- **Blast radius if done wrong:** learner progress loss — the single worst outcome available to this program.
- **Routed around:** dual-write continues indefinitely; nothing blocks on cutover.

## Decided and logged — reversible, owner may override

| # | Item | Question | Chose | If the other reading is right |
|---|---|---|---|---|
| 1 | ROOT.6 | Hosted Edition in scope? (OQ #6) | Not scheduled (ADR-0001) | Unblock ROOT.6; interfaces already exist |
| 2 | ROOT.1.5 | Monorepo apps/api split? (OQ #7) | Packages only, one Next app (ADR-0002) | Add apps/api later behind existing packages |
| 3 | ROOT.4.7 | Offline in Home v1? (OQ #5) | Deferred with hosted (ADR-0003) | Add outbox behind the single write contract |
| 4 | ROOT.2.2/4.3 | Streaks owner-ratified? (OQ #9) | Ship gentle streak as specced (ADR-0004) | Remove projection consumers; log untouched |
| 5 | ROOT.1.2 | Beat vocabulary A or B? (OQ #1) | Blueprint set; recap = authored convention (ADR-0005) | Additive `recap` type + convention migration |
| 6 | ROOT.5.5 | Quiz explanations on fail? (OQ #2) | Explanations returned; variants defeat brute force (ADR-0006) | Server-side flag gates missed-question explanations |
| 7 | ROOT.5.5 | Module 12 mitigation (OQ #8) | UNDECIDED — must be ADR'd before module 12 authoring; module 12 is last in the authoring queue | n/a — decision still open by design |
| 8 | ROOT.3.4 | Variant human review with no human | Generated variants queue unpublished; reviews fall back to canonical (REQ-CG-03) until owner reviews the bank | Owner reviews queue; gate goes hard |
| 9 | ROOT.1.3 | Home SSE resume store (OQ #4) | Reading A default (in-process/file-backed, no Redis) — ADR due at ROOT.1.3 decomposition | Accept one local Redis process |
| 10 | — | OQ #3 `.program/` sanctioned | Reading A (owner's infra commit f4fd9b9 + AGENTS.md ratify it) | Relocate ledger per owner instruction |
| 11 | — | OQ #13/#14 integrity carve-out + rung-4 boundary | Reading A (shards assume it; flagged, unobjected) | Itemized owner review; features are removable |
| 12 | ROOT.5.5 | OQ #15 Module-1 playground nit | Reading A — leave placement as-is | Adopt nit during CC-03 fixes |

OQ #10 (Velite tiebreak), #11 (Langfuse fallback), #12 (first-run cosmetic) are recorded
open-by-design in the shards with named trigger-holders; no decision needed at genesis.
