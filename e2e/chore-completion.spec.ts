import { test, expect } from '@playwright/test'
import { seedAndNavigate, makeChild, makeChore } from './helpers/storage'

const CHILD = makeChild({ id: 'child-1', name: 'Jack', avatarColour: '#1B5FA8' })

test.describe('Chore Completion', () => {
  test('toggle fixed chore marks it complete and credits balance', async ({ page }) => {
    const chore = makeChore(CHILD.id, {
      name: 'Make bed',
      scheme: 'fixed',
      fixedAmount: 0.5,
      frequency: 'daily',
    })
    await seedAndNavigate(page, { children: [CHILD], chores: [chore] }, `/child/${CHILD.id}`)

    const header = page.locator('header')

    // Balance starts at $0.00
    await expect(header.getByText('$0.00')).toBeVisible()

    // Toggle chore complete
    await page.getByRole('button', { name: /Make bed/ }).click()

    // Wait for balance to update (confetti animation takes 800ms)
    await expect(header.getByText('$0.50')).toBeVisible({ timeout: 5000 })
  })

  test('toggle fixed chore back to incomplete reverses balance', async ({ page }) => {
    const chore = makeChore(CHILD.id, {
      name: 'Make bed',
      scheme: 'fixed',
      fixedAmount: 0.5,
      frequency: 'daily',
    })
    await seedAndNavigate(page, { children: [CHILD], chores: [chore] }, `/child/${CHILD.id}`)

    const header = page.locator('header')

    // Complete it
    await page.getByRole('button', { name: /Make bed/ }).click()
    await expect(header.getByText('$0.50')).toBeVisible({ timeout: 5000 })

    // Uncomplete it
    await page.getByRole('button', { name: /Make bed/ }).click()
    await expect(header.getByText('$0.00')).toBeVisible({ timeout: 5000 })
  })

  test('fixed chore completion appears in ledger', async ({ page }) => {
    const chore = makeChore(CHILD.id, {
      name: 'Make bed',
      scheme: 'fixed',
      fixedAmount: 0.5,
      frequency: 'daily',
    })
    await seedAndNavigate(page, { children: [CHILD], chores: [chore] }, `/child/${CHILD.id}`)

    // Complete the chore
    await page.getByRole('button', { name: /Make bed/ }).click()
    await expect(page.locator('header').getByText('$0.50')).toBeVisible({ timeout: 5000 })

    // Navigate to ledger
    await page.getByRole('button', { name: /View history/i }).click()
    await expect(page.getByText('Transaction history')).toBeVisible()

    // Ledger should show the chore entry
    await expect(page.getByText('Make bed')).toBeVisible()
  })

  test('allowance chore does not credit ledger immediately', async ({ page }) => {
    const chore = makeChore(CHILD.id, {
      name: 'Tidy room',
      scheme: 'allowance',
      fixedAmount: null,
      frequency: 'weekly',
    })
    await seedAndNavigate(
      page,
      { children: [{ ...CHILD, weeklyAllowance: 10 }], chores: [chore] },
      `/child/${CHILD.id}`,
    )

    // Complete the allowance chore
    await page.getByRole('button', { name: /Tidy room/ }).click()

    // Balance should still be $0.00 (allowance not credited until weekly reset)
    await expect(page.locator('header').getByText('$0.00')).toBeVisible()

    // Verify no ledger entries
    await page.getByRole('button', { name: /View history/i }).click()
    await expect(page.getByText('No transactions yet')).toBeVisible()
  })

  test('balance displayed on child detail header after fixed chore', async ({ page }) => {
    const chore = makeChore(CHILD.id, {
      name: 'Wash dishes',
      scheme: 'fixed',
      fixedAmount: 2.5,
      frequency: 'daily',
    })
    await seedAndNavigate(page, { children: [CHILD], chores: [chore] }, `/child/${CHILD.id}`)

    await page.getByRole('button', { name: /Wash dishes/ }).click()
    await expect(page.locator('header').getByText('$2.50')).toBeVisible({ timeout: 5000 })
  })
})
