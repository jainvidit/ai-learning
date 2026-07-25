---
id: ROOT.1.2.6
parent: ROOT.1.2
type: Task
title: regression-floor.md seed — REQ-MS-02 checklist, MS-03 audit row, ADR-0006 note
ledger_depth: 3
status: in_review
generation: 1
owner_agent: implementer-ROOT.1.2.6-gen1 # hardened escalation; rework against secondary request_changes (ADR-0006 note placement; RF-02/04/14 executability; RF-03/07/renumbering minors) AND primary REJECT still open in events (wrong Gate IDs; RF-01 nonexistent lesson path; RF-14 day-zero false failure; RF-03 sandboxes; RF-11 sidebar surface)
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
    method: "Mapped every bullet of REQ-MS-02 and CURRENT-STATE.md:13-26 'Verified-working baseline' onto a row, then verified each row's how-to-verify column against the actual tree (route file, content fixture id, or component) so no step requires guessing. Row inventory confirmed by grep '^| RF-'."
    evidence: .program/evidence/ROOT.1.2.6/gen1-verification.md
    notes: "18 behavior rows: RF-01, RF-02, RF-03a-e, RF-04..RF-13. RF-03 split into five sub-rows (create/switch/isolation/401/delete) because the baseline bundles five distinct checks; RF-03c now requires progress AND sandbox isolation per CURRENT-STATE.md wording 'full isolation (progress + sandboxes)'. Fixtures verified to exist: quiz-tokens (02-tokens), quiz-hallucination (04-hallucination, 5 questions), playground-observe-hallucination, playground-observe-variance. RF-01 lesson path corrected to /learn/01-how-llms-work/02-tokens — the gen0 path 01-introduction does not exist (real slugs listed from module.json). RF-02 scoped to the PRE-submission payload with sanitizeQuiz() (LessonRenderer.tsx:15-29) as the named guarantee, and disambiguated from the submit response which legitimately carries correctOptionIds (quiz/submit/route.ts:51-60). RF-07 records the current-tree caveat that no terminal/challenge exercise exists in any content/**/exercises.json (only quiz+playground), so the loop is verified via the API against sandbox/templates/demo-fix-greet with verifier at src/lib/verifiers/index.ts:28 -> UNVERIFIED not FAIL if unreachable. RF-11 now names the REPLACED sidebar avatar+name (Sidebar.tsx:21-52) as the at-risk surface per CONSTRAINTS #26 [HARD], not just the picker badge. RF-06 score-in-code anchored at judge.ts:158-175 (metWeight summed in code)."
  - criterion: "The MS-03 never-delete audit row is present — no code path deletes data/** or the Workshop directory; legacy JSON archived not deleted after verified import; docs/origin append-only"
    verdict: pass
    method: "Grepped the whole tree (excluding node_modules) for rmSync|rmdirSync|unlinkSync|fs.rm(|.remove( over **/*.{ts,tsx,js,mjs} and separately for rimraf and 'rm -rf'; classified every hit as sanctioned or in-scope; then rewrote RF-14's scope to REQ-MS-03 scenario 1 wording ('any migration or cleanup script')."
    evidence: .program/evidence/ROOT.1.2.6/gen1-verification.md
    notes: "RF-14, RF-15, RF-16 present. RF-14 rescoped: the gen0 'confirm no deletion code exists' reading FAILS on day zero because src/lib/profiles.ts:69-73 deleteProfile() is the sanctioned delete that RF-03e itself requires. RF-14 now carries an explicit carve-out naming all three real deletion sites found by grep — profiles.ts:69-73 (profile delete), src/lib/sandbox.ts:65 resetSandbox (the reset half of RF-07), scripts/seed-sandboxes.ts:33 (re-seed of derived working copies) — plus the rationale that sandbox/live/** is derived (sandbox/templates/** is the checked-in source) and a stated FAIL condition (a NEW deletion call reachable from a migration/cleanup path). No rimraf / rm -rf / fs.rm( exists anywhere in the tree."
  - criterion: "The ADR-0006 intended-change note is recorded on the quiz-grading row — failed submissions returning teaching explanations per answered question with isomorphic-variant retries is the INTENDED policy (Gates must read a future change to withheld-key display as intended, not regression)"
    verdict: pass
    method: "Read .program/decisions/ADR-0006.md in full (Reading A accepted; withheld-until-pass = answer KEY display + 'Review answers'; reversal lever = server-side flag in the submit route) and cross-checked the current submit route behavior before writing the note. Note placement moved per the secondary blocker."
    evidence: .program/evidence/ROOT.1.2.6/gen1-verification.md
    notes: "Addresses the secondary BLOCKER (note was buried inside RF-04's how-to-verify cell). Now a dedicated headed section 'ADR-0006 intended-change note (applies to RF-04)' immediately after the behavior table, explicitly labelled 'a policy note, not a verification step', with RF-04's Notes column pointing to it. Three numbered consequences: (1) explanations on a failed submission are INTENDED and a future withholding of the answer-KEY display is PASS not regression; (2) the symmetric case — removing teaching explanations for answered questions IS a regression and fails RF-04; (3) /api/quiz/submit today returns correctOptionIds unconditionally, so its later disappearance pre-pass is expected and the note gets updated rather than a regression filed. RF-04 verify step made executable: exact route, exact JSON body with a deliberately wrong answer (q1-what-is-token: ['a'] against correct 'c'), exact expected response fields."
  - criterion: "The doc states its role — the single shared checklist; phase Gates cite rows, never re-derive the list (glossary Gate level); maintained by ROOT.7.1 after ROOT.1.2 closes"
    verdict: pass
    method: "Grepped '^type:' and '^title:' in each candidate Gate item file in .program/ledger/items/ to establish the real Gate set, confirmed the absence of the three IDs gen0 invented, and confirmed ROOT.7.1 is type Contract. Post-edit grep for 'ROOT.2.8|ROOT.3.8|ROOT.5.8|01-introduction' returns only the deliberate negative-assertion lines."
    evidence: .program/evidence/ROOT.1.2.6/gen1-verification.md
    notes: "Addresses the primary BLOCKER. Role paragraph retained and the Gate list replaced with a verified table: ROOT.1.8 (Phase 0), ROOT.2.5 (Phase 1), ROOT.3.6 (Phase 2), ROOT.4.9 (Phase 3), ROOT.5.6 (Phase 4) — all confirmed type: Gate. Added an explicit guard line: 'There is no ROOT.2.8, ROOT.3.8 or ROOT.5.8; ROOT.4.8 is a Capability (Testing & CI completion), not a Gate. Do not cite those IDs.' Steward stated as ROOT.7.1 (confirmed type: Contract, standing contract steward). Maintenance section closes the secondary MINOR on ID reuse: no reuse ever, retired rows marked RETIRED in place with the ID burned, bare RF-03 is a group citation passing only if all sub-rows pass, no renumbering. Also added a 'How to run it' note directing Gates to 127.0.0.1:3001 (playwright.config.ts / npm run e2e:server) per CONSTRAINTS #17 — port 3000 never used."
  - criterion: "Doc-only change did not disturb source (hardened-tier empirical requirement)"
    verdict: pass
    method: "npx tsc --noEmit in the worktree; git status --short in the worktree."
    evidence: .program/evidence/ROOT.1.2.6/gen1-verification.md
    notes: "tsc exit 0, no output. git status shows exactly one modified path (.program/interfaces/regression-floor.md) plus the new evidence doc. No contract-shape change: RF-01..RF-16 keep their meaning and numbering; RF-03 gained appended sub-IDs only; no Gate has cited any row yet (no .program/audits/gate-* exists), so the namespace was not frozen."
