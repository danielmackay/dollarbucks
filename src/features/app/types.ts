export interface AppState {
  currentDate: string           // ISO date string (today, may be overridden in dev)
  currentWeekStartDate: string  // ISO date string (Monday of current week)
}
