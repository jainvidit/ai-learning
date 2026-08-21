# Owner Constraints — requirements, preferences, non-negotiables

Everything the owner stated as a requirement, preference, or non-negotiable during the
originating conversation (2026-07-24), including things said once and never restated.
Exact wording is transcribed (typos preserved) where it carried meaning.
**[HARD]** = explicit requirement/directive. **[PREF]** = preference or process signal.

> Capture status note: an `openspec/config.yaml` briefly encoded items 1–8 and 12–16 as
> project context; the owner deleted the `openspec/` folder, so **this file is now the
> only durable record of all of these.** The deleted file was recovered via
> `git show HEAD:openspec/config.yaml` (commit 69aeaca) and verified against this file;
> its `rules:` section is migrated verbatim in the appendix below.

## Product & scope

1. **[HARD] The learning mission.** "build a modular learingin plan which takes a relatively non-techincal beginner person to guided towards being an expert and this shuold be an interactive learnign appcliations" — audience is a relatively non-technical beginner; destination is expert; interactivity is required, not optional.
2. **[HARD] Hands-on Claude Code from the web app.** "explore the possiblity of executing the calude code commadns from the web app so I can get the hands on learnign; I want to excel the claude tooling and features to peak" — the embedded real-terminal is the point of the product, and the ambition level is "peak," not survey.
3. **[HARD] Location.** Everything under `C:\Users\jainv\workplace\ai-learning-app\` ("create a workplace directory if not present already"; later: "all documents for this project should we written in directories under C:\Users\jainv\workplace\ai-learning-app\").
4. **[HARD] Parallel-buildable content.** "also leave behind a spec docuemtn for rest of the modules which can be picked by other agents in parallel and build while i learn module 1" — specs must be self-contained enough for independent agents.
5. **[HARD] Claude access = BOTH paths.** "Both we will use Amazon bedrock for api access" — Bedrock API for the playground AND the local CLI for terminal lessons.
6. **[PREF] Stack.** "we want the best applciation framework and not worried about the architecture; i want the best learingin experiecne" — learning experience outranks architectural taste.
7. **[HARD] Depth requirement.** "go into the deeper concepts also liek context rot and progressive-context unfloiding" — context engineering (context rot, progressive disclosure/unfolding) must be first-class curriculum, not a footnote.
8. **[HARD] Advanced-features coverage.** "also teach concepts like remote calude or openclaw" and "did we cover all concepts like `/loop /ultracode /goal`" — /goal, /loop, ultracode, remote Claude tiers, and OpenClaw (concept-only) are required curriculum.
9. **[HARD] OpenClaw hands-off.** "ignore the local open claw as its not setup correctly" — never exercise against the local install; teach conceptually.
10. **[HARD] Profiles without auth.** "allow user to switch between users to contunie their learing path or start a new one; we dont need to do user managemetn or authn/authz jsut simppel profile mangement" — Netflix-style name picker; no accounts, no passwords.
11. **[HARD] Progress must persist per profile.** "do you maintain the course progress ?" — asked as a requirement check; per-profile progress tracking is table stakes.

## Design values (dream blueprint directives)

12. **[HARD] Non-competitive.** "the course is not meant to be competetive but should focus on improving the learingn experience and engagement" — no leaderboards, no comparison mechanics, no competitive framing; intrinsic motivation only. (Enforced in the blueprint by schema absence of points/XP fields.)
13. **[HARD] Effort-unconstrained design.** "we do not need to worry about effort it takes to make the changes; imagine you are buidling frmo scratch waht would be the best version you will build." — rank by learning impact, never by implementation cost.
14. **[HARD] Cost & security are not design constraints.** "we dont care about cost and security concerns as it would be a locally run app and not hosted on public internet" — quality-first model selection; no public-internet threat modeling. *Assistant carve-out, flagged to owner and not objected to:* learning-integrity features (evidence-quote verification, weights hidden from judge, answer-key isolation from tutor, sandbox tool restrictions as own-machine safety) are retained as mastery-honesty features, not security.
15. **[HARD] Personal desktop tool, not a production service.** "by locally run app we mean, this woudl be run on a local desktop for individual learnign use and is nota production service" — single process where possible, files/SQLite over infrastructure, restart-and-recover over distributed durability, no SLA/scaling/ops machinery. Multi-profile is a name-picker, not tenancy.
16. **[HARD] Hint ladder ends in full guidance.** "hints should be multi staged where at later stage they fully guide learner about how to solve the problem" — a stuck learner must always have a path to a complete step-by-step method walkthrough (rung 4); reconciled with mastery honesty via zero/reduced evidence + later isomorphic re-probe.

## Environment & operations

17. **[HARD] Port 3000 is the owner's.** "Note: The server is running at port 3000 contantly" — never kill it; use other ports for testing. (Also in persistent memory.)
18. **[HARD] Delegate debugging.** "always fan off a new senior sde agnet for debugging the issues instead of doing it inline" — standing rule, stored in persistent memory.
19. **[HARD] Docs location.** "all documents for this project should we written in directories under C:\Users\jainv\workplace\ai-learning-app\" and later "keep everythign in docs" — all project documents under `docs/`.
20. **[HARD] Deleted tooling stays deleted.** "open spec folder was delted and so weere skills; keep everythign in docs" — do not recreate `openspec/` or project-level `.claude/` skills; docs are the system of record.
21. **[PREF] Multi-agent working style.** Escalating series: "fan off 10 agents to build the code" → "allow all the agents to spawn subagents recursively as they wish or need" → "they are fully empowered and expected to multithreaded thinking" → "allow all the agents to spawn agent teams along with sub agents recursively and ensure each agnet gets a unique name" — the owner wants heavy parallelism, agent teams with internal debate, and unique lineage-prefixed callsigns for every agent.
22. **[PREF] Named agent teams.** "give all the agnets a unique name so they are easily identifiabvle and can unambigously talk to each other" — Atlas/Nova/Sage/Ramesh/Priya convention; extend to future teams.
23. **[PREF] Team composition by owner.** Owner adds members by role ("add a senior web developer agent 'ramesh'", "add a seniro AI/LLM engineer") and expects gap analysis when asked ("do we need any addtional skill set in the team ... think critically").
24. **[PREF] Review before approval.** Twice rejected plan-approval to say "lets erview the plan first" / "continue reviewing" — walk through changes in conversation before executing; don't rush to the approval gate.
25. **[PREF] Evaluate-found-things.** "these are somethings i found i have no thoughts about them" (Trophy UI, Ludiks, Phaser, Godot, R3F) — when the owner brings discoveries, give honest include/exclude verdicts without assuming enthusiasm.

## UI specifics stated as requirements during polish

26. **[HARD] Active profile must be visible.** "teh page does not show 'which is the current active profile" — fixed (sidebar avatar+name, Active badge on picker); any redesign must preserve this.
27. **[HARD] Theme switcher.** "add a theme swticher" — light/system/dark, persisted; preserved in redesigns.
28. **[HARD] Independent nav scroll.** "scroll of left nav shuold be independent of page scroll" — sidebar and content scroll separately.
29. **[HARD] Per-question quiz cards.** "This section is displayed as a single card instead of each question being wrapped individually in a card" — each quiz question gets its own card.

## Appendix — artifact rules migrated verbatim from deleted openspec/config.yaml

Recovered with `git show HEAD:openspec/config.yaml` (commit 69aeaca). These were written
by the assistant as change-management rules and remain sensible conventions for any
future proposal/design/task documents, wherever they live:

- **Proposals:** always include a "Non-goals" section; cite which DREAM-BLUEPRINT.md
  section (or migration phase) the change advances, if any.
- **Designs:** respect frozen blueprint decisions (docs/DREAM-BLUEPRINT.md §8) unless the
  proposal explicitly challenges one with evidence.
- **Tasks:** end with a verification task that exercises the change end-to-end
  (`npm run validate`, `npx tsc --noEmit`, and a live check where applicable).

The config's `context:` block duplicated items 1–8 and 12–16 above plus repo facts
(stack, key documents) already recorded in docs/README.md; no unique content was lost.
