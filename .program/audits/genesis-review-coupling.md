# Genesis Review — COUPLING lens

**Reviewer:** blind adversarial reviewer (COUPLING). Read only: `.program/spec/**` (24 shards),
`docs/origin/LANE-DEPENDENCIES.md`, `.program/ledger/items/*.md`, `.program/glossary.md`,
`.program/org.md`, plus the current repo tree for path existence. Deliberately did NOT read
`.program/decisions/`, `.program/DECISIONS-PENDING.md`, or `.program/handoffs/`.

**Question:** which ledger items claim independence but actually share a contract or a file?

**Method:** (1) computed the concurrency set for each phase (same parent, no transitive
`depends_on` path between them) and intersected `file_ownership` globs pairwise; (2) walked
every "Shared files/contracts" row in LANE-DEPENDENCIES and asked whether exactly one
non-terminal item owns the seam; (3) diffed each shard's `**Depends on:**` header against the
consuming item's `depends_on`; (4) traced each acceptance criterion to the file(s) it must
write and compared against that item's globs.

**Systemic root cause behind most findings:** `org.md` establishes the rule *"ownership is
active only while an item is non-terminal; phase ordering guarantees no two phases are
concurrently active."* Combined with strict phase ordering, this means every seam file becomes
**unowned the moment its Phase-N owner reaches `done`** — while LANE-DEPENDENCIES models those
same seams as *standing stewardships* that persist for the life of the program. Eleven of the
findings below are instances of that mismatch. The second recurring cause is a **glob-shape
mismatch**: broad directory globs (`src/components/lesson/**`, `src/app/api/**`,
`src/app/**`, `src/lib/verifiers/**`) silently swallow narrow sibling globs.

---

## CRITICAL

### 1. ROOT.4.2 and ROOT.4.4 co-own `src/components/lesson/Playground.tsx` — concurrent, no edge
**Severity: critical**
**Pair:** ROOT.4.2 (Lesson experience) vs ROOT.4.4 (Playground v2)
**Shared file:** `src/components/lesson/Playground.tsx`

ROOT.4.2 owns `src/components/lesson/**`; ROOT.4.4 owns exactly
`src/components/lesson/Playground.tsx` — a strict subset. Both have `depends_on: [ROOT.4.1]`
and neither blocks the other, so a mechanical ready-frontier computation dispatches them
**simultaneously**. Nothing in either item file, in `ROOT.4.md`, or in `org.md`'s
"deliberately sequenced overlaps" list mentions this pair.

The collision is not hypothetical: ROOT.4.2's criterion "Exercise frames hydrate from stored
progress (LX-06)" requires editing Playground.tsx (per lesson-experience REQ-LX-06 current-state:
"`Playground.tsx` MODIFIED (gains passed-state hydration)"), while ROOT.4.4's criterion
"Rubric transparency + per-criterion feedback; staged gate-verdict states; coach margin note
wired (PG-02)" requires editing the same file.

**Predicted failure:** both implementers write Playground.tsx from their own shard; the second
write lands last and silently drops either the ExerciseFrame/hydration wrapper or the staged
gate-verdict states. Neither item's verification catches it because each verifies only its own
criteria. This is exactly the stub-overwrite pattern LANE-DEPENDENCIES "Known collision
history" documents for this precise file.

### 2. ROOT.4.2 and ROOT.4.6 co-own `src/components/lesson/Terminal.tsx` across a *mutual* contract with no edge in either direction
**Severity: critical**
**Pair:** ROOT.4.2 (Lesson experience) vs ROOT.4.6 (Terminal experience)
**Shared file/contract:** `src/components/lesson/Terminal.tsx`; the persistent-beat portal-slot contract

ROOT.4.6 owns `src/components/lesson/Terminal.tsx`, again a strict subset of ROOT.4.2's
`src/components/lesson/**`. ROOT.4.2 depends on 4.1; ROOT.4.6 depends on 4.5 — no path between
them, so they are concurrent.

Worse, the two shards declare a **mutual** dependency that the ledger encodes in neither
direction: `terminal-experience.md` says "*Depends on: ... lesson-experience.md (persistent
beats host portal slots — **mutual**; the beat contract is lesson-experience REQ-LX-03)*", and
`lesson-experience.md` says "*Depends on: ... terminal-experience.md (SandboxBeat hosts portal
slots)*". REQ-LX-03 (persistent beats stay mounted, ownership lives with PersistentTerminalHost)
and REQ-TX-01 (PersistentTerminalHost owns xterm instances via portals) are two halves of one
interface, and no `Contract`-type item exists for it.

