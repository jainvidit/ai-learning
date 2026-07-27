# Program Index — generated — for the human only; no agent reads this

| ID | Type | Title | Status | Gen | Blocker |
|----|----|-------|--------|-----|---------|
| ROOT | root | AI Learning App — dream version build | in_progress | 15 | — |
| ROOT.1 | phase | Phase 0 — Forced foundations | in_progress | 0 | — |
| ROOT.1.1 | capability | Content pipeline — Velite migration, beat compiler, versioned bundle | in_progress | 2 | gen2 coordinator owns it (gen1 died ~16:22Z) |
| ROOT.1.1.1 | task | Velite swap — build-time MDX compilation + interim LessonRenderer | done | 1 | — |
| ROOT.1.1.2 | task | Beat compiler — ordered beat arrays with stable beatIds | done | 0 | — |
| ROOT.1.1.3 | task | itemRevision content hashing + migration maps | done | 0 | — |
| ROOT.1.1.4 | task | Versioned immutable content bundle emitter + static route | in_progress | 1 | gen1 owner recorded; gen0 died at plan stage; prior worktree evidence contamination-flagged |
| ROOT.1.2 | contract | Contracts pack — schema.ts additive extensions + beat model + interface docs | done | 3 | — |
| ROOT.1.2.1 | task | schema.ts additive extension — new authoring fields, Module 1 validates unchanged | done | 2 | — |
| ROOT.1.2.2 | task | beat-model.md interface doc — beat type, stability rules, persistent-beat portal-slot contract | done | 1 | — |
| ROOT.1.2.3 | task | content-schema.md interface doc — authoring contract seam over src/lib/schema.ts | done | 1 | depends_on ROOT.1.2.1 satisfied |
| ROOT.1.2.4 | task | model-router.md interface doc — ModelRouter/ModelGateway seam contract | done | 1 | — |
| ROOT.1.2.5 | task | agent-runner.md interface doc — AgentRunner seam contract (event types deferred) | done | 1 | — |
| ROOT.1.2.6 | task | regression-floor.md seed — REQ-MS-02 checklist, MS-03 audit row, ADR-0006 note | done | 2 | — |
| ROOT.1.3 | capability | API & streaming — BFF posture, oRPC over Zod, resumable SSE plumbing | proposed | 0 | depends_on: ROOT.1.2, ROOT.1.6 |
| ROOT.1.4 | capability | CI pipeline + content gates | proposed | 0 | depends_on: ROOT.1.1, ROOT.7.2 |
| ROOT.1.5 | capability | Production seams — AgentRunner + ModelGateway with fakes | proposed | 0 | depends_on: ROOT.1.9, ROOT.1.3 |
| ROOT.1.6 | capability | Frontend platform substrate — tokens, state posture, motion foundation | proposed | 0 | depends_on: ROOT.1.2, ROOT.1.1 |
| ROOT.1.7 | probe | Probe — next-mdx-remote archival status (ASSUMPTIONS #11) | done | 0 | — |
| ROOT.1.8 | gate | Phase 0 Gate — regression floor + verification commands | proposed | 0 | depends_on all Phase 0 items |
| ROOT.1.9 | probe | Probe — Bedrock structured outputs (ASSUMPTIONS #12) | done | 0 | — |
| ROOT.1.10 | task | Workspace package split — npm workspaces, packages extracted, imports rewritten | proposed | 0 | depends_on: ROOT.1.1, ROOT.1.2, ROOT.1.3, ROOT.1.5, ROOT.1.6 |
| ROOT.2 | phase | Phase 1 — Event log under the floorboards | proposed | 0 | depends_on: ROOT.1 |
| ROOT.2.1 | contract | learning_events store — schema contract, SQLite impl, dual-write | proposed | 0 | — |
| ROOT.2.2 | capability | Projections — SkillState, ReviewQueue, Streak, ResumePosition, ArtifactHealth | proposed | 0 | depends_on: ROOT.2.1 |
| ROOT.2.3 | capability | Judge v2 — structured outputs, tiers, ensemble+arbiter, integrity, calibration | proposed | 0 | depends_on: ROOT.2.1 |
| ROOT.2.4 | capability | Legacy JSON progress archival (PARKED) | blocked | 0 | awaiting_human_authorization (REQ-MS-03 never-delete flag) |
| ROOT.2.5 | gate | Phase 1 Gate — regression floor + dual-write parity evidence | proposed | 0 | depends_on: ROOT.2.1, ROOT.2.2, ROOT.2.3 |
| ROOT.3 | phase | Phase 2 — Learning engine | proposed | 0 | depends_on: ROOT.2 |
| ROOT.3.1 | contract | Skill registry — 4–6 skills per module declared in content | proposed | 0 | — |
| ROOT.3.2 | capability | Mastery model — discrete states, firewall, module states, adaptive selection | proposed | 0 | depends_on: ROOT.3.1 |
| ROOT.3.3 | capability | Spaced review — FSRS-6, grade collapse, isomorph serving, warm-up UX | proposed | 0 | depends_on: ROOT.3.2, ROOT.3.4 |
| ROOT.3.4 | capability | Content generation — variant bank pipeline with gauntlet + human-review queue | proposed | 0 | depends_on: ROOT.3.1 |
| ROOT.3.5 | capability | Coach & hint ladder — isolation, four rungs, evidence accounting, leak checks | proposed | 0 | depends_on: ROOT.3.2 |
| ROOT.3.6 | gate | Phase 2 Gate — regression floor + engine invariants | proposed | 0 | depends_on: ROOT.3.1, ROOT.3.2, ROOT.3.3, ROOT.3.4, ROOT.3.5 |
| ROOT.4 | phase | Phase 3 — Experience layer | proposed | 0 | depends_on: ROOT.3 |
| ROOT.4.1 | capability | Frontend platform completion — motion tokens, celebration API, a11y bar | proposed | 0 | — |
| ROOT.4.2 | capability | Lesson experience — beat renderer, soft frontier, rail, warm-up, resume | proposed | 0 | depends_on: ROOT.4.1 |
| ROOT.4.3 | capability | Dashboard & wayfinding — hero, metro map, sidebar, quiet stats, first-run | proposed | 0 | depends_on: ROOT.4.1, ROOT.4.7 |
| ROOT.4.4 | capability | Playground v2 — server-authoritative runs, rubric transparency | proposed | 0 | depends_on: ROOT.4.2 |
| ROOT.4.5 | capability | Execution layer — ExecutionDriver, durable seq-log sessions, LocalDriver | proposed | 0 | — |
| ROOT.4.6 | capability | Terminal experience — PersistentTerminalHost, dock, detachability, a11y | proposed | 0 | depends_on: ROOT.4.5, ROOT.4.1, ROOT.4.2 |
| ROOT.4.7 | capability | Data layer — frozen UX contract, SQLite reactive reads (offline deferred) | proposed | 0 | — |
| ROOT.4.8 | capability | Testing & CI completion — cassettes, contract tests, nightly live battery | proposed | 0 | depends_on: ROOT.4.5 |
| ROOT.4.9 | gate | Phase 3 Gate — regression floor + REPLACED-component retirement checks | proposed | 0 | depends_on: ROOT.4.1, ROOT.4.2, ROOT.4.3, ROOT.4.4, ROOT.4.5, ROOT.4.6, ROOT.4.7, ROOT.4.8, ROOT.4.10 |
| ROOT.4.10 | capability | Profiles — picker rework, isolation regression, deletion-over-event-log semantics | proposed | 0 | depends_on: ROOT.4.1 |
| ROOT.5 | phase | Phase 4 — Workshop era & curriculum | proposed | 0 | depends_on: ROOT.4 |
| ROOT.5.1 | capability | Workshop plumbing — git-backed per-profile project, checkpoint/restore-forward | proposed | 0 | flagged: nightly backup pre-authorization pending |
| ROOT.5.2 | capability | Artifact shelf + cumulative re-verification + regression repair | proposed | 0 | depends_on: ROOT.5.1 |
| ROOT.5.3 | capability | Boss challenges & test-out | proposed | 0 | — |
| ROOT.5.4 | capability | Spec amendments before modules 2–14 — template + guide + format normalization | proposed | 0 | depends_on: ROOT.5.3 |
| ROOT.5.5 | capability | Modules 2–14 authoring + Module 1 fixes (parallel, one agent per module) | proposed | 0 | depends_on: ROOT.5.4 |
| ROOT.5.6 | gate | Phase 4 Gate — regression floor + full-curriculum content gates | proposed | 0 | depends_on: ROOT.5.1, ROOT.5.2, ROOT.5.3, ROOT.5.4, ROOT.5.5 |
| ROOT.6 | phase | Phase 5 — Hosted Edition (PARKED) | blocked | 0 | awaiting_human_authorization (ADR-0001; public API + auth + paid resources) |
| ROOT.7 | standing | Standing services — stewardship & verification surface (cross-phase) | in_progress | 0 | — |
| ROOT.7.1 | contract | Standing contract steward — schema.ts, interfaces, package.json (post-Phase-0) | in_progress | 0 | depends_on: ROOT.1.2 (satisfied) |
| ROOT.7.2 | task | Verification surface — test runner, npm test, Playwright e2e, AGENTS.md commands | done | 1 | — |

**Items indexed:** 57 | **Counts:** done 13 | in_progress 6 | proposed 36 | blocked 2 | **Parked:** ROOT.6, ROOT.2.4, ROOT.5.1 (pre-auth flag)

Regenerated 2026-07-27 from the item files. The prior footer claimed 58 items and a
status (`interrupted`) that no item file carries; both are now derived, not carried over.
