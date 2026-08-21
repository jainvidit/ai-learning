---
id: ROOT.7.3.2
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-JP-04 s2 "any number of subsequent failures" — failure-pattern domain (ADR-0020)
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.7.3.2-gen1 (dream-implementer-standard, fix cycle, dispatched by director-gen43 2026-07-28 ~02:10Z)
spawned_at: 2026-07-28T02:10:00Z
generation: 1
review_findings_gen0: "request_changes/high — full text .program/audits/ROOT.7.3.2-review.md. BLOCKING: F1 deterministic (scoreless) failures unenumerated; F2 SR-01 s4 amnesty window missing, default routes it wrongly; F3 shard clause names a demotion surface in mastery-model territory; F4 'most similar pattern' default undecidable; F5 declared MM-02 s5 amendment never landed (mastery-model.md is ROOT.7.3.3's glob — correct line 106 to name ROOT.7.3.3 as amender). MINOR: F6 invented reset-on-pass rule; F7 citation off-by-ones; F8 demotion-event checks not executable; F9 units + date. DIRECTOR ARBITRATION (event 02:05:00Z): in-band verdicts DO count toward struggle-halt; ADR-0021 owns the counter; ADR-0020 pattern 3 defers struggle-counting to ADR-0021, zero-evidence unchanged."
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
    method: "Gen0: Read ADR-0020 patterns section (7 patterns: 0 deterministic, 1 consecutive, 2 scattered, 3 in-band, 4 cross-skill, 5 gentle decay, 6 low-confidence), closed-world rule, relaxation path. Gen1: Verified F1-F9 fixes: pattern 0 added (deterministic failures), amnesty window exceptions (F2), decidable default (F4), all citation corrections (F7). Each pattern has falsifiable check."
    evidence: ".program/decisions/ADR-0020.md (gen1 amended)"
    result: "PASS gen1 — 7 patterns enumerated (0-6) with falsifiable checks. Closed-world: decidable default (unenumerated patterns bound by never-demote, no mastery/struggle changes without additive ADR). Relaxation: new patterns via additive ADR. F1 deterministic failures absorption; F2 21-day amnesty + ordering vs 45-day decay; F4 decidable default replaces undecidable 'most similar'; F6 ADR-0021 consecutiveness cite; F7 all citation off-by-ones corrected; F8 checks restated against projection state; F9 units corrected."
  - criterion: "judge-pipeline.md amended additively so s2 quantifies over the enumerated patterns"
    method: "Gen0: Read judge-pipeline.md lines 47-59 (REQ-JP-04). Verified additive amendment: failure-pattern domain clause inserted. Gen1: Verified F3/F4 fixes applied to shard clause: pattern 0 added, decay vocabulary corrected (not 'demotion surface'), decidable default."
    evidence: ".program/spec/judge-pipeline.md lines 47-59 (gen1 amended)"
    result: "PASS gen1 — Failure-pattern domain clause amended additively (gen0 insertion + gen1 rewording of gen0 text, no pre-existing text altered). F3: 'gentle decay path — Fluent→Practiced via gentle path, ONLY decay surface per MM-02 s6' replaces 'ONLY demotion surface'. F4: decidable default replaces 'most similar listed pattern'. Pattern 0 (deterministic) added. Scenario 3 untouched. s2 quantifies over 7 patterns (0-6), closed-world with decidable default."
  - criterion: "Consistency with mastery-model firewall semantics recorded (two-key contract untouched)"
    method: "Gen0: Read ADR-0020 two-key firewall contract section, consistency checks. Gen1: Verified F3/F5 consistency: gentle decay is s6 decay surface (not s5 never-demote exception), mastery-model.md untouched (ROOT.7.3.3 owns s5 cross-ref). Arbitration: in-band struggle-counting deferred to ADR-0021."
    evidence: ".program/decisions/ADR-0020.md Amendment gen1 section; mastery-model.md lines 38-39, 43-55 (byte-identical)"
    result: "PASS gen1 — Two-key contract unchanged: firewall thresholds (0.4/0.7), trichotomy, Priya↔Sage sign-off preserved. F3: gentle decay (pattern 5) is s6 decay surface (line 39), not s5 never-demote exception — never-demote binds active failures, gentle decay binds long-idle. F5: mastery-model.md deliberately untouched (outside file_ownership). Arbitration: in-band verdicts DO count toward struggle-halt (ADR-0021 owns counter, adaptivity vs evidence planes distinct). Struggle-halt disentangled from demotion (coaching intervention)."
artifacts: [".program/decisions/ADR-0020.md"]
resume_hint: "Scheduled by ADR-0018. Must be done before ROOT.2.3 (Judge v2) dispatches — i.e. early Phase 1. Pattern: ADR-0017. Survey row: judge-pipeline REQ-JP-04 s2."
work_log:
  - ts: "2026-07-28T00:15:00Z"
    note: "Gen0: Read judge-pipeline.md, mastery-model.md, ADR-0017/0019/0028 pattern. Spec refs shard: judge-pipeline.md#req-jp-04 s2 line 39. No judge-verdict.md interface exists (checked .program/interfaces/). CONSTRAINTS.md and REJECTED.md checked: no contradiction."
  - ts: "2026-07-28T00:30:00Z"
    note: "Gen0: ADR-0020 written: 6 failure patterns enumerated (consecutive clear-misses, scattered interleaved, in-band 0.4-0.7, cross-skill bursts, idle+probe gentle decay, low-confidence reversions). Per-pattern testable behaviors defined. Closed-world rule: patterns outside enumeration default to most similar. Relaxation path: new patterns via additive ADR. judge-pipeline.md amended additively with failure-pattern domain clause + scenario 3. Two-key firewall consistency verified (Priya/Sage sign-off requirement unchanged). Gentle decay path preserved as ONLY demotion surface (pattern 5). Struggle-halt disentangled from demotion (coaching intervention, not state change). All criteria satisfied."
  - ts: "2026-07-28T02:15:00Z"
    note: "Gen1: Read review findings (.program/audits/ROOT.7.3.2-review.md), arbitration event (02:05:00Z in-band verdict struggle-counting), spec shards (mastery-model.md, spaced-review.md, REJECTED.md). Recorded arbitration per PART 9 Rule 1: gen0 reading (in-band doesn't count) vs review reading (does count) → director ruling: DOES count, ADR-0021 owns the counter, ADR-0020 defers."
  - ts: "2026-07-28T02:35:00Z"
    note: "Gen1: Amended ADR-0020 in place. Added Amendment gen1 section with F1-F9 fixes: F1 pattern 0 (deterministic failures) + absorption clause; F2 21-day amnesty exception in patterns 1/2/5 + ordering rule vs 45-day decay; F3 shard line 51 reworded (decay surface not demotion surface, Fluent→Practiced via gentle path); F4 decidable default (never-demote + no struggle, spec violation to ship unenumerated); F5 mastery-model.md untouched, ROOT.7.3.3 owns s5 cross-ref; F6 pattern 2 cites ADR-0021; F7 citation off-by-ones corrected (MM-05 s2 line 76, MM-02 s6 line 39, REJECTED 43/44); F8 pattern 1/5 checks restated against projection state; F9 pattern 3 check units corrected (normalized score). judge-pipeline.md shard clause amended with pattern 0, reworded decay vocabulary, decidable default."
---
