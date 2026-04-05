import { describe, it, expect } from 'vitest'
import {
  isChoreComplete,
  getChoreWeeklyCompletionCount,
  getChoreMaxCompletions,
  getChoreDisplayCompletionCount,
  getChoreDisplayMaxCompletions,
  getWeeklyProgress,
  getDailyProgress,
} from './completionHelpers'
import type { Chore } from './types'

const weekDays = ['2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10', '2026-04-11', '2026-04-12']

function makeChore(overrides: Partial<Chore> = {}): Chore {
  return {
    id: 'c1',
    childId: 'k1',
    name: 'Test chore',
    scheme: 'allowance',
    fixedAmount: null,
    frequency: 'daily',
    completions: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('isChoreComplete', () => {
  it('returns true for a completed weekly chore', () => {
    const chore = makeChore({ frequency: 'weekly', completions: { week: true } })
    expect(isChoreComplete(chore)).toBe(true)
  })

  it('returns false for an incomplete weekly chore', () => {
    const chore = makeChore({ frequency: 'weekly', completions: {} })
    expect(isChoreComplete(chore)).toBe(false)
  })

  it('returns true for a daily chore completed on the given date', () => {
    const chore = makeChore({ completions: { '2026-04-07': true } })
    expect(isChoreComplete(chore, '2026-04-07')).toBe(true)
  })

  it('returns false for a daily chore not completed on the given date', () => {
    const chore = makeChore({ completions: { '2026-04-06': true } })
    expect(isChoreComplete(chore, '2026-04-07')).toBe(false)
  })
})

describe('getChoreWeeklyCompletionCount', () => {
  it('returns 7 for a completed weekly chore (weighted)', () => {
    const chore = makeChore({ frequency: 'weekly', completions: { week: true } })
    expect(getChoreWeeklyCompletionCount(chore, weekDays)).toBe(7)
  })

  it('returns 0 for an incomplete weekly chore', () => {
    const chore = makeChore({ frequency: 'weekly', completions: {} })
    expect(getChoreWeeklyCompletionCount(chore, weekDays)).toBe(0)
  })

  it('counts daily completions across the week', () => {
    const chore = makeChore({
      completions: {
        '2026-04-06': true,
        '2026-04-07': true,
        '2026-04-09': true,
        '2026-04-12': true,
      },
    })
    expect(getChoreWeeklyCompletionCount(chore, weekDays)).toBe(4)
  })
})

describe('getChoreMaxCompletions', () => {
  it('returns 7 for a daily chore over a full week', () => {
    expect(getChoreMaxCompletions(makeChore({ frequency: 'daily' }), weekDays)).toBe(7)
  })

  it('returns 7 for a weekly chore over a full week (equal weight to daily)', () => {
    expect(getChoreMaxCompletions(makeChore({ frequency: 'weekly' }), weekDays)).toBe(7)
  })

  it('returns the number of days passed in for a daily chore', () => {
    const threeDays = weekDays.slice(0, 3)
    expect(getChoreMaxCompletions(makeChore({ frequency: 'daily' }), threeDays)).toBe(3)
  })

  it('returns 7 for a weekly chore even with a partial weekDays array', () => {
    // Bug: when weekDays is filtered to 1 day, getChoreWeeklyCompletionCount returns 7
    // but getChoreMaxCompletions returned 1 → ratio = 7, allowance × 7 = way over budget
    const oneDayWeek = ['2026-04-06']
    expect(getChoreMaxCompletions(makeChore({ frequency: 'weekly' }), oneDayWeek)).toBe(7)
  })
})

describe('getWeeklyProgress with partial weekDays', () => {
  it('never exceeds 100% when weekly chore is complete and weekDays is partial', () => {
    const oneDayWeek = ['2026-04-06']
    const chores = [
      makeChore({ id: 'c1', frequency: 'daily', completions: { '2026-04-06': true } }),
      makeChore({ id: 'c2', frequency: 'daily', completions: { '2026-04-06': true } }),
      makeChore({ id: 'c3', frequency: 'weekly', completions: { week: true } }),
    ]
    const { pct } = getWeeklyProgress(chores, oneDayWeek)
    expect(pct).toBeLessThanOrEqual(100)
  })

  it('projected allowance never exceeds weeklyAllowance with partial weekDays', () => {
    const weeklyAllowance = 4
    const oneDayWeek = ['2026-04-06']
    const chores = [
      makeChore({ id: 'c1', frequency: 'daily', completions: { '2026-04-06': true } }),
      makeChore({ id: 'c2', frequency: 'daily', completions: { '2026-04-06': true } }),
      makeChore({ id: 'c3', frequency: 'weekly', completions: { week: true } }),
    ]
    const { completed, total } = getWeeklyProgress(chores, oneDayWeek)
    const ratio = total === 0 ? 0 : completed / total
    const projected = Math.round(weeklyAllowance * ratio * 100) / 100
    expect(projected).toBeLessThanOrEqual(weeklyAllowance)
  })
})

describe('getChoreDisplayCompletionCount', () => {
  it('returns 1 for a completed weekly chore', () => {
    const chore = makeChore({ frequency: 'weekly', completions: { week: true } })
    expect(getChoreDisplayCompletionCount(chore, weekDays)).toBe(1)
  })

  it('returns 0 for an incomplete weekly chore', () => {
    const chore = makeChore({ frequency: 'weekly', completions: {} })
    expect(getChoreDisplayCompletionCount(chore, weekDays)).toBe(0)
  })

  it('returns daily completion count for a daily chore', () => {
    const chore = makeChore({
      completions: { '2026-04-06': true, '2026-04-07': true, '2026-04-08': true },
    })
    expect(getChoreDisplayCompletionCount(chore, weekDays)).toBe(3)
  })
})

describe('getChoreDisplayMaxCompletions', () => {
  it('returns 7 for a daily chore', () => {
    expect(getChoreDisplayMaxCompletions(makeChore({ frequency: 'daily' }))).toBe(7)
  })

  it('returns 1 for a weekly chore', () => {
    expect(getChoreDisplayMaxCompletions(makeChore({ frequency: 'weekly' }))).toBe(1)
  })
})

describe('getWeeklyProgress', () => {
  it('calculates weighted progress for mixed daily and weekly chores', () => {
    const chores = [
      makeChore({
        id: 'c1',
        frequency: 'daily',
        completions: {
          '2026-04-06': true,
          '2026-04-07': true,
          '2026-04-08': true,
        },
      }),
      makeChore({
        id: 'c2',
        frequency: 'daily',
        completions: {
          '2026-04-06': true,
          '2026-04-07': true,
        },
      }),
      makeChore({
        id: 'c3',
        frequency: 'weekly',
        completions: { week: true },
      }),
    ]
    // total = 7 + 7 + 7 = 21, completed = 3 + 2 + 7 = 12
    const result = getWeeklyProgress(chores, weekDays)
    expect(result.total).toBe(21)
    expect(result.completed).toBe(12)
    expect(result.pct).toBe(57) // Math.round(12/21 * 100) = 57
  })

  it('returns zeros for empty chore list', () => {
    expect(getWeeklyProgress([], weekDays)).toEqual({ completed: 0, total: 0, pct: 0 })
  })
})

describe('getDailyProgress', () => {
  it('counts only daily chores for a specific day', () => {
    const chores = [
      makeChore({ id: 'c1', completions: { '2026-04-07': true } }),
      makeChore({ id: 'c2', completions: { '2026-04-07': true } }),
      makeChore({ id: 'c3', completions: {} }),
    ]
    const result = getDailyProgress(chores, '2026-04-07')
    expect(result.completed).toBe(2)
    expect(result.total).toBe(3)
    expect(result.pct).toBe(67)
  })

  it('ignores weekly chores', () => {
    const chores = [
      makeChore({ id: 'c1', completions: { '2026-04-07': true } }),
      makeChore({ id: 'c2', frequency: 'weekly', completions: { week: true } }),
    ]
    const result = getDailyProgress(chores, '2026-04-07')
    expect(result.completed).toBe(1)
    expect(result.total).toBe(1)
    expect(result.pct).toBe(100)
  })
})
