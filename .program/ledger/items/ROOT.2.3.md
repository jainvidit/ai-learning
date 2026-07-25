---
id: ROOT.2.3
parent: ROOT.2
type: Capability
title: Judge v2 — structured outputs, tiers, ensemble+arbiter, integrity, calibration
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/judge-pipeline.md#req-jp-01
  - .program/spec/judge-pipeline.md#req-jp-02
  - .program/spec/judge-pipeline.md#req-jp-03
  - .program/spec/judge-pipeline.md#req-jp-04
  - .program/spec/judge-pipeline.md#req-jp-05
acceptance_criteria:
  - Score-in-code, weights hidden, structured outputs (JP-01)
  - Draft/gate tiers; ×3 ensemble; vote-agreement confidence; arbiter on splits/±5/flags; only gate verdicts touch the learner model (JP-02)
  - Evidence quotes verified as substrings in code (JP-03)
  - Ungradeable-content path as graceful degradation (JP-04)
  - Calibration goldens per family + CI battery; the battery runs and reports kappa/flip-rate, and values below target (kappa ≥0.8, flip ≤2%) block the PR (JP-05, binary form per sizing #31)
depends_on: [ROOT.2.1]
blocks: []
children: []
file_ownership: ["src/lib/judge.ts", "src/app/api/playground/score/**", "src/lib/calibration/**", ".program/interfaces/judge-verdict.md"]
review: {tier: 2, required_lenses: [spec-conformance, adversarial-integrity], verdicts: []}
verification: []
artifacts: []
resume_hint: "Consumes ROOT.1.5's ModelGateway and ROOT.1.9's probe result. judgeCriterion helper survives (CURRENT-STATE). Verdict-shape doc (owned here) before ensemble work. JP-06 (nightly battery + drift monitor) moved to ROOT.4.8 (sizing #29)."
---
Priya owns the verdict shape. Firewall thresholds (0.4/0.7) live in mastery-model
(ROOT.3.2) but interpret this item's normalized score — two-key contract.
