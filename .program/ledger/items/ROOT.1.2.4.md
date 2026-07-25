---
id: ROOT.1.2.4
parent: ROOT.1.2
type: Task
title: model-router.md interface doc — ModelRouter/ModelGateway seam contract
ledger_depth: 3
status: in_review
owner_agent: implementer-ROOT.1.2.4-gen1 # hardened, escalated 2nd attempt
generation: 1
spec_refs:
  - .program/spec/model-gateway.md#req-mg-01
  - .program/spec/model-gateway.md#req-mg-02
  - .program/spec/model-gateway.md#req-mg-03
  - .program/decisions/ADR-0010.md
acceptance_criteria:
  - .program/interfaces/model-router.md exists and defines the seam — injectable per-task ModelRouter over the Bedrock client (task types judge-draft, judge-gate-vote, arbiter, tutor-rung, generation, playground); provider switch is config not code (REQ-MG-01 scenario 2); sampling params stripped per model tier (no seed; temperature removed on newest tiers); explicit cache_control breakpoints on cacheable prefixes
  - The doc records the quality-first table constraints (REQ-MG-02 — Sonnet-class default for learner-facing incl. gate-ensemble votes, Opus-class for arbiter/deep tutor rungs/generation, Haiku optional knob never default; justification cites calibration battery, never cost)
  - The doc states ModelGateway is a production interface with real and fake implementations satisfying the same compile-time-checked interface, fake runs without AWS_BEARER_TOKEN_BEDROCK (REQ-MG-03)
  - Consumers listed (judge-pipeline, coach-and-hints, content-generation, playground, testing-and-ci) with current-state anchor src/lib/bedrock.ts; implementation ownership stays with ROOT.1.4 — this doc is contract only; steward succession noted (ROOT.1.2 -> ROOT.7.1)
