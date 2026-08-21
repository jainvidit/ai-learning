# Current State — disposition of every part of the existing app

For each part of the app as it exists today (commit lineage through 69aeaca): whether it
**SURVIVES** as-is into the dream version, gets **MODIFIED**, gets **REPLACED**, or gets
**DELETED**. Deletion is treated as irreversible and halts an item, so dispositions are
conservative: when in doubt, MODIFIED or REPLACED (with the old file retired only after
its replacement is verified), never DELETED.

Provenance key — **[OBSERVED]**: verified against the running app during the build
session (live requests, real spawn, real Bedrock calls). **[REASONED]**: disposition
derived from the blueprint, which has NOT been checked against current code behavior.

## Verified-working baseline [OBSERVED]

These behaviors were exercised live on build day and are the regression floor — any
migration step that breaks one of these halts:

- Dashboard, module page, lesson pages render; quiz answers absent from client payload.
- Profile create/switch/delete with full isolation (progress + sandboxes); 401 without cookie.
- Quiz grading server-side with teaching explanations.
- Playground streams live from Bedrock (SSE text deltas + usage).
- Judge scored a real prompt 100/100 with per-criterion feedback; score computed in code.
- Full agent loop: Claude Code fixed a seeded bug in a sandbox via the API (5 turns,
  ~$0.42), challenge verifier passed, reset restored the broken fixture.
- Non-localhost Host header → 403; no Bedrock secrets in client bundle.
- Theme switcher, active-profile indicator, independent nav scroll, per-question quiz cards.

## Content & specs

