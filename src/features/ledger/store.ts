import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LedgerEntry } from './types'

type AddEntryInput = Omit<LedgerEntry, 'id' | 'date'> & { date?: string }

interface LedgerStore {
  entries: LedgerEntry[]
  addEntry: (data: AddEntryInput) => void
  removeEntriesForChild: (childId: string) => void
  clearAll: () => void
  reverseChoreEntry: (childId: string, description: string, date?: string) => void
  getBalanceForChild: (childId: string) => number
  getEntriesForChild: (childId: string) => LedgerEntry[]
}

/**
 * Promote a "YYYY-MM-DD" date string to a stable midday-local ISO datetime so
 * back-dated entries sort consistently and don't drift across timezones.
 * Pass-through for full ISO strings already containing 'T'.
 */
function toEntryDate(date: string | undefined): string {
  if (!date) return new Date().toISOString()
  if (date.includes('T')) return date
  return new Date(date + 'T12:00:00').toISOString()
}

export const useLedgerStore = create<LedgerStore>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: ({ date, ...data }) =>
        set((s) => ({
          entries: [
            ...s.entries,
            { id: crypto.randomUUID(), date: toEntryDate(date), ...data },
          ],
        })),
      removeEntriesForChild: (childId) =>
        set((s) => ({ entries: s.entries.filter((e) => e.childId !== childId) })),
      clearAll: () => set({ entries: [] }),
      reverseChoreEntry: (childId, description, date) =>
        set((s) => {
          // Match by childId + description + chore_fixed type. When a date is provided,
          // also require the entry's stored date to fall on that day (YYYY-MM-DD prefix
          // of the local-time representation). Otherwise fall back to "most recent match".
          const matches = (e: LedgerEntry) =>
            e.childId === childId &&
            e.type === 'chore_fixed' &&
            e.description === description &&
            (date ? e.date.startsWith(date) : true)

          const reversed = [...s.entries].reverse()
          const idx = reversed.findIndex(matches)
          if (idx === -1) return s
          const realIdx = s.entries.length - 1 - idx
          return { entries: s.entries.filter((_, i) => i !== realIdx) }
        }),
      getBalanceForChild: (childId) =>
        get()
          .entries.filter((e) => e.childId === childId)
          .reduce((sum, e) => sum + e.amount, 0),
      getEntriesForChild: (childId) =>
        get()
          .entries.filter((e) => e.childId === childId)
          .sort((a, b) => b.date.localeCompare(a.date)),
    }),
    { name: 'dollarbucks-ledger' }
  )
)
