# Delivery org — dream program

Program prefix: `dream`. Roles live in `C:\Users\jainv\.claude\agents\dream-*.md`
(user scope), authoritative mirror in `.program/roles/`.

## Coordinator assignments (top two levels)

| Item | Coordinator? | Rationale |
|---|---|---|
| ROOT.1 Phase 0 | yes — `dream-coordinator` | 10 children; package.json writers serialized by edges (1.1→1.6→1.3→1.5→1.10) |
| ROOT.1.1 content pipeline | yes | Velite swap, compiler, bundle, itemRevision + interim-renderer handoff |
| ROOT.1.2 contracts pack | yes (sizing #9) | Leaves: schema extension, beat-model doc, per-seam docs, regression-floor seed. One WRITER per file still holds |
| ROOT.1.3 API/streaming | yes | Resume-store ADR leaf first, then per-route-group leaves |
| ROOT.1.4 CI gates | yes (sizing #10) | One leaf per CP-06 gate with explicit soft/hard staging + paired hard-flips |
| ROOT.1.5 seams | yes | Two seams, two fakes; workspace split moved out to 1.10 |
| ROOT.1.6 frontend substrate | yes (sizing #4 — NOT near-leaf; full design-system migration) | Tailwind v4+tokens; shadcn-on-Base-UI; Query/Zustand pattern; RSC posture probe |
| ROOT.1.7 / 1.9 probes | no — one Probe leaf each, direct dispatch | Read-only, bounded (split per sizing #7) |
| ROOT.1.10 workspace split | no — direct tier-2 implementer, runs alone last | Everything else terminal; ADR-0008 |
| ROOT.1.8 / all Gates | no — `dream-gate-verifier` direct | Checklist-row execution against regression-floor.md (point-5 exemption recorded in glossary) |
| ROOT.2 Phase 1 | yes | Root-dependency phase; data-safety review load |
| ROOT.2.1 / 2.2 / 2.3 | yes each | 2.1: driver ADR→contract→impl→dual-write→importer→re-backing→cutover; 2.2: frame+2 projections; 2.3: engine+calibration |
| ROOT.2.4 | PARKED (archival only; cutover moved to 2.1) | awaiting_human_authorization |
| ROOT.3 Phase 2 | yes; 3.2/3.3/3.4/3.5 coordinators, 3.1 direct | 3.4 is a six-stage pipeline (sizing #17); registry is genuinely narrow |
| ROOT.4 Phase 3 | yes; 4.1/4.2/4.3/4.4/4.5/4.6/4.7/4.8 coordinators, 4.10 direct | UI-heavy phase; sizing #18–23 re-leveled the former "direct" items |
| ROOT.5 Phase 4 | yes; 5.1/5.4/5.5 coordinators; 5.5 fans out 14 module CAPABILITIES (one coordinator or hardened implementer each) | A module is Capability-sized (sizing #2); order 5.3→5.4→5.5 (coupling #12) |
| ROOT.6 Phase 5 | PARKED — no coordinator ever assigned without owner authorization | ADR-0001 |
| ROOT.7 standing services | no — 7.2 direct Task; 7.1 served per-request by fresh hardened implementers | ADR-0007: stewardship outlives phases; the item persists, agents don't |

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

## File-ownership boundaries (corrected per ADR-0007; coupling #17/#23/#25, sizing #25)

**Same-phase overlaps: NONE.** Former overlaps were resolved by carve-outs and edges:
- `src/components/lesson/**` split by file: 4.2 owns beats/** + named files
  (BeatRenderer, Rail, ExerciseFrame, Quiz, LessonRenderer, widgets); Playground.tsx →
  4.4; Terminal.tsx → 4.6; Boss* → 5.3.
- `package.json` in Phase 0 is serialized by depends_on edges (1.1→1.6→1.3→1.5→1.10);
  ROOT.7.2 writes before Phase 0 opens; after Phase 0 it belongs to ROOT.7.1 (standing
  steward) — the machine-readable guard the prose note lacked.
- `src/components/ui/**` split: primitives (1.6) vs ui/motion/** + ui/celebration/**
  (4.1).
- `src/lib/projections/**`: one module file per projection, one owner each (2.2 frame/
  streak/resume; 3.2 skillState; 3.3 reviewQueue; 5.1 artifactHealth).
- `src/lib/verifiers/**` split: index.ts + mNN-*.ts (5.5, append-only registry);
  common.ts + harness/** (4.8).
- `content/curriculum.json`: 3.1 (Phase 2) → transfers to 5.5's coordinator (Phase 4);
  module children never write it.

**Recorded cross-phase transfers** (ownership passes when the earlier item goes
terminal; the receiving item's body records what must survive):
`src/app/layout.tsx` 1.6→4.6 (providers, ThemeToggle); `src/lib/claudeSpawn.ts`
1.5→4.5 (same seam, extended); `.github/**` 1.4→4.8; `src/lib/schema.ts` +
interface docs 1.2→7.1; `package.json` (Phase 0 chain)→7.1;
`src/components/lesson/LessonRenderer.tsx` 1.1→4.2 (interim renderer retirement).

Cross-phase same-file rule: ownership is active only while an item is non-terminal.
CAVEAT (coupling #17): a Gate halt can reopen a phase, so "phases never concurrent"
is a scheduling invariant the DIRECTOR enforces at dispatch — on any reopen, re-check
glob liveness before dispatching the next phase's items.

## Standing constraints inherited by every role prompt

Port 3000 is never killed (CONSTRAINTS #17); debugging is always fanned to a fresh
agent, never inline (#18); no opsx skills; no AskUserQuestion; no git except the
director (program repo); continuous-write rule verbatim (PART 4); irreversible actions
park (PART 9 Rule 2).
