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
depends_on: [ROOT.4.1]
blocks: []
children: []
file_ownership: ["src/app/learn/**", "src/components/lesson/**"]
review: {tier: 2, required_lenses: [spec-conformance, pacing-ruling-fidelity], verdicts: []}
verification: []
artifacts: []
resume_hint: "Retires LessonRenderer only after the regression floor passes (REQ-MS-02 scenario 2). Owner [HARD] #29 (per-question quiz cards) survives. Quiz reveal policy per ADR-0006."
---
The pacing ruling is frozen via champion debate — step-through defaults and viewport
gating are REJECTED; reopening is wrong.
