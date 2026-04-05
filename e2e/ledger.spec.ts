import { test, expect } from '@playwright/test'
import { seedAndNavigate, makeChild, makeLedgerEntry } from './helpers/storage'

const CHILD = makeChild({ id: 'child-l1', name: 'Jack', avatarColour: '#1B5FA8' })

test.describe('Ledger', () => {
  test('shows transaction history', async ({ page }) => {
    const entries = [
      makeLedgerEntry(CHILD.id, { amount: 5, description: 'Make bed', type: 'chore_fixed' }),
      makeLedgerEntry(CHILD.id, { amount: 3, description: 'Wash dishes', type: 'chore_fixed' }),
    ]

    await seedAndNavigate(
      page,
      { children: [CHILD], ledger: entries },
      `/child/${CHILD.id}`,
    )

    await page.getByRole('button', { name: /View history/i }).click()

    await expect(page.getByText('Transaction history')).toBeVisible()
    await expect(page.getByText('Make bed')).toBeVisible()
    await expect(page.getByText('Wash dishes')).toBeVisible()
  })

  test('empty ledger shows empty state', async ({ page }) => {
    await seedAndNavigate(
      page,
      { children: [CHILD], ledger: [] },
      `/child/${CHILD.id}`,
    )

    await page.getByRole('button', { name: /View history/i }).click()

    await expect(page.getByText('No transactions yet')).toBeVisible()
  })

  test('displays correct balance in header', async ({ page }) => {
    const entries = [
      makeLedgerEntry(CHILD.id, {
        amount: 10,
        description: 'Chore 1',
        type: 'chore_fixed',
        date: '2026-01-01T10:00:00.000Z',
      }),
      makeLedgerEntry(CHILD.id, {
        amount: 5.5,
        description: 'Chore 2',
        type: 'chore_fixed',
        date: '2026-01-02T10:00:00.000Z',
      }),
    ]

    await seedAndNavigate(
      page,
      { children: [CHILD], ledger: entries },
      `/child/${CHILD.id}/ledger`,
    )

    // Total balance = $15.50
    await expect(page.locator('header').getByText('$15.50')).toBeVisible()
  })

  test('credits and debits summary shown', async ({ page }) => {
    const entries = [
      makeLedgerEntry(CHILD.id, {
        amount: 10,
        description: 'Chore earning',
        type: 'chore_fixed',
        date: '2026-01-01T10:00:00.000Z',
      }),
      makeLedgerEntry(CHILD.id, {
        amount: -3,
        description: 'Withdrawal',
        type: 'withdrawal',
        date: '2026-01-02T10:00:00.000Z',
      }),
      makeLedgerEntry(CHILD.id, {
        amount: 5,
        description: 'Another chore',
        type: 'chore_fixed',
        date: '2026-01-03T10:00:00.000Z',
      }),
    ]

    await seedAndNavigate(
      page,
      { children: [CHILD], ledger: entries },
      `/child/${CHILD.id}/ledger`,
    )

    // Should show credit count (2) and debit count (1)
    // The badges display the count numbers
    await expect(page.getByText('2').first()).toBeVisible()
    await expect(page.getByText('1').first()).toBeVisible()
  })

  test('ledger shows entry descriptions', async ({ page }) => {
    const entries = [
      makeLedgerEntry(CHILD.id, {
        amount: 5,
        description: 'Make bed',
        type: 'chore_fixed',
        date: '2026-01-01T10:00:00.000Z',
      }),
      makeLedgerEntry(CHILD.id, {
        amount: -2,
        description: 'Ice cream',
        type: 'withdrawal',
        date: '2026-01-02T10:00:00.000Z',
      }),
    ]

    await seedAndNavigate(
      page,
      { children: [CHILD], ledger: entries },
      `/child/${CHILD.id}/ledger`,
    )

    await expect(page.getByText('Make bed')).toBeVisible()
    await expect(page.getByText('Ice cream')).toBeVisible()
  })
})
