---
id: ROOT.5.5
parent: ROOT.5
type: Capability
title: Modules 2–14 authoring + Module 1 fixes (parallel, one agent per module)
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/curriculum-content.md#req-cc-01
  - .program/spec/curriculum-content.md#req-cc-02
  - .program/spec/curriculum-content.md#req-cc-03
  - .program/spec/curriculum-content.md#req-cc-05
  - .program/spec/curriculum-content.md#req-cc-06
acceptance_criteria:
  - Each of modules 2–14 is a child Capability, authored per its amended spec, passing npm run validate + all hard content gates (CC-01/02 verified per module by the gates + per-module blind review)
  - 14-module structure + cross-track convergences unchanged in curriculum.json — coordinator-verified against REQ-CC-01 before close
  - Module 1 targeted fixes (own child) — h1 duplication, skillIds, beat delimiters only (CC-03; OQ #15 Reading A — placement as-is)
  - Module 12 built only after its weakness mitigation is ADR'd (CC-05 / OPEN-QUESTIONS #8), last in the queue; module 13 gate + capstone honored
depends_on: [ROOT.5.4]
blocks: []
children: []
file_ownership: ["content/modules/**", "content/curriculum.json", "sandbox/templates/**", "src/lib/verifiers/index.ts", "src/lib/verifiers/m*-*.ts"]
review: {tier: 2, required_lenses: [pedagogy, protected-properties, per-module-fresh-eyes], verdicts: []}
verification: []
artifacts: []
resume_hint: "COORDINATOR-owned — decomposes into 14 CAPABILITY children (one per module — a module is Capability-sized, not a Feature: ~11 files + boss + verifiers; sizing #2), each of which decomposes into per-lesson/boss/verifier leaves. curriculum.json is written ONLY by this coordinator from children's submitted skill/boss/gate declarations (coupling #5) — module children NEVER touch it, index.ts additions are append-only one-liners. common.ts is ROOT.4.8's — never editable here (coupling #15). Schema gaps → field request to ROOT.7.1. ADR module-12 mitigation (OQ #8) FIRST."
---
Fixtures/verifiers 100% authored (CG-02). Context-engineering depth and
/goal /loop /ultracode /remote-Claude coverage are [HARD] curriculum (CONSTRAINTS #7–8);
OpenClaw is concept-only (CONSTRAINTS #9). CC-06 (quiz reveal) moved to ROOT.4.2
(ADR-0007 item 9). Glossary amended: module children are Capabilities under this item.
