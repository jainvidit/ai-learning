# Capability: Hosted Edition (OPTIONAL — Phase 5)

The multi-tenant public web deployment of the same codebase: Postgres + Zero, Better Auth, CloudDriver. **Explicitly optional**: the Home Edition remains the reference product throughout (personal-desktop-tool directive, CONSTRAINTS.md #15 [HARD]). NOTE ASSUMPTIONS.md #32 [INFERRED]: the owner never explicitly blessed keeping a Hosted Edition — see OPEN-QUESTIONS.md #6 before scheduling any of this work.

**Depends on:** everything edition-invariant: `execution-layer.md` (ExecutionDriver interface), `event-log-and-projections.md` (same event/projection model over Postgres), `data-layer-and-offline.md` (Zero implements the same UX contract), `profiles-and-identity.md` (Profile shape beneath accounts), `api-and-streaming.md`.
**Depended on by:** none.
**Contract owner:** Atlas (topology); Ramesh (fact-checked specifics). Cloud-topology claims are [VERIFIED-EXTERNALLY] — recheck before relying (blueprint §3 provenance note; ASSUMPTIONS.md #11).

---

## REQ-HE-01: Two deployments of one codebase behind shared interfaces {#req-he-01}

Home Edition (primary): learner's machine, local claude CLI, SQLite, real folders. Hosted Edition: Postgres + Zero, cloud sandboxes, real auth. Same codebase; the seams (ExecutionDriver, AgentRunner, ModelGateway, session-log contract, verifier golden matrix) are edition-invariant.

**Source:** DREAM-BLUEPRINT.md §3 "Two editions, one codebase", §8 contested decision 1; GLOSSARY.md "Home Edition / Hosted Edition", "Edition-invariant".
**Current state (docs/origin/CURRENT-STATE.md):** entirely new; nothing hosted exists.

**Scenarios:**
1. Given the two editions, when built, then they build from one codebase with edition differences confined to configuration and driver/store implementations behind the shared interfaces.
2. Given a feature implemented against the seams, when run on either edition, then learner-facing behavior is identical (Nova's dock UX must not branch on driver — LANE-DEPENDENCIES).

## REQ-HE-02: CloudDriver — Firecracker microVM + Durable Object session actor {#req-he-02}

CloudDriver (Hosted default; opt-in at home): Firecracker microVM per sandbox. Reference topology: Vercel Sandbox (24h persistent, reattachable) runs Claude Code; one Cloudflare Durable Object per session (partyserver) drives the sandbox, appends TermEvents with monotonic seq to DO storage (~5k ring buffer), terminates client WebSockets with hibernation. Auth: Next mints a short-lived JWT (sessionId+profileId); the DO verifies on upgrade and holds the sandbox token. Recorded alternates: all-Fly Machines; Vercel-native experimental WS for least-infra v1.

**Source:** DREAM-BLUEPRINT.md §3 "Execution layer — CloudDriver", §7 radar row "Cloud sandboxes"; REJECTED.md (E2B/Modal/Daytona/WebContainers rejected).
**Current state:** new.

**Scenarios:**
1. Given a hosted terminal session, when the client disconnects and reconnects hours later (within sandbox lifetime), then `attach(sessionId, fromSeq)` replays the gap from DO storage and resumes the live tail (same contract as REQ-EX-03).
2. Given a WebSocket upgrade to the session actor, when it lacks a valid short-lived JWT binding sessionId+profileId, then the connection is refused; the sandbox token never reaches the client.

## REQ-HE-03: Zero (online-optimistic only) and Better Auth {#req-he-03}

Hosted data layer: Zero (Rocicorp) over Postgres implementing the reactive-read/optimistic-write contract — scoped to online-optimistic only (no offline writes; the outbox handles offline — data-layer REQ-DL-03; aligned decision 9). Known limits recorded: no SSR bindings, no ZQL aggregates (aggregates come from server SQL projections anyway), real self-hosting ops. Auth: Better Auth with the same Profile shape beneath accounts so home data can migrate up (Auth.js/Clerk rejected).

**Source:** DREAM-BLUEPRINT.md §2 "Data layer", §3 "Auth & profiles", §7 radar rows "Sync (hosted)", "Auth (hosted)", §8 aligned decision 9.
**Current state:** new.

**Scenarios:**
1. Given the hosted dashboard, when navigated online, then reads meet the same <100ms reactive contract as the Home Edition.
2. Given a hosted account, when its profile data is inspected, then the Profile shape matches the Home Edition's, and a Home profile's data can be imported beneath an account without loss.
