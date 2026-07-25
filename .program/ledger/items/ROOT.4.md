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
children: [ROOT.4.1, ROOT.4.2, ROOT.4.3, ROOT.4.4, ROOT.4.5, ROOT.4.6, ROOT.4.7, ROOT.4.8, ROOT.4.9]
file_ownership: ["src/app/**", "src/components/**", "src/lib/claudeSpawn.ts", "src/lib/sandbox.ts", "src/lib/projections-read/**"]
review: {tier: 2, required_lenses: [assembly-vs-shard, ux-frozen-contracts], verdicts: []}
verification: []
artifacts: []
resume_hint: "ROOT.4.1 (platform substrate) and ROOT.4.5 (execution layer) first; lesson page 4.2 needs 4.1; dock 4.6 needs 4.5; dashboard 4.3 needs 4.1."
---

# Phase 3 — Experience layer

REPLACED components (dashboard, sidebar, lesson page, LessonRenderer) retire their
predecessors only after passing the regression floor (REQ-MS-02 scenario 2). Frozen UX
contracts: no scroll-jail, style-never-hide, celebrations only on server-confirmed
gate verdicts, dock UX never branches on driver. Port 3000 is the owner's (CONSTRAINTS
#17) — all testing on other ports.
