---
id: ROOT.1.7
parent: ROOT.1
type: Probe
title: Probe — next-mdx-remote archival status (ASSUMPTIONS #11)
ledger_depth: 2
status: done
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
verification:
  - criterion: "ASSUMPTIONS #11 re-verified with npm registry metadata"
    method: "npm view next-mdx-remote --json, npm view next-mdx-remote deprecated"
    evidence_path: ".program/audits/probes-mdx-archival.md"
    result: "CONTRADICTED — package actively maintained, v6.0.0 published 2026-02-12, no deprecation notice, 4 active maintainers"
artifacts:
  - path: ".program/audits/probes-mdx-archival.md"
    type: "evidence"
    desc: "Registry metadata probe finding — next-mdx-remote NOT archived"
resume_hint: "Dispatch immediately. Bedrock probe split out to ROOT.1.9 (sizing #7). OQ #10 tiebreak trigger (Velite two-process DX) is held by ROOT.1.1's coordinator, informed by this probe's evidence."
---
Read-only registry/web lookup.
