import { test, expect } from '@playwright/test'
import { clearStorage } from './helpers/storage'
import { createChild } from './helpers/actions'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await clearStorage(page)
  await page.goto('/')
})

test.describe('Children CRUD', () => {
  test('add a child with allowance', async ({ page }) => {
    await createChild(page, { name: 'Jack', allowance: '10' })

    // Jack should appear in the children list on Settings
    await expect(page.getByText('Jack', { exact: true })).toBeVisible()
    await expect(page.getByText('$10.00/week allowance')).toBeVisible()
  })

  test('added child appears on home page', async ({ page }) => {
    await createChild(page, { name: 'Jack', allowance: '10' })

    // Go home
    await page.getByRole('link', { name: /home/i }).click()

    // Jack should appear as a child card
    await expect(page.getByText('Jack', { exact: true })).toBeVisible()
    await expect(page.getByText('1 kid tracked this week')).toBeVisible()
  })

  test('child name is required', async ({ page }) => {
    await page.goto('/settings')

    const childrenSection = page.locator('section').filter({ hasText: 'Children' }).first()
    await childrenSection.getByRole('button', { name: '+ Add' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Try to save without entering a name
    await modal.getByRole('button', { name: 'Save' }).click()

    await expect(modal.getByText('Name is required')).toBeVisible()
  })

  test('edit a child', async ({ page }) => {
    await createChild(page, { name: 'Jack' })

    // Click Edit on Jack's row
    await page.getByRole('button', { name: 'Edit' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Clear and type new name
    await modal.getByLabel("Child's name").fill('Jill')
    await modal.getByRole('button', { name: 'Save' }).click()

    await expect(modal).toBeHidden()
    await expect(page.getByText('Jill', { exact: true })).toBeVisible()
    await expect(page.getByText('Jack', { exact: true })).toBeHidden()
  })

  test('remove a child', async ({ page }) => {
    await createChild(page, { name: 'Jack' })

    // Click Remove
    await page.getByRole('button', { name: 'Remove' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByText(/permanently delete/i)).toBeVisible()

    // Confirm delete
    await modal.getByRole('button', { name: 'Delete' }).click()
    await expect(modal).toBeHidden()

    // Child should be gone
    await expect(page.getByText('Jack', { exact: true })).toBeHidden()
    await expect(page.getByText('No children yet.')).toBeVisible()
  })

  test('cancel remove child keeps the child', async ({ page }) => {
    await createChild(page, { name: 'Jack' })

    await page.getByRole('button', { name: 'Remove' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Cancel
    await modal.getByRole('button', { name: 'Cancel' }).click()
    await expect(modal).toBeHidden()

    // Jack should still be there
    await expect(page.getByText('Jack', { exact: true })).toBeVisible()
  })

  test('add multiple children', async ({ page }) => {
    await createChild(page, { name: 'Jack', allowance: '10' })
    await createChild(page, { name: 'Jill', allowance: '8' })

    // Both should appear on Settings
    await expect(page.getByText('Jack', { exact: true })).toBeVisible()
    await expect(page.getByText('Jill', { exact: true })).toBeVisible()

    // Home should show 2 kids
    await page.getByRole('link', { name: /home/i }).click()
    await expect(page.getByText('2 kids tracked this week')).toBeVisible()
  })
})
