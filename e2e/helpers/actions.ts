import { type Page, expect } from '@playwright/test'

/**
 * Navigate to Settings and create a new child via the UI.
 * Leaves the browser on the Settings page.
 */
export async function createChild(
  page: Page,
  opts: { name: string; allowance?: string },
) {
  await page.goto('/settings')

  // Click the "+ Add" button in the Children section
  const childrenSection = page.locator('section').filter({ hasText: 'Children' }).first()
  await childrenSection.getByRole('button', { name: '+ Add' }).click()

  // Wait for modal
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()

  // Fill name
  await modal.getByLabel("Child's name").fill(opts.name)

  // Fill allowance if provided
  if (opts.allowance) {
    await modal.getByLabel('Weekly allowance').fill(opts.allowance)
  }

  // Save
  await modal.getByRole('button', { name: 'Save' }).click()

  // Wait for modal to close
  await expect(modal).toBeHidden()
}

/**
 * In Settings, create a chore for a given child.
 * Assumes the child already exists. Leaves the browser on Settings.
 */
export async function createChore(
  page: Page,
  childName: string,
  opts: {
    name: string
    scheme?: 'fixed' | 'allowance'
    frequency?: 'daily' | 'weekly'
    amount?: string
  },
) {
  await page.goto('/settings')

  // Find the child's chore panel — the rounded card that contains "<childName>'s chores"
  const chorePanel = page
    .locator('div.bg-white')
    .filter({ has: page.getByText(`${childName}'s chores`, { exact: true }) })

  await chorePanel.getByRole('button', { name: '+ Add' }).click()

  // Wait for modal
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()

  // Fill chore name
  await modal.getByLabel('Chore name').fill(opts.name)

  // Select earning scheme if not default (fixed is default)
  if (opts.scheme === 'allowance') {
    await modal.getByText('Weekly allowance').click()
  }

  // Fill amount for fixed scheme
  if (opts.scheme !== 'allowance' && opts.amount) {
    await modal.getByLabel('Amount ($)').fill(opts.amount)
  }

  // Select frequency if not default (daily is default)
  if (opts.frequency === 'weekly') {
    await modal.getByText('Weekly', { exact: false }).last().click()
  }

  // Save
  await modal.getByRole('button', { name: 'Save' }).click()

  // Wait for modal to close
  await expect(modal).toBeHidden()
}

/**
 * From the home page, click on a child card to navigate to their detail page.
 */
export async function navigateToChild(page: Page, childName: string) {
  await page.goto('/')
  await page.getByText(childName, { exact: true }).click()
  // Wait for child detail page to load
  await expect(page.getByText("Today's chores")).toBeVisible()
}

/**
 * On the child detail page, toggle a chore by clicking it.
 */
export async function toggleChore(page: Page, choreName: string) {
  await page.getByRole('button', { name: new RegExp(choreName) }).click()
}

/**
 * On the child detail page, perform a cash withdrawal.
 */
export async function performWithdrawal(
  page: Page,
  opts: { amount: string; note?: string },
) {
  await page.getByRole('button', { name: 'Withdraw cash' }).click()

  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()

  await modal.getByLabel('Amount ($)').fill(opts.amount)

  if (opts.note) {
    await modal.getByLabel('Note (optional)').fill(opts.note)
  }

  // Click the withdraw/confirm button (text varies based on overdraft)
  const withdrawBtn = modal.getByRole('button', { name: /Withdraw/ })
  await withdrawBtn.click()

  await expect(modal).toBeHidden()
}
