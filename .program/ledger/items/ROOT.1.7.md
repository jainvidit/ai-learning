---
id: ROOT.1.7
parent: ROOT.1
type: Probe
title: Probe — next-mdx-remote archival status (ASSUMPTIONS #11)
ledger_depth: 2
status: in_progress
owner_agent: prober-ROOT.1.7-gen0
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-01
acceptance_criteria:
  - ASSUMPTIONS #11 re-verified — is next-mdx-remote still archived upstream; result recorded with evidence in .program/audits/probes-mdx-archival.md (CP-01 scenario 3)
depends_on: []
blocks: [ROOT.1.1]
children: []
file_ownership: [".program/audits/probes-mdx-*"]
review: {tier: 0, required_lenses: [fresh-eyes], verdicts: []}
verification: []
artifacts: []
resume_hint: "Dispatch immediately. Bedrock probe split out to ROOT.1.9 (sizing #7). OQ #10 tiebreak trigger (Velite two-process DX) is held by ROOT.1.1's coordinator, informed by this probe's evidence."
---
Read-only registry/web lookup.
