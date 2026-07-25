# Regression Floor — Verified Baseline Checklist

**Role:** This is the single shared regression checklist for all migration phases. Phase
Gates cite rows by ID and never re-derive the list (glossary Gate level: a Gate is a
verification-only item that consumes this contract). Rows are append-only once cited.
Maintained by **ROOT.7.1** (Contract — standing contract steward) after ROOT.1.2 closes.

**Consuming Gates** (verified against `type: Gate` in each ledger item file):

| Gate item | Phase |
|---|---|
| ROOT.1.8 | Phase 0 Gate — regression floor + verification commands |
| ROOT.2.5 | Phase 1 Gate — regression floor + dual-write parity evidence |
| ROOT.3.6 | Phase 2 Gate — regression floor + engine invariants |
| ROOT.4.9 | Phase 3 Gate — regression floor + REPLACED-component retirement checks |
| ROOT.5.6 | Phase 4 Gate — regression floor + full-curriculum content gates |

There is no ROOT.2.8, ROOT.3.8 or ROOT.5.8; **ROOT.4.8 is a Capability** (Testing & CI
completion), not a Gate. Do not cite those IDs.

**Source authority:** REQ-MS-02 and REQ-MS-03 (`.program/spec/migration-and-sequencing.md`);
`docs/origin/CURRENT-STATE.md` "Verified-working baseline" [OBSERVED]; ADR-0006.

Any migration step that breaks a behavior in this table halts (REQ-MS-02 scenario 1).
Replacement components retire their predecessors only after the replacement passes this
baseline (REQ-MS-02 scenario 2).

