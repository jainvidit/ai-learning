# Lane Dependencies — blocking order and shared contracts

Across the five blueprint lanes (Atlas=architecture, Nova=UX, Sage=learning engine,
Ramesh=implementation/testing/DX, Priya=AI layer): which blocks which, and where any two
share a file, module, or contract. Written to become **file-ownership boundaries for
agents running in parallel** — overlapping ownership causes silent overwrites.

Paths are the current repo's where the thing exists today, and the blueprint's intended
path (marked *planned*) where it doesn't yet.

## The blocking graph

```
                    ┌─────────────────────────────┐
                    │  learning_events event log  │  ← THE root dependency
                    │  (Atlas owns schema; Ramesh │
                    │   owns storage impl)        │
                    └──────────────┬──────────────┘
           ┌───────────────┬──────┴────────┬───────────────┐
           ▼               ▼               ▼               ▼
     Projections      Sage's FSRS     Nova's hero/     Priya's drift
     (SkillState,     cards + mastery  resume/streak    monitoring
      ReviewQueue…)   states           reads            (met-rate z-tests)
           │               │               │
           └───────┬───────┘               │
                   ▼                       ▼
          Sage's review warm-up    Nova's beat rail + celebrations
                   │                       │
                   └───────────┬───────────┘
                               ▼
                    Priya's judge gate verdicts
                    (the ONLY events that touch
                     mastery or fire celebrations)
```

Sequenced hard blocks:
1. **Event log before everything.** Sage's mastery model, Nova's resume/streak/hero, and
   Priya's drift detection all read from `learning_events` (*planned*: `src/lib/events.ts`
   + SQLite; today's nearest ancestor: `src/lib/progress.ts` + `data/progress/<profileId>.json`,
   which CANNOT support any of them — it discards per-question results).
2. **Beat compiler before Nova's lesson experience.** Rail, soft frontier, resume-to-beat,
   and per-beat predicates all require lessons compiled to beat arrays (*planned*: compile
   step in `src/lib/content.ts` → Velite pipeline; today: single-blob `MDXRemote` in
   `src/components/lesson/LessonRenderer.tsx`).
3. **Skill registry before Sage's engine.** FSRS cards and mastery states key off
   `skillIds` declared in content (*planned*: extension of `src/lib/schema.ts` +
   per-module `skills.json`); until content carries skills, the engine has nothing to track.
4. **Priya's gate-tier verdicts before Sage's judge-fed evidence.** The judge-noise
   firewall consumes normalized gate scores + vote-agreement confidence; draft-tier
   verdicts must never reach the learner model.
5. **Priya's judge finality before Nova's celebrations.** Celebration triggers are
   server-confirmed events; for LLM-judged exercises that means gate-verdict completion —
   Nova's staged "Getting a second opinion…" copy exists because of this coupling.
6. **Ramesh's seams before everyone's testability.** `AgentRunner` and `ModelGateway`
   (*planned*: `packages/` seam modules; today's nearest ancestors:
   `src/lib/claudeSpawn.ts` and `src/lib/bedrock.ts`) must exist before cassette-based
   tests of any lane's features.

## Shared files/contracts — exactly two names on each seam

