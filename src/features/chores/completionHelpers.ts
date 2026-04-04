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

/** Count how many times a chore was completed across the week. */
export function getChoreWeeklyCompletionCount(chore: Chore, weekDays: string[]): number {
  if (chore.frequency === 'weekly') {
    return chore.completions['week'] === true ? 1 : 0
  }
  return weekDays.filter((day) => chore.completions[day] === true).length
}

/** Max possible completions for a chore in a week: 7 for daily, 1 for weekly. */
export function getChoreMaxCompletions(chore: Chore): number {
  return chore.frequency === 'daily' ? 7 : 1
}

/** Aggregate weekly progress across a set of chores. */
export function getWeeklyProgress(
  chores: Chore[],
  weekDays: string[]
): { completed: number; total: number; pct: number } {
  const total = chores.reduce((sum, c) => sum + getChoreMaxCompletions(c), 0)
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
