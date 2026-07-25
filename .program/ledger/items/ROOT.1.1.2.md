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
verification: []
artifacts: []
resume_hint: "gen0 in progress. Tier-2 plan at the bottom of this file. Code lands in the MAIN checkout (worktree has no node_modules)."
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
