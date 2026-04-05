import { test, expect } from '@playwright/test'
import { seedAndNavigate, makeChild, makeLedgerEntry } from './helpers/storage'

const CHILD = makeChild({ id: 'child-w1', name: 'Jack', avatarColour: '#1B5FA8' })

test.describe('Withdrawal', () => {
  test('withdraw cash reduces balance', async ({ page }) => {
    const entry = makeLedgerEntry(CHILD.id, {
      amount: 10,
      description: 'Chore earning',
      type: 'chore_fixed',
    })
    await seedAndNavigate(
      page,
      { children: [CHILD], ledger: [entry] },
      `/child/${CHILD.id}`,
    )

    // Balance should be $10.00
    await expect(page.getByText('$10.00')).toBeVisible()

    // Withdraw $3.00
    await page.getByRole('button', { name: 'Withdraw cash' }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    await modal.getByLabel('Amount ($)').fill('3')
    await modal.getByRole('button', { name: 'Withdraw' }).click()
    await expect(modal).toBeHidden()

    // Balance should now be $7.00
    await expect(page.getByText('$7.00')).toBeVisible()
  })

  test('withdraw with custom note appears in ledger', async ({ page }) => {
    const entry = makeLedgerEntry(CHILD.id, {
      amount: 10,
      description: 'Chore earning',
      type: 'chore_fixed',
    })
    await seedAndNavigate(
      page,
      { children: [CHILD], ledger: [entry] },
      `/child/${CHILD.id}`,
    )

    await page.getByRole('button', { name: 'Withdraw cash' }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    await modal.getByLabel('Amount ($)').fill('2')
    await modal.getByLabel('Note (optional)').fill('LEGO set')
    await modal.getByRole('button', { name: 'Withdraw' }).click()
    await expect(modal).toBeHidden()

    // Check ledger
    await page.getByRole('button', { name: /View history/i }).click()
    await expect(page.getByText('LEGO set')).toBeVisible()
  })

  test('overdraft warning shown when amount exceeds balance', async ({ page }) => {
    const entry = makeLedgerEntry(CHILD.id, {
      amount: 5,
      description: 'Chore earning',
      type: 'chore_fixed',
    })
    await seedAndNavigate(
      page,
      { children: [CHILD], ledger: [entry] },
      `/child/${CHILD.id}`,
    )

    await page.getByRole('button', { name: 'Withdraw cash' }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Enter amount greater than balance
    await modal.getByLabel('Amount ($)').fill('20')

    // Overdraft warning should appear
    await expect(modal.getByText(/exceeds.*balance/i)).toBeVisible()
    await expect(modal.getByRole('button', { name: 'Withdraw anyway' })).toBeVisible()
  })

  test('overdraft withdrawal still succeeds', async ({ page }) => {
    const entry = makeLedgerEntry(CHILD.id, {
      amount: 5,
      description: 'Chore earning',
      type: 'chore_fixed',
    })
    await seedAndNavigate(
      page,
      { children: [CHILD], ledger: [entry] },
      `/child/${CHILD.id}`,
    )

    await page.getByRole('button', { name: 'Withdraw cash' }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    await modal.getByLabel('Amount ($)').fill('20')
    await modal.getByRole('button', { name: 'Withdraw anyway' }).click()
    await expect(modal).toBeHidden()

    // Balance should be -$15.00
    await expect(page.getByText('-$15.00')).toBeVisible()
  })

  test('validation: empty amount shows error', async ({ page }) => {
    const entry = makeLedgerEntry(CHILD.id, {
      amount: 5,
      description: 'Chore earning',
      type: 'chore_fixed',
    })
    await seedAndNavigate(
      page,
      { children: [CHILD], ledger: [entry] },
      `/child/${CHILD.id}`,
    )

    await page.getByRole('button', { name: 'Withdraw cash' }).click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Try to withdraw without entering amount
    await modal.getByRole('button', { name: 'Withdraw' }).click()

    await expect(modal.getByText('Enter a valid amount')).toBeVisible()
  })
})
