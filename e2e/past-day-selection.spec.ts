import { test, expect, type Page } from '@playwright/test'
import { seedAndNavigate, makeChild, makeChore } from './helpers/storage'

// Pin the app's notion of "today" to a known Friday so the week layout is
// deterministic. Monday of this week is 2026-04-06.
const FIXED_TODAY = '2026-04-10' // Friday
const MONDAY = '2026-04-06'

async function pinDevDate(page: Page, isoDate: string) {
  await page.addInitScript((d) => {
    sessionStorage.setItem('dollarbucks-dev-date', d)
  }, isoDate)
}

const CHILD = makeChild({ id: 'child-past', name: 'Jack', avatarColour: '#1B5FA8' })

test.describe('Past-day selection in Weekly Summary', () => {
  test('clicking a past day loads that day and back-dates a fixed chore ledger entry', async ({ page }) => {
    await pinDevDate(page, FIXED_TODAY)
    const chore = makeChore(CHILD.id, {
      name: 'Make bed',
      scheme: 'fixed',
      fixedAmount: 0.5,
      frequency: 'daily',
    })
    await seedAndNavigate(page, { children: [CHILD], chores: [chore] }, `/child/${CHILD.id}`)

    // Header starts as "Today's chores"
    await expect(page.getByRole('heading', { name: "Today's chores" })).toBeVisible()

    // Open the weekly summary
    await page.getByRole('button', { name: /weekly summary/i }).click()

    // Click the Monday tile
    await page.getByRole('button', { name: /view mon chores/i }).click()

    // Header now reflects Monday
    await expect(page.getByRole('heading', { name: "Monday's chores" })).toBeVisible()

    // Toggle the chore complete (this should record completion for Monday)
    await page.getByRole('button', { name: /Make bed/ }).click()
    // Wait for the credit to land in the header
    await expect(page.locator('header').getByText('$0.50')).toBeVisible({ timeout: 5000 })

    // Open the ledger and verify the entry exists with Monday's date
    await page.getByRole('button', { name: /View history/i }).click()
    await expect(page.getByText('Make bed')).toBeVisible()

    // The ledger entry should be back-dated to Monday (2026-04-06).
    // Ledger formatting: check storage directly for date correctness.
    const ledgerDate = await page.evaluate(() => {
      const raw = localStorage.getItem('dollarbucks-ledger')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      const entry = parsed?.state?.entries?.find((e: { description: string }) => e.description === 'Make bed')
      return entry?.date ?? null
    })
    expect(ledgerDate).not.toBeNull()
    expect(ledgerDate!.startsWith(MONDAY)).toBe(true)
  })

  test('un-toggling a chore on a past day removes only that day\'s ledger entry', async ({ page }) => {
    await pinDevDate(page, FIXED_TODAY)
    // Pre-seed completion for Monday so we have something to un-toggle
    const chore = makeChore(CHILD.id, {
      name: 'Make bed',
      scheme: 'fixed',
      fixedAmount: 0.5,
      frequency: 'daily',
      completions: { [MONDAY]: true, [FIXED_TODAY]: true },
    })
    await seedAndNavigate(
      page,
      {
        children: [CHILD],
        chores: [chore],
        ledger: [
          { id: 'mon', childId: CHILD.id, date: `${MONDAY}T12:00:00.000Z`, description: 'Make bed', amount: 0.5, type: 'chore_fixed' },
          { id: 'fri', childId: CHILD.id, date: `${FIXED_TODAY}T12:00:00.000Z`, description: 'Make bed', amount: 0.5, type: 'chore_fixed' },
        ],
      },
      `/child/${CHILD.id}`,
    )

    // Starting balance is $1.00
    await expect(page.locator('header').getByText('$1.00')).toBeVisible()

    // Open the weekly summary and switch to Monday
    await page.getByRole('button', { name: /weekly summary/i }).click()
    await page.getByRole('button', { name: /view mon chores/i }).click()

    // Un-toggle the chore for Monday — balance should drop to $0.50
    await page.getByRole('button', { name: /Make bed/ }).click()
    await expect(page.locator('header').getByText('$0.50')).toBeVisible({ timeout: 5000 })

    // Verify only the Monday ledger entry was removed
    const remainingIds = await page.evaluate(() => {
      const raw = localStorage.getItem('dollarbucks-ledger')
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return (parsed?.state?.entries ?? []).map((e: { id: string }) => e.id)
    })
    expect(remainingIds).toEqual(['fri'])
  })

  test('future day tiles are not interactive', async ({ page }) => {
    await pinDevDate(page, FIXED_TODAY)
    const chore = makeChore(CHILD.id, {
      name: 'Make bed',
      scheme: 'fixed',
      fixedAmount: 0.5,
      frequency: 'daily',
    })
    await seedAndNavigate(page, { children: [CHILD], chores: [chore] }, `/child/${CHILD.id}`)

    await page.getByRole('button', { name: /weekly summary/i }).click()

    // Saturday is in the future when "today" is the Friday 2026-04-10
    const satTile = page.getByRole('button', { name: /view sat chores/i })
    await expect(satTile).toBeDisabled()

    // Header is unchanged
    await expect(page.getByRole('heading', { name: "Today's chores" })).toBeVisible()
  })
})