artifacts:
  - ".program/interfaces/regression-floor.md"
  - ".program/evidence/ROOT.1.2.6/gen1-verification.md"
---

Seed only — this item creates the checklist; executing it is Gate work (ROOT.1.8 etc.).
Row IDs are a contract: once a Gate cites RF-nn, rows are append-only (renumbering breaks
audit evidence).

## gen1 plan (hardened, 3 lines)

1. **Contract touched:** `.program/interfaces/regression-floor.md` — the RF-nn row-ID
   namespace that every phase Gate cites by ID instead of re-deriving the baseline.
2. **Who owns the other side:** the five phase Gates (ROOT.1.8, ROOT.2.5, ROOT.3.6,
   ROOT.4.9, ROOT.5.6 — verified by reading `type: Gate` in each item file) consume the
   row IDs; `ROOT.7.1` (Contract, standing steward) inherits maintenance after ROOT.1.2
   closes. Sibling interface docs (agent-runner, beat-model, model-router) are untouched.
3. **What I will NOT change:** existing row IDs RF-01..RF-16 keep their meaning and
   numbering (no renumber, no reuse); no new behaviors are invented beyond REQ-MS-02/03 +
   CURRENT-STATE.md "Verified-working baseline"; no file other than
   `.program/interfaces/regression-floor.md` is edited. Splits append only (RF-17+).

## gen1 outcome

State found: the worktree copy of `regression-floor.md` was byte-identical to the gen0
artifact — the rework this owner had marked `in_progress` was never written to disk. It was
performed in this pass, then verified. Both open verdicts are addressed: the primary REJECT
(Gate IDs, RF-01 lesson slug, RF-14 day-zero carve-out, RF-03 sandboxes, RF-11 sidebar) and
the secondary request_changes (ADR-0006 note placement blocker, RF-02/04/14 executability,
RF-03/RF-07/ID-reuse minors). Per-criterion method and evidence are in the `verification`
block above; the full fact-check table (every claim the doc makes about the tree, with the
method that established it) is at `.program/evidence/ROOT.1.2.6/gen1-verification.md`.

**Code changes live in worktree `.claude/worktrees/agent-adf23e6642c33000f`** and need
integration. Changed paths for the integrator are listed under `artifacts`. This agent ran
no git commands.

Two facts the next reader should not have to re-derive:
- No content exercise of type `terminal` or `challenge` exists anywhere in
  `content/**/exercises.json` (only `quiz` and `playground`), so RF-07 has no UI entry
  point in the current tree. RF-07 says so and routes the Gate to the API.
- `/api/quiz/submit` returns `correctOptionIds` unconditionally today. That is why RF-02 is
  scoped to the pre-submission payload; treating it as an RF-02 failure would be wrong.
