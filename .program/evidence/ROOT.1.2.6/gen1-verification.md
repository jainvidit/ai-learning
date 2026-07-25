# ROOT.1.2.6 gen1 verification evidence (hardened, 2nd attempt)

Artifact: `.program/interfaces/regression-floor.md` (edited in worktree
`.claude/worktrees/agent-adf23e6642c33000f`, to be integrated).

## State found at start of this attempt

The worktree copy of `regression-floor.md` was **byte-identical** to the gen0 artifact
(`diff` against the main-checkout copy returned no differences). The rework recorded as
"in_progress" by this owner had not been written to disk. All rework below was performed
in this attempt.

## Empirical fact checks (every claim the doc makes about the tree)

| Claim in doc | Method | Result |
|---|---|---|
| Real Gates are ROOT.1.8 / 2.5 / 3.6 / 4.9 / 5.6 | grep `^type:` in each ledger item file | CONFIRMED all five `type: Gate` |
| ROOT.4.8 is a Capability, not a Gate | same grep | CONFIRMED `type: Capability` (Testing & CI completion) |
| ROOT.2.8 / 3.8 / 5.8 do not exist | glob of `.program/ledger/items/` | CONFIRMED no such item files |
| ROOT.7.1 is the steward | grep `^type:` | CONFIRMED `type: Contract` — standing contract steward |
| Module-1 lesson slugs | glob `content/modules/01-how-llms-work/**` + `module.json` | `01-what-is-an-llm`, `02-tokens`, `03-training`, `04-hallucination`, `05-randomness`. No `01-introduction` — gen0's RF-01 path was unnavigable |
| Quiz sanitization | read `src/components/lesson/LessonRenderer.tsx:15-29` | `sanitizeQuiz()` emits only id/kind/prompt/options[id,text]; strips `correctOptionIds` + `explanation` |
| Submit response DOES contain the key | read `src/app/api/quiz/submit/route.ts:51-60` | returns `correctOptionIds` + `explanation` per question — so RF-02 had to be scoped to the pre-submission payload or it contradicts RF-04 |
| Quiz fixture for RF-02/RF-04 | `content/.../02-tokens/exercises.json` | `quiz-tokens`, `passingScore: 75`, first question id `q1-what-is-token`, correct = `c` (so `["a"]` is a deliberate fail) |
| 401 mechanism | `src/lib/profiles.ts` + route handlers | `requireActiveProfile()` / `NoProfileError` -> 401 `{"error":"no-profile"}` on quiz submit, playground score, claude-code exec |
| Profile isolation storage | `src/lib/progress.ts:10`, `src/lib/sandbox.ts:27-35` | progress `data/progress/<profileId>.json`; sandboxes `sandbox/live/<profileId>/<lessonId>` — two distinct surfaces, so RF-03 needed both |
| Sanctioned profile delete | `src/lib/profiles.ts:64-74` | `deleteProfile()` calls `fs.rmSync` on line 69 (progress) and 70-73 (sandbox). This is the RF-03e behavior itself |
| Other deletion sites | grep `rmSync\|rmdirSync\|unlinkSync\|fs.rm(\|.remove(` over `**/*.{ts,tsx,js,mjs}` | exactly 4 hits: `profiles.ts:69`, `profiles.ts:70`, `sandbox.ts:65` (resetSandbox — the reset half of RF-07), `scripts/seed-sandboxes.ts:33`. No `rimraf` / `rm -rf` / `fs.rm(` anywhere |
| Playground/judge fixtures | `04-hallucination/exercises.json`, `05-randomness/exercises.json` | `playground-observe-hallucination` (rubric ids `obscure-target` 40 / `uncertainty-permission` 40 / `knows-vs-unsure` 20, `passingScore: 60`); `playground-observe-variance` |
| Score-in-code | `src/lib/judge.ts:158-175` | `metWeight` summed from rubric weights in code; model returns only per-criterion `met`. Comment at line 113 states it explicitly |
| SSE streaming shape | `src/app/api/playground/run/route.ts:75-85` | `messageStream.on("text", delta)` -> `{type:"text",text}` events; final event carries `usage.inputTokens`/`outputTokens` |
| Agent-loop entry points | `claude-code/exec/route.ts:57-62`, `reset/route.ts:45-50`, `challenge/verify` | exec/reset accept only `terminal` or `challenge` exercises |
| **No terminal/challenge exercise exists in content** | grep `"type"` across all `content/**/exercises.json` | only `quiz` and `playground`. RF-07 cannot be driven from module-1 UI — the doc now says so and routes the Gate to the API + `demo-fix-greet` |
| Sandbox template + verifier | `sandbox/templates/` listing, `src/lib/verifiers/index.ts:28` | one template `demo-fix-greet`, verifier registered |
| 403 enforcement | `src/proxy.ts:4-9` | allows only `localhost` / `127.0.0.1`, else 403 "This app only serves localhost." |
| Sidebar is the at-risk profile surface | `docs/origin/CURRENT-STATE.md:69`, `src/components/nav/Sidebar.tsx:21-52` | Sidebar **REPLACED**; renders avatar initial + `profile.name`; CONSTRAINTS #26 [HARD] (line 50) requires the display to survive any redesign. Picker badge alone is insufficient |
| ThemeToggle survives | `CURRENT-STATE.md:70` | **SURVIVES**, light/system/dark persisted |
| Independent nav scroll structure | `src/app/layout.tsx:40-42`, `Sidebar.tsx:57` | body `h-screen overflow-hidden`, main `overflow-y-auto`, nav `overflow-y-auto`. CONSTRAINTS #28 [HARD] (line 52) |
| Multi-question quiz for RF-13 | `04-hallucination/exercises.json` | `quiz-hallucination`, 5 questions; `Quiz.tsx:118` maps questions to separate cards |
| Non-3000 port | `playwright.config.ts`, `package.json` | e2e serves 127.0.0.1:3001 via `e2e:server`; CONSTRAINTS #17 honored. Doc instructs Gates to use 3001 |
| ADR-0006 content | `.program/decisions/ADR-0006.md` | Reading A accepted; withheld-until-pass = answer *key* display + "Review answers"; reversal lever is a server-side flag in the submit route |
| Baseline behavior list | `docs/origin/CURRENT-STATE.md:13-26` + REQ-MS-02 | 11 baseline bullets; "full isolation (progress + sandboxes)" wording confirms RF-03 needed both |

