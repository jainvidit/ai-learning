# ROOT.1.2.6 gen2 verification — SCOPE-LOCKED 13-fix pass

Agent: implementer-ROOT.1.2.6-gen2 (critical tier). One file edited:
`.program/interfaces/regression-floor.md`. Pre-edit baseline: worktree copy verified
byte-identical (modulo CRLF) to the MAIN checkout copy via
`diff --strip-trailing-cr` → `IDENTICAL_MODULO_EOL`. Rollback note written to the item
file BEFORE the first edit. No restructuring: 20 `| RF-` rows before and after
(grep count), all IDs, Gate table, and section order unchanged.

## Fact table — every claim added, with source

| # | Fix | Claim added | Source (read this pass) |
|---|---|---|---|
| 1 | RF-09 credential var | Auth resolution order "explicit creds > awsProfile > AWS_BEARER_TOKEN_BEDROCK > default AWS credential chain"; client is server-side, Node runtime | `src/lib/bedrock.ts:7-9` (doc comment), `:17-20` (constructor), `:14-15` (nodejs runtime note) |
| 2 | RF-08 matched route | Matcher excludes `_next/static`, `_next/image`, `favicon.ico`; `/` and `/api/profiles` are matched | `src/proxy.ts:15` (config.matcher), `:5-11` (403 logic) |
| 3 | ADR-0006 item 3 attribution | Key-display withholding is part of the accepted Decision (Reading A): "Withheld until pass: the answer *key* display and the 'Review answers' affordance"; the fallback lever gates the *explanation* payload | `.program/decisions/ADR-0006.md` Decision section (lines 16-20) and "If the other reading is correct" (lines 30-32); `correctOptionIds` unconditional at `src/app/api/quiz/submit/route.ts:51-60` |
| 4 | RF-02 per-question scope | sanitizeQuiz returns exercise-level `type`,`id`,`title`,`passingScore` plus per-question `id`,`kind`,`prompt`,`options[].id`,`options[].text` | `src/components/lesson/LessonRenderer.tsx:16-29` |
| 5 | RF-04 passing submission | Correct answers q1:c, q2:b, q3:b, q4:b; 4 questions; passingScore 75 → all-correct = score 100, passed true; response carries `lessonCompleted` | `content/modules/01-how-llms-work/lessons/02-tokens/exercises.json:18,31,44,57` (correctOptionIds), `:6` (passingScore); `src/app/api/quiz/submit/route.ts:62-75` (score math, response shape) |
| 6 | RF-07 exec payload | ExecBody = moduleId, lessonId, exerciseId, prompt (all required), optional continueSession; 404 unless exercise resolves to terminal/challenge; sandboxTemplate field selects template for ensureSandbox | `src/app/api/claude-code/exec/route.ts:18-24` (interface), `:44-49` (required), `:51-62` (404), `:81` (ensureSandbox(profile.id, lessonId, exercise.sandboxTemplate)); `sandboxTemplate` on terminal/challenge schemas at `src/lib/schema.ts:312,326`; grep confirmed no terminal/challenge/demo-fix-greet in `content/**` |
| 7 | RF-02 → ADR-0006 cross-ref | Bold pointer line added to RF-02 Notes cell | doc-internal; note heading unchanged |
| 8 | RF-01 profile step | POST /api/profiles `{"name":"..."}`; the create route itself sets the profileId cookie | `src/app/api/profiles/route.ts:34-55` (name validation :41-47, cookie set :49-53) |
| 9 | RF-14 Workshop anchor | Workshop dir does not exist yet (`src/lib/workshop.ts` planned); future location per-profile under `sandbox/live/` | `docs/origin/CURRENT-STATE.md:95` ("the future Workshop dir under it must NEVER be bulk-deleted once it exists"), `:103`; `.program/spec/workshop-and-artifacts.md` REQ-WA-01 "Current state: new (`src/lib/workshop.ts` planned)" |
| 10 | General UNVERIFIED rule | Added to the "How to run it" header block; generalizes RF-05/RF-07 | doc-internal |
| 11 | RF-03a payload | Body `{"name":"<non-empty>"}`; empty/missing → 400 `{"error":"name-required"}`; success → 201 `{"profile":{...}}` + cookie | `src/app/api/profiles/route.ts:41-47,48-54` |
| 12 | RF-11(b) badge verify | "Active" pill span rendered only when `p.id === activeId`; ring styling on active card | `src/app/profiles/page.tsx:138-142` (badge), `:121-123` (border-indigo-500 ring) |
| 13 | RETIRED format example | One-line pipe-row example added to the No-ID-reuse bullet | doc-internal |

## Regression check (critical-tier empirical requirement)

- `npx tsc --noEmit` in the worktree: exit 0, no output (doc-only change did not disturb
  source).
- `git status --short`: exactly `.program/interfaces/regression-floor.md`,
  `.program/ledger/items/ROOT.1.2.6.md`, `.program/ledger/events/ROOT.1.2.6.jsonl`
  (plus this evidence file). No `data/**`, no sandbox, no source touched.
- Row inventory: `grep -c '^| RF-'` = 20 before and after; no ID added/removed/renumbered.

## Ledger-write location note

The worktree permission system rejected direct writes to the MAIN checkout's
`.program/ledger/**`, so item-file, events, and evidence updates live in THIS worktree
and are listed under `artifacts` for the integrator alongside the doc edit.
