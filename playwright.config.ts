import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for the e2e suite.
 *
 * PORT: 3001 only. Port 3000 belongs to the owner's own dev server and is never used
 * or killed (docs/origin/CONSTRAINTS.md #17).
 *
 * SERVER LIFECYCLE: the `webServer` block below is the SINGLE owner of the e2e server.
 * `scripts/run-e2e-with-server.sh` (invoked by `npm run verify:e2e`) only guarantees a
 * production build exists and then calls `playwright test`; it never starts or kills a
 * server. Keep it that way — two owners on port 3001 collide with EADDRINUSE.
 *
 * PRODUCTION, NOT DEV: Next.js 16 takes a directory-level lock for `next dev`, so a
 * second dev server cannot run alongside the owner's regardless of port. The suite runs
 * against a production build via `next start` (the `e2e:server` script in package.json).
 *
 * Entry points:
 *   npm run verify:e2e         build-if-needed + full suite (the command AGENTS.md publishes)
 *   npm run verify:e2e:manual  suite only, assumes a production build already exists
 *   npm run verify:e2e:ui      Playwright UI mode
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // Host and port are set in exactly one place: the `e2e:server` script in
    // package.json (-H 127.0.0.1 -p 3001). No -H/-p is appended here or in
    // scripts/run-e2e-with-server.sh — a duplicated flag was a prior defect.
    command: 'npm run e2e:server',
    url: 'http://127.0.0.1:3001',
    // Never adopt a listener we did not start: a foreign process on 3001 would be
    // health-checked and tested as if it were ours. false in every environment (not
    // just CI) so local and CI runs have identical, deterministic ownership.
    reuseExistingServer: false,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
