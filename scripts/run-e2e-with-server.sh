#!/usr/bin/env bash
# `npm run verify:e2e` — runs the Playwright e2e suite against a Next.js PRODUCTION
# server on port 3001.
#
# SERVER LIFECYCLE OWNERSHIP: the production server is started and stopped SOLELY by
# the `webServer` block in playwright.config.ts. This script deliberately does NOT
# start, health-check, or kill a server. Two owners binding the same port collide with
# EADDRINUSE, and a backgrounded `npm run start` here would also defeat `set -e`
# (the shell cannot see the child die). Playwright tears down its own child process
# tree, so nothing is left holding 3001 after this script exits.
#
# PORT: 3001 only. Port 3000 belongs to the owner's own dev server and is never used
# or killed (docs/origin/CONSTRAINTS.md #17).
#
# WHY A PRODUCTION SERVER, NOT A DEV SERVER: Next.js 16 takes a directory-level lock
# for `next dev`, so a second dev server cannot run alongside the owner's regardless of
# port (docs/nextjs-conventions.md "Development and Build Changes" — lockfiles prevent
# multiple instances of the same command). The e2e suite therefore targets a production
# build served by `next start`.
#
# This script's own jobs are exactly two: satisfy the production-build precondition of
# `next start`, and invoke Playwright.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Build precondition: `next start` serves a prior production build and fails without
# one. `.next/BUILD_ID` is the production-build marker (`next dev` writes to .next/dev
# and does not produce it), so a dev-only .next/ directory is correctly treated as
# "not built".
if [ ! -f ".next/BUILD_ID" ]; then
  echo "[verify:e2e] No production build found (.next/BUILD_ID missing) — building first..."
  npm run build
else
  echo "[verify:e2e] Reusing the existing production build in .next/ (delete .next/ to force a rebuild)."
fi

echo "[verify:e2e] Running Playwright e2e suite — Playwright owns the production server on port 3001."
npx playwright test "$@"

echo "[verify:e2e] e2e suite complete; Playwright has stopped the production server."
