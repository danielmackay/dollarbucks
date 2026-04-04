import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Child } from './types'

interface ChildrenStore {
  children: Child[]
  addChild: (data: Omit<Child, 'id'>) => void
  updateChild: (id: string, data: Partial<Omit<Child, 'id'>>) => void
  removeChild: (id: string) => void
}

export const useChildrenStore = create<ChildrenStore>()(
  persist(
    (set) => ({
      children: [],
      addChild: (data) =>
        set((s) => ({ children: [...s.children, { id: crypto.randomUUID(), ...data }] })),
      updateChild: (id, data) =>
        set((s) => ({
          children: s.children.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      removeChild: (id) =>
        set((s) => ({ children: s.children.filter((c) => c.id !== id) })),
    }),
    { name: 'dollarbucks-children' }
  )
)
