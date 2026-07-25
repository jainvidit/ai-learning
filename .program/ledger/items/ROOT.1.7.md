---
id: ROOT.1.7
parent: ROOT.1
type: Probe
title: Assumption probes — next-mdx-remote archival (#11), Bedrock structured outputs (#12)
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-01
  - .program/spec/judge-pipeline.md#req-jp-01
acceptance_criteria:
  - ASSUMPTIONS #11 re-verified — is next-mdx-remote still archived upstream; result recorded with evidence (CP-01 scenario 3)
  - ASSUMPTIONS #12 exercised — output_config json_schema against this repo's Bedrock setup with a live call; result recorded
depends_on: []
blocks: [ROOT.1.1, ROOT.1.5]
children: []
file_ownership: [".program/audits/probes-*"]
review: {tier: 0, required_lenses: [fresh-eyes], verdicts: []}
verification: []
artifacts: []
resume_hint: "Dispatch immediately — cheapest item, gates two capabilities. If #12 fails, judge-pipeline's structured-outputs plan needs an ADR before ROOT.2.3."
---
Read-only probes; a live Bedrock call is reversible (a paid-per-call API the project
already uses routinely — not new resource provisioning).
