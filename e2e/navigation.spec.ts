import { test, expect } from '@playwright/test'
import { clearStorage } from './helpers/storage'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await clearStorage(page)
  await page.goto('/')
})

test.describe('Navigation', () => {
  test('shows home page with app title', async ({ page }) => {
    await expect(page.getByText('Dollarbucks')).toBeVisible()
    await expect(page.getByText('Earn it. Save it. Spend it.')).toBeVisible()
  })

  test('shows empty state when no children exist', async ({ page }) => {
    // The EmptyState component should be shown
    await expect(page.getByText(/no kids yet/i)).toBeVisible()
  })

  test('bottom nav switches between Home and Settings', async ({ page }) => {
    // Click Settings
    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    // Click Home
    await page.getByRole('link', { name: /home/i }).click()
    await expect(page.getByText('Dollarbucks')).toBeVisible()
  })

  test('unknown routes redirect to home', async ({ page }) => {
    await page.goto('/random-nonexistent-route')
    await expect(page.getByText('Dollarbucks')).toBeVisible()
  })
})
