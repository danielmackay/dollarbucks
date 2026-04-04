import { useChoresStore } from './store'
import { useLedgerStore } from '../ledger/store'
import type { Chore } from './types'

/**
 * Pure business logic — no React hooks, usable in tests.
 * For fixed chores: posts or reverses a ledger entry immediately (BR-04).
 * For allowance chores: only flips isComplete — no ledger entry (BR-05).
 */
export function toggleChore(chore: Chore) {
  const nowComplete = !chore.isComplete
  useChoresStore.getState().setComplete(chore.id, nowComplete)

  if (chore.scheme === 'fixed' && chore.fixedAmount != null) {
    if (nowComplete) {
      useLedgerStore.getState().addEntry({
        childId: chore.childId,
        description: chore.name,
        amount: chore.fixedAmount,
        type: 'chore_fixed',
      })
    } else {
      useLedgerStore.getState().reverseChoreEntry(chore.childId, chore.name)
    }
  }
  // allowance chores: no ledger entry
}

/**
 * React hook wrapper — returns the toggleChore action bound to the stores.
 */
export function useChoreActions() {
  return { toggleChore }
}
