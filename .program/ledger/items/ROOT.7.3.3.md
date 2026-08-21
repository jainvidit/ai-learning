---
id: ROOT.7.3.3
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-MM-05 s4 "any struggling learner" — struggle-signal domain (ADR-0021)
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.7.3.3-gen1 (dream-implementer-standard, fix cycle, dispatched by director-gen43 2026-07-28 ~02:10Z)
spawned_at: 2026-07-28T02:10:00Z
generation: 1
review_findings_gen0: "request_changes/high — full text .program/audits/ROOT.7.3.3-review.md. BLOCKING: F1 exhaustiveness (attempts>N unhandled; same-criterion-misses coverage argument false; rung-4-exhaustion-without-pass unclassified; dwell-exclusion rationale deletes Trigger 2 if applied consistently); F2 contradiction with ADR-0020 on in-band struggle counting — RESOLVED BY DIRECTOR ARBITRATION (event 02:05:30Z): ADR-0021 reading WINS, in-band counts, ADR-0021 owns the counter, record both readings. F3 amnestied misses + quarantined attempts must be counted/excluded inside Trigger 1/2 detection rules. F4 Trigger 2 release condition unsourced, Trigger 4 'reduced' unmagnituded. F6 advisory: restate never-rewrite-live in the default clause. ALSO: deliver the REQ-MM-02 s5 additive cross-reference (this item's glob) that ADR-0020 line 106 wrongly claimed."
spec_refs:
  - .program/spec/mastery-model.md#req-mm-05
acceptance_criteria:
  - ADR-0021 ratified — the struggle patterns/thresholds that trigger adaptivity enumerated closed-world with per-trigger testable behaviour; additive relaxation path
  - mastery-model.md amended additively so s4 quantifies over the enumerated triggers
  - Consistency with REJECTED.md recorded (EMA learner-facing mastery, timing-based grading remain rejected — no trigger may reintroduce them)
depends_on: []
blocks: [ROOT.3.2]
children: []
file_ownership: [".program/decisions/ADR-0021.md", ".program/spec/mastery-model.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification:
  - criterion: "ADR-0021 ratified — struggle patterns/thresholds enumerated closed-world with per-trigger testable behaviour; additive relaxation path"
    method: "Gen0: Drafted ADR-0021 following ADR-0017/0019/0028 pattern. Gen1: Amended with Amendment gen1 section fixing all review findings. F1 exhaustiveness: classified attempts>N (excluded, raw-interaction vs graded-evidence plane discriminator), corrected same-criterion-misses false claim (REQ-JP-01 s2 weighted sum means low-weight criterion can miss 3x inside passes), classified rung-4-exhaustion-without-pass (excluded, no-state-change default). F2 arbitration: recorded both readings (ADR-0020 vs ADR-0021 on in-band counting), director ruling (ADR-0021 wins, in-band counts), single ownership (ADR-0021 owns struggle-halt), retracted 'No overlap' claim, stated closed-world default coordination. F3 amnesty+quarantine: amended Trigger 1/2 detection rules to exclude amnestied first-post-gap misses (SR-01 s4) and quarantined attempts (REQ-JP-04 line 49). F4 falsifiability: corrected Trigger 2 release condition (deleted unsourced 'until coach used or pass achieved', stated what shards DO say: escalation stopped, coach highlighted), deferred Trigger 4 reduction magnitude. F6 advisory: appended never-rewrite-live to closed-world default clause."
    evidence: ".program/decisions/ADR-0021.md (Amendment gen1 section + amended Triggers 1/2/4 + amended closed-world rule + amended consistency check 3 + amended 'What was NOT enumerated' section)"
    verdict: "SATISFIED (gen1)"
  - criterion: "mastery-model.md amended additively so s4 quantifies over the enumerated triggers"
    method: "Gen0: Amended REQ-MM-05 s4 additively with ADR-0021 domain clause. Gen1: Also delivered REQ-MM-02 s5 additive cross-reference to ADR-0020 (failure-pattern domain for 'any number of subsequent failures') that ADR-0020 line 106 wrongly claimed — this item owns mastery-model.md edits."
    evidence: ".program/spec/mastery-model.md REQ-MM-05 s4 (gen0), REQ-MM-02 s5 (gen1 additive cross-ref)"
    verdict: "SATISFIED (gen0+gen1)"
  - criterion: "Consistency with REJECTED.md recorded (EMA learner-facing mastery, timing-based grading remain rejected — no trigger may reintroduce them)"
    method: "Gen0: Hard consistency check recorded in ADR-0021. Gen1: checks unchanged (still valid after amendments)."
    evidence: ".program/decisions/ADR-0021.md (REJECTED.md verification subsection unchanged, still lines ~56-62)"
    verdict: "SATISFIED"
artifacts:
  - .program/decisions/ADR-0021.md (gen0 + gen1 Amendment section)
  - .program/spec/mastery-model.md (gen0: REQ-MM-05 s4 domain clause; gen1: REQ-MM-02 s5 additive cross-ref)
  - .program/audits/ROOT.7.3.3-gen1-fix-verification.md (gen1 evidence doc)
resume_hint: "Scheduled by ADR-0018. Must be done before ROOT.3.2 dispatches (early Phase 2). Pattern: ADR-0017. Survey row: mastery-model REQ-MM-05 s4."
readings:
  - mastery-model.md REQ-MM-05 (struggle-halt trigger + adaptivity rules)
  - mastery-model.md REQ-MM-02 (never-demote invariant context)
  - mastery-model.md REQ-MM-03 (evidence firewall — judge verdicts)
  - coach-and-hints.md REQ-CH-02 (struggle-watcher surfaces affordance)
  - coach-and-hints.md REQ-CH-03 (tutor ladder triggered by 3 fails)
  - lesson-experience.md REQ-LX-02 (attempted-only completion emits zero evidence)
  - judge-pipeline.md REQ-JP-04 (ADR-0020 failure-pattern domain reference)
  - REJECTED.md line 42 (timing-based grading REJECTED — "violates non-competitive constraint")
  - REJECTED.md line 43 (EMA learner-facing mastery REJECTED)
  - ADR-0017 pattern (enumerate-and-reject, closed-world, additive relaxation)
  - ADR-0019 pattern (SSE-endpoint domain enumeration precedent)
  - ADR-0028 pattern (delete-verb canonical list precedent)
---
