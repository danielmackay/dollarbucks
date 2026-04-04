import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Chore } from './types'

interface ChoresStore {
  chores: Chore[]
  addChore: (data: Omit<Chore, 'id' | 'completions' | 'createdAt'>) => void
  updateChore: (id: string, data: Partial<Omit<Chore, 'id'>>) => void
  removeChore: (id: string) => void
  setCompletion: (id: string, key: string, value: boolean) => void
  resetAllChores: () => void
  removeChoresForChild: (childId: string) => void
  clearAll: () => void
}

export const useChoresStore = create<ChoresStore>()(
  persist(
    (set) => ({
      chores: [],
      addChore: (data) =>
        set((s) => ({
          chores: [
            ...s.chores,
            { id: crypto.randomUUID(), completions: {}, createdAt: new Date().toISOString(), ...data },
          ],
        })),
      updateChore: (id, data) =>
        set((s) => ({
          chores: s.chores.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      removeChore: (id) =>
        set((s) => ({ chores: s.chores.filter((c) => c.id !== id) })),
      setCompletion: (id, key, value) =>
        set((s) => ({
          chores: s.chores.map((c) =>
            c.id === id
              ? { ...c, completions: { ...c.completions, [key]: value } }
              : c
          ),
        })),
      resetAllChores: () =>
        set((s) => ({ chores: s.chores.map((c) => ({ ...c, completions: {} })) })),
      removeChoresForChild: (childId) =>
        set((s) => ({ chores: s.chores.filter((c) => c.childId !== childId) })),
      clearAll: () => set({ chores: [] }),
    }),
    {
      name: 'dollarbucks-chores',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) {
          const state = persisted as Record<string, unknown>
          const chores = (state.chores as Record<string, unknown>[]) ?? []
          state.chores = chores.map((c) => {
            const { isComplete, ...rest } = c as Record<string, unknown> & { isComplete?: boolean }
            return {
              ...rest,
              frequency: 'weekly', // existing chores keep weekly behavior
              completions: isComplete ? { week: true } : {},
            }
          })
        }
        return persisted as ChoresStore
      },
    }
  )
)
