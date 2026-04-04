import { describe, it, expect, beforeEach } from 'vitest'
import { useChildrenStore } from '../children/store'
import { useChoresStore } from '../chores/store'
import { useLedgerStore } from './store'
import { getResetSummary, executeReset } from './useWeeklyReset'

function resetStores() {
  useChildrenStore.setState({ children: [] })
  useChoresStore.setState({ chores: [] })
  useLedgerStore.setState({ entries: [] })
}

const jack = { id: 'k1', name: 'Jack', avatarColour: '#E8821A', weeklyAllowance: 10 }

describe('getResetSummary', () => {
  beforeEach(resetStores)

  it('calculates proportional allowance for partially completed week', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        { id: 'ch1', childId: 'k1', name: 'Tidy room', scheme: 'allowance', fixedAmount: null, isComplete: true, createdAt: '' },
        { id: 'ch2', childId: 'k1', name: 'Set table', scheme: 'allowance', fixedAmount: null, isComplete: false, createdAt: '' },
        { id: 'ch3', childId: 'k1', name: 'Feed dog', scheme: 'allowance', fixedAmount: null, isComplete: false, createdAt: '' },
        { id: 'ch4', childId: 'k1', name: 'Unpack bag', scheme: 'allowance', fixedAmount: null, isComplete: false, createdAt: '' },
      ],
    })
    const [summary] = getResetSummary()
    expect(summary.allowanceEarned).toBe(2.5)  // 1/4 of $10
    expect(summary.allowanceChoresCompleted).toBe(1)
    expect(summary.allowanceChoresTotal).toBe(4)
  })

  it('returns 0 earned when no allowance chores exist', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({ chores: [] })
    const [summary] = getResetSummary()
    expect(summary.allowanceEarned).toBe(0)
    expect(summary.allowanceChoresTotal).toBe(0)
  })

  it('returns full allowance when all chores completed', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        { id: 'ch1', childId: 'k1', name: 'A', scheme: 'allowance', fixedAmount: null, isComplete: true, createdAt: '' },
        { id: 'ch2', childId: 'k1', name: 'B', scheme: 'allowance', fixedAmount: null, isComplete: true, createdAt: '' },
      ],
    })
    const [summary] = getResetSummary()
    expect(summary.allowanceEarned).toBe(10)
  })

  it('ignores children with no weeklyAllowance', () => {
    useChildrenStore.setState({
      children: [{ id: 'k2', name: 'Jill', avatarColour: '#1B5FA8', weeklyAllowance: null }],
    })
    expect(getResetSummary()).toHaveLength(0)
  })
})

describe('executeReset', () => {
  beforeEach(resetStores)

  it('posts allowance ledger entry and resets all chore completions', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        { id: 'ch1', childId: 'k1', name: 'Tidy room', scheme: 'allowance', fixedAmount: null, isComplete: true, createdAt: '' },
        { id: 'ch2', childId: 'k1', name: 'Set table', scheme: 'allowance', fixedAmount: null, isComplete: true, createdAt: '' },
      ],
    })
    executeReset()

    const entries = useLedgerStore.getState().entries
    expect(entries).toHaveLength(1)
    expect(entries[0].amount).toBe(10)
    expect(entries[0].type).toBe('chore_allowance')
    expect(entries[0].description).toBe('Weekly allowance')

    const chores = useChoresStore.getState().chores
    expect(chores.every((c) => !c.isComplete)).toBe(true)
  })

  it('does not post a ledger entry when earned amount is 0', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        { id: 'ch1', childId: 'k1', name: 'A', scheme: 'allowance', fixedAmount: null, isComplete: false, createdAt: '' },
      ],
    })
    executeReset()

    expect(useLedgerStore.getState().entries).toHaveLength(0)
  })
})
