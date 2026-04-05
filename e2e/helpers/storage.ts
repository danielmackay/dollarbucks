import { type Page } from '@playwright/test'

/** All Zustand persist localStorage keys used by the app */
const STORAGE_KEYS = [
  'dollarbucks-children',
  'dollarbucks-chores',
  'dollarbucks-ledger',
  'dollarbucks-app',
] as const

/** Clear all app data from localStorage. Call via page.evaluate before navigating. */
export async function clearStorage(page: Page) {
  await page.evaluate((keys) => {
    for (const key of keys) localStorage.removeItem(key)
  }, STORAGE_KEYS as unknown as string[])
}

// ── Zustand-persist-compatible seeding ──────────────────────────────

export interface SeedChild {
  id: string
  name: string
  avatarColour: string
  weeklyAllowance: number | null
}

export interface SeedChore {
  id: string
  childId: string
  name: string
  scheme: 'fixed' | 'allowance'
  fixedAmount: number | null
  frequency: 'daily' | 'weekly'
  completions: Record<string, boolean>
  createdAt: string
}

export interface SeedLedgerEntry {
  id: string
  childId: string
  date: string
  description: string
  amount: number
  type: 'chore_fixed' | 'chore_allowance' | 'withdrawal' | 'allowance_reversal'
}

export interface SeedData {
  children?: SeedChild[]
  chores?: SeedChore[]
  ledger?: SeedLedgerEntry[]
}

/**
 * Inject seed data into localStorage in Zustand-persist format, then reload
 * the page so the stores hydrate from the seeded state.
 */
export async function seedAndNavigate(page: Page, data: SeedData, path = '/') {
  // Must navigate first to have a page context for localStorage
  await page.goto('/')
  await clearStorage(page)

  await page.evaluate(({ children, chores, ledger }) => {
    if (children) {
      localStorage.setItem(
        'dollarbucks-children',
        JSON.stringify({ state: { children }, version: 0 }),
      )
    }
    if (chores) {
      localStorage.setItem(
        'dollarbucks-chores',
        JSON.stringify({ state: { chores }, version: 1 }),
      )
    }
    if (ledger) {
      localStorage.setItem(
        'dollarbucks-ledger',
        JSON.stringify({ state: { entries: ledger }, version: 0 }),
      )
    }
  }, data)

  await page.goto(path)
}

// ── Factory helpers for building seed data ──────────────────────────

let counter = 0

export function makeChild(overrides: Partial<SeedChild> = {}): SeedChild {
  counter++
  return {
    id: overrides.id ?? `child-${counter}`,
    name: overrides.name ?? `Child ${counter}`,
    avatarColour: overrides.avatarColour ?? '#1B5FA8',
    weeklyAllowance: overrides.weeklyAllowance ?? null,
  }
}

export function makeChore(childId: string, overrides: Partial<SeedChore> = {}): SeedChore {
  counter++
  return {
    id: overrides.id ?? `chore-${counter}`,
    childId,
    name: overrides.name ?? `Chore ${counter}`,
    scheme: overrides.scheme ?? 'fixed',
    fixedAmount: overrides.fixedAmount ?? (overrides.scheme === 'allowance' ? null : 1),
    frequency: overrides.frequency ?? 'daily',
    completions: overrides.completions ?? {},
    createdAt: overrides.createdAt ?? new Date().toISOString(),
  }
}

export function makeLedgerEntry(
  childId: string,
  overrides: Partial<SeedLedgerEntry> = {},
): SeedLedgerEntry {
  counter++
  return {
    id: overrides.id ?? `entry-${counter}`,
    childId,
    date: overrides.date ?? new Date().toISOString(),
    description: overrides.description ?? `Entry ${counter}`,
    amount: overrides.amount ?? 5,
    type: overrides.type ?? 'chore_fixed',
  }
}
