/**
 * Test: Demo scenarios end-to-end
 *
 * Covers all 3 demo accounts through the full validation flow,
 * verifying each scenario produces the expected check outcomes.
 */
import { test, expect } from '@playwright/test'

async function loginAndValidate(page, uan, claimType = 'Full Withdrawal') {
  await page.goto('/login')
  await page.locator('#uan-input').fill(uan)
  await page.locator('#password-input').fill('Demo@1234')
  await page.getByRole('button', { name: /Login/i }).click()
  await page.waitForURL('**/dashboard')

  await page.goto('/claim')
  await page.getByText(claimType, { exact: false }).first().click()
  await page.waitForTimeout(300)

  await page.goto('/validate')
  await page.waitForSelector('[data-status="COMPLETE"], .validation-summary', { timeout: 30000 })
}

test.describe('Scenario: Ramesh — NAME_MISMATCH_INITIAL', () => {
  test('nameMatch fails, other checks pass', async ({ page }) => {
    await loginAndValidate(page, '100673291847')
    // Name check should be FAIL or ADVISORY
    const nameCard = page.locator('[data-check-key="nameMatch"]')
    await expect(nameCard).toBeVisible()
    const status = await nameCard.getAttribute('data-check-status')
    expect(['FAIL', 'ADVISORY']).toContain(status)

    // DOB should pass
    await expect(page.locator('[data-check-key="dobMatch"][data-check-status="PASS"]')).toBeVisible()
    // Employer exit should pass
    await expect(page.locator('[data-check-key="employerExit"][data-check-status="PASS"]')).toBeVisible()
    // Bank KYC should pass
    await expect(page.locator('[data-check-key="bankKyc"][data-check-status="PASS"]')).toBeVisible()
  })

  test('resolution centre shows Joint Declaration option', async ({ page }) => {
    await loginAndValidate(page, '100673291847')
    await page.goto('/resolution')
    await expect(page.getByText(/Joint Declaration/i).first()).toBeVisible()
  })
})

test.describe('Scenario: Fatima — EMPLOYER_EXIT_AND_BANK_KYC', () => {
  test('employerExit and bankKyc fail', async ({ page }) => {
    await loginAndValidate(page, '100891234567')
    await expect(page.locator('[data-check-key="employerExit"][data-check-status="FAIL"]')).toBeVisible()
    await expect(page.locator('[data-check-key="bankKyc"][data-check-status="FAIL"]')).toBeVisible()
  })

  test('submit is blocked with correct reason', async ({ page }) => {
    await loginAndValidate(page, '100891234567')
    await page.goto('/submit')
    await expect(page.getByText(/Claim cannot be submitted/i)).toBeVisible()
  })
})

test.describe('Scenario: Vijay — ALL_CLEAR', () => {
  test('all 4 checks pass', async ({ page }) => {
    await loginAndValidate(page, '100334455678')
    await expect(page.locator('[data-check-key="nameMatch"][data-check-status="PASS"]')).toBeVisible()
    await expect(page.locator('[data-check-key="dobMatch"][data-check-status="PASS"]')).toBeVisible()
    await expect(page.locator('[data-check-key="employerExit"][data-check-status="PASS"]')).toBeVisible()
    await expect(page.locator('[data-check-key="bankKyc"][data-check-status="PASS"]')).toBeVisible()
  })

  test('claim can be submitted after checking declaration', async ({ page }) => {
    await loginAndValidate(page, '100334455678')
    await page.goto('/submit')
    await page.getByRole('heading', { name: /Submit Your Claim/i }).waitFor()
    await page.getByLabel(/I declare/i).check()
    const submitBtn = page.getByRole('button', { name: /Submit Claim/i })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()
    await expect(page.getByRole('heading', { name: /Claim Submitted/i })).toBeVisible({ timeout: 10000 })
  })
})
