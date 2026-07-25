# Delivery org — dream program

Program prefix: `dream`. Roles live in `C:\Users\jainv\.claude\agents\dream-*.md`
(user scope), authoritative mirror in `.program/roles/`.

## Coordinator assignments (top two levels)

| Item | Coordinator? | Rationale |
|---|---|---|
| ROOT.1 Phase 0 | yes — `dream-coordinator` | 8 children with intra-phase ordering + one deliberate ownership overlap (package.json) to sequence |
| ROOT.1.1 content pipeline | yes | Will split into 4+ leaves (Velite swap, compiler, bundle, itemRevision) |
| ROOT.1.2 contracts pack | no — single steward implementer (tier-2) | One writer by design; splitting schema stewardship creates the collision LANE-DEPENDENCIES exists to prevent |
| ROOT.1.3 / 1.4 / 1.5 / 1.6 | 1.3 and 1.5 yes; 1.4 and 1.6 direct implementers | 1.4/1.6 are near-leaf already |
| ROOT.1.7 probes | no — two Probe leaves, direct dispatch | Read-only, bounded |
| ROOT.1.8 / all Gates | no — `dream-gate-verifier` direct | Checklist execution, not decomposition |
| ROOT.2 Phase 1 | yes | Root-dependency phase; data-safety review load |
| ROOT.2.1 / 2.2 / 2.3 | yes each | Each splits into contract-doc + impl + parity/calibration leaves |
| ROOT.2.4 | PARKED | awaiting_human_authorization |
| ROOT.3 Phase 2 | yes; 3.2/3.3/3.5 get coordinators, 3.1/3.4 direct | Engine invariants are dense; registry and generator are narrower |
| ROOT.4 Phase 3 | yes; 4.2/4.3/4.5/4.6 coordinators, 4.1/4.4/4.7/4.8 direct | UI-heavy phase, most REPLACED components |
| ROOT.5 Phase 4 | yes; 5.5 gets a coordinator that fans out one implementer per module | The original build's proven per-module ownership pattern |
| ROOT.6 Phase 5 | PARKED — no coordinator ever assigned without owner authorization | ADR-0001 |

## Role roster (authored at genesis; justify-or-delete)

| Role | Base table row | One-line justification |
|---|---|---|
| `dream-coordinator` | Coordinator (fable/high/80) | Owns a subtree: decompose, dispatch, verify, assembly-review; never implements |
| `dream-implementer-standard` | Implementer tier 0–1 (sonnet/medium/60) | Single-leaf implementation against binary criteria |
| `dream-implementer-hardened` | Implementer tier 2 (opus/high/80) | Escalation variant; interface-crossing or second-attempt work |
| `dream-implementer-critical` | Implementer tier 3 (fable/high/80) | Escalation above hardened; the two-key firewall and data-adjacent code |
| `dream-reviewer-primary` | Reviewer primary (opus/high/40) | Blind spec-conformance review, artifact + shard only |
| `dream-reviewer-secondary` | Reviewer secondary (sonnet/medium/40) | Independent second lens |
| `dream-reviewer-adversarial` | Red-teamer (fable/max/50) | Escalated review tier; hunts what both reviewers missed |
| `dream-verifier` | Verifier (sonnet/low/20) | Runs the named check to close factual review disputes |
| `dream-gate-verifier` | Ledger auditor row basis (sonnet/medium/40) | Executes REQ-MS-02 baseline checklist + verification commands, writes evidence |
| `dream-reader-corpus` | Reader large (sonnet/low/30) | Large-corpus reads returning bounded findings |
| `dream-reader-lookup` | Reader narrow (haiku/low/15) | Narrow lookups only; never large reads |
| `dream-ledger-auditor` | Ledger auditor (sonnet/medium/40) | PART 7 checks incl. compaction + mirror drift; writes only to audits/ |
| `dream-collector` | Fan-in collector (sonnet/low/30) | Gathers completions into one digest; director reads digest only |
| `dream-reporter` | Reporter (haiku/low/15) | Regenerates HEADLINE.md and INDEX.md |

Escalation ladders: implementer standard→hardened→critical; reviewer
primary/secondary→adversarial. Genesis-only reviewers (the three opus lenses) are
dispatched as `dream-reviewer-primary` instances with lens-specific prompts, not
separate roles.

## File-ownership boundaries (top level)

Phase items own disjoint globs except two recorded, deliberately sequenced overlaps:
- `package.json` (ROOT.1.1 dep removal vs ROOT.1.5 workspace split) — phase coordinator
  sequences; never concurrent.
- `.github/**` (ROOT.1.4 vs ROOT.4.8) and lesson/layout files (ROOT.4.x) — cross-phase,
  so never concurrently active by construction; within Phase 3 the coordinator sequences
  `src/app/layout.tsx` (4.1 vs 4.6).
- `src/lib/claudeSpawn.ts` appears in ROOT.1 (seam wrap, Phase 0) and ROOT.4.5
  (driver rework, Phase 3) — sequential phases, no live overlap.

Cross-phase same-file rule: ownership is active only while an item is non-terminal;
phase ordering guarantees no two phases are concurrently active.

## Standing constraints inherited by every role prompt

Port 3000 is never killed (CONSTRAINTS #17); debugging is always fanned to a fresh
agent, never inline (#18); no opsx skills; no AskUserQuestion; no git except the
director (program repo); continuous-write rule verbatim (PART 4); irreversible actions
park (PART 9 Rule 2).
