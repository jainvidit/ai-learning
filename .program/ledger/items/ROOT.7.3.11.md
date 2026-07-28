---
id: ROOT.7.3.11
parent: ROOT.7.3
type: Decision
title: Ratify REQ-CP-05 s3 disposition — "outside an enumerated inside" accepted as-is (ADR-0029)
ledger_depth: 3
status: done
owner_agent: implementer-ROOT.7.3.11-gen0 (dream-implementer-standard, dispatched by director-gen43 2026-07-28 ~00:55Z)
spawned_at: 2026-07-28T00:55:00Z
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-05
acceptance_criteria:
  - ADR-0029 ratified — records that CP-05 s3's rejection clause is the standard falsifiable shape (testable per named rejected type) per the survey disposition and ADR-0017 Amendment 1's closed-world restatement; no shard edit unless a gap is found
  - If a gap IS found, it is routed as a new scoped item, not fixed here (content-pipeline items are in flight/closed)
depends_on: []
blocks: []
children: []
file_ownership: [".program/decisions/ADR-0029.md"]
review: {tier: 0, required_lenses: [spec-conformance], verdicts: [{lens: tier-0-fresh-eyes, verdict: approve, confidence: high, event_ts: 2026-07-28T01:25:00Z, note: "citations quote-checked, zero-gaps defensible, lane discipline verified via git status; reviewer write denied by path guard (6th) - verdict preserved in event log"}]}
verification:
  - criterion: "AC1 ADR-0029 ratified — records that CP-05 s3's rejection clause is the standard falsifiable shape (testable per named rejected type) per the survey disposition and ADR-0017 Amendment 1's closed-world restatement; no shard edit unless a gap is found"
    how: "Read content-pipeline.md REQ-CP-05 (hash-input domain lines 66-87 CLOSED-WORLD enumeration + scenario 3 rejection clause lines 92-93), ADR-0017 + Amendment 1 (A1.3 closed-world allowlist structure), survey disposition (CP-05 row accepted as-is: outside an enumerated inside is standard shape), implementation src/lib/revisions.ts (lines 375-525 allowlist + default-throw branches), and test suite tests/revisions.test.ts (lines 164-323: 24 rejection tests, each asserting TypeError + path + descriptor). Wrote ADR-0029 with ruling (standard falsifiable shape: named rejected type + named procedure + checkable), evidence (5 sections: spec precision, implementation structure, test suite exercises, GEN2 defect cycles + adversarial review survival, survey agreement), and gaps found (ZERO). No shard edit required."
    evidence: ".program/decisions/ADR-0029.md; .program/spec/content-pipeline.md#req-cp-05; .program/decisions/ADR-0017.md; .program/audits/2026-07-27T0540-unfalsifiable-criteria-survey.md; src/lib/revisions.ts; tests/revisions.test.ts; .program/ledger/items/ROOT.1.1.5.md (GEN2 defect cycle exercised the clause)"
    result: PASS
  - criterion: "AC2 If a gap IS found, it is routed as a new scoped item, not fixed here (content-pipeline items are in flight/closed)"
    how: "No gap found. The spec text is checkably precise (CLOSED-WORLD enumeration + named rejection semantics), the implementation is an allowlist whose default branches throw (checkable structure), and the test suite exercises the clause with 24 + 18 (GEN2) rejection tests. The 'outside an enumerated inside' pattern is decidable: any value not matched by a HASHABLE rule is outside, and the test obligation is coverage of the default-reject branches (satisfied). No routing action required."
    evidence: ".program/decisions/ADR-0029.md section 'Gaps found: ZERO'"
    result: PASS
artifacts:
  - path: ".program/decisions/ADR-0029.md"
    checkout: "MAIN (absolute path write)"
    note: "Ratification ADR. Ruling: CP-05 s3 conforms to standard falsifiable shape (named rejected type, named procedure, checkable). Evidence: spec precision, implementation allowlist structure, test suite exercises (24 + 18 GEN2 tests), adversarial review survival, survey disposition agreement. Gaps: ZERO. No shard edit required."
resume_hint: "Scheduled by ADR-0018. Ratification-only; blocks nothing (CP decomposition already occurred under ADR-0017). Owns ONLY its ADR file — content-pipeline.md is not in its globs by design (ROOT.1.1.4 era). Lowest priority of the eleven."
---
