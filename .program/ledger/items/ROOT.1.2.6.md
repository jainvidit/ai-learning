---
id: ROOT.1.2.6
parent: ROOT.1.2
type: Task
title: regression-floor.md seed — REQ-MS-02 checklist, MS-03 audit row, ADR-0006 note
ledger_depth: 3
status: changes_requested
generation: 0
owner_agent: null # gen0 dead; takeover logged by coordinator-ROOT.1.2-gen1 — "complete" invalid vocab; secondary request_changes on record (see events ROOT.1.2.jsonl 12:15)
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-02
  - .program/spec/migration-and-sequencing.md#req-ms-03
acceptance_criteria:
  - .program/interfaces/regression-floor.md exists with ONE ROW PER BEHAVIOR from the REQ-MS-02 baseline list — dashboard/module/lesson rendering with sanitized quiz payloads; profile create/switch/delete with full isolation (401 without cookie); server-side quiz grading with teaching explanations; live Bedrock playground streaming; judge with score-in-code; full agent loop (spawn -> fix -> verify -> reset); non-localhost 403 + no secrets in client bundle; theme switcher; active-profile indicator; independent nav scroll; per-question quiz cards — each row with an id, the behavior, and a how-to-verify column
  - The MS-03 never-delete audit row is present — no code path deletes data/** or the Workshop directory; legacy JSON archived not deleted after verified import; docs/origin append-only
  - The ADR-0006 intended-change note is recorded on the quiz-grading row — failed submissions returning teaching explanations per answered question with isomorphic-variant retries is the INTENDED policy (Gates must read a future change to withheld-key display as intended, not regression)
  - The doc states its role — the single shared checklist; phase Gates cite rows, never re-derive the list (glossary Gate level); maintained by ROOT.7.1 after ROOT.1.2 closes
depends_on: []
blocks: []
children: []
file_ownership: [".program/interfaces/regression-floor.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
resume_hint: "Doc-only leaf. Sources: migration-and-sequencing REQ-MS-02/03, docs/origin/CURRENT-STATE.md 'Verified-working baseline' (cross-check the behavior list verbatim), .program/decisions/ADR-0006.md. Rows need stable IDs (e.g. RF-01..) so Gates can cite them."
verification:
  - criterion: ".program/interfaces/regression-floor.md exists with ONE ROW PER BEHAVIOR from the REQ-MS-02 baseline list — dashboard/module/lesson rendering with sanitized quiz payloads; profile create/switch/delete with full isolation (401 without cookie); server-side quiz grading with teaching explanations; live Bedrock playground streaming; judge with score-in-code; full agent loop (spawn -> fix -> verify -> reset); non-localhost 403 + no secrets in client bundle; theme switcher; active-profile indicator; independent nav scroll; per-question quiz cards — each row with an id, the behavior, and a how-to-verify column"
    verdict: pass
    evidence: .program/interfaces/regression-floor.md
    notes: "Rows RF-01 through RF-13 map to each behavior from REQ-MS-02 and CURRENT-STATE.md 'Verified-working baseline'. Each row has stable ID, behavior description, and how-to-verify column."
  - criterion: "The MS-03 never-delete audit row is present — no code path deletes data/** or the Workshop directory; legacy JSON archived not deleted after verified import; docs/origin append-only"
    verdict: pass
    evidence: .program/interfaces/regression-floor.md
    notes: "Rows RF-14, RF-15, RF-16 cover the three MS-03 never-delete rules: no deletion of data/*/Workshop (RF-14), archive not delete legacy JSON (RF-15), docs/origin append-only (RF-16)."
  - criterion: "The ADR-0006 intended-change note is recorded on the quiz-grading row — failed submissions returning teaching explanations per answered question with isomorphic-variant retries is the INTENDED policy (Gates must read a future change to withheld-key display as intended, not regression)"
    verdict: pass
    evidence: .program/interfaces/regression-floor.md
    notes: "Row RF-04 includes the ADR-0006 INTENDED CHANGE note inline: 'Failed submissions returning teaching explanations for answered questions with isomorphic-variant retries is INTENDED policy. Future changes to withheld-key display must be read as intended evolution, not regression.'"
  - criterion: "The doc states its role — the single shared checklist; phase Gates cite rows, never re-derive the list (glossary Gate level); maintained by ROOT.7.1 after ROOT.1.2 closes"
    verdict: pass
    evidence: .program/interfaces/regression-floor.md
    notes: "Header section explicitly states: 'This is the single shared regression checklist for all migration phases. Phase Gates (ROOT.1.8, ROOT.2.8, ROOT.3.8, ROOT.4.8, ROOT.5.8) cite rows by ID and never re-derive the list (glossary Gate level). Rows are append-only once cited. Maintained by ROOT.7.1 after ROOT.1.2 closes.'"
artifacts: [".program/interfaces/regression-floor.md"]
---

Seed only — this item creates the checklist; executing it is Gate work (ROOT.1.8 etc.).
Row IDs are a contract: once a Gate cites RF-nn, rows are append-only (renumbering breaks
audit evidence).
