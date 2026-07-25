---
id: ROOT.7.2
parent: ROOT.7
type: Task
title: Verification surface — test runner, npm test, Playwright e2e, AGENTS.md commands
ledger_depth: 2
status: proposed
generation: 0
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
verification: []
artifacts: []
resume_hint: "Dispatch with ROOT.1.7/1.9 at program start — sizing finding #1: without named test commands, no behavioral leaf anywhere passes leaf-test point 5. Runner choice (vitest vs jest) is this item's first decision; note the historic unexplained jest-worker crash (ASSUMPTIONS/REJECTED) when choosing."
---

# Verification surface

Created by ADR-0007 item 2. AGENTS.md edit is additive (adds commands to the
Verification commands section only) — recorded here as the sanctioned exception to the
role-prompt rule against touching agent config; the director reviews the diff.
package.json ownership here precedes ROOT.1's dispatch (this item runs first, alone).
