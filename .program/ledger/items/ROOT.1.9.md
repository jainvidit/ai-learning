---
id: ROOT.1.9
parent: ROOT.1
type: Probe
title: Probe — Bedrock structured outputs (ASSUMPTIONS #12)
ledger_depth: 2
status: done
generation: 0
owner_agent: prober-ROOT.1.9-gen0
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
verification:
  - criterion: "ASSUMPTIONS #12 exercised with live call"
    method: "Two probe scripts: basic connectivity test (SUCCESS) and structured outputs test (FAILED with 400 errors)"
    evidence: ".program/audits/probes-bedrock-structured-outputs.md"
    verdict: "BLOCKED — output_config.json_schema not supported by Bedrock Mantle SDK v0.32.0; ROOT.2.3 needs ADR before dispatch"
artifacts:
  - ".program/audits/probes-bedrock-structured-outputs.md"
  - ".program/audits/probe-bedrock-basic.ts"
  - ".program/audits/probe-bedrock-structured-outputs.ts"
resume_hint: "Split from ROOT.1.7 (sizing #7). If the probe fails, ROOT.2.3's structured-outputs plan needs an ADR before dispatch. A live Bedrock call is routine for this app, not new provisioning."
---
