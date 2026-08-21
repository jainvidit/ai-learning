# Assumptions — treated as true without verification; deferred; out of scope

What the project treated as true without verifying, what was deferred, and what was ruled
out of scope. **[INFERRED]** marks things the assistant inferred rather than heard the
owner agree to — these deserve the most suspicion.

## Treated as true without (full) verification

### Environment & runtime
1. **Bedrock env inheritance.** The Next.js server inherits `AWS_BEARER_TOKEN_BEDROCK`/`AWS_REGION` when launched from a shell where Claude Code's settings env applies. Verified ONCE in one shell on build day (playground streamed live); never verified from a plain terminal. The README's "copy to .env.local" fallback exists because this is fragile.
2. **claude.exe path stability.** The CLI lives at `C:\Users\jainv\AppData\Roaming\npm\node_modules\@anthropic-ai\claude-code\bin\claude.exe` (verified on build day, v2.1.207). A CLI update could move or rename this; `CLAUDE_EXE` env override exists but is untested.
3. **`--resume` semantics.** Session resume was verified to work once in the live challenge test, but the constraint "resume must run from the same cwd" was taken from documentation research, not exercised across edge cases (sandbox reset between runs, profile switches).
4. **Kill/abort paths.** `claudeSpawn.ts` timeout and client-disconnect child-kill logic was written and type-checked but the builder agent explicitly reported it was **not exercised live** ("abort/timeout kill paths, and the 409 path against a real concurrent run — logic in place, not exercised").
5. **The jest-worker crash root cause.** NEVER DIAGNOSED. It recurred across restarts and a `.next` cache clear; the debugging agent was stopped by owner decision ("we can jest worker to stop as we are rebuilding the app anyways"). Assumption inherited by the rebuild: it was an app/dev-server-local issue that a re-architecture makes moot. If the dream version reuses Next dev on Windows + Node 24, the crash may return. **[Risk carried forward]**
6. **Windows/Git Bash quirks are handled.** Path translation (/c/ vs C:\), CRLF warnings, and the shell's tendency to reset cwd between calls were worked around case-by-case, not systematically.

### Content & pedagogy
7. **Module 1 pedagogy works for the actual owner.** The content was authored to a "non-technical beginner" persona and validated by schema + review agents — but no real learner (including the owner) had completed Module 1 at the time of writing.
8. **The 13 module specs are buildable as written.** Specs 02–14 were written by agents and spot-checked structurally, but no module has been built FROM a spec yet (the plan's step "author Module 2 from its own spec to dogfood the format" was never executed). The specs' self-containedness is untested.
9. **LLM-judge scoring quality.** The judge was verified once with one strong prompt (scored 100/100 sensibly). Its discrimination on weak/borderline prompts, its run-to-run variance (the ±10-point wobble the blueprint's firewall assumes), and rubric-gaming resistance were reasoned about, never measured. The blueprint's kappa ≥0.8 / flip-rate ≤2% thresholds are targets, not observations.
10. **Sage's evidence-count thresholds.** Practiced = 2 positives ≥2 sessions apart, Fluent = 3 across ≥2 types + 21-day stability, judge dead zone 0.4–0.7, redemption via isomorphic probes — all principled but empirically unvalidated numbers. **[INFERRED from learning-science literature, not measured on this product]**

### Blueprint library/API claims (web-verified by agents, not exercised in code)
11. Ramesh's tech-radar verdicts (Velite fitness, Zero's no-offline-writes, oRPC maturity, xterm 6 serialize addon, Vercel Sandbox 24h reattachability, DO hibernation economics) were verified against documentation/web by the agent, but none has been proven in this codebase. The next-mdx-remote-is-archived claim drives a FORCED migration — worth re-verifying before Phase 0.
12. Priya's API claims (no seed param; sampling params rejected on newest tiers; `output_config.format` structured outputs on Bedrock; Haiku 4096-token cache minimum) — stated with evidence by the agent; not exercised in this repo's code.
13. **Model quality ordering.** "Sonnet judges better than Haiku; Opus arbitrates better than Sonnet" is assumed from general capability ordering; the blueprint's own calibration battery is designed to test this and hasn't run.

### Process
14. **Agent-team reports faithfully represent their subagent debates.** The lane reports synthesize sub-team work (pacing debate, scheduler bake-off, transport verdicts) that the main conversation never saw in full; fidelity of synthesis is assumed.
15. **The five lanes' "written mutual agreement"** is assumed to mean genuine consistency; only the final blueprint text was checked by the main conversation, not every cross-lane contract.

## Deferred (explicitly, with owner awareness)

16. **Building any of modules 2–14.** Specs exist; construction deferred until owner asks.
17. **The dream-version build itself.** Blueprint accepted as document; Phase 0 not started.
18. **reveal.js for recap decks.** Parked with a narrow trigger (prose-only module recap route).
19. **React Three Fiber.** Parked as ASSESS; adopt only if a specced lesson makes spatial 3D pedagogically load-bearing.
20. **Hosted Edition (Phase 5).** Designed but explicitly optional; Home Edition is primary per the personal-desktop-tool directive.
21. **Velite vs Content Collections tiebreak** — Ramesh holds the trigger (two-process DX pain).
22. **Langfuse vs Braintrust** — Priya's fallback if eval volume outgrows self-hosting.
23. **First-run cosmetic refinement** — Nova, deferred as non-blocking.
24. **jest-worker root cause** — deferred permanently by owner decision (see #5).

## Ruled out of scope (owner directives)

25. Public-internet hosting, auth hardening, multi-tenant threat modeling, DDoS — "not hosted on public internet."
26. Production-service engineering: SLA/uptime, horizontal scaling, zero-downtime migrations, ops observability — "is nota production service."
27. Cost optimization as a design driver — "we dont care about cost."
28. Competitive mechanics of any kind — leaderboards, comparisons, XP/points/medals.
29. User management / authn / authz — "jsut simppel profile mangement."
30. Hands-on OpenClaw exercises — local install broken; concept-only teaching.

## Inferences the owner never explicitly ratified **[INFERRED]**

31. **The learning-integrity carve-out** on "we dont care about cost and security concerns": evidence-quote verification, weights hidden from the judge, tutor answer-key isolation, and sandbox tool restrictions were RETAINED (reframed as mastery-honesty / own-machine safety). Flagged to the owner at the time with an explicit invitation to overrule; no objection received. Still an inference, not a directive.
32. **"Locally run" still permits a Hosted Edition as optional appendix.** The blueprint keeps Phase 5; the owner said personal desktop tool — the team preserved cloud design as *optional*. Owner never explicitly blessed keeping it.
33. **Rung-4 walkthrough stops short of the literal artifact.** The owner said hints "should ... fully guide learner about how to solve the problem"; the method-not-artifact line (explain everything, learner still types it) and the zero-evidence + re-probe accounting were the team's reconciliation with mastery honesty, relayed but not itemized for approval.
34. **Non-competitive ≠ no streaks.** A gentle, non-punitive streak was adopted as intrinsic "continuity" framing. The owner banned competition, never mentioned streaks either way.
35. **Curriculum content itself (14 modules, their ordering, lesson topics)** was assistant-designed and approved as a whole plan — individual module choices (e.g., module 12's lesson list, capstone stage design) were never individually ratified.
36. **`.program/` as a sanctioned docs location** (from the git-setup instruction, step 8 of the persist-reasoning request) — directory does not exist in this repo and its purpose was never explained here. Recorded in docs/README.md as instructed, flagged as possibly belonging to a different project's workflow. **[Awaiting owner clarification]**
