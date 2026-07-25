---
id: ROOT.7.2
parent: ROOT.7
type: Task
title: Verification surface — test runner, npm test, Playwright e2e, AGENTS.md commands
ledger_depth: 2
status: in_progress
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
artifacts: []
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
