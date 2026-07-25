# Program Glossary — level model

Program name/prefix: **dream** (roles are `dream-*`). Levels invented for this program;
Agile's ladder was a menu, not a schema. Ledger depth is unbounded; levels below
Capability are defined now, instantiated later by coordinators.

| Level | Parent | Meaning | Exit criteria |
|---|---|---|---|
| **Program** | — (ROOT, depth 0) | The whole dream-version build across all shards | Every Phase `done`/`cancelled`, or `blocked: awaiting_human_authorization`; spec traceably verified |
| **Phase** | Program (depth 1) | One migration wave from migration-and-sequencing REQ-MS-01. Phases are strictly ordered: Phase N+1 may not start before Phase N's Gate passes. Rationale: REQ-MS-01 makes ordering itself a binding requirement, so it is the top decomposition axis, not an afterthought | All children `done`/`cancelled` AND the phase Gate passed |
| **Capability** | Phase (depth 2) | One spec shard's scope — or one shard's phase-slice, where a shard spans phases (execution-layer, testing-and-ci, curriculum-content) | Owned REQ sections verified per their scenarios + assembly review against the shard (PART 6) |
| **Contract** | Capability (depth 3+) | A shared interface/schema artifact with exactly one steward (LANE-DEPENDENCIES seam rows). Exists so interfaces are items, not side effects | Interface doc in `.program/interfaces/`; consumers listed; contract test or typecheck evidence |
| **Feature** | Capability/Contract (depth 3+) | One REQ-* requirement (or coherent sub-slice) implemented and verified against its listed scenarios | Every scenario has a `verification` entry with evidence |
| **Task** | any (leaf) | Passes the six-point leaf test (PART 3) at dispatch | Named AGENTS.md verification command passes; evidence path recorded |
| **Probe** | any (leaf) | Empirical discharge of an [INFERRED]/[VERIFIED-EXTERNALLY] assumption (e.g., ASSUMPTIONS #11 next-mdx-remote archived, #12 Bedrock structured outputs) | Evidence doc written; assumption confirmed or divergence logged |
| **Gate** | Phase (leaf) | Verification checkpoint: REQ-MS-02 regression-floor checklist + `npm run build` + `npx tsc --noEmit` + `npm run lint` | Every baseline behavior passes or the phase halts; evidence doc in `.program/audits/` |

Rationale for Probe and Gate as first-class levels: the origin docs are explicit that
several load-bearing claims were never exercised in this repo, and REQ-MS-02 makes the
regression floor a halting condition — both are real work that would otherwise become
phantom sub-bullets inside other items.
