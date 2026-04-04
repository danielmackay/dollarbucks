import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState } from './types'

function getMondayOfThisWeek(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(new Date().setDate(diff)).toISOString().split('T')[0]
}

interface AppStore extends AppState {
  setWeekStartDate: (date: string) => void
  resetWeekStartToNow: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentWeekStartDate: getMondayOfThisWeek(),
      setWeekStartDate: (date) => set({ currentWeekStartDate: date }),
      resetWeekStartToNow: () =>
        set({ currentWeekStartDate: getMondayOfThisWeek() }),
    }),
    { name: 'dollarbucks-app' }
  )
)
