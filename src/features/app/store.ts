import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState } from './types'

function getMondayOfThisWeek(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
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
    {
      name: 'dollarbucks-app',
      version: 1,
      migrate: (_persisted, _version) => ({
        // Recompute week start using the fixed local-date formula,
        // discarding any stale UTC-shifted value from previous versions.
        currentWeekStartDate: getMondayOfThisWeek(),
      }),
    }
  )
)
