import { test, expect } from '@playwright/test'
import { clearStorage } from './helpers/storage'
import { createChild, createChore } from './helpers/actions'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await clearStorage(page)
  await page.goto('/')
})

test.describe('Chores CRUD', () => {
  test('add a fixed daily chore', async ({ page }) => {
    await createChild(page, { name: 'Jack', allowance: '10' })
    await createChore(page, 'Jack', {
      name: 'Make bed',
      scheme: 'fixed',
      frequency: 'daily',
      amount: '0.50',
    })

    // Chore should appear in Jack's chores section
    await expect(page.getByText('Make bed')).toBeVisible()
    await expect(page.getByText('$0.50 fixed')).toBeVisible()
    await expect(page.getByText('Daily')).toBeVisible()
  })

  test('add an allowance weekly chore', async ({ page }) => {
    await createChild(page, { name: 'Jack', allowance: '10' })
    await createChore(page, 'Jack', {
      name: 'Tidy room',
      scheme: 'allowance',
      frequency: 'weekly',
    })

    await expect(page.getByText('Tidy room')).toBeVisible()
    await expect(page.getByText('Weekly allowance')).toBeVisible()
  })

  test('chore name is required', async ({ page }) => {
    await createChild(page, { name: 'Jack' })

    await page.goto('/settings')
    const chorePanel = page
      .locator('div.bg-white')
      .filter({ has: page.getByText("Jack's chores", { exact: true }) })
    await chorePanel.getByRole('button', { name: '+ Add' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Try save with empty name
    await modal.getByRole('button', { name: 'Save' }).click()
    await expect(modal.getByText('Name is required')).toBeVisible()
  })

  test('fixed scheme requires amount', async ({ page }) => {
    await createChild(page, { name: 'Jack' })

    await page.goto('/settings')
    const chorePanel = page
      .locator('div.bg-white')
      .filter({ has: page.getByText("Jack's chores", { exact: true }) })
    await chorePanel.getByRole('button', { name: '+ Add' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    await modal.getByLabel('Chore name').fill('Test chore')
    // Leave amount empty — fixed is default scheme
    await modal.getByRole('button', { name: 'Save' }).click()
    await expect(modal.getByText('Enter a valid amount')).toBeVisible()
  })

  test('edit a chore', async ({ page }) => {
    await createChild(page, { name: 'Jack' })
    await createChore(page, 'Jack', { name: 'Make bed', amount: '0.50' })

    // Click Edit on the chore
    const choreRow = page.locator('div.rounded-xl').filter({ hasText: 'Make bed' })
    await choreRow.getByRole('button', { name: 'Edit' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    await modal.getByLabel('Chore name').fill('Clean room')
    await modal.getByRole('button', { name: 'Save' }).click()
    await expect(modal).toBeHidden()

    await expect(page.getByText('Clean room')).toBeVisible()
    await expect(page.getByText('Make bed')).toBeHidden()
  })

  test('remove a chore', async ({ page }) => {
    await createChild(page, { name: 'Jack' })
    await createChore(page, 'Jack', { name: 'Make bed', amount: '0.50' })

    // Click Remove
    const choreRow = page.locator('div.rounded-xl').filter({ hasText: 'Make bed' })
    await choreRow.getByRole('button', { name: 'Remove' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    await modal.getByRole('button', { name: 'Remove' }).click()
    await expect(modal).toBeHidden()

    await expect(page.getByText('Make bed')).toBeHidden()
    await expect(page.getByText('No chores yet.')).toBeVisible()
  })

  test('chores appear on child detail page', async ({ page }) => {
    await createChild(page, { name: 'Jack' })
    await createChore(page, 'Jack', { name: 'Make bed', amount: '0.50' })

    // Navigate to child detail
    await page.getByRole('link', { name: /home/i }).click()
    await page.getByText('Jack', { exact: true }).click()

    await expect(page.getByText("Today's chores")).toBeVisible()
    await expect(page.getByText('Make bed')).toBeVisible()
  })
})
