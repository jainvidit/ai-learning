# Program Glossary — level model

Program name/prefix: **dream** (roles are `dream-*`). Levels invented for this program;
Agile's ladder was a menu, not a schema. Ledger depth is unbounded; levels below
Capability are defined now, instantiated later by coordinators.

| Level | Parent | Meaning | Exit criteria |
|---|---|---|---|
| **Program** | — (ROOT, depth 0) | The whole dream-version build across all shards | Every Phase `done`/`cancelled`, or `blocked: awaiting_human_authorization`; spec traceably verified |
| **Phase** | Program (depth 1) | One migration wave from migration-and-sequencing REQ-MS-01. Phases ROOT.1–ROOT.5 are strictly ordered: Phase N+1 may not start before Phase N's Gate passes. Exception (ADR-0007): ROOT.7 "Standing services" is a phase-typed container EXEMPT from ordering — it holds cross-phase stewardship and the verification surface; its children carry their own edges. Rationale: REQ-MS-01 makes ordering itself binding, so it is the top decomposition axis | All children `done`/`cancelled` AND the phase Gate passed (ROOT.7: children's own criteria) |
| **Capability** | Phase (depth 2) — or Capability (depth 3), for the 14 curriculum modules under ROOT.5.5 | One spec shard's scope, one shard's phase-slice, or ONE CURRICULUM MODULE (a module is Capability-sized: ~11 content files + boss + verifiers + templates — ADR-0007/sizing #2; never a Feature) | Owned REQ sections verified per their scenarios + assembly review against the shard (PART 6) |
| **Contract** | Capability (depth 3+) | A shared interface/schema artifact with exactly one steward (LANE-DEPENDENCIES seam rows). Exists so interfaces are items, not side effects | Interface doc in `.program/interfaces/`; consumers listed; contract test or typecheck evidence |
| **Feature** | Capability/Contract (depth 3+) | One REQ-* requirement (or coherent sub-slice) implemented and verified against its listed scenarios | Every scenario has a `verification` entry with evidence |
| **Task** | any (leaf) | Passes the six-point leaf test (PART 3) at dispatch | Named AGENTS.md verification command passes; evidence path recorded |
| **Probe** | any (leaf) | Empirical discharge of an [INFERRED]/[VERIFIED-EXTERNALLY] assumption (e.g., ASSUMPTIONS #11 next-mdx-remote archived, #12 Bedrock structured outputs) | Evidence doc written; assumption confirmed or divergence logged |
| **Gate** | Phase (leaf) | Verification checkpoint: every row of `.program/interfaces/regression-floor.md` (the single shared checklist — Gates cite rows, never re-derive the list) + the MS-03 never-delete audit row + all AGENTS.md verification commands | Every row passes or the phase halts; per-row evidence doc in `.program/audits/` |

**Leaf-test point-5 exemption (ADR-0007, recorded decision, not drift):** Probe and
Gate are leaf types whose exit is an EVIDENCE ARTIFACT, not a named command — the
six-point test's point 5 does not apply to them. For every other leaf, point 5 binds:
until ROOT.7.2 lands `npm test` / `npm run verify:e2e` in AGENTS.md, no behavioral
criterion can be leaf-dispatched.

Rationale for Probe and Gate as first-class levels: the origin docs are explicit that
several load-bearing claims were never exercised in this repo, and REQ-MS-02 makes the
regression floor a halting condition — both are real work that would otherwise become
phantom sub-bullets inside other items.
