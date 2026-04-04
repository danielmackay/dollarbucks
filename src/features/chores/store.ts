import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Chore } from './types'

interface ChoresStore {
  chores: Chore[]
  addChore: (data: Omit<Chore, 'id' | 'isComplete' | 'createdAt'>) => void
  updateChore: (id: string, data: Partial<Omit<Chore, 'id'>>) => void
  removeChore: (id: string) => void
  setComplete: (id: string, isComplete: boolean) => void
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
            { id: crypto.randomUUID(), isComplete: false, createdAt: new Date().toISOString(), ...data },
          ],
        })),
      updateChore: (id, data) =>
        set((s) => ({
          chores: s.chores.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      removeChore: (id) =>
        set((s) => ({ chores: s.chores.filter((c) => c.id !== id) })),
      setComplete: (id, isComplete) =>
        set((s) => ({
          chores: s.chores.map((c) => (c.id === id ? { ...c, isComplete } : c)),
        })),
      resetAllChores: () =>
        set((s) => ({ chores: s.chores.map((c) => ({ ...c, isComplete: false })) })),
      removeChoresForChild: (childId) =>
        set((s) => ({ chores: s.chores.filter((c) => c.childId !== childId) })),
      clearAll: () => set({ chores: [] }),
    }),
    { name: 'dollarbucks-chores' }
  )
)
