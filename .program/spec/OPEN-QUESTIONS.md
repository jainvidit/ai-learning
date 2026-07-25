# Open Questions

Ambiguities found while sharding docs/DREAM-BLUEPRINT.md, the two design reviews, and docs/origin/. Each entry gives both readings and is UNRESOLVED — nothing here was reconciled by the sharding pass. Items flagged in docs/origin/UNCERTAIN.md or as [INFERRED] in docs/origin/ASSUMPTIONS.md are open questions, not settled facts. Numbers are stable; shards cite them as "OPEN-QUESTIONS #N".

## 1. Beat type vocabulary — Nova's review vs the blueprint/glossary

- **Reading A (blueprint §2, GLOSSARY.md "Beat"):** beat types are `prose | quiz | playground | terminal | challenge | widget`.
- **Reading B (UX-REVIEW-NOVA.md §3, marked [TEAM: frozen]):** beats are `prose | interactive | exercise | recap` — a coarser taxonomy that also names a `recap` beat type the blueprint set lacks (the session-end beat may or may not be a distinct type).
- The shards use Reading A (the blueprint is the synthesis document), but both texts claim frozen status and they are not the same set. Whether `recap`/session-end is a beat *type* or an authored convention over prose beats is undecided.
- Affects: content-pipeline REQ-CP-02, lesson-experience REQ-LX-04.

## 2. Quiz answer withholding vs teaching explanations on failed submissions

- Sage §1a/§2 requires withholding answer keys so quizzes stop being brute-forceable; CURRENT-STATE.md records the deliberate policy change (withhold keys until pass; "Review answers" only post-pass).
- But the protected quiz culture (Sage §5 item 1; blueprint keep-list) is explanation-first feedback — and a full teaching explanation of a *missed* question typically reveals the correct answer.
- **Reading A:** on a failed submission, explanations are returned per answered question (teaching preserved), and brute-force is instead defeated by serving isomorphic variants on retry (REQ-SR-03).
- **Reading B:** on a failed submission, explanations for missed questions are withheld (or partial) until pass; full explanations appear only in the post-pass "Review answers" view.
- The sources do not specify which. Affects: curriculum-content REQ-CC-06.

## 3. `.program/` as a sanctioned location

- ASSUMPTIONS.md #36 [INFERRED] and UNCERTAIN.md #10 record the git-setup instruction that introduced `.program/` as possibly aimed at a different repository, "[Awaiting owner clarification]".
- **Reading A:** the owner's subsequent infrastructure commit (f4fd9b9, "Infrastructure setup for autonomous multi-agent program") and AGENTS.md's `.program/ledger` precedence rules ratify it — the repo records fact (UNCERTAIN.md standing correction).
- **Reading B:** the origin-docs flag stands until the owner explicitly clears it.
- The program is proceeding under Reading A (this file lives in `.program/spec/`); the flag is preserved here rather than silently dropped.

## 4. Resumable playground streams: Redis vs the single-process desktop directive

