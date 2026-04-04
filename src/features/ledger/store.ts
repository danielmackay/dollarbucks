import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LedgerEntry } from './types'

interface LedgerStore {
  entries: LedgerEntry[]
  addEntry: (data: Omit<LedgerEntry, 'id' | 'date'>) => void
  removeEntriesForChild: (childId: string) => void
  reverseChoreEntry: (childId: string, description: string) => void
  getBalanceForChild: (childId: string) => number
  getEntriesForChild: (childId: string) => LedgerEntry[]
}

export const useLedgerStore = create<LedgerStore>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (data) =>
        set((s) => ({
          entries: [
            ...s.entries,
            { id: crypto.randomUUID(), date: new Date().toISOString(), ...data },
          ],
        })),
      removeEntriesForChild: (childId) =>
        set((s) => ({ entries: s.entries.filter((e) => e.childId !== childId) })),
      reverseChoreEntry: (childId, description) =>
        set((s) => {
          // Find the most recent chore_fixed entry matching this description and remove it
          const reversed = [...s.entries].reverse()
          const idx = reversed.findIndex(
            (e) =>
              e.childId === childId &&
              e.type === 'chore_fixed' &&
              e.description === description
          )
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
