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
  - 14-module structure + cross-track convergences inviolable (CC-01)
  - Protected properties preserved per module (CC-02)
  - Module 1 targeted fixes only — h1 duplication, skillIds, beat delimiters (CC-03)
  - Module 12 built only after its weakness mitigation is ADR'd (CC-05 / OPEN-QUESTIONS #8); module 13 gate + capstone honored
  - Quiz reveal policy per ADR-0006 (CC-06)
depends_on: [ROOT.5.4]
blocks: []
children: []
file_ownership: ["content/modules/**", "sandbox/templates/**", "src/lib/verifiers/**"]
review: {tier: 2, required_lenses: [pedagogy, protected-properties, per-module-fresh-eyes], verdicts: []}
verification: []
artifacts: []
resume_hint: "Decomposes into ~14 Feature items, one per module, per-module ownership per LANE-DEPENDENCIES (only shared file: append-only verifier registry index). ADR module-12 mitigation (OQ #8) FIRST. OpenClaw is concept-only (CONSTRAINTS #9); OQ #15 (Module-1 playground placement nit): default Reading A — leave as-is."
---
Fixtures/verifiers 100% authored (CG-02). Context-engineering depth and
/goal /loop /ultracode /remote-Claude coverage are [HARD] curriculum (CONSTRAINTS #7–8).