- Blueprint §3 names "resumable-stream (Redis)" for playground SSE resume.
- CONSTRAINTS.md #15 [HARD]: personal desktop tool — files/embedded stores over managed databases, no infrastructure.
- **Reading A:** Redis applies only to the Hosted Edition; the Home Edition satisfies the same resume contract with an in-process/file-backed stream log (parallel to the terminal's local seq-log).
- **Reading B:** the blueprint literally intends Redis wherever resumable-stream runs, accepting one extra local process.
- The shards encode only the behavior (api-and-streaming REQ-API-03); the Home Edition implementation choice is unresolved.

## 5. Offline support vs the personal-desktop-tool scope

- Blueprint §2 specifies a full v1 offline story (precached bundle, service worker, IndexedDB outbox, iOS ITP survival) — machinery aimed at browsers/devices away from a server.
- CONSTRAINTS.md #15 [HARD] frames the product as a locally-run desktop tool, where the "server" is on the same machine and offline-from-yourself is near impossible; the iOS/ITP concerns only make sense for the Hosted Edition or LAN use.
- **Reading A:** the offline capability is Home-Edition v1 scope as written (the blueprint says "v1 offline").
- **Reading B:** offline is Hosted-Edition/Phase-5-adjacent scope, and building it for Home Edition contradicts the simplicity directive.
- Affects: data-layer-and-offline REQ-DL-03 scheduling and edition assignment.

## 6. Hosted Edition — never explicitly ratified by the owner

- ASSUMPTIONS.md #32 [INFERRED]: "'Locally run' still permits a Hosted Edition as optional appendix… Owner never explicitly blessed keeping it."
- **Reading A:** Phase 5 stays in the program as designed-but-optional (blueprint's position).
- **Reading B:** the owner's "personal desktop tool, not a production service" directive means hosted work should not be scheduled at all without a fresh directive.
- Affects: hosted-edition.md (entire shard), migration-and-sequencing REQ-MS-01 Phase 5.

## 7. Monorepo split (`apps/web`, `apps/api`, …) vs single-process simplicity

- Blueprint §6 Phase 0 includes a monorepo split with a separate `apps/api`.
- CONSTRAINTS.md #15 [HARD]: single process where possible; blueprint §3 itself says the Next server "plus a session service" is the BFF.
- **Reading A:** the split is a code-organization move (packages + two deployables that Home runs as one process or one supervised pair) — compatible with the directive.
- **Reading B:** a separate api app is production-service shape the directive rules out for Home; Phase 0 should split packages only.
- Affects: migration-and-sequencing REQ-MS-01 Phase 0.

## 8. Module 12's weakness — which mitigation

- Sage §4 records three options: make 12-L1's goal-lab the module boss; demote lessons 2–5 survey content to optional reading; or merge module 12 into 11. No option was chosen in any frozen decision.
- Affects: curriculum-content REQ-CC-05 (module 12 must not be built until one is picked).

## 9. Streaks were never owner-ratified

- ASSUMPTIONS.md #34 [INFERRED]: the owner banned competition; streaks were adopted by the team as intrinsic "continuity" framing and never mentioned by the owner either way.
- **Reading A:** gentle streak + grace day ships as designed (blueprint §3/§5, Nova §2).
- **Reading B:** streaks are close enough to engagement-pressure mechanics that they need owner confirmation before building.
- Affects: event-log-and-projections REQ-EL-04, dashboard-and-wayfinding REQ-DW-01.

## 10. Velite vs Content Collections tiebreak

- Recorded open in blueprint §8 ("remaining open, non-blocking") and ASSUMPTIONS.md #21: Ramesh holds the trigger — if Velite's two-process dev DX proves painful, switch to Content Collections. Additionally the underlying forced-migration claim (next-mdx-remote archived) must be re-verified before Phase 0 (ASSUMPTIONS.md #11).
- Affects: content-pipeline REQ-CP-01.

## 11. Langfuse vs Braintrust

- Recorded open in blueprint §8: Priya's fallback trigger — if eval volume outgrows self-hosting, revisit Braintrust. Non-blocking.
- Affects: judge-pipeline REQ-JP-06.

## 12. First-run cosmetic refinement

- Recorded open in blueprint §8: Nova, deferred, non-blocking. No spec exists; nothing to build until designed.

## 13. The learning-integrity carve-out is an inference

- ASSUMPTIONS.md #31 [INFERRED]: retaining evidence-quote verification, weight hiding, tutor answer-key isolation, and sandbox tool restrictions under "we dont care about cost and security" was flagged to the owner and drew no objection — but was never affirmatively ratified.
- **Reading A:** silence + explicit flag = consent; the features stand (the shards assume this).
- **Reading B:** each carve-out item needs owner confirmation if it ever adds friction.
- Affects: judge-pipeline REQ-JP-03/04, coach-and-hints REQ-CH-01, execution-layer REQ-EX-06.

## 14. Rung-4 "method-not-artifact" boundary is an inference

- ASSUMPTIONS.md #33 [INFERRED]: the owner said hints should "fully guide learner about how to solve the problem"; the stops-short-of-the-literal-artifact line and the zero-evidence + redemption-probe accounting were the team's reconciliation, relayed but never itemized for approval.
- **Reading A:** the reconciliation stands as designed (coach-and-hints REQ-CH-03/04 assume this).
- **Reading B:** "fully guide" could be read as including the literal solution; the boundary needs owner confirmation.

## 15. Module 1 first-playground placement

- Sage §4 nit: "first playground could arrive a lesson earlier." Recorded as a nit, never adopted as a change. CURRENT-STATE.md's Module 1 disposition (MODIFIED lightly) does not include it.
- **Reading A:** leave Module 1's exercise placement as-is (the shards assume this — curriculum-content REQ-CC-03).
- **Reading B:** adopt the nit while touching Module 1 anyway.
