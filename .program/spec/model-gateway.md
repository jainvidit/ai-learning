# Capability: Model Gateway (ModelRouter & ModelGateway seam)

The injectable model-selection abstraction over Bedrock, the quality-first model table, prompt-caching policy, and the ModelGateway production fake.

**Depends on:** none (root capability; pairs with `execution-layer.md`'s AgentRunner as the two production seams).
**Depended on by:** `judge-pipeline.md`, `coach-and-hints.md`, `content-generation.md`, `playground.md`, `testing-and-ci.md` (fakes/cassettes).
**Contract owner:** Priya (per-task selection table); all model callers consume (LANE-DEPENDENCIES "ModelRouter" row).

---

## REQ-MG-01: ModelRouter abstraction — Bedrock today, providers by config {#req-mg-01}

An injectable per-task ModelRouter sits over the Bedrock client; direct Anthropic API / Vertex are config swaps, not code changes. The router strips sampling params per model — no seed param exists; temperature is removed on newest tiers; consistency comes from structure + ensembles, not decoding params ([VERIFIED-EXTERNALLY]; ASSUMPTIONS.md #12 — re-verify at build time). Explicit `cache_control` breakpoints are used on cacheable prefixes.

**Source:** DREAM-BLUEPRINT.md §3 "Models", §7 radar row "Models"; REJECTED.md ("Judge consistency via temperature/seed policy" rejected on Priya's fact-check).
**Current state (docs/origin/CURRENT-STATE.md):** `src/lib/bedrock.ts` MODIFIED — becomes/feeds the ModelRouter; the singleton + env handling survive as the Bedrock backend.

**Scenarios:**
1. Given a task type (judge-draft, judge-gate-vote, arbiter, tutor-rung, generation, playground), when a model call is made, then the model choice came from the router's per-task table, not from call-site hardcoding.
2. Given a switch from Bedrock to direct Anthropic API, when performed, then it is a configuration change with no call-site edits.
3. Given a model tier that rejects sampling params, when the router sends a request, then those params were stripped and the request succeeds.
4. Given a repeated large prompt prefix (rubrics, lesson context), when requests are made, then explicit `cache_control` breakpoints mark the cacheable prefix.

## REQ-MG-02: Quality-first model assignment {#req-mg-02}

Per owner directive (CONSTRAINTS.md #14 [HARD] — cost is not a constraint): Sonnet-class default everywhere learner-facing including the gate ensemble; Opus-class for the arbiter, deep tutoring rungs, and generation; Haiku demoted to an optional router knob. The calibration battery, not price, arbitrates model choice (cross-link: judge-pipeline REQ-JP-05). Cost budgets were deleted from the design (REJECTED.md — Haiku-default table superseded by user directive). Model-quality ordering is assumed, not measured (ASSUMPTIONS.md #13) — the battery is designed to test it.

**Source:** DREAM-BLUEPRINT.md §3 "Models", §8 user directives; CONSTRAINTS.md #14; REJECTED.md.
**Current state:** today's playground default model config is superseded by the router table.

**Scenarios:**
1. Given the router's default table, when inspected, then learner-facing tasks (including each gate-ensemble vote) map to Sonnet-class; arbiter, deep tutor rungs, and generation map to Opus-class; Haiku appears only as an optional knob, never a default.
2. Given any model-selection change proposal, when justified, then the justification cites calibration-battery results, not cost.

## REQ-MG-03: ModelGateway is a production seam with a fake consumer {#req-mg-03}

`ModelGateway` is a production interface (not a test-only mock) with dev/preview/CI/offline consumers, so the whole app runs against recorded responses without an API key. (Its sibling seam `AgentRunner` is specified in `execution-layer.md` REQ-EX-04; the shared testing story is `testing-and-ci.md`.)

**Source:** DREAM-BLUEPRINT.md §3 "Fakes are a product surface", §6 Phase 0, §8 aligned decision 7; GLOSSARY.md "Fakes are a product surface".
**Current state:** new seam wrapping the modified `src/lib/bedrock.ts`.

**Scenarios:**
1. Given a dev environment with no `AWS_BEARER_TOKEN_BEDROCK`, when the app starts with the fake gateway configured, then all model-touching features run against recorded responses without error.
2. Given the production code path, when the gateway is resolved, then real and fake implementations satisfy the same interface (compile-time checked).
