---
id: ROOT.1.1.2
parent: ROOT.1.1
type: Task
title: Beat compiler — ordered beat arrays with stable beatIds
ledger_depth: 3
status: proposed
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
resume_hint: "Not yet dispatched. Requires ROOT.1.1.1 done."
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