**Predicted failure:** 4.2 builds SandboxBeat with its own slot/ref API while 4.6 builds
PersistentTerminalHost portalling into a different slot shape. Terminal.tsx is written twice.
The first symptom is an xterm instance that either double-mounts (two hosts) or never mounts
(each side waiting for the other's slot), and REQ-LX-03 scenario 1 ("DOM instance remains
mounted with dimensions intact") fails at the Phase 3 Gate with no single item accountable.

### 3. `package.json` is the program's true universal shared file but is owned only inside Phase 0
**Severity: critical**
**Pairs:** ROOT.1.1 vs ROOT.1.5 vs ROOT.1.6 vs ROOT.1.3 (concurrent, Phase 0); then ROOT.2.1, ROOT.3.3, ROOT.4.1, ROOT.4.6, ROOT.4.7, ROOT.4.8, ROOT.5.1 (no owner at all)
**Shared file:** `package.json`

`org.md` discloses exactly one contention on `package.json` — "ROOT.1.1 dep removal vs ROOT.1.5
workspace split" — and mitigates it with prose ("phase coordinator sequences; never
concurrent"). Two problems:

(a) **The disclosed overlap has no machine-readable guard.** There is no `depends_on` edge
between ROOT.1.1 and ROOT.1.5. Both are gated only by ROOT.1.7. The moment 1.7 completes, both
become ready simultaneously. The ledger is declared the source of truth; a prose note in
`org.md` is not a ledger edge.

(b) **The undisclosed writers are more numerous than the disclosed ones.** Every one of these
acceptance criteria requires a new dependency in `package.json`, from an item that does not own
it: ROOT.1.6 ("Tailwind v4 + shadcn/ui on Base UI", "TanStack Query + per-session Zustand");
ROOT.1.3 (oRPC + Zod); ROOT.2.1 (a SQLite driver — the item body explicitly makes driver
selection its first decision); ROOT.3.3 ("ts-fsrs pinned major"); ROOT.4.1 ("Motion 12
tokens"); ROOT.4.6 ("@xterm/xterm 6 + fit/webgl/serialize addons" per REQ-TX-01);
ROOT.4.8 (Playwright per REQ-TC-03); ROOT.5.1 (git plumbing). After Phase 0 reaches terminal
status, **no item owns `package.json` at all**, yet at least seven later items cannot satisfy
their criteria without writing it.

**Predicted failure:** in Phase 0, concurrent 1.1/1.5/1.6/1.3 writes clobber each other —
the most likely casualty is 1.1's REQ-CP-01 criterion ("`next-mdx-remote` is absent"), which a
later full-file write from 1.5's workspace restructure silently reintroduces, and which no gate
re-checks because ROOT.1.8's checklist is the REQ-MS-02 regression floor plus build/typecheck/lint
— a reinstated unused dependency breaks none of those. After Phase 0, later items either edit an
unowned file (violating the ownership model) or park.

### 4. `src/lib/projections.ts` — one file, one owner, four items that must write projection semantics into it
**Severity: critical**
**Pairs:** ROOT.2.2 (owner) vs ROOT.3.2, ROOT.3.3, ROOT.5.2
**Shared contract:** LANE-DEPENDENCIES row *"Projections (SkillState, ReviewQueue, Streak, ResumePosition, ArtifactHealth) — Sage (semantics) / Ramesh (SQL impl) — 'Every projection computed in exactly one place'"*

ROOT.2.2's entire `file_ownership` is `["src/lib/projections.ts"]`, and its own resume_hint
concedes the split: *"SkillState/ReviewQueue semantics finalize in Phase 2 — build the
projection frame + Streak/ResumePosition now, mastery semantics as consumers of ROOT.3.2."*
But ROOT.3.2's globs are `packages/learning-engine/src/mastery/**` and ROOT.3.3's are
`packages/learning-engine/src/scheduler/**`. ROOT.5.2 (artifact shelf, Phase 4) reads
ArtifactHealth whose semantics only exist once ROOT.5.1 defines artifact records — long after
ROOT.2.2 is terminal.

This directly collides with the shard's own hard invariant, REQ-EL-03 scenario 2: *"Given each
projection, when the codebase is searched, then exactly one implementation computes it."*

**Predicted failure:** ROOT.3.2 implements SkillState computation inside
`packages/learning-engine/src/mastery/` (its only writable location) while ROOT.2.2's
`projections.ts` already contains a SkillState frame. Two implementations of the same projection
now exist — a direct REQ-EL-03 scenario-2 failure, discovered at the Phase 2 Gate (ROOT.3.6),
whose fix requires reopening a `done` Phase 1 item. The same duplication recurs for ReviewQueue
(ROOT.3.3) and ArtifactHealth (ROOT.5.1/5.2). Note the aggravating factor in finding 21.

### 5. `content/curriculum.json` is unowned in Phase 4 while ~14 parallel module agents must all write it
**Severity: critical**
**Pair:** ROOT.3.1 (Phase 2 owner, terminal by then) vs ROOT.5.5 (14 concurrent per-module implementers)
**Shared file:** `content/curriculum.json`

ROOT.3.1 owns `content/curriculum.json`. ROOT.5.5 owns only `content/modules/**`,
`sandbox/templates/**`, `src/lib/verifiers/**`. But `curriculum-content.md` REQ-CC-01
current-state is explicit: *"`content/curriculum.json` MODIFIED — gains skillIds/boss/gate
fields"*, and REQ-MM-01 requires every module to declare 4–6 skills. Modules 2–14 cannot
declare skills, boss flags, or gate fields without writing `curriculum.json`.

ROOT.5.5's resume_hint asserts the safety property that makes parallel authoring viable:
*"per-module ownership per LANE-DEPENDENCIES (only shared file: append-only verifier registry
index)."* That assertion is false. `curriculum.json` is a **second** shared file, it is a
structured JSON document (not append-only line-per-entry), and it is outside ROOT.5.5's globs
entirely.

**Predicted failure:** thirteen module agents concurrently rewrite one JSON file. Unlike the
verifier registry ("conflicts are trivial, one line per verifier"), JSON object merges are not
trivially resolvable — the last writer wins and silently drops other modules' `skillIds`
entries. ROOT.5.6's gate criterion "All content CI gates green across 14 modules (one boss each,
skill refs...)" then fails with an unresolvable-looking skillId error whose true cause is a lost
write. Cross-track prerequisite edges (REQ-CC-01 scenario 1: modules 05/10/11 convergences,
declared *inviolable*) live in this same file and are equally exposed.

