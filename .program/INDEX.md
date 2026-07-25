# Program Index — generated for the human only; no agent reads this

| ID | Type | Title | Status | Gen | Blocker |
|----|----|-------|--------|-----|---------|
| ROOT | root | AI Learning App — dream version build | in_progress | 15 | — |
| ROOT.1 | phase | Phase 0 — Forced foundations | in_progress | 0 | — |
| ROOT.1.1 | work | Content pipeline — Velite migration, beat compiler, versioned bundle | in_progress | 0 | — |
| ROOT.1.2 | work | Contracts pack — schema.ts additive extensions + beat model + interface docs | done | 3 | — |
| ROOT.1.2.1 | artifact | schema.ts additive extension — new authoring fields, Module 1 validates unchanged | done | 2 | — |
| ROOT.1.2.2 | artifact | beat-model.md interface doc — beat type, stability rules, persistent-beat portal-slot contract | done | 1 | — |
| ROOT.1.2.3 | artifact | content-schema.md interface doc — authoring contract seam over src/lib/schema.ts | done | 1 | depends_on: ROOT.1.2.1 |
| ROOT.1.2.4 | artifact | model-router.md interface doc — ModelRouter/ModelGateway seam contract | done | 1 | — |
| ROOT.1.2.5 | artifact | agent-runner.md interface doc — AgentRunner seam contract (event types deferred) | done | 1 | — |
| ROOT.1.2.6 | artifact | regression-floor.md seed — REQ-MS-02 checklist, MS-03 audit row, ADR-0006 note | done | 2 | — |
| ROOT.1.3 | work | API & streaming — BFF posture, oRPC over Zod, resumable SSE plumbing | proposed | 0 | depends_on: ROOT.1.2✓, ROOT.1.6 |
| ROOT.1.4 | work | CI pipeline + content gates | proposed | 0 | depends_on: ROOT.1.1, ROOT.7.2✓ |
| ROOT.1.5 | work | Production seams — AgentRunner + ModelGateway with fakes | proposed | 0 | depends_on: ROOT.1.9✓, ROOT.1.3 |
| ROOT.1.6 | work | Frontend platform substrate — tokens, state posture, motion foundation | proposed | 0 | depends_on: ROOT.1.2✓, ROOT.1.1 |
| ROOT.1.7 | probe | Probe — next-mdx-remote archival status (ASSUMPTIONS #11) | done | 0 | — |
| ROOT.1.8 | gate | Phase 0 Gate — regression floor + verification commands | proposed | 0 | depends_on: ROOT.1.1, ROOT.1.2✓, ROOT.1.3, ROOT.1.4, ROOT.1.5, ROOT.1.6, ROOT.1.7✓, ROOT.1.9✓, ROOT.1.10 |
| ROOT.1.9 | probe | Probe — Bedrock structured outputs (ASSUMPTIONS #12) | done | 0 | — |
| ROOT.1.10 | work | Workspace package split — npm workspaces, packages extracted, imports rewritten | proposed | 0 | depends_on: ROOT.1.1, ROOT.1.2✓, ROOT.1.3, ROOT.1.5, ROOT.1.6 |
| ROOT.2 | phase | Phase 1 — Event log under the floorboards | proposed | 0 | depends_on: ROOT.1 |
| ROOT.2.1 | work | learning_events store — schema contract, SQLite impl, dual-write | proposed | 0 | — |
| ROOT.2.2 | work | Projections — SkillState, ReviewQueue, Streak, ResumePosition, ArtifactHealth | proposed | 0 | depends_on: ROOT.2.1 |
| ROOT.2.3 | work | Judge v2 — structured outputs, tiers, ensemble+arbiter, integrity, calibration | proposed | 0 | depends_on: ROOT.2.1 |
| ROOT.2.4 | work | Legacy JSON progress archival (PARKED) | blocked | 0 | awaiting_human_authorization |
| ROOT.2.5 | gate | Phase 1 Gate — regression floor + dual-write parity evidence | proposed | 0 | depends_on: ROOT.2.1, ROOT.2.2, ROOT.2.3 |
| ROOT.3 | phase | Phase 2 — Learning engine | proposed | 0 | depends_on: ROOT.2 |
| ROOT.3.1 | work | Skill registry — 4–6 skills per module declared in content | proposed | 0 | — |
| ROOT.3.2 | work | Mastery model — discrete states, firewall, module states, adaptive selection | proposed | 0 | depends_on: ROOT.3.1 |
| ROOT.3.3 | work | Spaced review — FSRS-6, grade collapse, isomorph serving, warm-up UX | proposed | 0 | depends_on: ROOT.3.2, ROOT.3.4 |
| ROOT.3.4 | work | Content generation — variant bank pipeline with gauntlet + human-review queue | proposed | 0 | depends_on: ROOT.3.1 |
| ROOT.3.5 | work | Coach & hint ladder — isolation, four rungs, evidence accounting, leak checks | proposed | 0 | depends_on: ROOT.3.2 |
| ROOT.3.6 | gate | Phase 2 Gate — regression floor + engine invariants | proposed | 0 | depends_on: ROOT.3.1, ROOT.3.2, ROOT.3.3, ROOT.3.4, ROOT.3.5 |
| ROOT.4 | phase | Phase 3 — Experience layer | proposed | 0 | depends_on: ROOT.3 |
| ROOT.4.1 | work | Frontend platform completion — motion tokens, celebration API, a11y bar | proposed | 0 | — |
| ROOT.4.2 | work | Lesson experience — beat renderer, soft frontier, rail, warm-up, resume | proposed | 0 | depends_on: ROOT.4.1 |
| ROOT.4.3 | work | Dashboard & wayfinding — hero, metro map, sidebar, quiet stats, first-run | proposed | 0 | depends_on: ROOT.4.1, ROOT.4.7 |
| ROOT.4.4 | work | Playground v2 — server-authoritative runs, rubric transparency | proposed | 0 | depends_on: ROOT.4.2 |
| ROOT.4.5 | work | Execution layer — ExecutionDriver, durable seq-log sessions, LocalDriver | proposed | 0 | — |
| ROOT.4.6 | work | Terminal experience — PersistentTerminalHost, dock, detachability, a11y | proposed | 0 | depends_on: ROOT.4.5, ROOT.4.1, ROOT.4.2 |
| ROOT.4.7 | work | Data layer — frozen UX contract, SQLite reactive reads (offline deferred) | proposed | 0 | — |
| ROOT.4.8 | work | Testing & CI completion — cassettes, contract tests, nightly live battery | proposed | 0 | depends_on: ROOT.4.5 |
| ROOT.4.9 | gate | Phase 3 Gate — regression floor + REPLACED-component retirement checks | proposed | 0 | depends_on: ROOT.4.1, ROOT.4.2, ROOT.4.3, ROOT.4.4, ROOT.4.5, ROOT.4.6, ROOT.4.7, ROOT.4.8, ROOT.4.10 |
| ROOT.4.10 | work | Profiles — picker rework, isolation regression, deletion-over-event-log semantics | proposed | 0 | depends_on: ROOT.4.1 |
| ROOT.5 | phase | Phase 4 — Workshop era & curriculum | proposed | 0 | depends_on: ROOT.4 |
| ROOT.5.1 | work | Workshop plumbing — git-backed per-profile project, checkpoint/restore-forward | proposed | 0 | — |
| ROOT.5.2 | work | Artifact shelf + cumulative re-verification + regression repair | proposed | 0 | depends_on: ROOT.5.1 |
| ROOT.5.3 | work | Boss challenges & test-out | proposed | 0 | — |
| ROOT.5.4 | work | Spec amendments before modules 2–14 — template + guide + format normalization | proposed | 0 | depends_on: ROOT.5.3 |
| ROOT.5.5 | work | Modules 2–14 authoring + Module 1 fixes (parallel, one agent per module) | proposed | 0 | depends_on: ROOT.5.4 |
| ROOT.5.6 | gate | Phase 4 Gate — regression floor + full-curriculum content gates | proposed | 0 | depends_on: ROOT.5.1, ROOT.5.2, ROOT.5.3, ROOT.5.4, ROOT.5.5 |
| ROOT.6 | phase | Phase 5 — Hosted Edition (PARKED) | blocked | 0 | awaiting_human_authorization |
| ROOT.7 | standing | Standing services — stewardship & verification surface (cross-phase) | in_progress | 0 | — |
| ROOT.7.1 | steward | Standing contract steward — schema.ts, interfaces, package.json (post-Phase-0) | in_progress | 0 | depends_on: ROOT.1.2✓ |
| ROOT.7.2 | steward | Verification surface — test runner, npm test, Playwright e2e, AGENTS.md commands | done | 1 | — |

**Items indexed:** 51 | **Counts:** done 8 | in_progress 3 | proposed 38 | blocked 2 | **Parked:** ROOT.6, ROOT.2.4