| Part | Path | Disposition | Notes |
|---|---|---|---|
| Curriculum map | `content/curriculum.json` | **MODIFIED** | Gains skillIds/boss/gate fields (blueprint content extensions). The 14-module structure and cross-track prerequisites survive untouched — Sage: never "simplify" the convergences |
| Module 1 content | `content/modules/01-how-llms-work/**` | **MODIFIED** (lightly) | Prose and exercises survive; fix the `# h1` duplication in lessons 04/05 (violates guide); beat delimiters may be added; exercises gain skillIds. [REASONED] |
| Module specs 02–14 | `specs/module-*.md` | **MODIFIED** | Survive as the authoring source; must be amended per Sage (#2: boss finale + test-out sections in `_TEMPLATE.md`) before modules are built from them. Spec format normalization (02–07 vs 08–14 styles) pending |
| Authoring guide + template | `specs/AUTHORING-GUIDE.md`, `specs/_TEMPLATE.md` | **MODIFIED** | Extended (skills, bosses, misconception tags, session-end beat convention); never replaced — blueprint keep-list item |
| Sandbox templates | `sandbox/templates/demo-fix-greet/**` | **SURVIVES** | Pattern generalizes; more templates arrive per module |

## Core libraries (src/lib)

| Part | Path | Disposition | Notes |
|---|---|---|---|
| Content schema | `src/lib/schema.ts` | **MODIFIED** | THE contract; additive extensions only (skillIds, boss role, hint rungs, difficulty tiers, misconception tags, beat types). Existing exercise types survive verbatim |
| Content loader + gating | `src/lib/content.ts` | **MODIFIED** | Gains the beat-compile step and soft-gate logic (`gate: hard|soft`); `isModuleUnlocked`/`lessonKey` survive. Per-request fs recompute later replaced by LearnerState projection [REASONED] |
| Progress store | `src/lib/progress.ts` + `data/progress/*.json` | **REPLACED** (Phase 1) | By append-only `learning_events` + projections. Blueprint sequences this as dual-write, then cutover — the JSON store is NOT deleted until the event log is verified; a migration importer converts existing progress. DO NOT delete user progress data at any point |
| Profiles | `src/lib/profiles.ts` + `data/profiles.json` | **SURVIVES** | Passwordless Netflix-style profiles are a blueprint keep-list item; per-profile isolation extends to Workshop dirs |
| Bedrock client | `src/lib/bedrock.ts` | **MODIFIED** | Becomes/feeds the ModelRouter (injectable per-task selection). The singleton + env handling survive as the Bedrock backend |
| Judge | `src/lib/judge.ts` | **MODIFIED** heavily | Kept invariants (score-in-code, weights hidden, XML delimiting, judge-the-prompt); prose-JSON parsing → structured outputs; single-pass → draft/gate tiers + ensemble. `judgeCriterion` helper survives (verifiers + leak-check reuse it) |
| Claude spawn | `src/lib/claudeSpawn.ts` | **MODIFIED** | Becomes the LocalDriver behind ExecutionDriver; NDJSON→TermEvent mapping survives; gains seq numbers + durable log + server-held sessions (fixes abort-on-unmount). The no-shell/stdin-prompt/flags-from-content hardening survives verbatim |
| Sandbox mgmt | `src/lib/sandbox.ts` | **MODIFIED** | Path-confinement survives; gains Workshop-adjacent lifecycle (drill sandboxes stay throwaway) |
| Verifier registry | `src/lib/verifiers/**` | **SURVIVES** + grows | Pattern is blueprint keep-list; gains golden-matrix CI harness (Ramesh) and per-module verifier files |

## API routes (src/app/api)

| Part | Path | Disposition | Notes |
|---|---|---|---|
| Playground run | `api/playground/run` | **MODIFIED** | SSE + server-side exercise loading survive; gains resumable-stream + stop endpoint [REASONED] |
| Playground score | `api/playground/score` | **MODIFIED** | Persists via event log; response shape gains tier/confidence fields |
| Claude exec/reset | `api/claude-code/*` | **MODIFIED** | Reworked onto ExecutionDriver + durable session log; SSE contract preserved for the UI |
| Quiz submit | `api/quiz/submit` | **MODIFIED** | Server-side grading survives; answer-reveal policy changes per Sage #1 (withhold keys until pass — NOTE: this contradicts current behavior which returns all answers on any submission; Nova's collapsed-passed "Review answers" only post-pass); per-question misses start being recorded |
| Profiles/progress routes | `api/profiles*`, `api/progress` | **MODIFIED** | Profile routes survive nearly as-is; progress GET/PUT re-backed by projections |
| Challenge verify | `api/challenge/verify` | **MODIFIED** | Verifier execution + hint unlocking survive; results become events; artifact re-verification added for Workshop exercises |

## UI (src/app, src/components)

| Part | Path | Disposition | Notes |
|---|---|---|---|
| Root layout + proxy | `src/app/layout.tsx`, `src/proxy.ts` | **MODIFIED** | Localhost-only proxy survives; layout gains PersistentTerminalHost + dock; theme no-flash script survives |
| Dashboard | `src/app/page.tsx` | **REPLACED** | Card grid → hero + metro map (Nova P0/P1). The 14-module visibility requirement survives in new form |
| Sidebar | `src/components/nav/Sidebar.tsx` | **REPLACED** | → progress-aware NavList with active highlight, track groups, Continue card. Active-profile display (owner [HARD] #26) and ThemeToggle placement survive into the replacement |
| ThemeToggle | `src/components/nav/ThemeToggle.tsx` | **SURVIVES** | Owner-requested; light/system/dark persisted |
| Profile picker | `src/app/profiles/page.tsx` | **MODIFIED** | Netflix pattern survives; completion % display changes (per-track instead of global); "Active" badge survives |
| Module page | `src/app/learn/[moduleId]/page.tsx` | **MODIFIED** | Gains time chips, resume emphasis, completion states |
| Lesson page | `src/app/learn/[moduleId]/[lessonId]/page.tsx` | **REPLACED** | Single-MDX render → beat flow + rail + warm-up + session-end + interstitial. Frontmatter header content survives |
| LessonRenderer | `src/components/lesson/LessonRenderer.tsx` | **REPLACED** | → BeatRenderer walking compiled beats. The components map + quiz sanitization logic carry over. `next-mdx-remote` dependency is FORCED out (archived upstream) — this is the one replacement with an external deadline [REASONED, fact-checked by Ramesh] |
| Quiz | `src/components/lesson/Quiz.tsx` | **MODIFIED** | Per-question cards (owner [HARD] #29) survive; gains initialProgress hydration, retry-preserves-correct (already done), answer-reveal policy change, ExerciseFrame wrapper |
| Playground | `src/components/lesson/Playground.tsx` | **MODIFIED** | SSE reader + rubric card survive; gains coach margin-note, staged gate-verdict states, passed-state hydration |
| Terminal | `src/components/lesson/Terminal.tsx` | **MODIFIED** heavily | xterm rendering survives; instance ownership moves to PersistentTerminalHost via portals; abort-on-unmount behavior is REMOVED (replaced by server-held reattach) |
| Challenge | `src/components/lesson/Challenge.tsx` | **MODIFIED** | Criteria checklist + hints survive; merges visually into SandboxBeat with its terminal |
| Module-1 widgets | `NextWordGame.tsx`, `TokenVisualizer.tsx` | **SURVIVES** | Content-owned; untouched by architecture migration |
| UI primitives | `src/components/ui/index.tsx` | **MODIFIED** | Card/Button/Callout survive; ProgressRing renamed → ProgressBar (it's a bar; Nova audit) + real RingProgress added; motion tokens added; Arial→Geist fix in `globals.css` |

## Infrastructure & meta

| Part | Path | Disposition | Notes |
|---|---|---|---|
| package.json scripts | `package.json` | **MODIFIED** | dev/start localhost binding survives; validate/seed survive; monorepo split (Phase 0) will relocate |
| Validation script | `scripts/validate-content.ts` | **MODIFIED** | Survives and grows (skills refs, boss-per-module, variant coverage, golden-update-with-rubric-change) |
| Seed script | `scripts/seed-sandboxes.ts` | **SURVIVES** | |
| .gitignore | `.gitignore` | **MODIFIED** | data/ + sandbox/live/ ignores survive; build-output entries evolve with tooling |
| README | `README.md` | **MODIFIED** | Setup instructions survive; updated per phase |
| Docs | `docs/**` | **SURVIVES**, append-only for `docs/origin/` | System of record per owner directive |
| CLAUDE.md / AGENTS.md | repo root | **SURVIVES** | Scaffold-provided Next.js guidance; harmless |
| openspec/, project .claude/ | — | **DELETED** (by owner) | Already gone; do not recreate ("keep everythign in docs"). Rules content preserved in CONSTRAINTS.md appendix |
| data/ (user progress, profiles) | `data/**` | **SURVIVES — NEVER DELETE** | Real learner data. Any storage migration imports it; the JSON files are retired only after verified import, and even then archived rather than deleted |
| sandbox/live/ | `sandbox/live/**` | **SURVIVES** (regenerable) | Throwaway by design (reset endpoint); safe to clear per-lesson via the app, but the future Workshop dir under it must NEVER be bulk-deleted once it exists |

## Deletions summary (the halt-worthy list)

Actually deleted, ever: only `openspec/` and project-level `.claude/` — both by the owner
directly, both recorded. The migration plan deletes NOTHING else outright; every
"REPLACED" item retires its predecessor only after the replacement passes the
verified-working baseline above. Two standing never-delete flags: `data/**` (learner
progress) and the future Workshop directory (learner's accumulated work).