### 6. `src/lib/schema.ts` stewardship is modelled as a one-shot Phase-0 item, not a standing role
**Severity: critical**
**Pairs:** ROOT.1.2 (sole owner, Phase 0) vs ROOT.5.4, ROOT.5.5, ROOT.5.1, ROOT.5.3
**Shared contract:** LANE-DEPENDENCIES row *"Content schema — Atlas (as contract steward) — Only Atlas's lane edits the file; Sage/Nova request fields via him. Content agents NEVER touch it"*

ROOT.1.2 owns `src/lib/schema.ts` and its body states the rule absolutely: *"Consumers ... request
fields through this item; nobody else edits schema.ts — ever."* Under `org.md`'s
"ownership is active only while an item is non-terminal" rule, once ROOT.1.2 is `done` the file
has **no owner and no requesting channel**, while the mechanism the rule depends on (request
fields via the steward) requires a live steward.

Four later items need schema changes: ROOT.5.4 must amend `_TEMPLATE.md` with "test-out probe
definitions ... difficulty tiers, and workshop/artifact declarations" (REQ-CC-04 scenario 1) —
authoring fields the validator must accept; ROOT.5.3's test-out probes (REQ-BT-02: "same
verifier/rubric, different fixture") need a declaration form; ROOT.5.1's artifact record shape
(REQ-WA-03) must reconcile with REQ-CP-03's "artifact/verifier declarations"; ROOT.5.5's 14
agents will hit gaps (REQ-CC-04 scenario 2 *explicitly designs for this*: "any gaps found were
fed back into the template" — and ASSUMPTIONS #8 notes no module has ever been built from a spec).

**Predicted failure:** the first Phase-4 module agent that needs a schema field has no steward
to ask and no glob permitting the edit. Either (a) it edits `schema.ts` anyway — and since 13
agents run in parallel, several do, reproducing precisely the collision LANE-DEPENDENCIES exists
to prevent and which `org.md` cites as the reason 1.2 is a single-steward item; or (b) it
declares the field in content without schema support, `npm run validate` rejects it, and the
module parks. Neither outcome is caught before ROOT.5.6.

---

## MAJOR

### 7. `.program/interfaces/**` is owned solely by ROOT.1.2, but three later items have criteria to publish there
**Severity: major**
**Pairs:** ROOT.1.2 (owner) vs ROOT.2.1, ROOT.2.3, ROOT.4.5
**Shared glob:** `.program/interfaces/**`

ROOT.1.2's `file_ownership` includes `.program/interfaces/**`, and its criterion is "Interface
docs written for every LANE-DEPENDENCIES seam this phase touches (**event types deferred to
ROOT.2.1**)". But:
- ROOT.2.1 acceptance criterion: "Event types + payload shapes **published in
  `.program/interfaces/learning-events.md`**" — its globs are `src/lib/events.ts`,
  `src/lib/progress.ts`, `src/app/api/progress/**`.
- ROOT.2.3 resume_hint: "Verdict-shape doc to `.program/interfaces/` before ensemble work" —
  globs are `src/lib/judge.ts`, `src/app/api/playground/score/**`, `src/lib/calibration/**`.
- ROOT.4.5 resume_hint: "TermEvent contract doc to `.program/interfaces/`" — globs contain no
  `.program` path.

The glossary makes `.program/interfaces/` the *exit criterion* for the `Contract` level
("Interface doc in `.program/interfaces/`; consumers listed"), so this is load-bearing, not
bookkeeping.

**Predicted failure:** ROOT.2.1 cannot satisfy a stated acceptance criterion without writing
outside its globs. Either the criterion is silently skipped (and the event-type contract — THE
root dependency — never gets a published shape for ROOT.2.2/3.2/3.3/4.3 to build against), or
the ownership model is breached on the program's most consequential contract.

### 8. Missing edge: ROOT.4.6 consumes ROOT.4.1's tokens and a11y bar with no `depends_on`
**Severity: major**
**Pair:** ROOT.4.6 (Terminal experience) vs ROOT.4.1 (motion tokens, celebration API, a11y bar)
**Shared contract:** LANE-DEPENDENCIES row *"Motion tokens + celebration API — Nova — consumers: all lesson components"*

`terminal-experience.md` header: *"Depends on: ... `frontend-platform.md` (tokens; a11y bar)"*.
ROOT.4.1 owns FP-04/FP-05 (motion tokens + "WCAG 2.2 AA bar established with audit tooling").
ROOT.4.6's `depends_on` is `[ROOT.4.5]` only; ROOT.4.1's `blocks` is `[ROOT.4.2, ROOT.4.3]` —
4.6 is deliberately excluded.

Yet REQ-TX-04 (a11y transcript, throttled `aria-live`) is the same requirement as REQ-FP-05
scenario 2, and REQ-TX-02's "pulsing Workshop indicator" is motion.

**Predicted failure:** 4.6 ships dock/transcript against ad-hoc CSS and a hand-rolled
`aria-live` region because the token layer and audit tooling do not exist yet — then REQ-FP-03
scenario 2 ("reduced-motion degrades with no per-component opt-out") fails on the dock, and the
fix is a rewrite in a file 4.1 does not own.

### 9. Missing edge: ROOT.4.3's own acceptance criterion cites a contract owned by concurrent ROOT.4.7
**Severity: major**
**Pair:** ROOT.4.3 (Dashboard & wayfinding) vs ROOT.4.7 (Data layer)
**Shared contract:** REQ-DL-01 frozen UX read contract (<100ms reactive reads)

`dashboard-and-wayfinding.md` header: *"Depends on: ... `data-layer-and-offline.md` (reactive
<100ms reads)"*, and REQ-DW-01 scenario 4 is *"the hero's reads ... are reactive local queries
meeting the <100ms contract (data-layer REQ-DL-01)"*. REQ-DW-02 scenario 5 likewise requires
"one reactive query supplies the DAG + learner overlay". ROOT.4.3's `depends_on` is
`[ROOT.4.1]`; ROOT.4.7 has `depends_on: []` and `blocks: []` — it blocks nothing and nothing
waits for it.

