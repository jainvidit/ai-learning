---
id: ROOT.3
parent: ROOT
type: Phase
title: Phase 2 — Learning engine
ledger_depth: 1
status: proposed
owner_agent: null
owner_model: null
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-01
  - .program/spec/mastery-model.md
  - .program/spec/spaced-review.md
  - .program/spec/content-generation.md
  - .program/spec/coach-and-hints.md
acceptance_criteria:
  - Skill registry declared in content; CI-resolved skillId references (REQ-MM-01)
  - Discrete mastery states with evidence-counted promotion and the judge-noise firewall live (REQ-MM-02/03)
  - FSRS-6 scheduling with frozen weights, grade collapse, isomorph-only reviews, warm-up UX (spaced-review)
  - Variant-bank generation pipeline built; publishing gated on human review — parked queue is acceptable (REQ-CG-01)
  - Coach ladder server-enforced with data-plane isolation and leak checks (coach-and-hints)
  - Phase 2 Gate (ROOT.3.6) passed
depends_on: [ROOT.2]
blocks: [ROOT.4]
children: [ROOT.3.1, ROOT.3.2, ROOT.3.3, ROOT.3.4, ROOT.3.5, ROOT.3.6]
file_ownership: ["packages/learning-engine/**", "src/lib/tutor*", "content/curriculum.json", "content/modules/01-how-llms-work/**"]
review: {tier: 2, required_lenses: [assembly-vs-shard, pedagogy-invariants], verdicts: []}
verification: []
artifacts: []
resume_hint: "ROOT.3.1 (skill registry) first — LANE-DEPENDENCIES block 3; then 3.2; 3.3 needs 3.2's firewall; 3.4/3.5 parallel."
---

# Phase 2 — Learning engine

Firewall thresholds (0.4/0.7) are a two-key contract (Sage+Priya semantics) — changes
need both reviewer lenses. EMA learner-facing mastery, timing-based grading, per-learner
FSRS fitting are all REJECTED — reopening any is wrong. Variant human review has no
human: generated variants accumulate in a review queue and reviews fall back to
canonical (REQ-CG-03) until the owner reviews — logged in DECISIONS-PENDING.
