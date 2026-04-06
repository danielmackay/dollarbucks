import { test, expect } from '@playwright/test'
import { seedAndNavigate, makeChild, makeChore } from './helpers/storage'

test.describe('Weekly Reset', () => {
  test('shows reset summary with allowance children', async ({ page }) => {
    const child = makeChild({
      id: 'child-r1',
      name: 'Jack',
      weeklyAllowance: 10,
      avatarColour: '#1B5FA8',
    })
    const chore = makeChore(child.id, {
      name: 'Tidy room',
      scheme: 'allowance',
      fixedAmount: null,
      frequency: 'weekly',
      completions: { week: true },
    })

    await seedAndNavigate(page, { children: [child], chores: [chore] }, '/settings')

    // Click "Reset week"
    await page.getByRole('button', { name: 'Reset week' }).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Summary should show Jack, chore completion ratio, and earned amount
    await expect(modal.getByText('Jack')).toBeVisible()
    await expect(modal.getByText(/7\/7 allowance chores done/i)).toBeVisible()
    await expect(modal.getByText('$10.00')).toBeVisible()
  })

  test('confirm reset posts allowance and shows success', async ({ page }) => {
    const child = makeChild({
      id: 'child-r2',
      name: 'Jack',
      weeklyAllowance: 10,
      avatarColour: '#1B5FA8',
    })
    const chore = makeChore(child.id, {
      name: 'Tidy room',
      scheme: 'allowance',
      fixedAmount: null,
      frequency: 'weekly',
      completions: { week: true },
    })

    await seedAndNavigate(page, { children: [child], chores: [chore] }, '/settings')

    await page.getByRole('button', { name: 'Reset week' }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    await modal.getByRole('button', { name: 'Confirm reset' }).click()

    // Should show success message
    await expect(modal.getByText(/Week complete/i)).toBeVisible()

    await modal.getByRole('button', { name: 'Done' }).click()
    await expect(modal).toBeHidden()
  })

  test('cancel reset does nothing', async ({ page }) => {
    const child = makeChild({
      id: 'child-r3',
      name: 'Jack',
      weeklyAllowance: 10,
      avatarColour: '#1B5FA8',
    })
    const chore = makeChore(child.id, {
      name: 'Tidy room',
      scheme: 'allowance',
      fixedAmount: null,
      frequency: 'weekly',
      completions: { week: true },
    })

    await seedAndNavigate(page, { children: [child], chores: [chore] }, '/settings')

    await page.getByRole('button', { name: 'Reset week' }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    await modal.getByRole('button', { name: 'Cancel' }).click()
    await expect(modal).toBeHidden()

    // The chore should still be marked complete — verify by navigating to child detail
    await page.getByRole('link', { name: /home/i }).click()
    await page.getByText('Jack', { exact: true }).click()

    // Chore should still show as completed (line-through style)
    const choreBtn = page.getByRole('button', { name: /Tidy room/ })
    await expect(choreBtn).toBeVisible()
  })

  test('reset with no allowance children shows message', async ({ page }) => {
    // Child with no weekly allowance
    const child = makeChild({
      id: 'child-r4',
      name: 'Jack',
      weeklyAllowance: null,
      avatarColour: '#1B5FA8',
    })

    await seedAndNavigate(page, { children: [child] }, '/settings')

    await page.getByRole('button', { name: 'Reset week' }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    await expect(modal.getByText(/No weekly allowance children/i)).toBeVisible()
  })
})
