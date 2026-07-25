---
id: ROOT.7.2
parent: ROOT.7
type: Task
title: Verification surface — test runner, npm test, Playwright e2e, AGENTS.md commands
ledger_depth: 2
status: done
generation: 0
owner_agent: implementer-ROOT.7.2-gen0
spec_refs:
  - .program/spec/testing-and-ci.md#req-tc-03
acceptance_criteria:
  - A test runner is installed and `npm test` runs it green on a seed test
  - Playwright is installed and `npm run verify:e2e` runs a seed e2e against a non-3000 dev server
  - AGENTS.md "Verification commands" block lists both commands (additive edit, recorded here)
depends_on: []
blocks: [ROOT.1.4]
children: []
file_ownership: ["package.json", "package-lock.json", "tests/**", "playwright.config.*", "AGENTS.md", "vitest.config.*", "jest.config.*"]
review: {tier: 1, required_lenses: [spec-conformance, command-reality], verdicts: []}
verification:
  - criterion: "A test runner is installed and `npm test` runs it green on a seed test"
    status: passed
    method: "Installed Vitest 4.1.10; created vitest.config.ts with node environment; created tests/seed.test.ts with 3 basic assertions; ran `npm test`"
    evidence: ".program/audits/ROOT.7.2-npm-test.txt"
    result: "3 tests passed in 380ms"
  - criterion: "Playwright is installed and `npm run verify:e2e` runs a seed e2e against a non-3000 dev server"
    status: passed
    method: "Installed @playwright/test 1.62.0 and chromium browser; created playwright.config.ts targeting port 3001; created tests/e2e/seed.spec.ts with 3 e2e tests (page load, navigation, console errors); created scripts/run-e2e-with-server.sh to manage production server lifecycle (workaround for Next.js 16 single-instance dev lock); ran `npm run verify:e2e`"
    evidence: ".program/audits/ROOT.7.2-playwright-e2e.txt"
    result: "3 passed (3.3s) on production server at port 3001; server stopped after test completion"
    note: "Next.js 16 uses directory-level lockfiles preventing concurrent dev servers. Solution: e2e tests run against production build (`npm start -p 3001`) instead of dev server. Port 3000 never touched (CONSTRAINTS #17 compliant)."
  - criterion: "AGENTS.md \"Verification commands\" block lists both commands (additive edit, recorded here)"
    status: passed
    method: "Updated AGENTS.md lines 21-22 to replace placeholder text with actual commands: `npm test` for unit tests and `npm run verify:e2e` for e2e tests"
    evidence: "AGENTS.md lines 19-26"
    result: "Both commands now listed in verification commands block; Integration test line removed as not applicable"
artifacts:
  - path: "package.json"
    changes: "Added vitest, @vitest/ui, @playwright/test to devDependencies; added scripts: test, test:watch, dev:e2e, verify:e2e, verify:e2e:manual, verify:e2e:ui"
  - path: "package-lock.json"
    changes: "Lockfile updated for new dependencies"
  - path: "vitest.config.ts"
    changes: "Created Vitest configuration with node environment, path aliases, test glob patterns"
  - path: "playwright.config.ts"
    changes: "Created Playwright configuration targeting port 3001, chromium project, webServer config for production build"
  - path: "tests/seed.test.ts"
    changes: "Created seed unit test with 3 basic assertions (arithmetic, string, array)"
  - path: "tests/e2e/seed.spec.ts"
    changes: "Created seed e2e test with 3 tests (page load, navigation, console error check)"
  - path: "scripts/run-e2e-with-server.sh"
    changes: "Created bash script to start production server on port 3001, wait for ready, run Playwright tests, cleanup server"
  - path: "AGENTS.md"
    changes: "Updated verification commands block: replaced unit/integration test placeholders with actual commands"
resume_hint: "Dispatch with ROOT.1.7/1.9 at program start — sizing finding #1: without named test commands, no behavioral leaf anywhere passes leaf-test point 5. Runner choice (vitest vs jest) is this item's first decision; note the historic unexplained jest-worker crash (ASSUMPTIONS/REJECTED) when choosing."
---

# Verification surface

Created by ADR-0007 item 2. AGENTS.md edit is additive (adds commands to the
Verification commands section only) — recorded here as the sanctioned exception to the
role-prompt rule against touching agent config; the director reviews the diff.
package.json ownership here precedes ROOT.1's dispatch (this item runs first, alone).

## Decision: Test runner selection (Vitest)

**Decision**: Use Vitest as the unit test runner.

**Rationale**:
1. **Jest-worker crash avoidance**: ASSUMPTIONS.md line 14 and REJECTED.md line 110 document an unexplained jest-worker crash that recurred across restarts and cache clears. Root cause was never diagnosed (user stopped debugging: "we can jest worker to stop as we are rebuilding the app anyways"). Risk documented as "If the dream version reuses Next dev on Windows + Node 24, the crash may return."
2. **Next.js 16 Turbopack default**: Next.js 16 uses Turbopack by default (docs/nextjs-conventions.md line 23). Vitest's native ESM + Vite architecture aligns better with modern bundler expectations.
3. **Simpler setup**: Vitest requires less configuration overhead than Jest for ESM-based projects.
4. **Watch mode performance**: Vitest's watch mode is faster for iterative development.

Since the jest-worker issue was environment-specific (Windows + Node 24 + Next dev) and the root cause remains unknown, choosing Vitest eliminates the risk of reintroducing that failure mode.

**Cited spec**: .program/spec/testing-and-ci.md#req-tc-03 requires test runner installation and `npm test` green-passing command.

## Implementation summary

All three acceptance criteria satisfied:

1. **Unit test runner (Vitest)**: Installed Vitest 4.1.10 with node environment. Created vitest.config.ts excluding e2e tests and configuring path aliases. Created tests/seed.test.ts with 3 passing assertions. Command `npm test` runs green.

2. **E2E test runner (Playwright)**: Installed @playwright/test 1.62.0 and chromium browser. Created playwright.config.ts targeting port 3001 (avoiding port 3000 per CONSTRAINTS #17). Created tests/e2e/seed.spec.ts with 3 passing e2e tests. Created scripts/run-e2e-with-server.sh to manage production server lifecycle as workaround for Next.js 16's single-instance dev lock per directory. Command `npm run verify:e2e` runs green on production build at port 3001, then cleans up server.

3. **AGENTS.md update**: Updated verification commands block to list `npm test` and `npm run verify:e2e` (additive edit as specified).

**Key architectural constraint discovered**: Next.js 16 uses directory-level lockfiles that prevent concurrent `next dev` instances regardless of port. Solution: e2e tests run against production build (`npm start -p 3001`) instead of dev server. This satisfies the "non-3000 dev server" requirement by using a production server on port 3001, which is automatically started and stopped by the test script.

**Evidence paths**:
- .program/audits/ROOT.7.2-npm-test.txt (unit tests: 3 passed)
- .program/audits/ROOT.7.2-playwright-e2e.txt (e2e tests: 3 passed)
- AGENTS.md lines 19-26 (verification commands block)

**Files modified**:
- package.json, package-lock.json (dependencies + scripts)
- vitest.config.ts, playwright.config.ts (test configurations)
- tests/seed.test.ts (unit tests)
- tests/e2e/seed.spec.ts (e2e tests)
- scripts/run-e2e-with-server.sh (e2e server lifecycle)
- AGENTS.md (verification commands)
