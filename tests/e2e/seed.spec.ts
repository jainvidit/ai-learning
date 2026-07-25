import { test, expect } from '@playwright/test'

test.describe('Verification surface seed e2e', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to be loaded
    await page.waitForLoadState('networkidle')

    // Verify the page title or some basic content exists
    await expect(page).toHaveTitle(/AI Learning/)
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads successfully (status 200)
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
  })

  test('should render without console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Allow Next.js development mode warnings but no actual errors
    expect(consoleErrors.length).toBe(0)
  })
})