depends_on: []
blocks: []
children: []
file_ownership: [".program/interfaces/model-router.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
resume_hint: "Doc-only leaf. Source: model-gateway.md whole shard + ADR-0010 (BINDING). Contract doc, no code. ASSUMPTIONS #12 is now SPLIT: structured-outputs clause discharged NEGATIVE by ADR-0010 (never cite as live); sampling-param + cache-minimum clauses remain OPEN and the doc assigns build-time re-verification to ROOT.1.5 (NOT ROOT.1.9 — that probe is closed and was structured-outputs-only; the gen0 hint's ROOT.1.9 attribution was the primary reviewer's MAJOR finding). gen1 rework addressed 1 primary major + 2 primary minors + 2 secondary blockers + 2 secondary majors + 2 secondary minors."
verification:
  - criterion: ".program/interfaces/model-router.md exists and defines the seam — injectable per-task ModelRouter over the Bedrock client (task types judge-draft, judge-gate-vote, arbiter, tutor-rung, generation, playground); provider switch is config not code (REQ-MG-01 scenario 2); sampling params stripped per model tier (no seed; temperature removed on newest tiers); explicit cache_control breakpoints on cacheable prefixes"
    verdict: PASS
    method: "doc-leaf criterion->section mapping, re-verified against gen1 text by grep for each required clause (headings enumerated + clause-level marker grep)"
    evidence: "C:\\Users\\jainv\\workplace\\ai-learning-app\\.program\\interfaces\\model-router.md — L12-23 Purpose (\"An injectable per-task ModelRouter abstraction over Bedrock\"); L25-47 'Router vs. Gateway — which wraps which' (consumers see the router, gateway is the provider seam beneath; router is injectable via DI/factory, not a module singleton); L50-65 'Task Types — CLOSED enum' (all six: judge-draft, judge-gate-vote, arbiter, tutor-rung, generation, playground); L89-103 Sampling Parameter Stripping (L93 'No `seed` parameter exists'; L94 temperature removed on newest tiers; L97 stripped per model tier + REQ-MG-01 scenario 3); L105-117 Cache Control Breakpoints (L107 'explicit `cache_control` breakpoints' on rubrics/lesson-context/system-instructions + hits measured from response metadata, REQ-MG-01 scenario 4); L194-208 Provider Switch Scenario (L196 'configuration change with no call-site edits' + named single config entry point `modelGatewayConfig`, REQ-MG-01 scenario 2)"
  - criterion: "The doc records the quality-first table constraints (REQ-MG-02 — Sonnet-class default for learner-facing incl. gate-ensemble votes, Opus-class for arbiter/deep tutor rungs/generation, Haiku optional knob never default; justification cites calibration battery, never cost)"
    verdict: PASS
    method: "doc-leaf section mapping + row count check (grep -c on table rows = 7) against gen1 text; confirmed table NOT weakened vs gen0 (CONSTRAINTS #14 preserved) and no cost/budget language reintroduced (REJECTED.md Haiku-default-with-cost-budgets row)"
    evidence: "C:\\Users\\jainv\\workplace\\ai-learning-app\\.program\\interfaces\\model-router.md L67-87 'Quality-First Model Table (REQ-MG-02)' — 7 rows unchanged from gen0: judge-draft Sonnet, judge-gate-vote Sonnet (each ensemble vote learner-facing), arbiter Opus, tutor-rung deep(3-4) Opus, tutor-rung light(1-2) Sonnet, generation Opus, playground Sonnet-default; L81 constraint 'Haiku is demoted to an optional router knob... must cite calibration-battery results ... never cost'; L83 NEW provenance paragraph derives the deep/light 3-4/1-2 boundary from coach-and-hints REQ-CH-03/REQ-CH-04 and marks it as this doc's reading with Priya as arbiter (closes primary MINOR: uncited rung-split addition)"
  - criterion: "The doc states ModelGateway is a production interface with real and fake implementations satisfying the same compile-time-checked interface, fake runs without AWS_BEARER_TOKEN_BEDROCK (REQ-MG-03)"
    verdict: PASS
    method: "doc-leaf section mapping against gen1 text; additionally verified the two secondary BLOCKER-2 requirements are present as explicit contract statements (fake cache-miss semantics; error shapes shared real/fake)"
    evidence: "C:\\Users\\jainv\\workplace\\ai-learning-app\\.program\\interfaces\\model-router.md L150-192 'ModelGateway Production Seam (REQ-MG-03)' — L152 'a **production interface** (not a test-only mock)'; L154-157 Real (requires AWS_BEARER_TOKEN_BEDROCK / credential chain); L159-162 Fake (L161 'No `AWS_BEARER_TOKEN_BEDROCK` required — the whole app runs offline', REQ-MG-03 scenario 1); L186 'Type-checking ensures both satisfy the interface at compile time (REQ-MG-03 scenario 2)'; NEW L164-171 'Fake return and error semantics — contract' (hit = recorded response deterministically; MISS = deterministic `CassetteMiss` ERROR, never synthesized/approximated/nearest-neighbour, never falls through to a live call; no network under the fake; requestStructured validation not skipped under the fake); NEW L173-184 'Shared error taxonomy — one union, both implementations' 4-row table (ProviderUnavailable, RequestRejected, SchemaValidationFailed real+fake, CassetteMiss) declared once on the interface so consumer error handling cannot depend on which impl is wired; L190 seam-unification note (AgentRunner sibling, per ROOT.1.5)"
  - criterion: "Consumers listed (judge-pipeline, coach-and-hints, content-generation, playground, testing-and-ci) with current-state anchor src/lib/bedrock.ts; implementation ownership stays with ROOT.1.4 — this doc is contract only; steward succession noted (ROOT.1.2 -> ROOT.7.1)"
    verdict: PASS
    method: "doc-leaf section mapping against gen1 text; cross-checked ownership statement against ROOT.1.5 file_ownership (src/lib/bedrock.ts, src/lib/seams/**) read from C:\\Users\\jainv\\workplace\\ai-learning-app\\.program\\ledger\\items\\ROOT.1.5.md so the doc does not misattribute seam-code ownership"
    evidence: "C:\\Users\\jainv\\workplace\\ai-learning-app\\.program\\interfaces\\model-router.md L6 current-state anchor `src/lib/bedrock.ts` (MODIFIED, singleton + env handling survive); L210-222 Consumers — all five (judge-pipeline, coach-and-hints, content-generation, playground, testing-and-ci) plus LANE-DEPENDENCIES 'ModelRouter' row; L224-230 Implementation Ownership — 'This document (ROOT.1.2.4): contract only... No code', ROOT.1.4 owns the implementation work with seam-code file_ownership noted as ROOT.1.5's, neither may change the published contract without steward approval; L4 + L228 steward succession ROOT.1.2 -> ROOT.7.1 with the enumerated list of what counts as a contract change"
  - criterion: "ADR-0010 CONFORMANCE (binding constraint added at gen1 rework, not an original acceptance criterion): doc must add a seam-level capability requestStructured(schema) = tool-use forcing (one tool whose input schema IS the target schema, invocation forced), fallback prompt-embedded schema + local zod/ajv validation + at most ONE bounded repair re-ask, second failure is an error surfaced per the consumer shard's error path; explicitly NOT an output_config passthrough; mechanism swap invisible to consumers; ADR cited"
    verdict: PASS
    method: "clause-by-clause mapping of ADR-0010 'Decision' + 'Consequences' bullets onto the new doc section, verified by grep for each required phrase (NOT a passthrough / tool-use forcing / zod or ajv / ONE bounded repair / invisible to every consumer)"
    evidence: "C:\\Users\\jainv\\workplace\\ai-learning-app\\.program\\interfaces\\model-router.md L119-148 '`requestStructured(schema)` — ADR-0010'. L121 cites .program/decisions/ADR-0010.md + evidence .program/audits/probes-bedrock-structured-outputs.md; L127-129 reproduces the live 400 ('output_config.json_schema: Extra inputs are not permitted') and notes basic connectivity succeeded => feature gap not misconfiguration; L131 'seam-level capability, and NOT a passthrough of `output_config.json_schema`' + forwarding output_config declared a contract violation; L137 step 1 tool-use forcing (one tool whose input schema IS the target schema, invocation forced, no fence-stripping happy path, ties to judge-pipeline REQ-JP-01 scenario 3); L138 step 2 fallback prompt-embedded schema + local zod/ajv validation; L139 step 3 at most ONE bounded repair re-ask with validation errors supplied; L140 step 4 second failure raises SchemaValidationFailed, never unvalidated data, never a third call, surfaced per the consuming shard's error path with ROOT.2.3's one-repair budget named; L144 mechanism swap (incl. future native structured outputs) is internal to the gateway and 'invisible to every consumer' — no call-site edit, no contract change; L145 ASSUMPTIONS #12 structured-outputs clause discharged NEGATIVE, cite ADR-0010 not #12; L146 records that REJECTED.md's 'tool-use JSON schema rejected in favor of output_config' row is reversed by the ADR on empirical grounds (scoped to mechanism; the strict-schema requirement is unchanged) — so this is not a self-authorized reopening of a rejected alternative; also surfaced at L8 (header binding decision), L18 (Purpose), L181/L214/L235/L238/L253"
  - criterion: "REVIEW-FINDINGS CLOSURE (gen0 primary REJECT + gen0 secondary request_changes)"
    verdict: PASS
    method: "each finding mapped to the specific gen1 line(s) that closes it; verified by grep that the offending gen0 text no longer exists"
    evidence: "PRIMARY MAJOR (unowned REQ-MG-01 re-verification falsely attributed to closed ROOT.1.9): gen0 L52 'ASSUMPTIONS.md #12 discharge ... is ROOT.1.9's probe — cited here as pending' is DELETED; replaced by L101 'Open empirical obligation — owner: ROOT.1.5', which states ROOT.1.9's probe does NOT discharge it (structured-outputs-scoped, negative, closed), assigns build-time re-verification to ROOT.1.5 (the open item owning src/lib/bedrock.ts + src/lib/seams/**), and requires an unexpected param-rejection 400 be surfaced as RequestRejected rather than silently retried; also L238. PRIMARY MINOR-1 (cache_control ephemeral shape asserted from memory, needs empirical marker): L115 now labels the whole mechanism paragraph 'Illustrative only — NOT contract' and states the wire shapes/thresholds are 'asserted from documentation/memory and are NOT empirically verified in this repo', with ROOT.1.5 to confirm and free to deviate without a contract change. PRIMARY MINOR-2 (uncited deep=3-4/light=1-2 split): L83 provenance paragraph (derived from coach-and-hints REQ-CH-03/CH-04, labelled this doc's reading, boundary change needs steward, Priya arbitrates). SECONDARY BLOCKER-1 (task-type enum looked open-ended): heading is now 'Task Types — CLOSED enum' with L61 closure rule (exhaustive, consumers may rely on exhaustiveness, additions/renames/aliases require steward approval + a doc edit, default-fallback routing is a violation) and L63 delimiting what granularity remains in bounds. SECONDARY BLOCKER-2 (fake return/error semantics undefined; error shapes must be shared): L164-171 + L173-184 as detailed in criterion 3 above. SECONDARY MAJOR-1 (router-vs-gateway wrapping ambiguity): L25-47 one-sentence contract 'consumers see the ModelRouter; the ModelGateway is the provider seam beneath it' plus a layering diagram and three consequence bullets. SECONDARY MAJOR-2 (config handle unnamed): L200-206 names `modelGatewayConfig` as the single contract-level config entry point resolved once at start, prohibits per-call-site process.env reads for model/provider concerns, and gives an operative test for REQ-MG-01 scenario 2. SECONDARY MINOR-1 (stripping observability): L99 requires stripped params be recorded inspectably, with channel/field names left to the implementer. SECONDARY MINOR-2 (cache_control over-specifies mechanism for a contract doc): same fix as PRIMARY MINOR-1 — L107-113 is the contract (prefixes marked, hits measured), L115 is explicitly illustrative and non-binding."
artifacts: [".program/interfaces/model-router.md"]
---

Contract doc for the ModelRouter/ModelGateway seam ahead of the implementing items.
Interface doc defines names/shapes/policies; the implementing item may refine internals
but not the published contract without going through the steward.

## gen1 rework plan (hardened, pre-implementation)

1. **Contract touched:** the ModelRouter/ModelGateway seam contract in
   `.program/interfaces/model-router.md` — task-type enum, quality-first model table,
   `requestStructured(schema)` (new, per ADR-0010), gateway error union, config entry point.
2. **Who owns the other side:** consumers of this seam are judge-pipeline (ROOT.2.3),
   coach-and-hints, content-generation, playground, testing-and-ci; the implementing side is
   ROOT.1.4 (implementation work per this item's criteria) and ROOT.1.5, which holds
   `file_ownership` of `src/lib/bedrock.ts` and `src/lib/seams/**`. Sibling seam doc:
   `.program/interfaces/agent-runner.md`.
3. **What I will NOT change:** no file other than `.program/interfaces/model-router.md`
   (no code, no spec shard, no ADR, no other interface doc); no weakening of the
   quality-first table (CONSTRAINTS #14 [HARD]); nothing reintroduced from
   `docs/origin/REJECTED.md` (no cost budgets, no Haiku-default table, no
   temperature/seed determinism policy); no *new* shape added to any contract owned by
   another item — where the seam's mechanism was empirically wrong I marked the obligation
   and named its owner rather than redesigning another item's contract.

**Note on REJECTED.md and ADR-0010.** ADR-0010 (accepted) reverses REJECTED.md's
"tool-use JSON schema for judge output" row on empirical grounds (a live 400 proves the
chosen alternative does not exist on this provider). The doc records this reversal
explicitly and scopes it to the enforcement mechanism only; the underlying requirement
(strict schema-conformant judge output, no fence-stripping happy path) is unchanged. This
is an accepted-ADR consequence being propagated, not a self-authorized reopening.