## Regression sanity check

`npx tsc --noEmit` run in the worktree: exit 0, no output. (Doc-only change; this confirms
no source file was disturbed.) `git status --short` in the worktree shows exactly one
modified path: `.program/interfaces/regression-floor.md`.

## Findings addressed

Primary REJECT (spec-conformance):
- **BLOCKER — wrong Gate IDs.** Replaced the bogus list with a verified table of the five
  real Gates and an explicit "there is no ROOT.2.8/3.8/5.8; ROOT.4.8 is a Capability" line
  so the error cannot be reintroduced by copy-paste.
- **MAJOR — RF-14 day-zero false failure.** Rescoped to migration/cleanup paths per
  REQ-MS-03 scenario 1 and added an explicit carve-out naming all three sanctioned
  deletion sites with file:line, plus a note that the literal "no deletion code exists"
  reading is wrong.
- **MAJOR — RF-01 nonexistent lesson path.** Now `/learn/01-how-llms-work/02-tokens`, with
  the full real slug list and an explicit "no `01-introduction` exists".
- **MINOR — RF-03 sandboxes.** Split into RF-03a..RF-03e; RF-03c requires progress AND
  sandbox isolation, with both storage paths named.
- **MINOR — RF-11 sidebar surface.** Now two required surfaces, (a) the REPLACED sidebar
  avatar+name as the at-risk one under CONSTRAINTS #26 [HARD], (b) the picker badge, with
  "picker badge alone does NOT satisfy this row" and a note that ROOT.4.9 checks the new nav.

Secondary request_changes (consumer-fit):
- **BLOCKER — ADR-0006 note placement.** Lifted out of the how-to-verify cell into its own
  headed section after the table, labelled a policy note, with three numbered consequences
  including the symmetric case (removing explanations IS a regression) and the current
  unconditional `correctOptionIds` behavior.
- **MAJOR — RF-02 not executable.** Scoped to the pre-submission payload, names the exact
  fields to search, the page to load, the `sanitizeQuiz()` guarantee, and disambiguates the
  legitimate key in the submit response.
- **MAJOR — RF-04 not executable.** Exact route, exact JSON body with a deliberately wrong
  answer, exact expected response fields.
- **MAJOR — RF-14 not executable.** Exact grep token list, exact carve-out with file:line,
  explicit FAIL condition.
- **MINOR — RF-03 conflation.** Resolved by the sub-row split above.
- **MINOR — RF-07 path.** Now names the three API routes in loop order, the template, the
  verifier registration, and the current-tree caveat that no terminal/challenge exercise
  exists in content (UNVERIFIED, not FAIL).
- **MINOR — renumbering rule silent on ID reuse.** Maintenance section now states no ID
  reuse ever, retirement marks in place with the ID burned, and that bare `RF-03` is a
  group citation.

## Contract-shape note

Row IDs RF-01..RF-16 keep their original meaning and numbering. RF-03 became a group with
appended sub-IDs RF-03a..RF-03e; no ID changed behavior and none was reused. No Gate has
cited any row yet (no `.program/audits/gate-*` exists), so the namespace was not frozen.
No file other than `.program/interfaces/regression-floor.md` was modified.
