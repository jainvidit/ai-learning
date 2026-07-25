---
id: ROOT.4.2
parent: ROOT.4
type: Capability
title: Lesson experience — beat renderer, soft frontier, rail, warm-up, resume
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/lesson-experience.md#req-lx-01
  - .program/spec/lesson-experience.md#req-lx-02
  - .program/spec/lesson-experience.md#req-lx-03
  - .program/spec/lesson-experience.md#req-lx-04
  - .program/spec/lesson-experience.md#req-lx-05
  - .program/spec/lesson-experience.md#req-lx-06
  - .program/spec/lesson-experience.md#req-lx-07
acceptance_criteria:
  - Soft-frontier pacing — style never hide, no scroll-jail (LX-01)
  - Per-type completion predicates; boss exclusion; attempted-only firewall (LX-02)
  - Persistent beats stay mounted (LX-03)
  - Header + warm-up beat 0 + rail + session-end anatomy (LX-04)
  - Celebration interstitial on server-confirmed completion only (LX-05)
  - Exercise frames hydrate from stored progress (LX-06)
  - Revisit mode + resume-to-beat (LX-07)
  - Warm-up display + copy — due cap "9+", ~5-min framing, no debt/overdue language (SR-04 display half, from ROOT.3.3)
  - Quiz reveal policy per ADR-0006 lands in api/quiz/submit + Quiz.tsx; per-question results (incl. misses) recorded as events (CC-06 scenarios 1–3, moved here per ADR-0007 item 9)
  - Module page rework — time chips, resume emphasis, completion states (DW-04 s2, CURRENT-STATE module-page row)
  - LessonRenderer + lesson page predecessors retired only after this item's replacement passes the regression floor, with gate-evidence citation (final leaf)
depends_on: [ROOT.4.1]
blocks: []
children: []
file_ownership: ["src/app/learn/**", "src/app/api/quiz/**", "src/components/lesson/beats/**", "src/components/lesson/BeatRenderer.tsx", "src/components/lesson/Rail.tsx", "src/components/lesson/ExerciseFrame.tsx", "src/components/lesson/Quiz.tsx", "src/components/lesson/LessonRenderer.tsx", "src/components/lesson/NextWordGame.tsx", "src/components/lesson/TokenVisualizer.tsx"]
review: {tier: 2, required_lenses: [spec-conformance, pacing-ruling-fidelity], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned; decompose one leaf per LX REQ (the one clean Feature-per-REQ spot, sizing #19) + the four moved criteria. Owner [HARD] #29 (per-question quiz cards) survives."
---
The pacing ruling is frozen via champion debate — step-through defaults and viewport
gating are REJECTED; reopening is wrong.

GLOB CARVE-OUT (ADR-0007 item 5): this item does NOT own Playground.tsx (ROOT.4.4),
Terminal.tsx (ROOT.4.6), or Boss* (ROOT.5.3). The portal-slot contract between
SandboxBeat (here) and PersistentTerminalHost (4.6) is in
.program/interfaces/beat-model.md — build against it, never against 4.6's code. The
interim renderer's carried-over quiz sanitization (from ROOT.1.1's handoff note) must
survive into BeatRenderer.