**Predicted failure:** 4.3 builds hero/metro-map reads directly against projections or
per-request server calls (the only thing available), satisfying "position/next/why within 5s"
but not DW-01 scenario 4 or DW-02 scenario 5. 4.7 then delivers `src/lib/data/**` with no
consumer, and rewiring the dashboard requires editing 4.3's files after it is terminal. The
"simplicity-directive" lens on 4.7 will likely conclude the layer is unnecessary — locking in
the violation.

### 10. Missing edge: ROOT.3.3 serves variants that only ROOT.3.4 produces
**Severity: major**
**Pair:** ROOT.3.3 (Spaced review) vs ROOT.3.4 (Content generation / variant bank)
**Shared contract:** the variant bank format (`content/variants/**` + bundle representation)

`spaced-review.md` header lists *"`content-generation.md` (variant production)"* as a
dependency, and REQ-SR-03 ("Reviews serve banked variants/micro-probes") is one of ROOT.3.3's
four acceptance criteria. ROOT.3.3 `depends_on: [ROOT.3.2]`; ROOT.3.4 `depends_on: [ROOT.3.1]`.
Both are ready as soon as their single predecessor closes — concurrent, no edge, and 3.4 owns
`content/variants/**` which 3.3 must read.

**Predicted failure:** 3.3 defines its own variant lookup shape (probably `variantOf` +
`itemId`) while 3.4 emits a different bank structure; both pass their own verification because
3.3 exercises the "deliberate canonical fallback" path (SR-03 scenario 2), which is
indistinguishable from "the bank format doesn't match." Symptom: reviews permanently fall back
to canonical items — silently defeating REQ-SR-03's entire purpose (defeating brute-forcing),
and the ≥2-variant CI gate (CP-06 scenario 4) passes on a bank nothing reads.

### 11. ROOT.3.2 ↔ ROOT.3.3 is bidirectional but modelled one-way
**Severity: major**
**Pair:** ROOT.3.2 (Mastery model) vs ROOT.3.3 (Spaced review)
**Shared contract:** FSRS card state ↔ mastery promotion

Ledger: 3.3 `depends_on: [3.2]`. But REQ-MM-02 — one of ROOT.3.2's own criteria — requires
"FSRS stability ≥21 days" for Practiced→Fluent, and MM-02 scenario 4 is a *negative* test
requiring an FSRS card store to read. Likewise REQ-MM-02's "Failures reset scheduler stability
invisibly" writes scheduler state. The scheduler lives in ROOT.3.3's glob
(`packages/learning-engine/src/scheduler/**`); the mastery engine in ROOT.3.2's
(`packages/learning-engine/src/mastery/**`).

**Predicted failure:** ROOT.3.2 cannot verify MM-02 scenarios 4–5 before 3.3 exists, so it
either stubs FSRS stability (and the Fluent gate becomes vacuously true — a silent pedagogy
regression that the Phase 2 Gate's "never-demote" spot-check will not catch) or it writes
scheduler code inside `mastery/**`, duplicating 3.3's forthcoming card store.

### 12. Missing edges: ROOT.5.4 and ROOT.5.5 both encode boss/test-out rules that concurrent ROOT.5.3 defines
**Severity: major**
**Pair:** ROOT.5.3 (Boss & test-out) vs ROOT.5.4 (spec amendments) and ROOT.5.5 (module authoring)
**Shared contract:** boss authoring rules + test-out probe definitions

`curriculum-content.md` header: *"Depends on: ... `boss-and-test-out.md` (boss authoring
rules)"*. REQ-CC-04 scenario 1 requires the amended template to specify "a boss definition,
**test-out probe definitions**". ROOT.5.3 has `depends_on: []` and `blocks: []`; ROOT.5.4 has
`depends_on: []`. So 5.3 and 5.4 start concurrently, and 5.4 → 5.5 is the only hard order.

