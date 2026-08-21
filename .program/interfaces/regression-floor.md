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

**General rule — unmet preconditions:** when a row's precondition cannot be met (missing
entry point, server won't start, no credentials), record **UNVERIFIED with the reason** —
never FAIL, never PASS. This generalizes what RF-05 and RF-07 state for their specific
cases and applies to every row in this document.

---

## Baseline Behaviors (REQ-MS-02)

| ID | Behavior | How to Verify | Notes |
|---|---|---|---|
| RF-01 | Dashboard, module page, lesson pages render | Load three pages on 127.0.0.1:3001, expect HTTP 200 and visible content: `/` (dashboard, `src/app/page.tsx`); `/learn/01-how-llms-work` (module page); `/learn/01-how-llms-work/02-tokens` (lesson page). Real lesson slugs in module 1 are exactly: `01-what-is-an-llm`, `02-tokens`, `03-training`, `04-hallucination`, `05-randomness` (`content/modules/01-how-llms-work/module.json`) — no `01-introduction` exists | Requires an active profile cookie for gated routes. Concrete setup: POST `/api/profiles` with `{"name":"gate-runner"}` — the route sets the `profileId` cookie itself on create (`src/app/api/profiles/route.ts:48-53`) — or use the `/profiles` UI. Same step as RF-03a |
| RF-02 | Quiz answer keys absent from the pre-submission client payload | Scope: the payload delivered *before* the learner submits. Load `/learn/01-how-llms-work/02-tokens`, view source / DevTools → Network on the document and RSC flight response, and search for `correctOptionIds` and `explanation`. Both MUST be absent. Server-side guarantee is `sanitizeQuiz()` in `src/components/lesson/LessonRenderer.tsx` (**lines 74-87 as of 2026-07-25**; cited as `:16-29` before ROOT.1.1.1's Velite migration inserted the compiled-MDX evaluator above it — **the behavior is the guarantee, not the file:line**, so a Gate that finds the function moved re-locates it by name and does NOT fail this row; see the ROOT.7.1 anchor-audit note below) — **per question** it returns only `id`, `kind`, `prompt`, `options[].id`, `options[].text` (it also legitimately returns the exercise-level `type`, `id`, `title`, `passingScore` — those are not secrets). If that function stops stripping `correctOptionIds` or `explanation` from any question, this row FAILS. Note: the POST `/api/quiz/submit` *response* legitimately contains `correctOptionIds`; that is RF-04 territory and governed by the ADR-0006 note, not a RF-02 failure | Fixture: quiz `quiz-tokens` (`passingScore: 75`). **The ADR-0006 intended-change note below also governs this row:** the withheld-answer-key policy determines which payloads may legally carry the key — read it before judging RF-02, not just RF-04 |
| RF-03a | Profile create | POST `/api/profiles` with body `{"name":"<non-empty string>"}` (only field; missing/empty name → 400 `{"error":"name-required"}`). Expect HTTP 201 with `{"profile":{...}}`, the new profile in `data/profiles.json`, and the `profileId` cookie set by the response (`src/app/api/profiles/route.ts:34-55`) | Registry is `data/profiles.json` (`src/lib/profiles.ts`) |
| RF-03b | Profile switch | POST `/api/profiles/switch` with a second profile id; expect the `profileId` cookie to change | |
| RF-03c | Profile isolation covers **progress AND sandboxes** | With profile A, complete quiz `quiz-tokens` and run a sandbox exercise; switch to profile B; confirm B shows zero progress for that lesson AND that A's sandbox working copy is not visible to B. Storage is per-profile by construction: progress at `data/progress/<profileId>.json`, sandboxes at `sandbox/live/<profileId>/<lessonId>` (`src/lib/sandbox.ts` `sandboxDir()`). Baseline wording is "full isolation (progress + sandboxes)" — progress alone is NOT sufficient to pass | CURRENT-STATE.md line: "Profile create/switch/delete with full isolation (progress + sandboxes)" |
| RF-03d | 401 without cookie | Call an authenticated route with no `profileId` cookie — e.g. POST `/api/quiz/submit`, `/api/playground/score`, `/api/claude-code/exec` — and expect HTTP 401 with body `{"error":"no-profile"}` (`requireActiveProfile()` / `NoProfileError`) | |
| RF-03e | Profile delete | DELETE `/api/profiles/[id]`; expect the profile gone from the registry and its progress + live sandboxes removed. This deletion is **sanctioned** — see the RF-14 carve-out | Implementation: `deleteProfile()`, `src/lib/profiles.ts:64-74` |
| RF-04 | Server-side quiz grading with teaching explanations | Two submissions, both required. **Fail path:** POST `/api/quiz/submit` with `{moduleId:"01-how-llms-work", lessonId:"02-tokens", exerciseId:"quiz-tokens", answers:{"q1-what-is-token":["a"]}}` (a deliberately WRONG answer). Expect HTTP 200 and a body containing `score`, `passed:false`, and `results[]` where each entry has `questionId`, `correct`, and a non-empty `explanation`. **Pass path:** same route with all four correct answers — `answers:{"q1-what-is-token":["c"], "q2-splitting":["b"], "q3-strawberry":["b"], "q4-context-window":["b"]}` (keys read from `content/modules/01-how-llms-work/lessons/02-tokens/exercises.json:18,31,44,57`) — expect `score:100`, `passed:true` (passingScore 75), and `lessonCompleted` present. Grading must happen on the server: the client never receives the key pre-submission (RF-02), so a correct/incorrect verdict in the response is itself the evidence. Confirm `passed:false` still returns explanations for the answered questions | **See the ADR-0006 intended-change note below.** Route: `src/app/api/quiz/submit/route.ts` |
| RF-05 | Live Bedrock playground streaming | Load `/learn/01-how-llms-work/04-hallucination` (playground `playground-observe-hallucination`), run the starter prompt, and watch the POST `/api/playground/run` response: expect `text/event-stream` with incremental `{"type":"text","text":...}` SSE events (not one buffered blob) followed by a final event carrying `usage.inputTokens` / `usage.outputTokens`. Requires live AWS Bedrock credentials server-side; if unavailable, record **UNVERIFIED** with the reason — never PASS on a mock | Also present at `05-randomness` (`playground-observe-variance`) |
| RF-06 | Judge scores with score-in-code | POST `/api/playground/score` with `{moduleId, lessonId, exerciseId:"playground-observe-hallucination", prompt, modelOutput}`. Expect `score` 0-100, `passed`, and `criteria[]` with one entry per rubric id (`obscure-target`, `uncertainty-permission`, `knows-vs-unsure`). Score-in-code check: the model returns only per-criterion met/not-met; the number is summed from rubric weights in `src/lib/judge.ts` (~line 159-175, `metWeight`). If the score is ever read from the model's JSON instead of computed, this row FAILS even when the number looks right | Weights 40/40/20; `passingScore: 60` |
| RF-07 | Full agent loop: spawn → fix → verify → reset | POST `/api/claude-code/exec` (SSE) with a `terminal` or `challenge` exercise, confirm the agent edits the seeded-bug fixture, then POST `/api/challenge/verify` and expect a pass, then POST `/api/claude-code/reset` and confirm the fixture is broken again. **Current-tree caveat:** module 1 content has NO terminal/challenge exercise (only `quiz` and `playground` — verified across `content/**/exercises.json`), so the baseline run exercised this through the API against the `demo-fix-greet` template (`sandbox/templates/demo-fix-greet/`, verifier registered in `src/lib/verifiers/index.ts:28`). **API-direct payload** (`ExecBody`, `src/app/api/claude-code/exec/route.ts:18-24,44`): POST `/api/claude-code/exec` with `{"moduleId":"<module>", "lessonId":"<lesson>", "exerciseId":"<terminal-or-challenge-exercise-id>", "prompt":"<instruction to fix the seeded bug>"}` — all four required; optional `"continueSession":true` resumes the prior session. Caveat inside the caveat: the route 404s (`exercise-not-found`) unless `exerciseId` resolves via content to an exercise of type `terminal`/`challenge` (route.ts:51-62), whose `sandboxTemplate` field (e.g. `"demo-fix-greet"`) selects the template that `ensureSandbox()` seeds (route.ts:81). So the API-direct run needs a terminal/challenge exercise fixture pointing at `demo-fix-greet`; if none can be provided, record UNVERIFIED with that reason. A UI-only attempt will find no entry point and must be recorded UNVERIFIED, not FAIL | Baseline evidence: 5 turns, ~$0.42, verifier passed, reset restored the broken fixture (CURRENT-STATE.md) |
| RF-08 | Non-localhost Host header → 403 | Send a request with `Host: evil.example.com` to a **matched** route — e.g. `/` or `/api/profiles` — and expect HTTP 403 with body "This app only serves localhost." Enforcement is `src/proxy.ts` (allows only `localhost` and `127.0.0.1`). Note the matcher **excludes** `_next/static`, `_next/image`, and `favicon.ico` (`src/proxy.ts:15`) — those paths are NOT covered and a 200 there is not a failure | |
| RF-09 | No secrets in client bundle | Search the built client output (`.next/static/**`) and DevTools → Sources for AWS/Bedrock credential material. The credential this tree actually uses is **`AWS_BEARER_TOKEN_BEDROCK`** — the Bedrock client resolves auth as explicit creds > awsProfile > `AWS_BEARER_TOKEN_BEDROCK` env var > default AWS credential chain (`src/lib/bedrock.ts:7-9`) — so search for it AND its value if set. Belt-and-braces, also search: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `ANTHROPIC_API_KEY` (none used by this tree today, but the default AWS credential chain can pick up the first three from the environment, so leaked values would still be real secrets). Zero hits required. Any `NEXT_PUBLIC_`-prefixed credential is an automatic FAIL | Client construction is server-side only (`src/lib/bedrock.ts:17-20`, Node.js runtime) |
| RF-10 | Theme switcher | Use ThemeToggle (`src/components/nav/ThemeToggle.tsx`, **SURVIVES** per CURRENT-STATE.md) to cycle light → system → dark; confirm each applies and the choice persists across a full page reload | |
| RF-11 | Active-profile indicator | Two surfaces, both required. (a) **Sidebar avatar + name** — the at-risk surface: `src/components/nav/Sidebar.tsx` renders the active profile's colored initial avatar and `profile.name`. The Sidebar is **REPLACED** in Phase 3 (CURRENT-STATE.md), and CONSTRAINTS #26 [HARD] requires the active-profile display to survive into the replacement — so at ROOT.4.9 this row is checked against the NEW nav, not the old file. (b) Active badge on the `/profiles` picker: load `/profiles` and confirm the active profile's card — and ONLY that card — shows an uppercase "Active" pill badge below the name (a `<span>` with text `Active`, rendered only when `p.id === activeId`, `src/app/profiles/page.tsx:138-142`) and the highlighted `border-indigo-500` ring styling (`page.tsx:121-123`). Verifying only the picker badge does NOT satisfy this row | CONSTRAINTS #26 [HARD]: "Active profile must be visible … any redesign must preserve this" |
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
3. Today `/api/quiz/submit` returns `correctOptionIds` unconditionally
   (`src/app/api/quiz/submit/route.ts:51-60`). Withholding the answer-key display until
   pass is part of ADR-0006's **accepted Decision (Reading A)** itself — "Withheld until
   pass: the answer *key* display and the 'Review answers' affordance" — so when the
   pass-gating of that field lands, its disappearance from the pre-pass response is
   expected. Update this note rather than filing a regression. (ADR-0006's separate
   "if the other reading is correct" fallback lever — a server-side flag in the submit
   route — gates the *explanation* payload, not the key; if THAT ever activates,
   consequence 2 above is superseded by a new ADR, not silently.)

### ROOT.7.1 anchor-audit note (applies to RF-02 and RF-11) — appended 2026-07-25

**This is a locator/anchoring note, not a verification step.** Added by the standing
contract steward (ROOT.7.1, batch 1) in reply to `coordinator-ROOT.1.1-gen0`'s
`field_request` of 2026-07-25T15:30:00Z. It changes no row's behavior, ID, or pass/fail
condition.

**1. What was asked.** ROOT.1.1.1 migrated `LessonRenderer.tsx` off `next-mdx-remote`
(MDX now compiles at build time via Velite). Its DOM and selector output was proven
**byte-identical on all five existing lessons** — evidence
`.program/audits/ROOT.1.1.1-verification/dom-equivalence-and-carryover.md` — so no
DOM-level re-anchoring is needed. But the component's **prop signature** changed
additively: a new optional `code?: string`, and `mdx` widened to optional and marked
`@deprecated` (accepted and ignored). The coordinator asked the steward to re-anchor any RF
row that anchors to the **prop signature** rather than to DOM.

**2. Ruling: no prop-shape re-anchor is needed. No RF row anchors to a prop signature.**
All 16 rows were checked (RF-01, RF-02, RF-03a–RF-03e, RF-04 … RF-16). Every anchor is one
of: a **route + payload field** (RF-01, RF-03a–RF-03e, RF-04, RF-05, RF-06, RF-07, RF-08), a
**rendered-DOM/selector or CSS-structure** assertion (RF-01, RF-10, RF-11, RF-12, RF-13), a
**built-artifact search** (RF-09), or a **server-side function or storage path** (RF-02,
RF-03c, RF-03e, RF-06, RF-14). None names a React component's props, and none would change
verdict because an optional prop was added or an ignored one deprecated. RF-11 in
particular anchors on rendered nav output and the `/profiles` "Active" pill — not on props
— and is unaffected by this migration (its real at-risk event is the Phase 3 nav
replacement, which the row already handles).

**3. What DID need correcting, and was corrected additively.** RF-02's locator carried a
stale file:line: `sanitizeQuiz()` moved from `LessonRenderer.tsx:16-29` to **74-87** when
the migration inserted the compiled-MDX evaluator above it. The row's *How to Verify* cell
now cites the current range. The **function is unchanged** — it still projects a
`QuizExercise` to a `ClientQuizExercise`, dropping `correctOptionIds` and `explanation`
per question and every option field except `id`/`text` — so the guarantee RF-02 tests is
exactly what it was.

**4. Standing rule this establishes for every row (inherited duty, now written down).**
ROOT.1.2 handed this steward an "RF-02 re-anchor duty" whose principle generalizes: **the
behavior, not the file:line, is the guarantee.** Therefore, for any row in this document —

- A file:line that no longer resolves is a **stale locator, not a failure**. Re-locate the
  named function/route/selector by name and verify the behavior. Record the drift for the
  steward; do not FAIL, and do not record UNVERIFIED merely because a line moved.
- Only if the named behavior is **absent or no longer holds** does the row FAIL.
- Locator refreshes are the steward's routine, additive maintenance: edit the *How to
  Verify* text, never the ID, never the behavior.

**5. Still outstanding on RF-02 (not discharged here).** The Phase 3 re-anchor remains
open: REQ-CP-01 replaces this interim renderer with `BeatRenderer` (ROOT.4.2), which will
move the sanitize step again. When ROOT.4.2 lands, the steward re-anchors RF-02 to
whatever server-side projection then withholds the answer key — same behavior, same row ID,
new locator. `LessonRenderer.tsx` is interim by charter and its own header says so.

## Data-Safety Audit (REQ-MS-03)

| ID | Behavior | How to Verify | Notes |
|---|---|---|---|
| RF-14 | No **migration or cleanup** code path deletes `data/**` or the Workshop directory | **The Workshop directory does not exist yet** (`src/lib/workshop.ts` is planned, not present — workshop-and-artifacts spec REQ-WA-01 "Current state: new"). Its recorded future location is per-profile **under `sandbox/live/`** — CURRENT-STATE.md:95: "the future Workshop dir under it must NEVER be bulk-deleted once it exists". Until it exists, the Workshop half of this row is vacuously satisfied; once created, add its concrete path here. Scope per REQ-MS-03 scenario 1: *migration scripts, cleanup scripts, and storage-cutover code*. Grep the tree (excluding `node_modules`) for `rmSync`, `rmdirSync`, `unlinkSync`, `fs.rm(`, `fs.remove(`, `rimraf`, and `rm -rf`; for each hit, confirm it is on the carve-out list below or that it does not target `data/**` or the Workshop directory. A new deletion call reachable from a migration/cleanup path is a FAIL. **Carve-out — sanctioned deletions that exist today and must NOT be reported as failures:** (1) `src/lib/profiles.ts:69-73` `deleteProfile()` removes `data/progress/<id>.json` and `sandbox/live/<id>` — this IS the profile-delete behavior RF-03e requires; (2) `src/lib/sandbox.ts:65` `resetSandbox()` wipes `sandbox/live/<profileId>/<lessonId>` — this IS the reset half of RF-07; (3) `scripts/seed-sandboxes.ts:33` re-seeds `sandbox/live/**` working copies. None of these touch learner progress belonging to a *surviving* profile, `data/profiles.json` wholesale, or the Workshop directory. A literal "no deletion code exists" reading fails on day zero and is wrong | Rescoped after the day-zero false failure; `sandbox/live/**` is a derived working copy, not protected learner data (`sandbox/templates/**` is the checked-in source of truth) |
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
  to the same behavior forever. **Marking format:** prefix the Behavior cell with
  `**RETIRED (<item-or-ADR>, <date>)** —` and keep the rest of the row text intact.
  Example: `| RF-10 | **RETIRED (ADR-0099, 2026-09-01)** — Theme switcher | …original
  verify text… | Retired because … |`
- **Steward.** ROOT.1.2 seeds this file; ROOT.7.1 maintains it thereafter.
