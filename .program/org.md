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

Every role file carries an explicit `model:` and `effort:` field — the default is
`inherit`, and an unlabelled role silently follows whatever model the director happens to
be on. `effort` is frontmatter-only and cannot be raised at dispatch, so every base role
has an authored escalation variant; without one, a failing item's only remaining move is
to block.

| Role | model / effort / maxTurns | tools | One-line justification |
|---|---|---|---|
| `dream-coordinator` | fable / high / 80 | +Agent, Write, Edit | Owns a subtree: decompose, dispatch, verify, assembly-review; never implements |
| `dream-coordinator-recovery` | fable / max / 80 | +Agent, Write, Edit | ESCALATION above coordinator: subtree that deadlocked, failed twice, or hit generation ≥3; diagnoses the decomposition instead of retrying it |
| `dream-implementer-standard` | sonnet / medium / 60 | +Agent (readers only), Write, Edit | Single-leaf implementation against binary criteria |
| `dream-implementer-suite` | sonnet / medium / 40 | +Agent (readers only), Write, Edit | Tier 0–1 variant for leaves proven by FULL build+typecheck+lint suites — the table's "40 if it runs full suites" row; maxTurns is frontmatter-only so it needs its own file |
| `dream-implementer-isolated` | sonnet / medium / 60 | +Agent (readers only), Write, Edit, **isolation: worktree** | Tier 0–1 variant for leaves whose ownership could collide with a live sibling (verifier registry append, package.json chain on a Gate reopen) |
| `dream-implementer-hardened` | opus / high / 80 | +Agent (readers only), Write, Edit, **isolation: worktree** | ESCALATION above standard; interface-crossing, shared-schema, or second-attempt work |
| `dream-implementer-critical` | fable / high / 80 | +Agent (readers only), Write, Edit, **isolation: worktree** | ESCALATION above hardened; the two-key firewall and data-adjacent code |
| `dream-reviewer-primary` | opus / high / 40 | read-only (no Agent/Write/Edit) | Blind spec-conformance review, artifact + shard only |
| `dream-reviewer-secondary` | sonnet / medium / 40 | read-only | Independent second lens |
| `dream-reviewer-adversarial` | fable / max / 50 | read-only | ESCALATION above primary/secondary; hunts what both reviewers missed |
| `dream-verifier` | sonnet / low / 20 | read-only | Runs the named check to close factual review disputes |
| `dream-verifier-deep` | sonnet / medium / 30 | read-only | ESCALATION above verifier: designs a falsifiable check when the named one returned inconclusive |
| `dream-gate-verifier` | sonnet / medium / 40 | Write, Edit (own item + audits glob), no Agent | Owns a Gate ledger item: executes the regression-floor checklist + verification commands, writes evidence |
| `dream-gate-verifier-forensic` | opus / high / 40 | Write, Edit (own item + audits glob), no Agent | ESCALATION above gate-verifier: re-runs a failed/UNVERIFIED gate and separates regression from never-worked |
| `dream-reader-corpus` | sonnet / low / 30 | read-only | Large-corpus reads returning bounded findings; sonnet for the 1M window |
| `dream-reader-lookup` | haiku / low / 15 | read-only (no Bash) | Narrow lookups only; escalates to corpus rather than attempt a large read |
| `dream-ledger-auditor` | sonnet / medium / 40 | read-only | PART 7 checks incl. compaction + mirror drift; returns findings, director persists them |
| `dream-ledger-auditor-deep` | sonnet / high / 40 | read-only | ESCALATION above auditor: full-history forensics, bookkeeping-vs-work call, sampled re-verification |
| `dream-collector` | sonnet / low / 30 | Write (digest only), no Agent/Edit | Gathers completions into one digest; director reads digest only |
| `dream-reporter` | haiku / low / 15 | Write (2 files only), no Agent/Edit | Regenerates HEADLINE.md and INDEX.md from front matter only |

`dream-director` (fable/high, launch-only) is not a dispatchable role and is excluded from
every allowlist: it runs as a main session, and dispatching it creates a second scheduler
writing the same ledger.

Escalation ladders: implementer standard→hardened→critical (with suite/isolated as
same-tier budget/isolation variants); coordinator→recovery; reviewer
primary/secondary→adversarial; verifier→deep; auditor→deep; gate-verifier→forensic.
Genesis-only reviewers (the three opus lenses) are dispatched as `dream-reviewer-primary`
instances with lens-specific prompts, not separate roles.

**Amendment (role authoring, supersedes the earlier "writes only to audits/" wording for
the auditor):** reviewers, auditors, readers and verifiers omit `Agent`, `Write` and
`Edit` entirely. `dream-ledger-auditor` and `dream-ledger-auditor-deep` therefore RETURN
their findings and the director persists them to `.program/audits/`; an auditor that can
write cannot be prevented from repairing the evidence of how the ledger broke.
`dream-gate-verifier` keeps `Write`/`Edit` because it owns a Gate ledger item and must
write its own item file and evidence doc — it is an item-owning executor, not a review
role. `dream-collector` and `dream-reporter` keep `Write` (no `Edit`) because producing a
digest/report file is their entire output; neither may touch an item or events file.

Roles are byte-identical in `C:\Users\jainv\.claude\agents\` (user scope, loads in every
project on this machine — hence the mandatory `dream-` prefix, since identity comes only
from the `name` field and subfolders do not namespace it) and `.program/roles/` (the only
versioned copy). On divergence the mirror wins and the user-scope file is regenerated
from it.

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