**Predicted failure:** 5.4 writes a `_TEMPLATE.md` boss/test-out section from the shard prose
while 5.3 independently implements probe mechanics (REQ-BT-02: "same verifier/rubric, different
fixture", "skills seeded Practiced never Fluent"). 13 module agents then author 13 bosses and
13 test-out probe sets against a template that does not match the engine's expected declaration
shape. The mismatch surfaces only at ROOT.5.6 — after all authoring is complete — and the
remediation is 13 parallel content edits. This is the single most expensive-to-repair coupling
defect in the decomposition.

### 13. ROOT.2.2's criterion re-backs an API owned by ROOT.2.1
**Severity: major**
**Pair:** ROOT.2.2 (Projections) vs ROOT.2.1 (event store)
**Shared files:** `src/app/api/progress/**`, `src/lib/progress.ts`

ROOT.2.2 acceptance criterion 4: "Progress GET/PUT re-backed by projections behind the existing
API shape" (REQ-EL-03 current-state: "`api/progress` route MODIFIED — GET/PUT re-backed by
projections"). ROOT.2.2's `file_ownership` is `["src/lib/projections.ts"]` — full stop. Both
target files belong to ROOT.2.1.

Because 2.2 `depends_on: [2.1]`, there is no *concurrent* write race — but 2.1 will be terminal
and therefore unowned when 2.2 runs, so 2.2 must write outside its declared globs to satisfy a
stated criterion.

**Predicted failure:** the criterion is dropped as "not my file" and the dual-write parity
evidence ROOT.2.5's gate demands ("legacy store and projections agree on a real profile's
progress") has nothing to compare, because reads were never routed through projections.

### 14. `scripts/validate-content.ts` has a single Phase-0 owner but its gates are staged across four later phases
**Severity: major**
**Pairs:** ROOT.1.4 (owner) vs ROOT.3.1, ROOT.3.4, ROOT.5.3, ROOT.5.5, ROOT.5.6
**Shared file:** `scripts/validate-content.ts` (and `.github/**`)

REQ-CP-06 defines six CI gates; the ledger distributes responsibility for *activating* them
across phases while ownership sits in Phase 0:
- ROOT.3.1 criterion: "CI resolves every skillId reference or fails the build (**activates
  ROOT.1.4's gate**)" — 3.1's globs are content files only.
- ROOT.3.4 body: "The ≥2-variant CI gate (CP-06) cannot hard-fail until the owner reviews the
  first bank — the phase coordinator ADRs **the gate's soft/hard staging**" — 3.4's globs are
  `scripts/generate-variants*`, `content/variants/**`.
- ROOT.5.3 (one-boss-per-module, CI-enforced) and ROOT.5.6 ("All content CI gates green across
  14 modules") assume gates that only 1.4 can write.

**Predicted failure:** ROOT.1.4 implements all six gates in Phase 0, when no content declares
skills, no variants exist, and no module has a boss. Gates 2–5 must therefore ship disabled or
warn-only. Nothing in the ledger owns flipping them to hard-fail, so ROOT.5.6's "all content CI
gates green" passes against a permanently soft gate — the CI protection for the entire
curriculum is vacuous, and this is invisible to a green build.

### 15. `src/lib/verifiers/**` is owned wholesale by ROOT.5.5's 14 parallel agents, including the files LANE-DEPENDENCIES forbids them to touch
**Severity: major**
**Pair:** ROOT.5.5 (module authoring, fans out to ~14 implementers) vs ROOT.4.8 / ROOT.1.4 (harness + golden matrix)
**Shared contract:** LANE-DEPENDENCIES row *"Verifier registry + golden matrix — **Ramesh** (harness) — Content agents ADD registry entries + their own `mNN-*.ts`; **never edit common.ts**"*

ROOT.5.5's glob is `src/lib/verifiers/**` — the whole tree, including the two files the ground
truth explicitly protects: `src/lib/verifiers/index.ts` (append-only, one line per verifier) and
`src/lib/verifiers/common.ts` (never edited by content agents). No item in the program is the
harness owner; `ROOT.5.md`'s body asserts the append-only property but the ledger encodes
nothing.

**Predicted failure:** a module agent needing a shared helper edits `common.ts` (its glob
permits it), changing behavior for every previously-verified module. REQ-CC-02 scenario 2
(pristine-must-fail / solution-must-pass, both directions, for *every* registered verifier) then
fails for modules that were already green, at ROOT.5.6, with 13 candidate culprits. Secondary:
`index.ts` is a real merge point for 13 concurrent agents with no encoded append-only rule.

### 16. Two homes for one execution seam: AgentRunner (ROOT.1.5, `packages/**`) vs ExecutionDriver (ROOT.4.5, `src/lib/execution/**`)
**Severity: major**
**Pair:** ROOT.1.5 (production seams) vs ROOT.4.5 (execution layer); consumer ROOT.4.8
**Shared contract:** LANE-DEPENDENCIES rows *"ExecutionDriver interface (Local/Cloud) — **Atlas**; Ramesh implementations"* and *"TermEvent protocol — **Ramesh**"*

ROOT.1.5 delivers "AgentRunner seam wraps claudeSpawn lineage with recorded-transcript fakes
(EX-04)" into `packages/**` + `src/lib/claudeSpawn.ts`. ROOT.4.5 delivers "ExecutionDriver
interface with LocalDriver primary" into `src/lib/execution/**` + `src/lib/claudeSpawn.ts`. The
shards treat these as one thing (REQ-EX-01 "One interface, one stream protocol, one dock UX";
REQ-EX-04's AgentRunner is a *seam over the same claudeSpawn lineage*), but the ledger creates
two abstractions in two packages in two phases, with no interface item and no statement of
their relationship. `org.md` records only the *file* overlap on `claudeSpawn.ts` ("sequential
phases, no live overlap") — not the *abstraction* overlap.

**Predicted failure:** the app ends up with `AgentRunner` (Phase 0, with the CI fakes wired to
it) and `ExecutionDriver`/`LocalDriver` (Phase 3, with the durable seq-log and reattach). The
cassettes ROOT.4.8 must make merge-blocking (REQ-TC-02) attach to whichever seam their author
finds first; REQ-EX-04 scenario 2 ("real and fake runners satisfy the same AgentRunner
interface") and REQ-EX-01 scenario 1 (identical TermEvent stream) can both pass while the fake
path bypasses the durable log entirely — so "no live-CLI on PRs" is satisfied by a fake that
does not exercise the shipped code path.

### 17. Phase-level `file_ownership` globs are neither disjoint nor supersets of their children — so they cannot be used as the containment check `org.md` claims
**Severity: major**
**Pairs:** ROOT.1 / ROOT.2 / ROOT.3 / ROOT.4 / ROOT.5 mutually
**Shared globs:** multiple

`org.md` states: *"Phase items own disjoint globs except two recorded, deliberately sequenced
overlaps."* Verified false in both directions.

Phase globs that overlap each other (beyond the two recorded):
- `ROOT.4: src/app/**` ⊇ `ROOT.2: src/app/api/progress/**` and `ROOT.2: src/app/api/playground/score/**`.
- `ROOT.3: packages/learning-engine/**` ⊇ `ROOT.5.3: packages/learning-engine/src/boss/**`.
- `ROOT.3: content/modules/01-how-llms-work/**` ⊂ `ROOT.5: content/modules/**`.
- `ROOT.1: packages/**` ⊇ `ROOT.3: packages/learning-engine/**`.
- `ROOT.4: src/components/**` ⊇ `ROOT.5.3: src/components/lesson/Boss*` and `ROOT.5.2: src/components/workshop/**`.

Children owning paths their parent phase does not declare: ROOT.1.3 (`src/app/api/**`,
`src/lib/api/**`, `src/proxy.ts`), ROOT.1.5 (`pnpm-workspace.yaml`), ROOT.1.6
(`src/components/ui/**`, `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.*`),
ROOT.2.3 (`src/lib/calibration/**`), ROOT.3.4 (`scripts/generate-variants*`,
`content/variants/**`), ROOT.3.5 (`src/app/api/tutor/**`), ROOT.4.1 (`src/lib/motion/**`),
ROOT.4.5 (`src/lib/execution/**`), ROOT.4.7 (`src/lib/data/**`), ROOT.5.2
(`src/components/workshop/**`, `src/app/workshop/**`), ROOT.5.3 (both globs).

**Predicted failure:** any tooling or reviewer that validates "leaf glob ⊆ phase glob" or
"phase globs are disjoint" reports mass violations and gets ignored as noise; the genuine
overlaps (findings 1, 2, 3) hide in that noise. Concretely: the cross-phase safety argument
("phase ordering guarantees no two phases are concurrently active") fails the moment a Gate
halts and a phase is reopened for fix-forward — which REQ-MS-02 scenario 1 makes a *designed*
occurrence, not an exception.

### 18. REQ-CC-06 (quiz answer-reveal) is claimed by two items, and the file it needs is owned by neither
**Severity: major**
**Pair:** ROOT.4.2 vs ROOT.5.5 (both claim ADR-0006 / CC-06); file owner is ROOT.1.3
**Shared files:** `src/app/api/quiz/submit/**`, `src/components/lesson/Quiz.tsx`

ROOT.4.2's body: "Quiz reveal policy per ADR-0006." ROOT.5.5's acceptance criterion: "Quiz
reveal policy per ADR-0006 (CC-06)." `curriculum-content.md` REQ-CC-06 current-state names the
files: *"`api/quiz/submit` MODIFIED; `Quiz.tsx` MODIFIED"*, and scenario 3 requires per-question
results to "land as events". `src/app/api/quiz/**` is matched only by ROOT.1.3's
`src/app/api/**` (Phase 0, whose criteria say nothing about reveal policy); the event write
needs `src/lib/events.ts` (ROOT.2.1). ROOT.5.5's globs contain no `src/app/**` at all.

**Predicted failure:** ROOT.5.5 (14 content agents) cannot change server grading behavior, and
ROOT.4.2 does not own the route either. The requirement — flagged in the shard as *deliberately
contradicting current behavior* — is the kind that silently doesn't happen. Quizzes stay
brute-forceable, which also invalidates REQ-SR-03's premise; and the regression floor's
"server-side quiz grading with teaching explanations" keeps passing, so no gate notices.

### 19. ROOT.5.1's Workshop criteria require writes into ROOT.4.5's execution/sandbox files
**Severity: major**
**Pair:** ROOT.5.1 (Workshop plumbing) vs ROOT.4.5 (Execution layer)
**Shared files:** `src/lib/sandbox.ts`, `src/lib/execution/**`

`workshop-and-artifacts.md` header: *"Depends on: `execution-layer.md` (Claude runs scoped to
the workshop dir; sandbox isolation REQ-EX-06)"*, and REQ-WA-01 current-state: *"`sandbox.ts`
MODIFIED gains Workshop-adjacent lifecycle"*. REQ-EX-06 scenario 3 requires bulk sandbox cleanup
to *exclude* the Workshop directory. ROOT.5.1's entire glob is `["src/lib/workshop.ts"]`;
ROOT.5.1 `depends_on: []`.

**Predicted failure:** either ROOT.4.5 (Phase 3) implements a Workshop exclusion for a directory
concept that does not yet exist — untestable, so likely a TODO — or ROOT.5.1 edits `sandbox.ts`
outside its globs in Phase 4. The failure mode of getting this wrong is destructive: a bulk
sandbox reset deletes learner Workshop repos, violating the REQ-MS-03 never-delete flag that
both items cite. No item owns the seam where that guard must live.

### 20. ROOT.5.2's shelf depends on dock and celebration surfaces it does not own, built a phase earlier
**Severity: major**
**Pair:** ROOT.5.2 (Artifact shelf) vs ROOT.4.6 (dock) and ROOT.4.1 (celebration API)
**Shared files/contracts:** `src/components/terminal/**` (Workshop dock tab + pulsing indicator); celebration ladder API

REQ-TX-02 (ROOT.4.6, Phase 3) requires "a pulsing Workshop indicator" in the dock; REQ-WA-04
(ROOT.5.2, Phase 4) requires "artifact-created triggers a shelf animation via the celebration
ladder" and live ArtifactHealth badges. ROOT.5.2's resume_hint acknowledges the coupling
("dock tab from ROOT.4.6") but its globs are `src/components/workshop/**`,
`src/app/workshop/**`. ROOT.4.6 has no dependency on, or knowledge of, workshop semantics.

**Predicted failure:** 4.6 ships a dock with a Workshop tab wired to nothing (there is no
Workshop in Phase 3), and 5.2 cannot complete the wiring because the dock files belong to a
terminal item. Either a dead tab ships (contradicting REQ-DW-03's own "locked state is explicit,
not `href='#'`" principle applied to dead links) or 5.2 breaches ownership.

### 21. `ROOT.4` declares `src/lib/projections-read/**`, which no child owns — an invitation to a second projection implementation
**Severity: major**
**Pair:** ROOT.4 (phase) vs ROOT.2.2 (projections owner)
**Shared contract:** REQ-EL-03 "every projection computed in exactly one place"

`ROOT.4.file_ownership` includes `src/lib/projections-read/**`. None of ROOT.4.1–4.9 claim it.
The path does not exist in the repo. The name itself asserts a *second* module in the projection
pipeline, which is precisely what REQ-EL-03 scenario 2 and the LANE-DEPENDENCIES "Projections"
row ("Nova reads them; never computes her own") forbid.

**Predicted failure:** whichever Phase-3 item first needs a read path (4.3 hero, 4.7 data layer)
creates `src/lib/projections-read/` and puts derivation logic there because the glob exists at
the phase level and grants apparent permission. That is a duplicate projection implementation
with a name that makes it look sanctioned — the hardest kind for a reviewer to challenge.
Compounds finding 4.

### 22. ROOT.4.2 and ROOT.4.3 both own breadcrumbs, in different files, concurrently
**Severity: major**
**Pair:** ROOT.4.2 (lesson page) vs ROOT.4.3 (sidebar/breadcrumbs)
**Shared contract:** the lesson breadcrumb (`Map › track › module › Lesson n of m`)

ROOT.4.2 criterion (LX-04): "Header + warm-up beat 0 + rail + session-end anatomy" — the
anatomy's first element is the "breadcrumb header". ROOT.4.3 criterion (DW-03) covers
"Progress-aware sidebar + breadcrumbs", and REQ-DW-03 scenario 4 is *"Given a lesson page, when
breadcrumbs render, then they show map › track › module › 'Lesson n of m'"* — a scenario
verified on 4.2's page, implemented from 4.3's `src/components/nav/**`. Both depend only on 4.1;
concurrent.

**Predicted failure:** two breadcrumb components, or a DW-03 scenario 4 that 4.3 cannot verify
because it does not own the page that renders it. The likelier outcome is duplication with
divergent labels, which then makes ROOT.4.9's "owner UI [HARD]s 26–29 re-verified" ambiguous
about which surface is authoritative.

---

## MINOR

### 23. `org.md` documents a Phase-3 `layout.tsx` overlap that does not exist, and omits the one that does
**Severity: minor**
**Pair (claimed):** ROOT.4.1 vs ROOT.4.6. **Pair (actual):** ROOT.1.6 vs ROOT.4.6.
**Shared file:** `src/app/layout.tsx`

`org.md`: *"within Phase 3 the coordinator sequences `src/app/layout.tsx` (4.1 vs 4.6)."*
ROOT.4.1's globs are `src/components/ui/**` and `src/lib/motion/**` — it does not own
`layout.tsx`. The real contenders are ROOT.1.6 (owns `src/app/layout.tsx`, Phase 0: RSC posture,
providers, Geist fix, ThemeToggle) and ROOT.4.6 (owns it in Phase 3: PersistentTerminalHost +
dock). The mitigation note therefore guards a non-existent conflict while the actual one is
unrecorded.

**Predicted failure:** low blast radius (cross-phase), but the specific loss mode is real:
ROOT.4.6 rewrites `layout.tsx` to insert the host/dock and drops a provider or the ThemeToggle
placement from 1.6 — CONSTRAINTS #27 [HARD] and #26. ROOT.4.9 does re-verify [HARD]s 26–29, so
this is caught late rather than never.

### 24. Files with live requirements and no owner anywhere in the program
**Severity: minor**
**Files:** `src/lib/profiles.ts`, `src/lib/content.ts` (after Phase 0), `src/app/api/profiles*`

- `src/lib/profiles.ts` appears in no item's `file_ownership`, yet REQ-PI-01 is an acceptance
  criterion of ROOT.4.3 (globs: `src/app/profiles/**`, i.e. the page, not the lib) and
  per-profile isolation is separately asserted by ROOT.4.5 (EX-06) and ROOT.5.1 (WA-01) —
  three items, one invariant, zero owners.
- `src/lib/content.ts` is owned only by ROOT.1.1 (Phase 0). REQ-MM-04 current-state requires
  "`src/lib/content.ts` gating MODIFIED — `isModuleUnlocked` survives; new states layer on top"
  in Phase 2 (ROOT.3.2, globs `packages/learning-engine/src/mastery/**`), and REQ-DL-01
  current-state says content.ts's per-request recompute is "later replaced by LearnerState
  projection" (ROOT.4.7).

**Predicted failure:** module-state gating (Locked→…→Mastered) gets implemented twice — once in
`content.ts`'s surviving `isModuleUnlocked` and once in the learning engine — with the UI reading
whichever it finds. REQ-MM-04 scenarios pass in the engine while the actual navigation gate uses
the old logic.

### 25. `ROOT` owns `.program/**`, a superset of every child's audit/interface/probe glob
**Severity: minor**
**Pair:** ROOT vs ROOT.1.2, ROOT.1.7, and all five Gates

Parent-child glob nesting is normal for a tree, but here the parent is an *active* implementer:
`ROOT.artifacts` lists `.program/glossary.md`, `.program/org.md`, and six ADRs, and the director
writes HEADLINE/INDEX. The nesting means no ownership signal distinguishes "director may write
`.program/decisions/`" from "director may rewrite `.program/interfaces/beat-model.md`" (ROOT.1.2)
or a gate's evidence doc.

**Predicted failure:** low. A reporter/director regeneration pass overwrites or reformats an
interface doc or gate evidence file; recoverable, but it weakens evidence-authenticity, which is
a required lens on all five Gates.

### 26. ROOT.5.2's shelf animation requires extending ROOT.4.1's celebration API
**Severity: minor**
**Pair:** ROOT.5.2 vs ROOT.4.1
**Shared contract:** celebration API (single confetti primitive, server-confirmed triggers)

REQ-WA-04 scenario 2 requires the shelf animation to fire on a server event "per frontend-platform
REQ-FP-04", and REQ-FP-04 scenario 1 requires *exactly one* confetti primitive reachable only
through the celebration API — owned by ROOT.4.1 (`src/lib/motion/**`, `src/components/ui/**`),
terminal by Phase 4. ROOT.5.2 owns neither.

**Predicted failure:** 5.2 adds a second animation primitive inside
`src/components/workshop/**`, breaching FP-04 scenario 1. Caught only if someone re-runs the
Phase-3 dependency-graph audit during Phase 4, which no gate requires.

### 27. ROOT.1.1 owns `LessonRenderer.tsx`, which ROOT.4.2 is chartered to delete
**Severity: minor**
**Pair:** ROOT.1.1 (Phase 0) vs ROOT.4.2 (Phase 3)
**Shared file:** `src/components/lesson/LessonRenderer.tsx`

Cross-phase, so no write race. Recorded because the handoff is unstated: ROOT.1.1 must keep
lesson rendering working at the Phase 0 Gate after removing `next-mdx-remote` (REQ-MS-02 floor
includes "lesson rendering with sanitized quiz payloads"), i.e. it ships an interim renderer;
ROOT.4.2 then replaces it with BeatRenderer and must retire the predecessor only post-floor
(REQ-MS-02 scenario 2). Neither item names the other, and `ROOT.4.md`'s REPLACED list mentions
LessonRenderer without an edge to 1.1.

**Predicted failure:** the interim renderer's carried-over pieces (components map + quiz
sanitization, per REQ-CP-01 current-state) get dropped in the 4.2 rewrite, breaking sanitized
quiz payloads — a regression-floor item, so caught at ROOT.4.9, late.

---

## Summary of seam-ownership audit (LANE-DEPENDENCIES "Shared files/contracts", row by row)

| Seam row | Exactly one owning item? | Consumers depend rather than co-edit? | Finding |
|---|---|---|---|
| Content schema (`schema.ts`) | Only in Phase 0 (ROOT.1.2); unowned after | No — Phase 4 items need fields with no steward | 6 |
| Beat model type | Yes (ROOT.1.2, published to interfaces) | Yes | — |
| `learning_events` types | Yes (ROOT.2.1) | Yes, but the interface doc lands outside its globs | 7 |
| Projections | No — file (2.2) and semantics (3.2/3.3/5.1) split across phases | No | 4, 21 |
| Judge verdict shape | Yes (ROOT.2.3) | Two-key sign-off has no mechanism once 2.3 is terminal | 7 |
| Mastery vocabulary | Yes (ROOT.3.2) | Yes (4.3 renders) | — |
| TermEvent protocol | Ambiguous — 1.5 (AgentRunner) vs 4.5 (ExecutionDriver) | No | 16 |
| ExecutionDriver interface | Ambiguous, same as above | No | 16 |
| Hint-ladder rung semantics | Yes (ROOT.3.5) | Rung-4 evidence accounting lives in 3.2's glob | 11 (adjacent) |
| Verifier registry + golden matrix | No — 5.5 owns the whole tree, no harness owner | No | 15 |
| Sandbox templates | Yes (ROOT.5.5) | Yes | — |
| Calibration goldens | Yes (ROOT.2.3 `src/lib/calibration/**`) | CI wiring owner (1.4/4.8) is cross-phase | 14 |
| Motion tokens + celebration API | Yes (ROOT.4.1) | No — 4.6 has no edge; 5.2 must extend it | 8, 26 |
| Metro-map layout data | Split by design (1.1 bundle / 4.3 render), cross-phase | Yes | — |
| Workshop git plumbing | Yes (ROOT.5.1) | Requires sandbox/execution writes it does not own | 19 |
| ModelRouter | Yes (ROOT.1.5) | Yes | — |

## Counts

- critical: 6 (findings 1–6)
- major: 16 (findings 7–22)
- minor: 5 (findings 23–27)
