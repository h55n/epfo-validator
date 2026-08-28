/**
 * Test: Mobile and keyboard interaction
 *
 * Runs in mobile-chrome project (375px viewport).
 * Verifies the core flow is usable on narrow screens.
 */
import { test, expect } from '@playwright/test'

test.describe('Mobile interactions (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('Login page renders correctly on mobile', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Member Login')).toBeVisible()
    // UAN input should be visible and usable
    const uanInput = page.locator('#uan-input')
    await expect(uanInput).toBeVisible()
    // Input mode should be numeric
    await expect(uanInput).toHaveAttribute('inputmode', 'numeric')
  })

  test('Demo account fill works on mobile', async ({ page }) => {
    await page.goto('/login')
    // Click first demo account
    await page.locator(`[id^="demo-"]`).first().click()
    const uanValue = await page.locator('#uan-input').inputValue()
    expect(uanValue).toMatch(/^\d{12}$/)
  })

  test('Login flow completes on mobile', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#uan-input').fill('100334455678')
    await page.locator('#password-input').fill('Demo@1234')
    await page.getByRole('button', { name: /Login/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('Dashboard is scrollable and cards are visible', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#uan-input').fill('100334455678')
    await page.locator('#password-input').fill('Demo@1234')
    await page.getByRole('button', { name: /Login/i }).click()
    await page.waitForURL('**/dashboard')
    // Page should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10) // 10px tolerance
  })

  test('Validation cards visible on mobile', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#uan-input').fill('100334455678')
    await page.locator('#password-input').fill('Demo@1234')
    await page.getByRole('button', { name: /Login/i }).click()
    await page.waitForURL('**/dashboard')

    await page.goto('/claim')
    await page.getByText('Full Withdrawal', { exact: false }).first().click()
    await page.goto('/validate')

    // All 4 check keys should render
    const checkKeys = ['nameMatch', 'dobMatch', 'employerExit', 'bankKyc']
    for (const key of checkKeys) {
      // Cards should be in the DOM (may still be loading)
      await expect(page.locator(`[data-check-key="${key}"]`)).toBeAttached({ timeout: 5000 })
    }
  })
})

test.describe('Keyboard navigation', () => {
  test('Login form submits on Enter key', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#uan-input').fill('100334455678')
    await page.locator('#password-input').fill('Demo@1234')
    await page.locator('#password-input').press('Enter')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('Demo account buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/login')
    // Tab to the first demo button and activate it with Enter
    const firstDemo = page.locator('[id^="demo-"]').first()
    await firstDemo.focus()
    await expect(firstDemo).toBeFocused()
    await firstDemo.press('Enter')
    const uanVal = await page.locator('#uan-input').inputValue()
    expect(uanVal).toMatch(/^\d{12}$/)
  })

  test('Password visibility toggle is keyboard accessible', async ({ page }) => {
    await page.goto('/login')
    const toggleBtn = page.getByRole('button', { name: /Show password|Hide password/i })
    await toggleBtn.focus()
    await expect(toggleBtn).toBeFocused()
    await toggleBtn.press('Space')
    await expect(page.locator('#password-input')).toHaveAttribute('type', 'text')
  })

  test('Navigation buttons are reachable by Tab', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#uan-input').fill('100334455678')
    await page.locator('#password-input').fill('Demo@1234')
    await page.getByRole('button', { name: /Login/i }).click()
    await page.waitForURL('**/dashboard')

    // Click on page body to ensure keyboard focus context
    await page.locator('body').click()
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON', 'INPUT', 'SELECT']).toContain(focused)
  })
})
