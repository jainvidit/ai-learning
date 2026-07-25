---
id: ROOT.1.1.2
parent: ROOT.1.1
type: Task
title: Beat compiler — ordered beat arrays with stable beatIds
ledger_depth: 3
status: in_progress
owner_agent: implementer-ROOT.1.1.2-gen0
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-02
acceptance_criteria:
  - Every built lesson yields an ordered Beat[] where each beat has beatId, type from the closed set (prose|quiz|playground|terminal|challenge|widget), and a completion predicate (CP-02 scenario 1)
  - Prose-only edits preserve all existing beatIds across rebuild; insert/delete elsewhere preserves other beats' beatIds; deleted IDs never reassigned (CP-02 scenario 2; beat-model.md S1–S4, I1–I4) — proven by vitest tests following beat-model.md "How to test it" steps 1–4
  - Terminal beats carry persistent: true (CP-02 scenario 3); compiler enforces the predicate x type mapping (beat-model.md table) and fails the build on violation
  - npm test passes; npx tsc --noEmit passes; npm run build passes; evidence paths recorded
depends_on: [ROOT.1.1.1]
blocks: [ROOT.1.1.3, ROOT.1.1.4]
children: []
file_ownership: ["src/lib/content.ts", "src/lib/beats.ts", "tests/beats.test.ts"]
review: {tier: 2, required_lenses: [spec-conformance, framework-empirical], verdicts: []}
verification:
  - criterion: "AC1 — every built lesson yields an ordered Beat[] with beatId, closed-set type, completion predicate (CP-02 sc.1)"
    method: "Emitted the real bundle via compileAllLessonBeats() over the authored corpus (5 built lessons, 43 beats) and inspected it; plus vitest describe('REQ-CP-02 scenario 1 …') asserting shape, closed-set type, valid predicate, NO field outside {beatId,type,persistent?,completion} (guards ADR-0011 #6 no-itemRevision), 1:1 exercise->beat type mapping, zero widget beats (ADR-0011 #5), and source ordering; plus describe('the real authored corpus compiles and conforms') re-running the gate on-disk."
    evidence: ".program/audits/ROOT.1.1.2-verification/authored-corpus-beats.json; .program/audits/ROOT.1.1.2-verification/npm-test.txt; tests/beats.test.ts"
    verdict: pass
  - criterion: "AC2 — beatId stability (S1–S4, I1–I4) proven by beat-model.md 'How to test it' steps 1–4"
    method: "Four vitest describe blocks named 'beat-model.md step 1'..'step 4', implementing the procedure literally against tests/fixtures/beats-fixture-lesson.ts (baseline + prose-only-edit + insert-between-beats-2-and-3 + delete variants). Step 1 records the exact ordered id list and asserts byte-identical recompile (S2). Step 2 asserts the FULL id list unchanged and the whole array deep-equal (S1). Step 3 asserts every pre-existing id unchanged AND deep-equal, the new id is not any pre-existing id (I1), and post-insertion beats shifted index while keeping ids (S3). Step 4 asserts no surviving beat took the deleted id and that a later rebuild adding different content still never claims it (I2). Structural backing: duplicate keys throw instead of being ordinal-suffixed, and beats.ts is I/O-free/clock-free/counter-free so S2 is a code property."
    evidence: ".program/audits/ROOT.1.1.2-verification/npm-test.txt (65/65 passed); tests/beats.test.ts; tests/fixtures/beats-fixture-lesson.ts; .program/audits/ROOT.1.1.2-verification/README.md"
    verdict: pass
  - criterion: "AC3 — terminal beats carry persistent: true (CP-02 sc.3); compiler enforces the predicate x type mapping and fails the build on violation"
    method: "vitest: terminal beat has persistent:true, non-persistent beats OMIT the flag (absent===false per contract), and assertValidBeats throws BeatCompileError on a terminal beat missing it. COMPLETION_BY_BEAT_TYPE deep-equals the beat-model.md table and is total over the closed set; 12 parameterised cases assert EVERY invalid type x completion pair in that table throws. Two enforcement layers: Record<BeatType,CompletionPredicate> makes tsc fail if a type is added without a predicate; assertValidBeats re-checks every emitted array so a later edit cannot ship a violating bundle."
    evidence: ".program/audits/ROOT.1.1.2-verification/npm-test.txt; .program/audits/ROOT.1.1.2-verification/tsc-noemit.txt; src/lib/beats.ts (COMPLETION_BY_BEAT_TYPE, PERSISTENT_BEAT_TYPES, assertValidBeats)"
    verdict: pass
  - criterion: "AC4 — npm test / npx tsc --noEmit / npm run build pass; evidence paths recorded (+ npx eslint on owned files)"
    method: "Ran all four in the MAIN checkout (worktree has no node_modules). npm test: exit 0, 2 files / 65 tests passed. npx tsc --noEmit: exit 0, no output. npm run build ('velite build --clean && next build', Turbopack default per docs/nextjs-conventions.md): exit 0, 14/14 static pages, all 15 routes. npx eslint on the 4 owned/created files: exit 0, no output. Port 3000 never touched; no dev server started."
    evidence: ".program/audits/ROOT.1.1.2-verification/npm-test.txt; .program/audits/ROOT.1.1.2-verification/tsc-noemit.txt; .program/audits/ROOT.1.1.2-verification/npm-run-build.txt; .program/audits/ROOT.1.1.2-verification/eslint-owned-files.txt"
    verdict: pass
