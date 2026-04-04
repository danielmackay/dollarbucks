const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** Format a Date as "YYYY-MM-DD" using local time (avoids UTC shift from toISOString). */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Returns today's date as "YYYY-MM-DD". */
export function getToday(): string {
  return formatLocalDate(new Date())
}

/** Returns 7 ISO date strings starting from a Monday week-start date. */
export function getWeekDays(weekStart: string): string[] {
  const d = new Date(weekStart + 'T00:00:00')
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d)
    day.setDate(d.getDate() + i)
    return formatLocalDate(day)
  })
}

/** Returns a short day label like "Mon", "Tue", etc. */
export function getDayLabel(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return DAY_LABELS[d.getDay()]
}

/** Returns true if the given ISO date is today. */
export function isToday(isoDate: string): boolean {
  return isoDate === getToday()
}
