import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for e2e tests.
 * Uses port 3001 to avoid conflict with owner's port 3000 (CONSTRAINTS.md #17).
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

  // webServer: commented out due to Next.js 16 single-instance lock
  // Use scripts/run-e2e-with-server.sh to run tests with a temporary server
  // or manually start: next dev -H 127.0.0.1 -p 3001
})
