---
id: ROOT.1.10
parent: ROOT.1
type: Task
title: Workspace package split — npm workspaces, packages extracted, imports rewritten
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-01
acceptance_criteria:
  - npm workspaces (ADR-0008) configured; packages/content-schema and packages/learning-engine exist and build; one Next app remains (ADR-0002); npm run build and npx tsc --noEmit pass
depends_on: [ROOT.1.1, ROOT.1.2, ROOT.1.3, ROOT.1.5, ROOT.1.6]
blocks: []
children: []
file_ownership: ["package.json", "package-lock.json", "packages/**", "src/**"]
review: {tier: 2, required_lenses: [spec-conformance, framework-empirical], verdicts: []}
verification: []
artifacts: []
resume_hint: "Extracted from ROOT.1.5 (sizing #11). Runs ALONE, last before the Gate — the src/** import rewrite touches every sibling's files, so its depends_on covers all Phase-0 implementation items. Broad glob is legal only because nothing else is active."
---

# Workspace split

Deliberately sequenced as the sole active item when it runs (its depends_on closes
every Phase-0 sibling first). npm workspaces per ADR-0008 — no pnpm.
