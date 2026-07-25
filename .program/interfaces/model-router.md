# Interface: ModelRouter / ModelGateway

**Contract owner:** Priya (per-task model selection table)  
**Implementation owner:** ROOT.1.4 (per this item's acceptance criteria); the seam **code** — `src/lib/bedrock.ts`, `src/lib/seams/**` — is owned by **ROOT.1.5** ("Production seams — AgentRunner + ModelGateway with fakes")  
**Steward succession:** ROOT.1.2 → ROOT.7.1  
**Current state anchor:** `src/lib/bedrock.ts` (MODIFIED — becomes/feeds the ModelRouter; the singleton + env handling survive as the Bedrock backend)  
**Spec source:** `.program/spec/model-gateway.md` REQ-MG-01, REQ-MG-02, REQ-MG-03  
**Binding decision:** `.program/decisions/ADR-0010.md` (structured outputs — see [`requestStructured(schema)`](#requeststructuredschema--adr-0010))

---

## Purpose

An injectable per-task ModelRouter abstraction over Bedrock that:
- Routes model calls by task type, not call-site hardcoding
- Strips sampling parameters per model tier constraints
- Applies explicit cache_control breakpoints on cacheable prefixes
- Exposes `requestStructured(schema)` for schema-conformant output without relying on provider-native structured outputs (ADR-0010)
- Exposes a production seam (ModelGateway) with real and fake implementations satisfying one compile-time-checked interface

Provider switching (Bedrock ↔ direct Anthropic API ↔ Vertex) is a configuration change, not a code change.

---

## Router vs. Gateway — which wraps which

One-sentence contract: **consumers see the ModelRouter; the ModelGateway is the provider seam beneath it.**

```
consumer feature code
        │  calls by task type, never by model ID
        ▼
   ModelRouter          ← per-task selection table, sampling-param stripping,
        │                 cache_control breakpoints, requestStructured()
        ▼
   ModelGateway         ← the production seam (REQ-MG-03): real | fake
        │
        ▼
provider client (`src/lib/bedrock.ts` today; direct Anthropic API / Vertex by config)
```

- The router is the **only** surface consumers import. No consumer resolves, constructs, or type-references a `ModelGateway` implementation directly (REQ-MG-01 scenario 1: the model choice came from the router's table, not the call site).
- The gateway is the **swap point**. Real vs. fake, and Bedrock vs. another provider, are both decided below the router (REQ-MG-03 scenario 2; REQ-MG-01 scenario 2). Substituting either is invisible to consumers.
- The router is **injectable**: a consumer receives a router instance (DI / factory), it does not reach for a module-level singleton. Tests and the offline app inject a router bound to the fake gateway.

This layering is what makes the ADR-0010 enforcement mechanism, the provider identity, and the real/fake choice all internal details rather than contract.

---

## Task Types — CLOSED enum

The task-type set is **closed at the contract level**. These six are the complete enumeration:

1. **judge-draft** — initial scoring of learner prompt submissions
2. **judge-gate-vote** — individual ensemble member votes in the gate-review firewall
3. **arbiter** — tie-breaking judge or meta-review of disputed verdicts
4. **tutor-rung** — hint-ladder coach responses (rungs 1–4)
5. **generation** — content authoring / lesson-material generation
6. **playground** — learner-facing interactive model experimentation

**Closure rule:** the enum is exhaustive and consumers may rely on exhaustiveness (a compile-time exhaustive switch over task types is legal and expected). Adding, renaming, or aliasing a task type is a **contract change**: it requires the steward's approval (ROOT.1.2 during initial definition, ROOT.7.1 after the Phase 0 gate) and an edit to this document. Routing an unlisted task by falling back to a default is a contract violation, not a convenience.

**In bounds for the implementer:** internal *granularity* of an existing type (see Open Question 4 — whether `tutor-rung` carries a `depth` parameter or is split into two internal variants), provided the six externally named types and their model-class mapping below are preserved.

---

## Quality-First Model Table (REQ-MG-02)

Per owner directive (CONSTRAINTS.md #14 [HARD] — cost is not a design constraint):

| Task Type | Model Class | Rationale |
|---|---|---|
| judge-draft | Sonnet-class | Learner-facing quality; calibration battery validates discrimination, not cost |
| judge-gate-vote | Sonnet-class | Each ensemble vote is learner-facing (flip-rate threshold ≤2%); quality is the gate's premise |
| arbiter | Opus-class | Deepest reasoning for tie-breaking / meta-review; calibration battery justifies tier |
| tutor-rung (deep, rungs 3–4) | Opus-class | Full method walkthroughs and conceptual repair require the strongest model |
| tutor-rung (light, rungs 1–2) | Sonnet-class | Sufficient for nudges and clarifying questions |
| generation | Opus-class | Authoring quality determines all downstream learning; not cost-optimized |
| playground | Sonnet-class default | Learner-facing; Haiku available as an optional knob, never default |

**Constraint:** Haiku is demoted to an optional router knob. It never appears as a task-type default. Any model-selection change proposal must cite calibration-battery results (cross-ref: judge-pipeline REQ-JP-05), never cost.

**Provenance of the deep/light rung split.** REQ-MG-02 assigns Opus-class to "deep tutoring rungs" without naming rung numbers. The 3–4 / 1–2 boundary above is derived from `coach-and-hints.md` REQ-CH-03 (a four-rung ladder ending in full guidance — rung 4 "walks the full method step-by-step"; rungs 1–2 are nudges and clarifying questions) plus REQ-CH-04 (rung-4-assisted passes carry reduced/zero mastery evidence, i.e. rung 4 is the deep end). It is **this document's reading**, not a verbatim spec line: the binding part is *deep rungs → Opus-class, light rungs → Sonnet-class*. Moving the exact boundary requires steward approval and an edit here; Priya (ladder-mechanics owner per `coach-and-hints.md`) arbitrates what counts as "deep".

**Assumption carried forward:** model quality ordering (Opus > Sonnet > Haiku for reasoning depth) is assumed from the general capability hierarchy (ASSUMPTIONS.md #13). The calibration battery (design: judge-pipeline REQ-JP-05) is designed to measure this, not to re-verify it here.

---

## Sampling Parameter Stripping (REQ-MG-01)

Per REJECTED.md ("Judge consistency via temperature/seed policy" — rejected on Priya's fact-check):

- **No `seed` parameter exists** in the Claude API.
- **Temperature is removed on newest model tiers** — requests to models that reject it must strip the param before sending.
- **Consistency comes from structure + ensembles**, not decoding parameters. Reintroducing a temperature/seed determinism policy is out of bounds.

The router enforces this: sampling params are stripped per model tier. Callers may express intent (e.g. `temperature: 0.7` for playground exploration), but the router removes params the target model rejects, and the request must then succeed (REQ-MG-01 scenario 3).

**Observability (implementation detail, not contract shape).** Stripping must not be silent-and-unknowable: the implementation is expected to record which params were stripped for which model tier, in a form that is inspectable — a structured log line, a per-request debug/metadata field, or a dev-mode report. The contract requires only that the information *is available*; the channel, field names, and verbosity are the implementer's choice. Rationale: a caller whose `temperature` vanished should be able to find out why without reading router source.

**Open empirical obligation — owner: ROOT.1.5.** The per-tier param-rejection matrix (which model IDs reject `temperature`, `top_p`, etc.) comes from ASSUMPTIONS.md #12, which was web-verified and **not** exercised in this repo. ROOT.1.9's probe does **not** discharge it: that probe was scoped to structured outputs only, returned negative, and is closed (see ADR-0010). Build-time re-verification of the sampling-param matrix therefore belongs to **ROOT.1.5**, the open item that owns `src/lib/bedrock.ts` and the seam code. Until it is discharged the matrix is a documented assumption, and the router must treat an unexpected param-rejection 400 as `RequestRejected` per the error taxonomy below — never as a silent retry loop.

---

## Cache Control Breakpoints (REQ-MG-01)

**Contract:** the router applies **explicit `cache_control` breakpoints** on repeated large prompt prefixes, and cache effectiveness is **verified from response metadata, never assumed**. Cacheable prefixes:

- **Rubrics** (judge scoring criteria)
- **Lesson context** (tutor/coach preambles)
- **System instructions** (playground, generation tasks)

That is the whole of the contract for this section: cacheable prefixes *are* marked, and hits *are* measured (REQ-MG-01 scenario 4).

**Illustrative only — NOT contract.** The following sketches one plausible mechanism, recorded to orient the implementer, and is explicitly **not binding**: marking cacheable blocks with `cache_control: {type: "ephemeral"}` on the final message of each prefix, subject to a per-model cache minimum (ASSUMPTIONS.md #12 records a Haiku 4096-token minimum). **These wire-level shapes and thresholds are asserted from documentation/memory and are NOT empirically verified in this repo.** ROOT.1.5 must confirm the actual field name, placement rule, and per-tier minimums against the live provider before depending on them, and may deviate freely from this sketch without a contract change. If the sketch proves wrong, this section's contract still holds unchanged.

---

## Disclosure — ASSUMPTIONS #12 is read per-clause, not per-assumption (ROOT.7.1, 2026-07-25)

**Additive disclosure, no contract change.** Left as steward-note backlog 3 at ROOT.1.2's
close and applied by the standing steward (ROOT.7.1, batch 1); logged on
`events/ROOT.7.1.jsonl`.

`docs/origin/ASSUMPTIONS.md` **#12 is a single numbered assumption bundling four distinct
claims** — no `seed` param; sampling params rejected on newest tiers;
`output_config.format` structured outputs on Bedrock; a Haiku 4096-token cache minimum.
**ADR-0010 retires #12 at whole-assumption granularity** — "ASSUMPTIONS #12 must not be
cited as live" — but its evidence
(`.program/audits/probes-bedrock-structured-outputs.md`) probed **only** the
structured-outputs clause, and its Decision and Consequences speak only to structured
outputs and the `requestStructured` enforcement mechanism.

**This document therefore reads #12 per clause:** the structured-outputs clause is
**discharged negative** (cite ADR-0010, never #12); the **sampling-param matrix** and the
**cache-minimum** clauses remain **open documented assumptions** with re-verification owner
**ROOT.1.5** (see "Sampling Parameter Stripping" and "Cache Control Breakpoints" above, and
the References `Assumptions` line).

**Disclosed plainly:** that per-clause reading is **this contract's interpretation**, not
something ADR-0010 states. It is chosen because the alternative is worse in both directions
— treating the un-probed sampling/cache clauses as *retired* would silently drop two live
empirical obligations that no probe has discharged, while treating them as *verified* would
assert facts this repo has never exercised. Keeping them open and owned is the conservative
option and matches what the two sections above already do.

**Consequences, so nothing is ambiguous:**

- Nothing in this document depends on the structured-outputs clause. `requestStructured`
  is specified as tool-forcing + validate/repair per ADR-0010, not as an
  `output_config` passthrough.
- The sampling-param matrix stays a documented assumption until ROOT.1.5 discharges it, and
  until then an unexpected param-rejection 4xx is `RequestRejected` per the error taxonomy
  — never a silent retry loop.
- The cache-minimum figure appears only inside the **explicitly non-binding** "Illustrative
  only — NOT contract" sketch. If it proves wrong, that section's actual contract
  (cacheable prefixes *are* marked; hits *are* measured from response metadata) holds
  unchanged.
- **If a later probe discharges either remaining clause**, or if an ADR restates #12's
  retirement at clause granularity, this disclosure becomes redundant and the steward
  removes it — until then it is the honest record of why a "retired" assumption is still
  cited here.

---

## `requestStructured(schema)` — ADR-0010

**Binding:** `.program/decisions/ADR-0010.md` (accepted 2026-07-25); evidence `.program/audits/probes-bedrock-structured-outputs.md`.

### Why this capability exists

A live probe against this repo's own Bedrock setup returned a **400** for provider-native structured outputs:

```
400 invalid_request_error: output_config.json_schema: Extra inputs are not permitted
```

Basic connectivity succeeded in the same probe, so this is a feature gap, not a configuration fault. `requestStructured` is therefore a **seam-level capability**, and **NOT a passthrough of `output_config.json_schema`**. Any implementation that forwards `output_config` to the provider violates this contract and will fail against a live endpoint.

### Contract

`requestStructured(schema)` — a capability of the seam, reachable by consumers through the router — takes a target schema and returns a value that has been **validated against that schema before it reaches the consumer**. Enforcement is layered:

1. **Primary — tool-use forcing.** Declare exactly one tool whose **input schema IS the target schema**, and force its invocation. The model's tool-call input is the structured result. No prose parsing and no fence-stripping in the happy path (this is how judge-pipeline REQ-JP-01 scenario 3 is satisfied: output arrived under a schema constraint, not a fence-strip fallback).
2. **Fallback — prompt-embedded schema + local validation.** Where tool-forcing is unavailable or refused, embed the schema in the prompt and validate the response **locally** with zod or ajv.
3. **At most ONE bounded repair re-ask.** On validation failure the seam may re-ask exactly once, bounded, supplying the validation errors. One repair round-trip is the ceiling per call.
4. **A second failure is an error.** If the repair attempt also fails validation, the seam raises `SchemaValidationFailed` (see taxonomy below). It never returns unvalidated data, never silently degrades to prose, and never attempts a third call. The error is surfaced **per the consuming shard's error path** — for the judge pipeline that is a judge error handled by the calibration engine (ROOT.2.3, which budgets for at most one repair round-trip per judgment); other consumers handle it via their own shard's error path.

### Consequences for consumers

- **The mechanism is not contract.** Tool-forcing vs. prompt-embedding vs. a future native structured-outputs API is **internal to the ModelGateway**. If native structured outputs later appear on this provider, swapping the enforcement mechanism is a change beneath the seam and is **invisible to every consumer** — no consumer code change, no call-site edit, no contract change. Consumers may rely on exactly this: schema-valid data, or a typed error, with at most one repair round-trip already spent.
- **ASSUMPTIONS.md #12 is not live for structured outputs.** Its `output_config.format` clause is discharged **negative**. Any item that assumed native structured outputs cites ADR-0010 instead. Do not cite #12 as a live assumption for this capability (its sampling-param and cache-minimum clauses remain open — see above).
- **A REJECTED.md row is superseded here, deliberately.** REJECTED.md records "Tool-use JSON schema for judge output — `output_config.format` json_schema chosen (Priya)". ADR-0010 reverses that on empirical grounds: the preferred alternative does not exist on this provider. This is a fact-check reversal recorded in an accepted ADR, not a reopened design debate, and it is scoped to the enforcement mechanism only — the underlying requirement (strict schema-conformant judge output; no prose-JSON + fence-stripping happy path) is unchanged.

---

## ModelGateway Production Seam (REQ-MG-03)

`ModelGateway` is a **production interface** (not a test-only mock) with two implementations satisfying the same compile-time-checked interface.

### Real Implementation
- Wraps the provider client (`src/lib/bedrock.ts` singleton + env handling survive)
- Requires `AWS_BEARER_TOKEN_BEDROCK` / the AWS credential chain
- Used in: production, local dev with an API key, the live nightly test battery

### Fake Implementation
- Runs against **recorded responses** (cassettes / VCR pattern), deterministic and version-controlled
- **No `AWS_BEARER_TOKEN_BEDROCK` required** — the whole app runs offline (REQ-MG-03 scenario 1)
- Used in: CI, offline dev, preview builds, testing without API consumption

### Fake return and error semantics — contract

The fake is a product surface, so its behaviour on the unhappy path is contract, not an implementation whim:

- **Cassette hit:** returns the recorded response for the matched request, as recorded. Deterministic — the same request yields the same response on every run, in any order, on any machine.
- **Cassette miss (unmatched request): a deterministic ERROR.** The fake raises `CassetteMiss` naming the unmatched request (its cassette key / task type). It **never synthesizes, approximates, paraphrases, or nearest-neighbour-matches a response**, and it never falls through to a live provider call. A missing recording is a dev/CI failure to be fixed by recording it — not a soft degradation. A fake that invented plausible model output would make every cassette suite silently meaningless.
- **No network under the fake.** The fake performs no provider I/O, so it cannot be made to succeed merely by having credentials present.
- **`requestStructured` under the fake:** identical contract to the real gateway. A recorded response that fails schema validation produces `SchemaValidationFailed` exactly as the real path would; the fake does not skip validation. Repair re-asks are themselves cassette lookups, and miss loudly if unrecorded.

### Shared error taxonomy — one union, both implementations

**Error shapes are shared between the real and fake implementations.** They are declared once on the `ModelGateway` interface, and both implementations raise members of that same union, so a consumer's error handling cannot depend on which implementation is wired in. Contract-level members:

| Error | Meaning | Raised by |
|---|---|---|
| `ProviderUnavailable` | transport / auth / availability failure reaching the provider | real |
| `RequestRejected` | provider rejected the request (4xx) — e.g. an unexpected sampling-param rejection | real |
| `SchemaValidationFailed` | `requestStructured` output failed validation after the one permitted repair (ADR-0010 step 4) | real **and** fake |
| `CassetteMiss` | no recorded response matches this request | fake |

`CassetteMiss` is fake-only *in practice* but belongs to the shared union so consumers handle it uniformly and the compiler sees one error surface. Member **names and meanings** are contract; the concrete class hierarchy, error codes, and message text are implementation detail. Adding a member is a contract change (steward). Consumers must not pattern-match on message strings.

**Interface contract:** both implementations expose the same method signatures, return types, and error union. The resolver (DI container or config-driven factory) chooses which to instantiate. Type-checking ensures both satisfy the interface at compile time (REQ-MG-03 scenario 2).

**Source justification:** DREAM-BLUEPRINT.md §3 "Fakes are a product surface", §6 Phase 0, §8 aligned decision 7; GLOSSARY.md "Fakes are a product surface". The fake is not a test double — it is a first-class product mode for learners and contributors without API access.

**Seam unification (per ROOT.1.5):** the sibling seam `AgentRunner` (`execution-layer.md` REQ-EX-04, `.program/interfaces/agent-runner.md`) is the same pattern for CLI execution. ModelGateway and AgentRunner are two seams — never merged, and never duplicated into parallel abstractions.

---

## Provider Switch Scenario (REQ-MG-01 scenario 2)

**Scenario:** switch from Bedrock to the direct Anthropic API.

**Contract:** this is a **configuration change with no call-site edits**. All consumers call the router by task type; none hardcodes a model ID, a provider-specific client, or a provider SDK import.

**Named config surface — contract level.** There is **exactly one config entry point** for model/provider resolution: a single named configuration module, resolved **once at process/app start** and injected downward. Working name in this contract: **`modelGatewayConfig`**. Its concrete file path, exact identifier, and schema are fixed by the implementing item (ROOT.1.5, under `src/lib/seams/**`), but its *singularity* and *resolution in one place* are contract:

- Provider identity, model-class → concrete model ID mapping, real-vs-fake gateway selection, and cassette-directory location are all resolved through `modelGatewayConfig`.
- **Per-call-site `process.env` reads for model/provider concerns are prohibited.** Env vars may feed `modelGatewayConfig`; they may not be read by consumers, feature code, or scattered helpers. A `process.env.BEDROCK_*` or model-ID env read outside the config entry point and the provider client is a contract violation.
- Adding a provider means adding a case behind this entry point, not touching consumers.

Operative test for scenario 2: if switching provider requires editing anything other than `modelGatewayConfig` (plus, for a genuinely new provider, one new gateway/backend module), the contract is not met.

---

## Consumers

The following features depend on ModelRouter/ModelGateway:

1. **judge-pipeline** (judge-draft, judge-gate-vote, arbiter task types; `requestStructured` for judge output — ADR-0010)
2. **coach-and-hints** (tutor-rung task type; deep/light rung split per the table above)
3. **content-generation** (generation task type)
4. **playground** (playground task type)
5. **testing-and-ci** (fake gateway for deterministic cassette tests; cross-ref `testing-and-ci.md` REQ-TC-01)

**Lane dependency:** per LANE-DEPENDENCIES "ModelRouter" row, all model-calling features consume this seam.

---

## Implementation Ownership

- **This document (ROOT.1.2.4):** contract only. Defines names, shapes, policies. No code.
- **Implementation (ROOT.1.4):** owns the implementation work per this item's acceptance criteria; the seam modules and the `src/lib/bedrock.ts` lineage sit in ROOT.1.5's `file_ownership`. Either may refine internals; neither may change the published contract without steward approval. ROOT.1.5 additionally carries the open empirical obligations (sampling-param matrix; cache_control wire shapes).
- **Steward succession:** ROOT.1.2 (initial contract definition) → ROOT.7.1 (ongoing maintenance after Phase 0 completion). Contract changes — the task-type enum, the model table, error-union members, `requestStructured` guarantees, the config entry point — go through the current steward.

---

## References

- **Spec source:** `.program/spec/model-gateway.md` (REQ-MG-01, REQ-MG-02, REQ-MG-03)
- **Binding decision:** `.program/decisions/ADR-0010.md`; evidence `.program/audits/probes-bedrock-structured-outputs.md`
- **Binding constraints:** `docs/origin/CONSTRAINTS.md` #14 [HARD] (cost is not a design constraint), #15 [HARD] (personal desktop tool)
- **Rejected alternatives:** `docs/origin/REJECTED.md` — Haiku-default table with cost budgets (superseded by user directive); judge consistency via temperature/seed (rejected on fact-check); tool-use JSON schema for judge output (that row is reversed by ADR-0010 on empirical grounds — see above)
- **Assumptions:** `docs/origin/ASSUMPTIONS.md` #12 — sampling-param and cache-minimum clauses OPEN, re-verification owner ROOT.1.5; structured-outputs clause DISCHARGED NEGATIVE by ADR-0010. #13 — model quality ordering assumed, not measured
- **Cross-references:**
  - `judge-pipeline.md` REQ-JP-01 (schema-conformant judge output), REQ-JP-05 (calibration battery)
  - `coach-and-hints.md` REQ-CH-03 / REQ-CH-04 (four-rung ladder; rung-4 semantics)
  - `testing-and-ci.md` REQ-TC-01 (cassettes on PRs, live battery nightly)
  - `execution-layer.md` REQ-EX-04 (AgentRunner as the sibling production seam)

---

## Open Questions for Implementation (ROOT.1.5 / ROOT.1.4)

1. **Method signature:** one `route(taskType, messages, options)` method, or separate `judge()` / `tutor()` / `generate()` methods? Contract: callers must not hardcode model IDs, and `requestStructured(schema)` must be reachable for schema-constrained calls.
2. **Cache breakpoint API:** does the caller mark breakpoints explicitly, or does the router infer them from message roles/labels? Contract: cacheable prefixes ARE marked and hits ARE measured; the mechanism is implementation detail.
3. **Fake cassette keying:** how does the fake match requests to recordings (hash of messages, task-type + fixture ID, manual tags)? Contract: matching is deterministic and version-controlled, and a **miss raises `CassetteMiss`** (never a synthesized response); the keying scheme itself is internal.
4. **Rung-tier granularity:** is `tutor-rung` one task type with a `depth` param, or two internal variants? Contract: the six external task types are closed; Opus for deep rungs, Sonnet for light; internal granularity is the implementer's choice.
5. **Repair-re-ask prompt shape:** how validation errors are fed back in the single permitted repair (ADR-0010 step 3) is internal. Contract: at most one repair, then `SchemaValidationFailed`.

These are left to the implementing items. This doc constrains outcomes — closed task-type enum, quality table, no call-site hardcoding, single config entry point, compile-time interface, shared error union, `requestStructured` guarantees — not mechanisms.

---

**Document lineage:** gen0 by implementer-ROOT.1.2.4-gen0; reworked by implementer-ROOT.1.2.4-gen1 (hardened) after a primary REJECT (spec-conformance) and a secondary request_changes (consumer-fit), and to conform to ADR-0010. Spec shard: `.program/spec/model-gateway.md` (whole file, REQ-MG-01/02/03). Verified: doc-leaf criterion→section mapping plus ADR/spec citation check. Steward: ROOT.1.2 → ROOT.7.1.
