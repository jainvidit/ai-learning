# Capability: API & Streaming (BFF, oRPC, SSE plumbing)

The BFF posture, the oRPC-over-Zod API layer, and the streaming transport plumbing shared by playground and terminal.

**Depends on:** none (platform capability; Phase 0).
**Depended on by:** `execution-layer.md` (session transport), `playground.md` (SSE runs), `data-layer-and-offline.md` (write path), all feature shards that expose routes.
**Contract owner:** Ramesh (API shape, transport verdict — blueprint §3).

---

## REQ-API-01: BFF — the browser talks only to the Next server; credentials never reach the client {#req-api-01}

The Next server (plus a session service) is the only thing the browser talks to; model credentials and sandbox tokens never reach the client (already true today — kept). Localhost-only binding + non-localhost Host rejection survive for the Home Edition.

**Source:** DREAM-BLUEPRINT.md §3 "BFF & API"; INITIAL-BUILD-PLAN.md "Security (bake in)"; CURRENT-STATE.md verified baseline ("Non-localhost Host header → 403; no Bedrock secrets in client bundle").
**Current state (docs/origin/CURRENT-STATE.md):** `src/proxy.ts` localhost-only proxy SURVIVES (in MODIFIED layout.tsx row); this is regression-floor behavior — breaking it halts migration.

**Scenarios:**
1. Given the built client bundle, when searched, then no model credential or sandbox token appears.
2. Given a request with a non-localhost Host header to the Home Edition, when handled, then it is rejected (403).

## REQ-API-02: oRPC over Zod with OpenAPI/JSON-Schema emission {#req-api-02}

The API layer is oRPC over Zod — tRPC-class DX with OpenAPI-native output giving a language-agnostic exit path; `z.toJSONSchema` emission doubles as the contract handed to content-authoring agents. (tRPC, ts-rest, GraphQL rejected — REJECTED.md.) oRPC maturity is a web-verified, not code-proven claim (ASSUMPTIONS.md #11).

**Source:** DREAM-BLUEPRINT.md §3 "BFF & API", §6 Phase 0, §7 radar row "API".
**Current state:** new layer; existing route handlers are progressively fronted/replaced per their own shards' dispositions.

**Scenarios:**
1. Given the API layer, when built, then an OpenAPI document is emitted covering the oRPC procedures.
2. Given the content-agent authoring contract, when assembled, then JSON Schemas emitted from the Zod definitions are part of it.

## REQ-API-03: Streaming plumbing — resumable SSE with heartbeats and backoff {#req-api-03}

Playground: SSE from route handlers + resumable-stream so a refresh doesn't kill a run; explicit stop endpoint. Terminal: SSE-down + POST-up (see execution-layer REQ-EX-05). Mandatory plumbing on all streams: `X-Accel-Buffering: no`, no-transform, ~20s heartbeats, client backoff-reconnect with last-seq (doubles as the deploy-drain story).

**Source:** DREAM-BLUEPRINT.md §3 "BFF & API — Streaming". NOTE: the blueprint names Redis for resumable-stream; the personal-desktop-tool directive (CONSTRAINTS.md #15 [HARD]) says files/embedded stores over managed databases for the Home Edition — see OPEN-QUESTIONS.md #4.
**Current state:** `api/playground/run` MODIFIED — SSE + server-side exercise loading survive; gains resumable-stream + stop endpoint. `api/claude-code/*` MODIFIED per execution-layer.

**Scenarios:**
1. Given a playground run in progress, when the page refreshes and the client reconnects with its last seq, then the stream resumes without restarting the model call.
2. Given a running playground stream, when the stop endpoint is called, then generation halts server-side.
3. Given any SSE response **from the enumerated SSE-endpoint domain (see ADR-0019: playground streaming endpoint `/api/playground/run`, terminal/execution streaming endpoint `/api/claude-code/exec`)**, when headers are inspected, then `X-Accel-Buffering: no` and no-transform caching directives are present, and heartbeats arrive at ~20s intervals during quiet periods.
4. Given a dropped connection, when the client reconnects, then it backs off and supplies its last received seq for gap-free resume.
