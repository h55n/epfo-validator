/**
 * Test: Accessibility (axe-core)
 *
 * Runs axe on every route and asserts zero serious/critical violations.
 * Uses @axe-core/playwright.
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function login(page, uan = '100334455678') {
  await page.goto('/login')
  await page.locator('#uan-input').fill(uan)
  await page.locator('#password-input').fill('Demo@1234')
  await page.getByRole('button', { name: /Login/i }).click()
  await page.waitForURL('**/dashboard')
}

async function checkA11y(page, routeName) {
  // Wait for motion transitions to settle
  await page.waitForTimeout(500)
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  // Filter to serious and critical only (warnings are noise for now)
  const blocking = results.violations.filter(v =>
    v.impact === 'serious' || v.impact === 'critical'
  )

  if (blocking.length > 0) {
    const summary = blocking.map(v =>
      `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.slice(0,2).map(n => n.html).join('\n  ')}`
    ).join('\n\n')
    expect(blocking, `Accessibility violations on ${routeName}:\n${summary}`).toHaveLength(0)
  }
}

test.describe('Accessibility — public routes', () => {
  test('Landing page', async ({ page }) => {
    await page.goto('/')
    await checkA11y(page, 'Landing /')
  })

  test('Login page', async ({ page }) => {
    await page.goto('/login')
    await checkA11y(page, 'Login /login')
  })
})

test.describe('Accessibility — authenticated routes', () => {
  test.beforeEach(async ({ page }) => { await login(page) })

  test('Dashboard', async ({ page }) => {
    await checkA11y(page, 'Dashboard /dashboard')
  })

  test('Claim initiation', async ({ page }) => {
    await page.goto('/claim')
    await checkA11y(page, 'Claim /claim')
  })

  test('Pre-validation (idle state)', async ({ page }) => {
    await page.goto('/claim')
    await page.getByText('Full Withdrawal', { exact: false }).first().click()
    await page.goto('/validate')
    // Check immediately (before full validation completes) to test idle state
    await checkA11y(page, 'Validation /validate')
  })
})

test.describe('Accessibility — document modal', () => {
  test('Modal has correct ARIA attributes', async ({ page }) => {
    await login(page, '100673291847') // name-mismatch user
    await page.goto('/claim')
    await page.getByText('Full Withdrawal', { exact: false }).first().click()
    await page.goto('/validate')

    await page.waitForSelector('[data-status="COMPLETE"], .validation-summary', { timeout: 30000 })

    await page.goto('/resolution')
    const docBtn = page.getByRole('button', { name: /Download Joint Declaration/i })
    await expect(docBtn).toBeVisible({ timeout: 10000 })
    await docBtn.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 15000 })

    // Check dialog has correct ARIA
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await expect(dialog).toHaveAttribute('aria-labelledby')

    // Run axe on the modal
    await checkA11y(page, 'Document modal')
  })
})