**How to run it:** never on port 3000 (CONSTRAINTS #17). Use the e2e production server on
127.0.0.1:3001 (`npm run verify:e2e` / `npm run e2e:server`). Verify steps below name the
exact route, payload field, or file:line so a Gate executor never has to guess. Where the
current tree has no content exercise of the required type, the row says so and gives the
direct API path instead.

---

## Baseline Behaviors (REQ-MS-02)

| ID | Behavior | How to Verify | Notes |
|---|---|---|---|
| RF-01 | Dashboard, module page, lesson pages render | Load three pages on 127.0.0.1:3001, expect HTTP 200 and visible content: `/` (dashboard, `src/app/page.tsx`); `/learn/01-how-llms-work` (module page); `/learn/01-how-llms-work/02-tokens` (lesson page). Real lesson slugs in module 1 are exactly: `01-what-is-an-llm`, `02-tokens`, `03-training`, `04-hallucination`, `05-randomness` (`content/modules/01-how-llms-work/module.json`) — no `01-introduction` exists | Requires an active profile cookie for gated routes; create one at `/profiles` first |
| RF-02 | Quiz answer keys absent from the pre-submission client payload | Scope: the payload delivered *before* the learner submits. Load `/learn/01-how-llms-work/02-tokens`, view source / DevTools → Network on the document and RSC flight response, and search for `correctOptionIds` and `explanation`. Both MUST be absent. Server-side guarantee is `sanitizeQuiz()` in `src/components/lesson/LessonRenderer.tsx` (returns only `id`, `kind`, `prompt`, `options[].id`, `options[].text`) — if that function stops stripping either field, this row FAILS. Note: the POST `/api/quiz/submit` *response* legitimately contains `correctOptionIds`; that is RF-04 territory and governed by the ADR-0006 note, not a RF-02 failure | Fixture: quiz `quiz-tokens` (`passingScore: 75`) |
| RF-03a | Profile create | POST `/api/profiles` with a name; expect the new profile in `data/profiles.json` and a `profileId` cookie path available | Registry is `data/profiles.json` (`src/lib/profiles.ts`) |
| RF-03b | Profile switch | POST `/api/profiles/switch` with a second profile id; expect the `profileId` cookie to change | |
| RF-03c | Profile isolation covers **progress AND sandboxes** | With profile A, complete quiz `quiz-tokens` and run a sandbox exercise; switch to profile B; confirm B shows zero progress for that lesson AND that A's sandbox working copy is not visible to B. Storage is per-profile by construction: progress at `data/progress/<profileId>.json`, sandboxes at `sandbox/live/<profileId>/<lessonId>` (`src/lib/sandbox.ts` `sandboxDir()`). Baseline wording is "full isolation (progress + sandboxes)" — progress alone is NOT sufficient to pass | CURRENT-STATE.md line: "Profile create/switch/delete with full isolation (progress + sandboxes)" |
| RF-03d | 401 without cookie | Call an authenticated route with no `profileId` cookie — e.g. POST `/api/quiz/submit`, `/api/playground/score`, `/api/claude-code/exec` — and expect HTTP 401 with body `{"error":"no-profile"}` (`requireActiveProfile()` / `NoProfileError`) | |
| RF-03e | Profile delete | DELETE `/api/profiles/[id]`; expect the profile gone from the registry and its progress + live sandboxes removed. This deletion is **sanctioned** — see the RF-14 carve-out | Implementation: `deleteProfile()`, `src/lib/profiles.ts:64-74` |
| RF-04 | Server-side quiz grading with teaching explanations | POST `/api/quiz/submit` with `{moduleId:"01-how-llms-work", lessonId:"02-tokens", exerciseId:"quiz-tokens", answers:{"q1-what-is-token":["a"]}}` (a deliberately WRONG answer). Expect HTTP 200 and a body containing `score`, `passed`, and `results[]` where each entry has `questionId`, `correct`, and a non-empty `explanation`. Grading must happen on the server: the client never receives the key pre-submission (RF-02), so a correct/incorrect verdict in the response is itself the evidence. Confirm `passed:false` still returns explanations for the answered questions | **See the ADR-0006 intended-change note below.** Route: `src/app/api/quiz/submit/route.ts` |
| RF-05 | Live Bedrock playground streaming | Load `/learn/01-how-llms-work/04-hallucination` (playground `playground-observe-hallucination`), run the starter prompt, and watch the POST `/api/playground/run` response: expect `text/event-stream` with incremental `{"type":"text","text":...}` SSE events (not one buffered blob) followed by a final event carrying `usage.inputTokens` / `usage.outputTokens`. Requires live AWS Bedrock credentials server-side; if unavailable, record **UNVERIFIED** with the reason — never PASS on a mock | Also present at `05-randomness` (`playground-observe-variance`) |
| RF-06 | Judge scores with score-in-code | POST `/api/playground/score` with `{moduleId, lessonId, exerciseId:"playground-observe-hallucination", prompt, modelOutput}`. Expect `score` 0-100, `passed`, and `criteria[]` with one entry per rubric id (`obscure-target`, `uncertainty-permission`, `knows-vs-unsure`). Score-in-code check: the model returns only per-criterion met/not-met; the number is summed from rubric weights in `src/lib/judge.ts` (~line 159-175, `metWeight`). If the score is ever read from the model's JSON instead of computed, this row FAILS even when the number looks right | Weights 40/40/20; `passingScore: 60` |
| RF-07 | Full agent loop: spawn → fix → verify → reset | POST `/api/claude-code/exec` (SSE) with a `terminal` or `challenge` exercise, confirm the agent edits the seeded-bug fixture, then POST `/api/challenge/verify` and expect a pass, then POST `/api/claude-code/reset` and confirm the fixture is broken again. **Current-tree caveat:** module 1 content has NO terminal/challenge exercise (only `quiz` and `playground` — verified across `content/**/exercises.json`), so the baseline run exercised this through the API against the `demo-fix-greet` template (`sandbox/templates/demo-fix-greet/`, verifier registered in `src/lib/verifiers/index.ts:28`). Until such an exercise exists in content, verify via the API directly; a UI-only attempt will find no entry point and must be recorded UNVERIFIED, not FAIL | Baseline evidence: 5 turns, ~$0.42, verifier passed, reset restored the broken fixture (CURRENT-STATE.md) |
| RF-08 | Non-localhost Host header → 403 | Send a request with `Host: evil.example.com` to any route; expect HTTP 403 and body "This app only serves localhost." Enforcement is `src/proxy.ts` (allows only `localhost` and `127.0.0.1`) | |
| RF-09 | No secrets in client bundle | Search the built client output (`.next/static/**`) and DevTools → Sources for AWS/Bedrock credential material: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `ANTHROPIC_API_KEY`. Zero hits required. Any `NEXT_PUBLIC_`-prefixed credential is an automatic FAIL | |
| RF-10 | Theme switcher | Use ThemeToggle (`src/components/nav/ThemeToggle.tsx`, **SURVIVES** per CURRENT-STATE.md) to cycle light → system → dark; confirm each applies and the choice persists across a full page reload | |
| RF-11 | Active-profile indicator | Two surfaces, both required. (a) **Sidebar avatar + name** — the at-risk surface: `src/components/nav/Sidebar.tsx` renders the active profile's colored initial avatar and `profile.name`. The Sidebar is **REPLACED** in Phase 3 (CURRENT-STATE.md), and CONSTRAINTS #26 [HARD] requires the active-profile display to survive into the replacement — so at ROOT.4.9 this row is checked against the NEW nav, not the old file. (b) Active badge on the `/profiles` picker. Verifying only the picker badge does NOT satisfy this row | CONSTRAINTS #26 [HARD]: "Active profile must be visible … any redesign must preserve this" |
| RF-12 | Independent nav scroll | Scroll the sidebar to its bottom, then scroll the main content; confirm the sidebar keeps its own scroll position and vice versa. Structural basis: `src/app/layout.tsx` `body` is `h-screen overflow-hidden` with `main` `overflow-y-auto`, and the sidebar `nav` is separately `overflow-y-auto`. Must survive the Phase 3 sidebar replacement | CONSTRAINTS #28 [HARD] |
| RF-13 | Per-question quiz cards | Load a multi-question quiz (`quiz-hallucination` at `/learn/01-how-llms-work/04-hallucination`, 5 questions) and confirm each question renders as its own independent card, not one merged form | |

### ADR-0006 intended-change note (applies to RF-04)

**This is a policy note, not a verification step — read it before judging RF-04.**

ADR-0006 (accepted) decided Reading A: **failed submissions return teaching explanations
for the questions as answered**, and brute force is defeated by serving **isomorphic
variants** on retry (REQ-SR-03). What stays withheld until pass is the **answer-key
display** and the "Review answers" affordance.

Consequences for any Gate executing RF-04:

1. Explanations on a failed submission are **INTENDED**. A future change that withholds or
   partials the *answer key display* until pass — while keeping explanations — is intended
   evolution and must be recorded as PASS, **not** as a regression.
2. Conversely, a change that stops returning teaching explanations for answered questions
   on a failed submission IS a regression and fails RF-04.
3. Today `/api/quiz/submit` returns `correctOptionIds` unconditionally. When the
   pass-gating of that field lands (ADR-0006's "if the other reading is correct" lever is
   a server-side flag in the submit route), its disappearance from the pre-pass response is
   expected. Update this note rather than filing a regression.

## Data-Safety Audit (REQ-MS-03)

| ID | Behavior | How to Verify | Notes |
|---|---|---|---|
| RF-14 | No **migration or cleanup** code path deletes `data/**` or the Workshop directory | Scope per REQ-MS-03 scenario 1: *migration scripts, cleanup scripts, and storage-cutover code*. Grep the tree (excluding `node_modules`) for `rmSync`, `rmdirSync`, `unlinkSync`, `fs.rm(`, `fs.remove(`, `rimraf`, and `rm -rf`; for each hit, confirm it is on the carve-out list below or that it does not target `data/**` or the Workshop directory. A new deletion call reachable from a migration/cleanup path is a FAIL. **Carve-out — sanctioned deletions that exist today and must NOT be reported as failures:** (1) `src/lib/profiles.ts:69-73` `deleteProfile()` removes `data/progress/<id>.json` and `sandbox/live/<id>` — this IS the profile-delete behavior RF-03e requires; (2) `src/lib/sandbox.ts:65` `resetSandbox()` wipes `sandbox/live/<profileId>/<lessonId>` — this IS the reset half of RF-07; (3) `scripts/seed-sandboxes.ts:33` re-seeds `sandbox/live/**` working copies. None of these touch learner progress belonging to a *surviving* profile, `data/profiles.json` wholesale, or the Workshop directory. A literal "no deletion code exists" reading fails on day zero and is wrong | Rescoped after the day-zero false failure; `sandbox/live/**` is a derived working copy, not protected learner data (`sandbox/templates/**` is the checked-in source of truth) |
| RF-15 | Legacy JSON archived, not deleted, after verified import | After a storage cutover (e.g. `data/progress/*.json` → `learning_events`), confirm (a) the import was verified before retirement, and (b) the legacy JSON files still exist at an archived path. Zero legacy files remaining anywhere = FAIL, even if the import succeeded | REQ-MS-03 scenario 2 |
| RF-16 | `docs/origin/` is append-only | Confirm no code, script, or migration deletes or overwrites a file under `docs/origin/`; only appends and new files are permitted. Also confirm `openspec/` and project-level `.claude/` skills have not been recreated (CONSTRAINTS #20 [HARD], owner directive) | |

---

## Maintenance and ID rules

- **Freeze on citation.** A row is frozen once any Gate cites it in `.program/audits/`.
  As of this writing no Gate has run, so no row is frozen yet.
- **Append only.** New baseline behaviors discovered during migration are appended as
  RF-17, RF-18, … Sub-IDs (`RF-03a`…) may be appended to an existing row's group.
- **RF-03 is a group ID.** A citation of bare `RF-03` means all of RF-03a–RF-03e (the
  whole profile create/switch/isolation/401/delete behavior) and passes only if every
  sub-row passes. `RF-03` was never a separate behavior and is not reusable as one.
- **No renumbering.** Renumbering breaks the audit evidence chain.
- **No ID reuse, ever.** If a row is retired (its behavior genuinely no longer exists),
  mark it RETIRED in place with the deciding item/ADR and leave the ID burned. A retired
  ID is never reassigned to a different behavior — a Gate audit citing RF-nn must resolve
  to the same behavior forever.
- **Steward.** ROOT.1.2 seeds this file; ROOT.7.1 maintains it thereafter.
