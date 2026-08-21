import { defineConfig } from 'vitest/config'
import path from 'path'

/**
 * Vitest configuration — the UNIT test runner (`npm test`).
 *
 * The Playwright e2e suite lives in tests/e2e and must never be collected here: its
 * specs import `@playwright/test`, whose `test.describe` throws when called outside the
 * Playwright runner ("Playwright Test did not expect test.describe() to be called
 * here"). Two guards, deliberately redundant:
 *   1. `include` matches only *.test.* files; e2e specs are named *.spec.ts.
 *   2. `exclude` names tests/e2e explicitly, so renaming an e2e file to *.test.ts
 *      still does not leak it into the unit run.
 * Run the e2e suite with `npm run verify:e2e` instead.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.{js,ts,jsx,tsx}', 'src/**/*.test.{js,ts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      'tests/e2e/**',
      '**/playwright/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
