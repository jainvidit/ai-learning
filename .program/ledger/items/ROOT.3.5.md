---
id: ROOT.3.5
parent: ROOT.3
type: Capability
title: Coach & hint ladder — isolation, four rungs, evidence accounting, leak checks
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/coach-and-hints.md#req-ch-01
  - .program/spec/coach-and-hints.md#req-ch-02
  - .program/spec/coach-and-hints.md#req-ch-03
  - .program/spec/coach-and-hints.md#req-ch-04
  - .program/spec/coach-and-hints.md#req-ch-05
acceptance_criteria:
  - Strict context contract — tutor never holds keys/verifiers/exemplars/weights (CH-01)
  - On-demand affordance; struggle-watcher surfaces, never auto-opens (CH-02)
  - Server-held four-rung ladder; rung 4 always reachable, method-not-artifact (CH-03)
  - Rung-4 passes emit reduced/zero evidence; redemption probe restores credit (CH-04)
  - No-numerics output schema + post-response leak check with authored fallback (CH-05 service half; the margin-note component labeled "not your grade" is ROOT.4.4's leaf)
depends_on: [ROOT.3.2, ROOT.7.3.4]
blocks: []
children: []
file_ownership: ["src/lib/tutor/**", "src/app/api/tutor/**"]
review: {tier: 2, required_lenses: [spec-conformance, leak-hunting], verdicts: []}
verification: []
artifacts: []
resume_hint: "Consumes ModelGateway (ROOT.1.5) and judge missed-criterion IDs (ROOT.2.3). This item is the service + ladder enforcement only; UI split per sizing #16. OQ #13/#14 (integrity carve-out, rung-4 boundary) are Reading-A inferences — flagged in DECISIONS-PENDING, build as specced."
---
