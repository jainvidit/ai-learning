---
id: ROOT.4
parent: ROOT
type: Phase
title: Phase 3 — Experience layer
ledger_depth: 1
status: proposed
owner_agent: null
owner_model: null
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-01
  - .program/spec/frontend-platform.md
  - .program/spec/lesson-experience.md
  - .program/spec/dashboard-and-wayfinding.md
  - .program/spec/terminal-experience.md
  - .program/spec/execution-layer.md
  - .program/spec/playground.md
  - .program/spec/data-layer-and-offline.md
acceptance_criteria:
  - Frontend platform substrate live — tokens, motion, celebration API, a11y bar (frontend-platform)
  - Beat-rendered lesson page with soft frontier, rail, warm-up, session-end, resume-to-beat (lesson-experience)
  - Hero dashboard + metro map + progress-aware sidebar; owner UI [HARD]s 26–29 preserved (dashboard-and-wayfinding)
  - ExecutionDriver + durable seq-log sessions + LocalDriver; server-held reattach (execution-layer)
  - Terminal dock with PersistentTerminalHost; a11y transcript (terminal-experience)
  - Playground on resumable SSE with rubric transparency (playground)
  - Data layer per ADR-0003 — DL-01/02 only, offline deferred
  - Phase 3 Gate (ROOT.4.9) passed
depends_on: [ROOT.3]
blocks: [ROOT.5]
children: [ROOT.4.1, ROOT.4.2, ROOT.4.3, ROOT.4.4, ROOT.4.5, ROOT.4.6, ROOT.4.7, ROOT.4.8, ROOT.4.9, ROOT.4.10]
file_ownership: ["src/app/**", "src/components/**", "src/lib/claudeSpawn.ts", "src/lib/sandbox.ts", "src/lib/execution/**", "src/lib/data/**", "src/lib/motion/**", "src/lib/tutor/**"]
review: {tier: 2, required_lenses: [assembly-vs-shard, ux-frozen-contracts], verdicts: []}
verification: []
artifacts: []
resume_hint: "ROOT.4.7 (data layer) and ROOT.4.5 (execution layer) first; 4.1 needs 2.2/2.3 event contracts; 4.2 needs 4.1; 4.4 needs 4.2's ExerciseFrame; 4.6 needs 4.1+4.2+4.5; 4.3 needs 4.1+4.7; 4.10 (profiles) parallel; a11y audit is 4.1's LATE leaf after surfaces exist."
---

# Phase 3 — Experience layer

REPLACED components (dashboard, sidebar, lesson page, LessonRenderer) retire their
predecessors only after passing the regression floor (REQ-MS-02 scenario 2) — the
retirement leaf lives INSIDE each replacing item; ROOT.4.9 verifies citations (sizing
#6). Frozen UX contracts: no scroll-jail, style-never-hide, celebrations only on
server-confirmed gate verdicts, dock UX never branches on driver. Port 3000 is the
owner's (CONSTRAINTS #17) — all testing on other ports. Lesson-component ownership is
carved per file (ADR-0007 item 5): 4.2 owns beats/** + named files; Playground.tsx is
4.4's; Terminal.tsx is 4.6's; Boss* is 5.3's. The projections-read glob was deleted —
REQ-EL-03 forbids a second projection implementation (coupling #21).
