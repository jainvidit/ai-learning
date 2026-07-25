---
id: ROOT.1.9
parent: ROOT.1
type: Probe
title: Probe — Bedrock structured outputs (ASSUMPTIONS #12)
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/judge-pipeline.md#req-jp-01
  - .program/spec/model-gateway.md#req-mg-01
acceptance_criteria:
  - ASSUMPTIONS #12 exercised — output_config json_schema against this repo's Bedrock setup with a live call; result + evidence recorded in .program/audits/probes-bedrock-structured-outputs.md
depends_on: []
blocks: [ROOT.1.5]
children: []
file_ownership: [".program/audits/probes-bedrock-*"]
review: {tier: 0, required_lenses: [fresh-eyes], verdicts: []}
verification: []
artifacts: []
resume_hint: "Split from ROOT.1.7 (sizing #7). If the probe fails, ROOT.2.3's structured-outputs plan needs an ADR before dispatch. A live Bedrock call is routine for this app, not new provisioning."
---