| Shared thing | Path (today / planned) | Owner of the contract | Consumer(s) | Rule |
|---|---|---|---|---|
| Content schema (exercise types, skillIds, boss flag, hint rungs, misconception tags) | `src/lib/schema.ts` | **Atlas** (as contract steward) | Sage (fields), Nova (rendering), content agents | Only Atlas's lane edits the file; Sage/Nova request fields via him. Content agents NEVER touch it |
| Beat model type (`beatId, type, persistent, completion`) | *planned*: `src/lib/schema.ts` or `packages/content-schema` | **Atlas** | Nova (renderer/rail), Ramesh (compiler impl) | Nova defines UX needs; Atlas owns the type; Ramesh implements the compiler |
| `learning_events` event types + payload shapes | *planned*: `src/lib/events.ts` | **Atlas** | Sage (evidence), Nova (resume/streak), Priya (judge triple: judgeModel+promptVersion+itemRevision) | Additive-only changes; every judge event MUST carry Priya's triple |
| Projections (SkillState, ReviewQueue, Streak, ResumePosition, ArtifactHealth) | *planned*: `src/lib/projections.ts` | **Sage** (semantics) / **Ramesh** (SQL impl) | Nova reads them; never computes her own | "Every projection computed in exactly one place" — Nova's own frozen contract |
| Judge verdict shape (per-criterion met/feedback/evidenceQuote/confidence, tier tag) | today: `src/lib/judge.ts` `JudgeResult`; *planned*: extended | **Priya** | Sage (firewall input), Nova (rubric card + staged states) | Sage's firewall thresholds (0.4/0.7) interpret Priya's normalized score — threshold changes need BOTH sign-offs |
| Mastery vocabulary (Introduced/Practiced/Fluent; module Mastered=MIN) | blueprint §4; *planned*: projections + UI copy | **Sage** | Nova (all UI copy), Priya (evidence weighting) | Nova renders Sage's states verbatim; no UI-invented states |
| TermEvent protocol (`text|tool|result|error` + seq numbers) | today: `src/lib/claudeSpawn.ts` (TermEvent) + `src/components/lesson/Terminal.tsx` (parser); *planned*: `attach(sessionId, fromSeq)` contract | **Ramesh** | Nova (dock/terminal UI, a11y transcript), Atlas (drivers) | Contract tests are merge-blocking; UI never parses raw NDJSON |
| ExecutionDriver interface (Local/Cloud) | *planned*; today's ancestor: `src/lib/claudeSpawn.ts` + `src/lib/sandbox.ts` | **Atlas** | Ramesh (implementations), Nova (identical dock UX across drivers) | Nova's UX must not branch on driver |
| Hint-ladder rung semantics (4 rungs, server-held position, rung-4 method-not-artifact) | blueprint §3-AI; *planned*: tutor service | **Priya** (mechanics) / **Sage** (mastery accounting) | Nova ("Guide me through it" UI, guided-provenance tag) | Rung-4 evidence weighting is Sage's; leak rules are Priya's; UI copy is Nova's |
| Verifier registry + golden matrix | today: `src/lib/verifiers/index.ts`, `src/lib/verifiers/common.ts` | **Ramesh** (harness) | Sage (challenge pedagogy), content agents (register per-module verifiers) | Content agents ADD registry entries + their own `mNN-*.ts`; never edit common.ts |
| Sandbox templates | `sandbox/templates/<name>/` | **Content agents** (per module) | Ramesh (harness fixtures) | One directory per exercise; pristine-must-fail is CI-enforced |
| Calibration goldens | *planned*: per exercise family in the content bundle | **Priya** (methodology) / **Ramesh** (CI wiring) | — | Rubric change without golden update in the same PR = CI failure |
| Motion tokens + celebration API | *planned*: `src/components/ui` token layer | **Nova** | Ramesh (perf budget), all lesson components | One library (Motion); route transitions use View Transitions; never both on one element |
| Metro-map layout data | *planned*: emitted by content compile (DAG + layout hints) | **Atlas** (bundle) / **Nova** (rendering) | — | Layout computed from (col,lane) math, not hand-placed |
| Workshop git plumbing (checkpoint/restore-forward/artifact records) | *planned*: `src/lib/workshop.ts` | **Ramesh** (git mechanics) / **Sage** (artifact semantics, mapping rule) | Nova (shelf UI) | "No hard reset anywhere in the UI" is Sage's invariant; Ramesh enforces it in plumbing |
| ModelRouter | today's ancestor: `src/lib/bedrock.ts` | **Priya** | all model callers | Per-task selection is Priya's table; quality-first per owner directive |

## Current-app file ownership for parallel work TODAY (pre-dream-version)

If agents work on the existing app in parallel before any Phase 0, these are the
boundaries that held during the original 10-agent build and should hold again:

- `src/lib/schema.ts`, `src/lib/content.ts`, `content/curriculum.json` — foundation;
  single owner per change, everyone else read-only.
- `src/lib/profiles.ts`, `src/lib/progress.ts`, `src/app/api/profiles*`, `src/app/api/progress` — profile/progress agent.
- `src/components/lesson/LessonRenderer.tsx`, `Quiz.tsx`, `src/app/api/quiz/submit`, `src/app/learn/**` — lesson/quiz agent.
- `src/lib/bedrock.ts`, `src/app/api/playground/run`, `src/components/lesson/Playground.tsx` — playground agent.
- `src/lib/judge.ts`, `src/app/api/playground/score` — judge agent (imports bedrock.ts, never edits it).
- `src/lib/claudeSpawn.ts`, `src/lib/sandbox.ts`, `src/app/api/claude-code/**`, `src/components/lesson/Terminal.tsx` — terminal agent.
- `src/lib/verifiers/**`, `src/app/api/challenge/verify`, `src/components/lesson/Challenge.tsx` — challenge agent.
- `content/modules/<one module>/**` + `sandbox/templates/<its templates>/**` + `src/lib/verifiers/mNN-*.ts` — one module-authoring agent per module; the ONLY shared file is the one-line verifier registration in `src/lib/verifiers/index.ts` (append-only, one line per verifier, conflicts are trivial).
- Cross-cutting seams (`src/components/ui/index.tsx`, `src/app/layout.tsx`, `src/components/nav/**`) — single owner at a time; these caused the only mid-build stub collisions last time.

## Known collision history (why this file exists)

During the original build, the lesson-renderer agent created placeholder stubs for
`Playground.tsx`/`Terminal.tsx`/`Challenge.tsx`/`TokenVisualizer.tsx`/`NextWordGame.tsx`
that other agents later overwrote — that worked only because the stubs were explicitly
marked "safe to overwrite entirely." The pattern to repeat: if you must create a file
another agent owns, mark it a placeholder in a header comment and tell the orchestrator.
