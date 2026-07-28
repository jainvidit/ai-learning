---
id: ROOT.7.3.6
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-LX-07 s3 "any beat entering view" — beat entry-mode domain (ADR-0024)
ledger_depth: 3
status: in_progress
owner_agent: implementer-ROOT.7.3.6-gen0 (dream-implementer-standard, dispatched by director-gen43 2026-07-28 ~00:50Z)
spawned_at: 2026-07-28T00:50:00Z
generation: 0
spec_refs:
  - .program/spec/lesson-experience.md#req-lx-07
acceptance_criteria:
  - ADR-0024 ratified — beat entry modes enumerated closed-world (e.g. scroll, jump, resume, restore) with the s3 obligation testable per mode; additive relaxation path
  - lesson-experience.md amended additively so s3 quantifies over the enumerated modes
  - Consistency with beat-model.md persistent-beat ruling (steward NARROW ratification) recorded
depends_on: []
blocks: [ROOT.4.2]
children: []
file_ownership: [".program/decisions/ADR-0024.md", ".program/spec/lesson-experience.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification: []
artifacts: []
resume_hint: "Scheduled by ADR-0018. Must be done before ROOT.4.2 (BeatRenderer) dispatches (Phase 3). Pattern: ADR-0017. Survey row: lesson-experience REQ-LX-07 s3."
---

## Work Log

### Reading Phase (2026-07-28 ~01:00Z)

Read lesson-experience.md in full — REQ-LX-07 s3: "Given any beat entering view, when telemetry is checked, then a beat_viewed event was recorded."

Identified beat entry modes from the full spec corpus:
1. **Scroll entry (REQ-LX-01)** — user scrolls naturally and a beat crosses 50% viewport threshold; also covers dwell-based frontier advancement (2s @ 50%).
2. **Rail jump navigation (REQ-LX-04 s4)** — user clicks rail node to jump directly to a beat.
3. **Resume from stored position (REQ-LX-07 s2)** — navigation completes to exact stored beatId from dashboard chip.
4. **Initial page load** — lesson page opens; first beat(s) mount and enter viewport on render.
5. **Continue button navigation (REQ-LX-01 s3)** — smooth-scroll + focus move to next beat.
6. **Keyboard navigation (REQ-LX-04)** — j/k and Alt+↑/↓ beat nav (suppressed inside terminal/playground inputs).
7. **State restore after page refresh** — beat already in viewport when page reloads (hydration).

Read beat-model.md persistent-beat ruling (lines 169–255) — the steward's NARROW ratification. Key: the persistent requirement applies ONLY to beats with genuine session identity (terminal sessions, agent runs, session-backed SSE widgets) — NOT to playground beats whose SSE transport is request-scoped. The ruling explicitly states the compiler must read the `persistent` flag, never re-derive from `type`. Persistent beats stay mounted across beat transitions (REQ-LX-03), never `display:none`, never collapsed to zero height. The "any beat entering view" domain includes persistent beats viewed while already mounted AND non-persistent beats mounting/entering normally.

Read frontend-platform.md — found reduced-motion preference (REQ-FP-03): "Given prefers-reduced-motion, when any navigation or celebration triggers motion, then instant jumps replace animations; no duration, no animation-fill-mode." Rail jump and keyboard nav use instant jumps under reduced motion, not smooth scroll. This does NOT create a new entry mode (the beat still enters view), but it does affect the mechanism.

Read CONSTRAINTS.md and REJECTED.md — no contradictions. REJECTED.md line 57 confirms viewport/scroll gating was rejected; completion gates lesson status, not viewport. Line 59 confirms dwell-analytics-justified gates were rejected.

ADR-0017 pattern: enumerate domain closed-world; testable per-mode obligations; decidable default for unenumerated; additive relaxation path.

Precedents: ADR-0019 (SSE endpoints), ADR-0028 (delete verbs) — both enumerate closed-world and provide grep/test procedures per item.
