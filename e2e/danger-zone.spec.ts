import { test, expect } from '@playwright/test'
import { clearStorage } from './helpers/storage'
import { createChild, createChore } from './helpers/actions'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await clearStorage(page)
  await page.goto('/')
})

test.describe('Danger Zone', () => {
  test('nuke all data clears everything', async ({ page }) => {
    // Create a child and chore first
    await createChild(page, { name: 'Jack', allowance: '10' })
    await createChore(page, 'Jack', { name: 'Make bed', amount: '0.50' })

    // Verify data exists
    await expect(page.getByText('Jack', { exact: true })).toBeVisible()

    // Go to danger zone and nuke
    await page.goto('/settings')
    await page.getByRole('button', { name: /Reset all data/i }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByText(/permanently delete/i)).toBeVisible()

    await modal.getByRole('button', { name: 'Delete everything' }).click()
    await expect(modal).toBeHidden()

    // Settings should show no children
    await expect(page.getByText('No children yet.')).toBeVisible()

    // Home should show empty state
    await page.getByRole('link', { name: /home/i }).click()
    await expect(page.getByText(/no kids yet/i)).toBeVisible()
  })

  test('cancel nuke keeps data intact', async ({ page }) => {
    await createChild(page, { name: 'Jack' })

    await page.goto('/settings')
    await page.getByRole('button', { name: /Reset all data/i }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    await modal.getByRole('button', { name: 'Cancel' }).click()
    await expect(modal).toBeHidden()

    // Jack should still exist
    await expect(page.getByText('Jack', { exact: true })).toBeVisible()
  })
})