artifacts:
  - src/lib/beats.ts (NEW — pure beat compiler)
  - src/lib/content.ts (MODIFIED — beat-compile step + re-exports; all pre-existing exports verbatim)
  - tests/beats.test.ts (NEW — 62 beat tests incl. beat-model.md steps 1–4)
  - tests/fixtures/beats-fixture-lesson.ts (NEW — extra fixture file, recorded per task instruction)
  - .program/ledger/items/ROOT.1.1.2.md (ledger)
  - .program/ledger/events/ROOT.1.1.2.jsonl (ledger)
  - .program/audits/ROOT.1.1.2-verification/README.md (NEW — evidence doc)
  - .program/audits/ROOT.1.1.2-verification/npm-test.txt (NEW)
  - .program/audits/ROOT.1.1.2-verification/tsc-noemit.txt (NEW)
  - .program/audits/ROOT.1.1.2-verification/npm-run-build.txt (NEW)
  - .program/audits/ROOT.1.1.2-verification/eslint-owned-files.txt (NEW)
  - .program/audits/ROOT.1.1.2-verification/authored-corpus-beats.json (NEW — emitted bundle evidence)
resume_hint: "gen0 COMPLETE — all 4 ACs pass with evidence in .program/audits/ROOT.1.1.2-verification/. Code is in the MAIN checkout (byte-identical copies also in this worktree). Nothing left to implement; awaiting tier-2 review (spec-conformance + framework-empirical)."
---
Implement the beat compiler producing the shape in `.program/interfaces/beat-model.md`
(BUILD TO IT — never edit it; change requests route through the steward). Read
docs/nextjs-conventions.md first.

Algorithm is FIXED by ADR-0011 (.program/decisions/ADR-0011.md) — do not redesign:
- Segment lessons at <Exercise id/> anchors and h2 headings.
- beatIds: exercise beats `ex:<exerciseId>`; prose beats `prose:<slug-of-h2>`;
  pre-first-h2 segment `prose:intro`. Duplicate keys in a lesson = build failure
  (no ordinal suffixing).
