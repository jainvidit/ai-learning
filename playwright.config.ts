import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for e2e tests.
 * Uses port 3001 to avoid conflict with owner's port 3000 (CONSTRAINTS.md #17).
 *
 * Note: Next.js 16 uses directory-level lockfiles that prevent concurrent dev servers.
 * The webServer config below will fail if another dev server is already running.
 * Options:
 *   1. Stop the port 3000 server before running e2e tests (violates CONSTRAINTS #17)
 *   2. Use npm run verify:e2e which manages server lifecycle
 *   3. Use production build: npm run build && npm run start -- -p 3001
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
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
    command: 'npm run start -- -p 3001',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
