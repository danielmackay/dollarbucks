import { useChildrenStore } from '../children/store'
import { useChoresStore } from '../chores/store'
import { useLedgerStore } from './store'
import { useAppStore } from '../app/store'

export interface WeekResetSummary {
  childId: string
  childName: string
  allowanceEarned: number
  allowanceChoresCompleted: number
  allowanceChoresTotal: number
}

/**
 * Pure business logic — no React hooks, usable in tests.
 * Computes a preview of what the weekly reset will post.
 */
export function getResetSummary(): WeekResetSummary[] {
  const { children } = useChildrenStore.getState()
  const { chores } = useChoresStore.getState()

  return children
    .filter((child) => child.weeklyAllowance != null)
    .map((child) => {
      const allowanceChores = chores.filter(
        (c) => c.childId === child.id && c.scheme === 'allowance'
      )
      const completed = allowanceChores.filter((c) => c.isComplete).length
      const total = allowanceChores.length
      const ratio = total === 0 ? 0 : completed / total
      const allowanceEarned =
        total === 0 ? 0 : Math.round(child.weeklyAllowance! * ratio * 100) / 100

      return {
        childId: child.id,
        childName: child.name,
        allowanceEarned,
        allowanceChoresCompleted: completed,
        allowanceChoresTotal: total,
      }
    })
}

/**
 * Pure business logic — no React hooks, usable in tests.
 * Posts allowance ledger entries for the week and resets all chores.
 */
export function executeReset(): WeekResetSummary[] {
  const summaries = getResetSummary()

  summaries.forEach(({ childId, allowanceEarned }) => {
    if (allowanceEarned > 0) {
      useLedgerStore.getState().addEntry({
        childId,
        description: 'Weekly allowance',
        amount: allowanceEarned,
        type: 'chore_allowance',
      })
    }
  })

  useChoresStore.getState().resetAllChores()
  useAppStore.getState().resetWeekStartToNow()

  return summaries
}

/**
 * React hook wrapper — returns the reset functions.
 * Call getResetSummary() first to show confirmation UI,
 * then call executeReset() when the parent confirms.
 */
export function useWeeklyReset() {
  return { getResetSummary, executeReset }
}
