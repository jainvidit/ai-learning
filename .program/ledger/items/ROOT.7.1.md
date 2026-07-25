---
id: ROOT.7.1
parent: ROOT.7
type: Contract
title: Standing contract steward — schema.ts, interfaces, package.json (post-Phase-0)
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-03
  - .program/spec/event-log-and-projections.md#req-el-02
acceptance_criteria:
  - Every post-Phase-0 field request against schema.ts is resolved by this item (additive change + validate evidence) or rejected with a logged reason — no other item edits the file
  - Every interface doc change after its founding item closes goes through this item, additive-only, consumers notified via their parents' views
  - Every post-Phase-0 dependency addition to package.json lands through this item, serialized
  - The regression-floor checklist (.program/interfaces/regression-floor.md) is maintained here after ROOT.1.2 seeds it; ADR-0006's intended quiz-policy change recorded so Gates read it as intended, not regression
depends_on: [ROOT.1.2]
blocks: []
children: []
file_ownership: ["src/lib/schema.ts", ".program/interfaces/**", "package.json", "package-lock.json"]
review: {tier: 2, required_lenses: [consumer-fit, additivity], verdicts: []}
verification: []
artifacts: []
resume_hint: "Activates when ROOT.1.2 closes (its globs transfer here — no concurrent overlap by construction). Long-lived: served by a fresh dream-implementer-hardened per request batch, item stays open across generations. Closes only when ROOT.5 closes."
---

# Standing steward

The exception to one-agent-one-item dies-at-terminal: the ITEM persists; each request
batch is served by a fresh agent that reads this file, acts, writes verification, and
returns. Request protocol: a consumer item logs a `field_request` event on ITS OWN
events file and its coordinator notifies the director, who dispatches a steward batch
here. Requests changing an existing field's meaning (non-additive) are rejected —
that is a freeze-challenge requiring an ADR.
