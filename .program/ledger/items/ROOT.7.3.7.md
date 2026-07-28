---
id: ROOT.7.3.7
parent: ROOT.7.3
type: Decision
title: Ratify or enumerate REQ-EX-01 s3 "never branches on driver" (borderline) (ADR-0025)
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.7.3.7-gen1 (dream-implementer-standard, fix cycle, dispatched by director-gen43 2026-07-28 ~01:10Z)
spawned_at: 2026-07-28T01:10:00Z
generation: 1
review_findings_gen0: |
  request_changes/high (.program/audits/ROOT.7.3.7-review.md — transcribed by director, reviewer write denied):
  1. BLOCKING - recorded rg command not executable (rg has no `tsx` file type; exits 2). Baseline "PASS" cannot have come from the recorded command. Need corrected command + pasted transcript with exit code.
  2. BLOCKING - regex misses 9/10 branching mechanisms (quoted literals, d.kind/driverKind, constructor.name, `in` duck-typing, config.executionMode, NEXT_PUBLIC_EDITION env, switch on .name, ternary dynamic import). Need extended pattern + negative-control run proving each mechanism caught.
  3. BLOCKING - factory exception unbounded ("factory.ts or equivalent", self-declared purpose). Need single named file+symbol or PARK the exception until ROOT.4.5 names it.
  4. MAJOR - zero-hits PASS vacuous today (no ExecutionDriver exists) and check is one-time. Need a named gate/acceptance owner for the re-run (candidate: ROOT.4.5 acceptance criterion + Phase 3 Gate row).
spec_refs:
  - .program/spec/execution-layer.md#req-ex-01
acceptance_criteria:
  - ADR-0025 ratified — either a recorded ruling that s3 is falsifiable as written (driver count fixed at 2 and named, per survey borderline note) with the concrete check named, or an enumeration of the call sites the no-branching guarantee covers
  - If a shard edit is needed it is additive; if none is needed, the no-edit ruling is recorded in the ADR
depends_on: []
blocks: [ROOT.4.5]
children: []
file_ownership: [".program/decisions/ADR-0025.md", ".program/spec/execution-layer.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification:
  - criterion: "FINDING 1 FIXED - Executable procedure with pasted transcript"
    method: "Corrected rg command (removed invalid --type tsx; ts already covers .tsx per rg 14.1.1). Extended to 10 named checks covering all branching mechanisms. Ran against src/ at commit 4e50d6c; pasted full transcript with exit codes into ADR baseline section."
    evidence: ".program/decisions/ADR-0025.md 'Baseline dry-run' section; .program/audits/ROOT.7.3.7-verification/baseline-check-src.txt"
  - criterion: "FINDING 2 FIXED - Pattern completeness via negative control"
    method: "Extended to 10 checks covering all 9 escaped mechanisms plus original. Created synthetic test file with all 10 mechanisms, ran checks, verified each caught. Negative control run transcript pasted into ADR."
    evidence: ".program/decisions/ADR-0025.md 'Baseline dry-run' negative control subsection; .program/audits/ROOT.7.3.7-verification/negative-control.ts; .program/audits/ROOT.7.3.7-verification/negative-control-run.txt"
  - criterion: "FINDING 3 FIXED - Factory exception parked"
    method: "Exception PARKED until ROOT.4.5 names the composition point. ADR now states NO EXCEPTIONS until ROOT.4.5 amends with single named file+symbol per ADR-0028 rules. Exception addition procedure recorded."
    evidence: ".program/decisions/ADR-0025.md 'Allowed exceptions' section"
  - criterion: "FINDING 4 FIXED - Re-run owner bound"
    method: "Recorded binding: ROOT.4.5 must run checks as acceptance criterion; ROOT.4.9 (Phase 3 Gate) must run as gate row. Logged event for director to mirror bindings into those item files (implementer lacks write access)."
    evidence: ".program/decisions/ADR-0025.md 'Re-run binding' section; .program/ledger/events/ROOT.7.3.7.jsonl director-action-required event"
  - criterion: "No-edit ruling preserved (gen0 PASS)"
    method: "Shard edit NOT needed. REQ-EX-01 s3 falsifiable as written; 10-check procedure operationalizes 'when audited'. Ruling preserved from gen0 per review finding 5 PASS."
    evidence: ".program/decisions/ADR-0025.md 'Shard edit ruling' section"
artifacts: [".program/decisions/ADR-0025.md"]
resume_hint: "Scheduled by ADR-0018. BORDERLINE per survey — likely a short ratification (grep-for-driver-conditionals check), possibly no shard edit. Must be done before ROOT.4.5 dispatches (Phase 3). Survey row: execution-layer REQ-EX-01 s3."
---
