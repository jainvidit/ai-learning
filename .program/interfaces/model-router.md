# Interface: ModelRouter / ModelGateway

**Contract owner:** Priya (per-task model selection table)  
**Implementation owner:** ROOT.1.4  
**Steward succession:** ROOT.1.2 → ROOT.7.1  
**Current state anchor:** `src/lib/bedrock.ts` (MODIFIED — becomes/feeds the ModelRouter)  
**Spec source:** `.program/spec/model-gateway.md` REQ-MG-01, REQ-MG-02, REQ-MG-03

---

## Purpose

An injectable per-task ModelRouter abstraction over Bedrock that:
- Routes model calls by task type, not call-site hardcoding
- Strips sampling parameters per model tier constraints
- Applies explicit cache_control breakpoints on cacheable prefixes
- Exposes a production seam (ModelGateway) with real and fake implementations satisfying one compile-time-checked interface

Provider switching (Bedrock ↔ direct Anthropic API ↔ Vertex) is a configuration change, not a code change.

---

## Task Types

The router distinguishes these task types:

1. **judge-draft** — initial scoring of learner prompt submissions
2. **judge-gate-vote** — individual ensemble member votes in the gate-review firewall
3. **arbiter** — tie-breaking judge or meta-review of disputed verdicts
4. **tutor-rung** — hint-ladder coach responses (rungs 1–4)
5. **generation** — content authoring / lesson-material generation
6. **playground** — learner-facing interactive model experimentation

---

## Quality-First Model Table (REQ-MG-02)

