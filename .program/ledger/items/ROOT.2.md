---
id: ROOT.2
parent: ROOT
type: Phase
title: Phase 1 — Event log under the floorboards
ledger_depth: 1
status: proposed
owner_agent: null
owner_model: null
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-01
  - .program/spec/event-log-and-projections.md
  - .program/spec/judge-pipeline.md
acceptance_criteria:
  - Append-only learning_events SQLite store live with dual-write behind the existing progress API (REQ-EL-01)
  - All five projections computed in exactly one place each; replay derivability holds (REQ-EL-03)
  - Judge v2 shipped — structured outputs, tiers, ensemble+arbiter, evidence quotes, calibration goldens (REQ-JP-01..05)
  - Existing learner progress imported; legacy JSON untouched pending ROOT.2.4 authorization (REQ-MS-03)
  - Phase 1 Gate (ROOT.2.5) passed the regression floor
depends_on: [ROOT.1]
blocks: [ROOT.3]
children: [ROOT.2.1, ROOT.2.2, ROOT.2.3, ROOT.2.4, ROOT.2.5]
file_ownership: ["src/lib/events.ts", "src/lib/projections.ts", "src/lib/progress.ts", "src/lib/judge.ts", "src/app/api/progress/**", "src/app/api/playground/score/**"]
review: {tier: 2, required_lenses: [assembly-vs-shard, data-safety], verdicts: []}
verification: []
artifacts: []
resume_hint: "ROOT.2.1 first (root dependency of the whole program); 2.2 depends on 2.1; 2.3 is parallel to 2.2; 2.4 parks."
---

# Phase 1 — Event log

THE root dependency (LANE-DEPENDENCIES block 1). Dual-write then cutover; reads stay
legacy-served until parity is demonstrated (REQ-EL-01 scenario 4). data/** is
never-delete (REQ-MS-03). ROOT.2.4 (legacy JSON retirement/archival — touches real
learner data files) parks as awaiting_human_authorization; nothing downstream depends
on it because dual-write can continue indefinitely.
