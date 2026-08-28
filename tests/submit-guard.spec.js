/**
 * Test: /submit access guard
 *
 * Verifies that navigating directly to /submit without completing
 * validation is blocked — the user sees a blocking error state,
 * not the submission form.
 */
import { test, expect } from '@playwright/test'

// Helper: log in with a demo account
async function loginAs(page, uan) {
  await page.goto('/login')
  await page.locator('#uan-input').fill(uan)
  await page.locator('#password-input').fill('Demo@1234')
  await page.getByRole('button', { name: /Login/i }).click()
  await page.waitForURL('**/dashboard')
}

test.describe('/submit access guard', () => {
  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/submit')
    await expect(page).toHaveURL(/\/login/)
  })

  test('authenticated user without validation sees blocking screen', async ({ page }) => {
    await loginAs(page, '100673291847') // Ramesh — Name Mismatch
    await page.goto('/submit')
    // Should not see the submission form
    await expect(page.getByRole('heading', { name: /Validation not complete/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Run Validation/i })).toBeVisible()
  })

  test('authenticated user with failed checks sees blocked submit', async ({ page }) => {
    await loginAs(page, '100891234567') // Fatima — multiple failures

    // Run validation
    await page.goto('/claim')
    await page.getByText('Full Withdrawal').click()
    await page.goto('/validate')
    await page.waitForSelector('[data-status="COMPLETE"], .validation-summary', { timeout: 30000 })

    // Go to /submit directly
    await page.goto('/submit')
    await expect(page.getByText(/Claim cannot be submitted/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Submit Claim/i })).toHaveCount(0)
  })

  test('user with ALL_CLEAR sees the submission form', async ({ page }) => {
    await loginAs(page, '100334455678') // Vijay — all clear

    await page.goto('/claim')
    await page.getByText('Full Withdrawal').click()
    await page.goto('/validate')
    await page.waitForSelector('[data-status="COMPLETE"], .validation-summary', { timeout: 30000 })

    await page.goto('/submit')
    await expect(page.getByRole('heading', { name: /Submit Your Claim/i })).toBeVisible()
    await expect(page.getByLabel(/I declare/i)).toBeVisible()
  })
})
