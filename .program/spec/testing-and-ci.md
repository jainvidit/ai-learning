# Capability: Testing & CI

The two-suite testing design (deterministic cassettes on PRs, live battery nightly), contract tests, and the CI pipeline. Fakes are a product surface, not test mocks.

**Depends on:** `execution-layer.md` (AgentRunner seam REQ-EX-04), `model-gateway.md` (ModelGateway seam REQ-MG-03), `judge-pipeline.md` (calibration battery REQ-JP-05/06), `content-pipeline.md` (content CI gates REQ-CP-06).
**Depended on by:** every implementation shard (merge gates).
**Contract owner:** Ramesh (CI wiring, harness); Priya (calibration methodology).

---

## REQ-TC-01: Two-suite testing — cassettes on PRs, live battery nightly {#req-tc-01}

PR-time tests are deterministic: recorded NDJSON cassettes replayed through AgentRunner, recorded responses through ModelGateway, golden calibration sets for the judge. Live model/CLI calls run only in the nightly battery. Live-CLI tests on every PR were REJECTED (flaky, expensive — REJECTED.md; Priya adopted Ramesh's design).

**Source:** DREAM-BLUEPRINT.md §7 radar row "Testing", §3 "Fakes are a product surface"; REJECTED.md.
**Current state (docs/origin/CURRENT-STATE.md):** new; no test suite is configured today (AGENTS.md verification commands list none).

**Scenarios:**
1. Given the PR test suite, when run with no network, no API key, and no claude CLI, then it passes deterministically.
2. Given the nightly battery, when it runs, then it exercises live models against the calibration goldens and records drift metrics (judge-pipeline REQ-JP-06).

## REQ-TC-02: Contract tests on the TermEvent protocol are merge-blocking {#req-tc-02}

The TermEvent protocol (`text|tool|result|error` + seq numbers, `attach(sessionId, fromSeq)` semantics) has contract tests that block merges; the UI never parses raw NDJSON (LANE-DEPENDENCIES "TermEvent protocol" row).

**Source:** LANE-DEPENDENCIES "TermEvent protocol" row; DREAM-BLUEPRINT.md §7 radar row "Testing".
**Current state:** new; TermEvent typing survives from claudeSpawn.ts.

**Scenarios:**
1. Given a change to either a driver's event emission or the client's event consumption, when CI runs, then protocol contract tests execute and a violation blocks the merge.
2. Given the attach contract, when contract-tested, then gap replay ordering, no-duplication, and live-tail handoff are asserted.

## REQ-TC-03: CI pipeline — validate, typecheck, e2e, calibration {#req-tc-03}

Phase-0 CI comprises: content validate (`npm run validate` lineage + REQ-CP-06 gates), typecheck (`npx tsc --noEmit`), Playwright e2e, and the judge calibration battery gate (REQ-JP-05). Verifier golden-matrix harness (pristine-must-fail / solution-must-pass both directions) runs for every registered verifier.

**Source:** DREAM-BLUEPRINT.md §6 Phase 0; CURRENT-STATE.md validation-script row ("survives and grows"); LEARNING-DESIGN-REVIEW-SAGE.md §5 item 3; LANE-DEPENDENCIES "Verifier registry + golden matrix" row.
**Current state:** `scripts/validate-content.ts` MODIFIED; typecheck/build/lint commands exist per AGENTS.md; Playwright and calibration wiring are new.

**Scenarios:**
1. Given any PR, when CI runs, then validate + typecheck + e2e (against fakes) + applicable calibration gates all execute and any failure blocks merge.
2. Given every registered challenge verifier, when the golden matrix runs, then it fails on the pristine template and passes on the reference solution — both directions asserted.
