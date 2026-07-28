---
id: ROOT.7.3.2
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-JP-04 s2 "any number of subsequent failures" — failure-pattern domain (ADR-0020)
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.7.3.2-gen0 (dream-implementer-standard, dispatched by director-gen43 2026-07-28 ~00:05Z)
spawned_at: 2026-07-28T00:05:00Z
generation: 0
spec_refs:
  - .program/spec/judge-pipeline.md#req-jp-04
acceptance_criteria:
  - ADR-0020 ratified — the failure patterns bound by JP-04 s2 enumerated (e.g. consecutive, scattered, timing-clustered) with per-pattern testable behaviour; closed-world with additive relaxation path
  - judge-pipeline.md amended additively so s2 quantifies over the enumerated patterns
  - Consistency with mastery-model firewall semantics recorded (two-key contract untouched)
depends_on: []
blocks: [ROOT.2.3]
children: []
file_ownership: [".program/decisions/ADR-0020.md", ".program/spec/judge-pipeline.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification:
  - criterion: "ADR-0020 ratified — failure patterns bound by JP-04 s2 enumerated with per-pattern testable behaviour; closed-world with additive relaxation path"
    method: "Read ADR-0020 lines 19-95 (6 patterns enumerated with falsifiable checks per pattern), lines 97-103 (closed-world rule), lines 155-162 (relaxation path). Verified consistency with ADR-0017/0019/0028 closed-world pattern."
    evidence: ".program/decisions/ADR-0020.md"
    result: "PASS — 6 patterns enumerated: consecutive clear-misses, scattered interleaved, in-band (0.4-0.7), cross-skill bursts, idle+probe (gentle decay), low-confidence reversions. Each has falsifiable check (e.g. pattern 1: after 5 consecutive clear-misses, assert Fluent + stability reset + no demotion event). Closed-world: patterns outside enumeration default to most similar. Relaxation: new patterns via additive ADR."
  - criterion: "judge-pipeline.md amended additively so s2 quantifies over the enumerated patterns"
    method: "Read judge-pipeline.md lines 47-59 (REQ-JP-04). Verified additive amendment: new failure-pattern domain paragraph inserted after opening paragraph (lines 50-52), new scenario 3 added (line 59) — zero deletion or rewording of pre-existing text."
    evidence: ".program/spec/judge-pipeline.md lines 47-59"
    result: "PASS — Failure-pattern domain clause inserted additively (line 50-52, cites ADR-0020). Scenario 3 added (line 59): falsifiable check per enumerated pattern. Original scenarios 1-2 untouched. s2 now quantifies over enumerated patterns (closed-world), not open universal."
  - criterion: "Consistency with mastery-model firewall semantics recorded (two-key contract untouched)"
    method: "Read ADR-0020 lines 19-40 (two-key firewall contract cited verbatim), lines 105-110 (consistency check: firewall thresholds unchanged, Priya/Sage sign-off requirement preserved). Cross-check mastery-model.md lines 43-55 (REQ-MM-03 firewall definition), LANE-DEPENDENCIES judge-verdict row."
    evidence: ".program/decisions/ADR-0020.md lines 19-40, 105-110; .program/spec/mastery-model.md lines 43-55"
    result: "PASS — Two-key contract unchanged: firewall thresholds (0.4/0.7), clear-miss/clear-pass/in-band trichotomy, and Priya↔Sage sign-off requirement all preserved. ADR-0020 enumerates failure-pattern behaviors WITHIN firewall's output semantics, not altering the contract. Gentle decay path (pattern 5) preserved as ONLY demotion surface. Struggle-halt disentangled from demotion (coaching intervention)."
artifacts: [".program/decisions/ADR-0020.md"]
resume_hint: "Scheduled by ADR-0018. Must be done before ROOT.2.3 (Judge v2) dispatches — i.e. early Phase 1. Pattern: ADR-0017. Survey row: judge-pipeline REQ-JP-04 s2."
work_log:
  - ts: "2026-07-28T00:15:00Z"
    note: "Read judge-pipeline.md, mastery-model.md, ADR-0017/0019/0028 pattern. Spec refs shard: judge-pipeline.md#req-jp-04 s2 line 39. No judge-verdict.md interface exists (checked .program/interfaces/). CONSTRAINTS.md and REJECTED.md checked: no contradiction."
  - ts: "2026-07-28T00:30:00Z"
    note: "ADR-0020 written: 6 failure patterns enumerated (consecutive clear-misses, scattered interleaved, in-band 0.4-0.7, cross-skill bursts, idle+probe gentle decay, low-confidence reversions). Per-pattern testable behaviors defined. Closed-world rule: patterns outside enumeration default to most similar. Relaxation path: new patterns via additive ADR. judge-pipeline.md amended additively with failure-pattern domain clause + scenario 3. Two-key firewall consistency verified (Priya/Sage sign-off requirement unchanged). Gentle decay path preserved as ONLY demotion surface (pattern 5). Struggle-halt disentangled from demotion (coaching intervention, not state change). All criteria satisfied."
---