- Exercise type maps 1:1 to beat type (quiz/playground/terminal/challenge).
- No `widget` beats yet — custom components stay inside prose beats (ADR-0011 #5).
- Predicate x type: prose/playground/terminal/widget -> "attempted"; quiz -> "passed";
  challenge -> "verified" (beat-model.md mapping table; compiler-enforced).
- persistent: true on every terminal beat (and any streaming beat).
- itemRevision is NOT a Beat field — sidecar, ROOT.1.1.3/4 (ADR-0011 #6).

Preferred layout: pure compile logic in new src/lib/beats.ts; src/lib/content.ts gains
the beat-compile step and exports it (isModuleUnlocked/lessonKey survive verbatim —
REQ-CP-02 current-state note). Tests in tests/beats.test.ts (or colocated per existing
vitest convention — check vitest config) implementing beat-model.md's four assertion
steps against a fixture lesson. src/lib/schema.ts is steward-owned — never edit.
NEVER touch port 3000 / npm run dev (CONSTRAINTS #17).

## gen0 tier-2 pre-implementation plan (required at this tier)

1. **Contract touched:** `.program/interfaces/beat-model.md` — the compiled Beat shape
   (`beatId` / `type` / `persistent?` / `completion`), its S1–S4 + I1–I4 stability
   invariants, and its predicate x type mapping table. I am on the PRODUCER side: that
   doc names "Beat Compiler (`src/lib/content.ts`) — **produces** this shape".
2. **Who owns the other side:** the contract file is steward-owned — ROOT.1.2 while open,
   ROOT.7.1 after (Atlas, beat type steward). Downstream consumers are ROOT.1.3 (carries
   the shape over the oRPC/Zod boundary), ROOT.4.2 (BeatRenderer), ROOT.4.6
   (PersistentTerminalHost), ROOT.4.3 (resume-to-beat deep links). None of their files
   are touched by this item.
3. **What I will NOT change:** `.program/interfaces/beat-model.md` (never edited — any
   shape change is a needs_split/blocked signal, not my judgment call);
   `src/lib/schema.ts` (steward-owned); `package.json` (not in my ownership);
   `velite.config.ts`; `isModuleUnlocked` / `lessonKey` / every other existing export of
   `content.ts` (bodies survive verbatim); the `loadLesson()` return shape (no new field
   — a separate `getLessonBeats()` entry point keeps the six exercise-only API routes
   decoupled from beat compilation, preserving content.ts's documented
   degrade-gracefully property). No new dependency; no `itemRevision` field; no `widget`
   beats.

### gen0 working notes (empirical, from the repo — not from memory)

- Beat source of truth is the **raw MDX body**, not Velite's `code`: Velite emits compiled
  MDX *function-body JS* (`outputFormat: 'function-body'`, velite.config.ts), in which h2
  headings have already become `_jsx("h2", …)` calls. Segmenting that string would be
  parsing generated JS. `loadLesson()` already returns the raw `mdx` body from
  `gray-matter`, so beats compile from `mdx` + `exercises` — both already loaded.
- Authored corpus (5 lessons, module 01): 7 `<Exercise id=…/>` anchors; exercise types
  present are only `quiz` (5) and `playground` (2). No terminal/challenge exercise exists
  yet, so those two rows of the mapping table are covered by fixtures, not by real content.
- Existing vitest convention: `tests/**/*.test.ts` + `src/**/*.test.ts` are included and
  `tests/e2e/**` excluded (vitest.config.ts). `tests/seed.test.ts` is the only unit test,
  so `tests/beats.test.ts` (the item's preferred path) IS the existing convention — no
  colocation deviation needed.

## gen0 implementation decisions (for the reviewer — each is inside the fixed algorithm)

These are readings of ADR-0011 / beat-model.md, not redesigns. Each is documented at its
site in `src/lib/beats.ts`.

1. **Beats compile from the RAW MDX body, not Velite's `code`.** Velite emits
   `outputFormat: 'function-body'`, so in `code` an `h2` is already a `_jsx("h2", …)` call;
   segmenting it would mean parsing generated JavaScript. `loadLesson()` already returns the
   authored body, which is the only sound identity source.
2. **One prose beat per h2 SECTION, positioned at its heading.** ADR-0011 #1 says "one
   prose beat per h2 section". So `text → anchor → more text` under one heading yields ONE
   prose beat, not two — the two-beat reading would emit two beats keyed `prose:<same-slug>`
   and so trip ADR-0011 #3's duplicate-key build failure on ordinary content. Every h2 gets
   its prose beat even when heading-only, so adding/removing sentences never creates or
   destroys a beat (S1). Test: "emits ONE prose beat for a section whose text is split by an
   anchor".
3. **Fenced code blocks and h3+ headings are not boundaries.** A `## …` or `<Exercise …/>`
   inside a fence is sample text; honouring it would let a code sample invent a beat.
4. **`PERSISTENT_BEAT_TYPES` = {terminal} only.** beat-model.md also requires `true` for
   "streaming" beats. `Playground.tsx` does stream (`res.body.getReader()` on
   `/api/playground/run`), but the obligations the flag imposes are SESSION-survival ones
   (stay mounted across route changes, never `display:none`, reserve min-height for xterm
   `fit()`). A playground run is request-scoped with no session identity to restore, and
   flagging it would impose portal-slot duties on ROOT.4.2/4.6 that their specs never ask
   for. Adding a type later is additive and churns no beatId. **Flagged for the reviewer as
   the one judgment call in this leaf.**
5. **`getLessonBeats()` / `compileAllLessonBeats()` are new entry points; `loadLesson()`'s
   return shape is unchanged.** Compiling beats inside `loadLesson()` would put a
   build-failure throw in the path of the six exercise-only API routes, contradicting the
   degrade-gracefully property content.ts documents for the compiled bundle.
6. **`persistent` is emitted only when `true`** — absent === false is normative, and an
   explicit `false` adds noise consumers must treat identically.
