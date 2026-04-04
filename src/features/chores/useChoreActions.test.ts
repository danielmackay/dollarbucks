import { describe, it, expect, beforeEach } from 'vitest'
import { useChoresStore } from './store'
import { useLedgerStore } from '../ledger/store'
import { toggleChore } from './useChoreActions'
import type { Chore } from './types'

function resetStores() {
  useChoresStore.setState({ chores: [] })
  useLedgerStore.setState({ entries: [] })
}

const baseChore: Chore = {
  id: 'c1',
  childId: 'kid1',
  name: 'Make bed',
  scheme: 'fixed',
  fixedAmount: 0.5,
  isComplete: false,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('toggleChore — fixed scheme', () => {
  beforeEach(resetStores)

  it('posts a positive ledger entry when marking complete', () => {
    useChoresStore.setState({ chores: [baseChore] })
    toggleChore(baseChore)

    const entries = useLedgerStore.getState().entries
    expect(entries).toHaveLength(1)
    expect(entries[0].amount).toBe(0.5)
    expect(entries[0].type).toBe('chore_fixed')
    expect(entries[0].description).toBe('Make bed')
  })

  it('reverses the entry when unmarking', () => {
    const completedChore = { ...baseChore, isComplete: true }
    useChoresStore.setState({ chores: [completedChore] })
    useLedgerStore.setState({
      entries: [{
        id: 'e1',
        childId: 'kid1',
        date: '2026-01-01T10:00:00.000Z',
        description: 'Make bed',
        amount: 0.5,
        type: 'chore_fixed' as const,
      }],
    })
    toggleChore(completedChore)

    expect(useLedgerStore.getState().entries).toHaveLength(0)
    expect(useChoresStore.getState().chores[0].isComplete).toBe(false)
  })

  it('marks the chore as complete in the store', () => {
    useChoresStore.setState({ chores: [baseChore] })
    toggleChore(baseChore)
    expect(useChoresStore.getState().chores[0].isComplete).toBe(true)
  })
})

describe('toggleChore — allowance scheme', () => {
  beforeEach(resetStores)

  it('does NOT post a ledger entry when completing an allowance chore', () => {
    const allowanceChore: Chore = { ...baseChore, scheme: 'allowance', fixedAmount: null }
    useChoresStore.setState({ chores: [allowanceChore] })
    toggleChore(allowanceChore)

    expect(useLedgerStore.getState().entries).toHaveLength(0)
    expect(useChoresStore.getState().chores[0].isComplete).toBe(true)
  })
})
