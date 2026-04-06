import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState } from './types'
import { getToday } from '../chores/dateHelpers'

export function getMondayOfThisWeek(): string {
  const today = getToday()
  const d = new Date(today + 'T00:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

interface AppStore extends AppState {
  setCurrentDate: (date: string) => void
  setWeekStartDate: (date: string) => void
  resetWeekStartToNow: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentDate: getToday(),
      currentWeekStartDate: getMondayOfThisWeek(),
      setCurrentDate: (date) => set({ currentDate: date }),
      setWeekStartDate: (date) => set({ currentWeekStartDate: date }),
      resetWeekStartToNow: () =>
        set({ currentWeekStartDate: getMondayOfThisWeek() }),
    }),
    {
      name: 'dollarbucks-app',
      version: 1,
      partialize: (state) => ({ currentWeekStartDate: state.currentWeekStartDate }),
      migrate: () => ({
        // Recompute week start using the fixed local-date formula,
        // discarding any stale UTC-shifted value from previous versions.
        currentWeekStartDate: getMondayOfThisWeek(),
      }),
    }
  )
)
