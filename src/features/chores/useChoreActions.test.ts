import { describe, it, expect, beforeEach } from 'vitest'
import { useChoresStore } from './store'
import { useLedgerStore } from '../ledger/store'
import { toggleChore } from './useChoreActions'
import type { Chore } from './types'

function resetStores() {
  useChoresStore.setState({ chores: [] })
  useLedgerStore.setState({ entries: [] })
}

const baseFixedWeekly: Chore = {
  id: 'c1',
  childId: 'kid1',
  name: 'Make bed',
  scheme: 'fixed',
  fixedAmount: 0.5,
  frequency: 'weekly',
  completions: {},
  createdAt: '2026-01-01T00:00:00.000Z',
}

const baseFixedDaily: Chore = {
  ...baseFixedWeekly,
  id: 'c2',
  frequency: 'daily',
}

describe('toggleChore — fixed weekly scheme', () => {
  beforeEach(resetStores)

  it('posts a positive ledger entry when marking complete', () => {
    useChoresStore.setState({ chores: [baseFixedWeekly] })
    toggleChore(baseFixedWeekly)

    const entries = useLedgerStore.getState().entries
    expect(entries).toHaveLength(1)
    expect(entries[0].amount).toBe(0.5)
    expect(entries[0].type).toBe('chore_fixed')
    expect(entries[0].description).toBe('Make bed')
  })

  it('reverses the entry when unmarking', () => {
    const completedChore = { ...baseFixedWeekly, completions: { week: true } }
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
    expect(useChoresStore.getState().chores[0].completions).toEqual({ week: false })
  })

  it('marks the chore as complete in the store', () => {
    useChoresStore.setState({ chores: [baseFixedWeekly] })
    toggleChore(baseFixedWeekly)
    expect(useChoresStore.getState().chores[0].completions).toEqual({ week: true })
  })
})

describe('toggleChore — fixed daily scheme', () => {
  beforeEach(resetStores)

  it('posts a ledger entry for today when marking a daily chore complete', () => {
    useChoresStore.setState({ chores: [baseFixedDaily] })
    toggleChore(baseFixedDaily, '2026-04-07')

    const entries = useLedgerStore.getState().entries
    expect(entries).toHaveLength(1)
    expect(entries[0].amount).toBe(0.5)
    expect(useChoresStore.getState().chores[0].completions).toEqual({ '2026-04-07': true })
  })

  it('sets completion for the specific date only', () => {
    const withMon = { ...baseFixedDaily, completions: { '2026-04-06': true } }
    useChoresStore.setState({ chores: [withMon] })
    toggleChore(withMon, '2026-04-07')

    const completions = useChoresStore.getState().chores[0].completions
    expect(completions['2026-04-06']).toBe(true)
    expect(completions['2026-04-07']).toBe(true)
  })
})

describe('toggleChore — allowance scheme', () => {
  beforeEach(resetStores)

  it('does NOT post a ledger entry when completing an allowance chore', () => {
    const allowanceChore: Chore = { ...baseFixedWeekly, scheme: 'allowance', fixedAmount: null }
    useChoresStore.setState({ chores: [allowanceChore] })
    toggleChore(allowanceChore)

    expect(useLedgerStore.getState().entries).toHaveLength(0)
    expect(useChoresStore.getState().chores[0].completions).toEqual({ week: true })
  })
})