Per owner directive (CONSTRAINTS.md #14 [HARD] — cost is not a constraint):

| Task Type | Model Class | Rationale |
|---|---|---|
| judge-draft | Sonnet-class | Learner-facing quality; calibration battery validates discrimination, not cost |
| judge-gate-vote | Sonnet-class | Each ensemble vote is learner-facing (flip-rate threshold ≤2%); quality is the gate's premise |
| arbiter | Opus-class | Deepest reasoning for tie-breaking / meta-review; calibration battery justifies tier |
| tutor-rung (deep, rung 3–4) | Opus-class | Full method walkthroughs and conceptual repair require strongest model |
| tutor-rung (light, rung 1–2) | Sonnet-class | Sufficient for nudges and clarifying questions |
| generation | Opus-class | Authoring quality determines all downstream learning; not cost-optimized |
| playground | Sonnet-class default | Learner-facing; Haiku available as optional knob, never default |

**Constraint:** Haiku is demoted to an optional router knob. It never appears as a task-type default. Any model-selection change proposal must cite calibration-battery results (cross-ref: judge-pipeline REQ-JP-05), not cost.

**Assumption carried forward:** Model quality ordering (Opus > Sonnet > Haiku for reasoning depth) is assumed per general capability hierarchy. The calibration battery (design: judge-pipeline, implementation: ROOT.1.9) is designed to measure this, not re-verify it (ASSUMPTIONS.md #13). ASSUMPTIONS.md #12 discharge (sampling-param behavior) is ROOT.1.9's probe — cited here as pending, not re-verified in this doc.

---

## Sampling Parameter Stripping (REQ-MG-01)

Per REJECTED.md ("Judge consistency via temperature/seed policy") and ASSUMPTIONS.md #12:

- **No `seed` parameter exists** in the Claude API.
- **Temperature is removed on newest model tiers** — requests to models that reject it must strip the param before sending.
- **Consistency comes from structure + ensembles**, not decoding parameters.

The router enforces this: sampling params are stripped per model tier. Callers may express intent (e.g., `temperature: 0.7` for playground exploration), but the router removes params that the target model rejects.

---

## Cache Control Breakpoints (REQ-MG-01)

The router applies **explicit `cache_control` breakpoints** on repeated large prompt prefixes:

- **Rubrics** (judge scoring criteria)
- **Lesson context** (tutor/coach preambles)
- **System instructions** (playground, generation tasks)

Implementation detail: the router or its Bedrock backend marks cacheable blocks with `cache_control: {type: "ephemeral"}` on the final message in each prefix. Haiku's 4096-token cache minimum (ASSUMPTIONS.md #12) is noted as a constraint; the implementation verifies cache hits via response metadata, not assumed.

---

## ModelGateway Production Seam (REQ-MG-03)

`ModelGateway` is a **production interface** (not a test-only mock) with two implementations satisfying the same compile-time-checked interface:

### Real Implementation
- Wraps the Bedrock client (`src/lib/bedrock.ts` singleton + env handling survive)
- Requires `AWS_BEARER_TOKEN_BEDROCK` / AWS credential chain
- Used in: production, local dev with API key, live nightly test battery

### Fake Implementation
- Runs against **recorded responses** (cassettes / VCR pattern)
- **No `AWS_BEARER_TOKEN_BEDROCK` required** — the whole app runs offline
- Used in: CI, offline dev, preview builds, testing without API consumption

**Interface contract:** Both implementations expose the same method signatures and return types. The resolver (DI container or config-driven factory) chooses which to instantiate. Type-checking ensures both satisfy the interface at compile time.

**Source justification:** DREAM-BLUEPRINT.md §3 "Fakes are a product surface", §6 Phase 0, §8 aligned decision 7; GLOSSARY.md "Fakes are a product surface". The fake is not a test double — it's a first-class product mode for learners and contributors without API access.

---

## Consumers

The following features depend on ModelRouter/ModelGateway:

1. **judge-pipeline** (judge-draft, judge-gate-vote, arbiter task types)
2. **coach-and-hints** (tutor-rung task type)
3. **content-generation** (generation task type)
4. **playground** (playground task type)
5. **testing-and-ci** (fake gateway for deterministic cassette tests; cross-ref: `testing-and-ci.md` spec)

**Lane dependency:** Per LANE-DEPENDENCIES "ModelRouter" row, all model-calling features consume this seam.

---

## Implementation Ownership

- **This document (ROOT.1.2.4):** Contract only. Defines names, shapes, policies.
- **Implementation (ROOT.1.4):** Owns the code. May refine internals but cannot change the published contract without steward approval.
- **Steward succession:** ROOT.1.2 (initial contract definition) → ROOT.7.1 (ongoing maintenance after Phase 0 completion).

---

## Provider Switch Scenario (REQ-MG-01)

**Scenario:** Switch from Bedrock to direct Anthropic API.

**Implementation constraint:** This must be a **configuration change with no call-site edits**. All consumers call `ModelRouter.route(taskType, prompt, options)` or similar — never hardcode model IDs or provider-specific clients.

**Config surface (implementation detail, not contract):** Environment variables, DI bindings, or a provider-registry config file. The router resolves the backend at runtime; callers see one interface.

---

## References

- **Spec source:** `.program/spec/model-gateway.md` (REQ-MG-01, REQ-MG-02, REQ-MG-03)
- **Binding constraints:** `docs/origin/CONSTRAINTS.md` #14 (cost not a constraint), #15 (personal desktop tool)
- **Rejected alternatives:** `docs/origin/REJECTED.md` (Haiku-default table superseded by user directive; judge consistency via temperature/seed rejected on fact-check)
- **Assumptions carried forward:** `docs/origin/ASSUMPTIONS.md` #12 (sampling-param stripping — ROOT.1.9 probe), #13 (model quality ordering assumed, not measured)
- **Cross-references:** 
  - `judge-pipeline.md` REQ-JP-05 (calibration battery)
  - `testing-and-ci.md` (fake gateway cassette story)
  - `execution-layer.md` REQ-EX-04 (AgentRunner as sibling production seam)

---

## Open Questions for Implementation (ROOT.1.4)

1. **Method signature:** Does the router expose one `route(taskType, messages, options)` method, or separate `judge()`, `tutor()`, `generate()` methods? Contract: implementation decides; callers must not hardcode model IDs.
2. **Cache breakpoint API:** Does the caller mark breakpoints explicitly, or does the router infer them from message roles/labels? Contract: cacheable prefixes ARE marked; the mechanism is implementation detail.
3. **Fake cassette keying:** How does the fake match requests to recorded responses (hash of messages, task-type + fixture ID, manual tags)? Contract: matching is deterministic and version-controlled; the keying scheme is internal.
4. **Rung-tier model split:** Is "tutor-rung" one task type with a `depth` param (light/deep), or two types (`tutor-light`, `tutor-deep`)? Contract: Opus for rungs 3–4, Sonnet for 1–2; the task-type granularity is implementation detail.

These are left to ROOT.1.4. This doc constrains outcomes (quality table, no call-site hardcoding, compile-time interface), not mechanisms.

---

**Document lineage:** Written by implementer-ROOT.1.2.4-gen0 per item acceptance criteria. Spec shard: `.program/spec/model-gateway.md` (whole file, REQ-MG-01/02/03). Verified: doc-leaf (map criteria to sections). Steward: ROOT.1.2 → ROOT.7.1.
