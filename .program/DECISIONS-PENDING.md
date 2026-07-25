# Decisions pending owner input

Deferred ambiguities (decided-and-logged per PART 9 Rule 1 — work continues) and parked
irreversible items (PART 9 Rule 2 — work routed around). Nothing here stalls the program.

## Parked — awaiting human authorization

### ROOT.6 — Hosted Edition (Phase 5)
- **Action proposed:** decompose and build the hosted-edition.md shard (Postgres+Zero, Better Auth, CloudDriver).
- **Why parked:** never owner-ratified (ASSUMPTIONS #32 [INFERRED]; OPEN-QUESTIONS #6); contains PART 9 hard stops (auth, public API surface, paid resources). ADR-0001.
- **Blast radius if done:** public deployment surface, credentials, recurring cost.
- **Routed around:** all edition-invariant interfaces are built regardless; zero downstream items depend on ROOT.6.

### ROOT.2.4 — Legacy JSON progress archival
- **Action proposed:** move `data/progress/*.json` to an archive location after verified import (the reversible read-cutover was split out to ROOT.2.1 per ADR-0007 and is NOT parked).
- **Why parked:** moving real learner data files this program did not create; `data/**` is a standing never-delete flag (REQ-MS-03). The "additive so safe" reframe is the PART 9 signal to park.
- **Blast radius if done wrong:** learner progress loss — the single worst outcome available to this program.
- **Routed around:** files stay in place indefinitely; nothing blocks on archival.

### ROOT.5.1 — Nightly Workshop git-bundle backup (WA-01 s5, pre-flagged)
- **Action proposed (future):** a scheduled local job producing git-bundle backups of each profile's Workshop.
- **Why flagged:** a scheduled job that writes copies of learner data is PART 9-adjacent (recurring side effect on data the program didn't create). ROOT.5.1 designs it and submits it here for authorization before implementation.
- **Routed around:** Workshop functions fully without backups; checkpoints already exist in-repo.

### ROOT.1.1 — Content pipeline: verification toolchain denied (2026-07-25, coordinator-ROOT.1.1-gen0)
- **Action needed:** grant the program's agents permission to run the AGENTS.md verification commands (`npm install`, `npm run build`, `npx tsc --noEmit`, `npm run lint`, `npm run validate`, `npm test`) — the permission system currently denies Bash/npm environment-wide (denied for the coordinator directly and for the implementer per-command, bare and individually).
- **Why parked:** every ROOT.1.1 leaf is framework-touching; PART 6 requires empirical build/typecheck evidence, which is unattainable without the toolchain. Not retried on an escalated implementer: the failure is environmental, not agent capability.
- **URGENT side effect — RESOLVED by director-gen15 (2026-07-25T14:20Z):** the repo was BUILD-BROKEN mid-migration (package.json swapped to velite with `npm install` never run; LessonRenderer.tsx still importing next-mdx-remote/rsc). Director restored the green baseline: `git checkout 6df07a6^ -- package.json .gitignore` + deleted the program-created velite.config.ts (reversible; the WIP swap survives in commit 6df07a6 and in ROOT.1.1.1's item-file inventory). The repo is coherent again; nothing needs hand-reverting. Director also re-verified the denial empirically this session: `npm --version` denied for the director AND for a fresh dream-verifier — yet earlier sessions today ran full npm suites (ROOT.7.2, ROOT.1.2.1 evidence), so the permission surface CHANGED mid-program. After permission grant: re-dispatch ROOT.1.1.1 fresh (re-apply the swap from the item-file inventory, then `npm install` first).
- **Routed around:** nothing downstream of ROOT.1.1 can proceed (1.6/1.3/1.5 package.json chain waits on 1.1); ROOT.1.1 and ROOT.1.1.1 set blocked/awaiting_human_authorization.

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

| 13 | ROOT.1.10 | Package manager for workspace split | npm workspaces (ADR-0008) | pnpm import is mechanical later |
| 14 | ROOT.1.7 | ASSUMPTIONS #11 divergent: next-mdx-remote is NO LONGER archived (v6.0.0, active). Reopen pipeline choice? | Proceed as specced — Velite migration stands; REJECTED.md binding (ADR-0009) | Keep next-mdx-remote; removal is a reversible package change, git preserves the path |
| 15 | ROOT.1.9 | ASSUMPTIONS #12 negative: Bedrock rejects output_config.json_schema (live 400). How does the judge get schema-conformant output? | Tool-forcing + local validate/one-repair inside the ModelGateway seam (ADR-0010); swap-in of native support stays seam-internal | Wait for native structured outputs; only the seam internals change |

OQ #10 (Velite tiebreak — trigger held by ROOT.1.1's coordinator, informed by ROOT.1.7's
probe), #11 (Langfuse fallback — JP-06 now owned by ROOT.4.8), #12 (first-run cosmetic)
are recorded open-by-design with named trigger-holders; no decision needed at genesis.

Genesis adversarial review (2026-07-25): three blind opus lenses filed 71 findings
(completeness 13, coupling 27, sizing 31); disposition in ADR-0007, full texts in
`.program/audits/genesis-review-*.md`. Owner-relevant: the review confirmed the two
parks above and surfaced no new irreversible-action candidates beyond the nightly-backup
flag.

### RESOLVED — ROOT.1.1 toolchain denial (2026-07-25, coordinator-ROOT.1.1-gen0)
- The permission grant landed: `npm --version` succeeds in the ROOT.1.1 coordinator session (11.6.2). Baseline restore by director-gen15 verified intact (next-mdx-remote ^6.0.0 back in package.json, no velite.config.ts). ROOT.1.1/ROOT.1.1.1 unblocked; ROOT.1.1.1 gen1 re-dispatched. The 2026-07-25 "verification toolchain denied" entry above is closed.
