import type { Chore } from './types'
import { getToday } from './dateHelpers'

/** Completion key for a chore: ISO date for daily, "week" for weekly. */
export function getCompletionKey(chore: Chore, date?: string): string {
  return chore.frequency === 'daily' ? (date ?? getToday()) : 'week'
}

/** Is a chore complete for the given context? Defaults to today for daily, "week" for weekly. */
export function isChoreComplete(chore: Chore, date?: string): boolean {
  const key = getCompletionKey(chore, date)
  return chore.completions[key] === true
}

/**
 * Weighted completion count for allowance calculations.
 * Weekly chores count as 7 when complete (equal weight to a fully-completed daily chore).
 * Daily chores count 0-7 based on days completed.
 */
export function getChoreWeeklyCompletionCount(chore: Chore, weekDays: string[]): number {
  if (chore.frequency === 'weekly') {
    return chore.completions['week'] === true ? 7 : 0
  }
  return weekDays.filter((day) => chore.completions[day] === true).length
}

/** Max weighted completions for a chore: always 7 for weekly (equal weight to a full daily), weekDays.length for daily. */
export function getChoreMaxCompletions(chore: Chore, weekDays: string[]): number {
  if (chore.frequency === 'weekly') return 7
  return weekDays.length
}

/** Display completion count for UI: weekly chores show 0 or 1, daily chores show 0-7. */
export function getChoreDisplayCompletionCount(chore: Chore, weekDays: string[]): number {
  if (chore.frequency === 'weekly') {
    return chore.completions['week'] === true ? 1 : 0
  }
  return weekDays.filter((day) => chore.completions[day] === true).length
}

/** Display max completions for UI: 1 for weekly, 7 for daily. */
export function getChoreDisplayMaxCompletions(chore: Chore): number {
  return chore.frequency === 'daily' ? 7 : 1
}

/**
 * Projected allowance at weekly reset.
 * completedWeekDays: days to count completions from (typically days elapsed so far).
 * fullWeekDays: days used for the max denominator (always the full 7-day week).
 * Keeping these separate prevents partial-week completion from inflating the ratio.
 */
export function getAllowanceProjection(
  chores: Chore[],
  completedWeekDays: string[],
  fullWeekDays: string[],
  weeklyAllowance: number
): { completed: number; total: number; pct: number; projected: number } {
  const completed = chores.reduce(
    (sum, c) => sum + getChoreWeeklyCompletionCount(c, completedWeekDays),
    0
  )
  const total = chores.reduce((sum, c) => sum + getChoreMaxCompletions(c, fullWeekDays), 0)
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const projected = total === 0 ? 0 : Math.round((completed / total) * weeklyAllowance * 100) / 100
  return { completed, total, pct, projected }
}

/** Aggregate weekly progress across a set of chores. */
export function getWeeklyProgress(
  chores: Chore[],
  weekDays: string[]
): { completed: number; total: number; pct: number } {
  const total = chores.reduce((sum, c) => sum + getChoreMaxCompletions(c, weekDays), 0)
  const completed = chores.reduce((sum, c) => sum + getChoreWeeklyCompletionCount(c, weekDays), 0)
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { completed, total, pct }
}

/** Progress for a specific day (daily chores only; weekly chores excluded). */
export function getDailyProgress(
  chores: Chore[],
  date: string
): { completed: number; total: number; pct: number } {
  const dailyChores = chores.filter((c) => c.frequency === 'daily')
  const total = dailyChores.length
  const completed = dailyChores.filter((c) => c.completions[date] === true).length
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { completed, total, pct }
}
