import { describe, it, expect, beforeEach } from 'vitest'
import { useChildrenStore } from '../children/store'
import { useChoresStore } from '../chores/store'
import { useLedgerStore } from './store'
import { useAppStore } from '../app/store'
import { getResetSummary, executeReset } from './useWeeklyReset'
import type { Chore } from '../chores/types'

const WEEK_START = '2026-04-06' // Monday

function resetStores() {
  useChildrenStore.setState({ children: [] })
  useChoresStore.setState({ chores: [] })
  useLedgerStore.setState({ entries: [] })
  useAppStore.setState({ currentWeekStartDate: WEEK_START })
}

const jack = { id: 'k1', name: 'Jack', avatarColour: '#E8821A', weeklyAllowance: 10 }

function makeChore(overrides: Partial<Chore>): Chore {
  return {
    id: 'ch1',
    childId: 'k1',
    name: 'Test',
    scheme: 'allowance',
    fixedAmount: null,
    frequency: 'weekly',
    completions: {},
    createdAt: '',
    ...overrides,
  }
}

describe('getResetSummary — weekly-only chores (original behavior)', () => {
  beforeEach(resetStores)

  it('calculates proportional allowance for partially completed week', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({ id: 'ch1', name: 'Tidy room', completions: { week: true } }),
        makeChore({ id: 'ch2', name: 'Set table', completions: {} }),
        makeChore({ id: 'ch3', name: 'Feed dog', completions: {} }),
        makeChore({ id: 'ch4', name: 'Unpack bag', completions: {} }),
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

  it('returns full allowance when all weekly chores completed', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({ id: 'ch1', name: 'A', completions: { week: true } }),
        makeChore({ id: 'ch2', name: 'B', completions: { week: true } }),
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

  it('weekly-only: partial — 1 of 3 done', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({ id: 'ch1', name: 'A', completions: { week: true } }),
        makeChore({ id: 'ch2', name: 'B', completions: {} }),
        makeChore({ id: 'ch3', name: 'C', completions: {} }),
      ],
    })
    const [summary] = getResetSummary()
    expect(summary.allowanceEarned).toBe(3.33) // (1/3) × $10
  })
})

describe('getResetSummary — daily-only chores', () => {
  beforeEach(resetStores)

  it('daily-only: partial week — 3 of 14 completed', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({
          id: 'ch1',
          name: 'A',
          frequency: 'daily',
          completions: { '2026-04-06': true, '2026-04-07': true },
        }),
        makeChore({
          id: 'ch2',
          name: 'B',
          frequency: 'daily',
          completions: { '2026-04-06': true },
        }),
      ],
    })
    const [summary] = getResetSummary()
    // total = 7 + 7 = 14, completed = 2 + 1 = 3
    expect(summary.allowanceChoresTotal).toBe(14)
    expect(summary.allowanceChoresCompleted).toBe(3)
    expect(summary.allowanceEarned).toBe(2.14) // (3/14) × $10 = 2.142... → 2.14
  })

  it('daily-only: full week — 14 of 14 completed', () => {
    const allDays = {
      '2026-04-06': true, '2026-04-07': true, '2026-04-08': true,
      '2026-04-09': true, '2026-04-10': true, '2026-04-11': true,
      '2026-04-12': true,
    }
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({ id: 'ch1', name: 'A', frequency: 'daily', completions: allDays }),
        makeChore({ id: 'ch2', name: 'B', frequency: 'daily', completions: allDays }),
      ],
    })
    const [summary] = getResetSummary()
    expect(summary.allowanceEarned).toBe(10)
  })

  it('daily chore with zero completions', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({ id: 'ch1', name: 'A', frequency: 'daily', completions: {} }),
      ],
    })
    const [summary] = getResetSummary()
    expect(summary.allowanceChoresTotal).toBe(7)
    expect(summary.allowanceChoresCompleted).toBe(0)
    expect(summary.allowanceEarned).toBe(0)
  })
})

describe('getResetSummary — mixed daily + weekly chores', () => {
  beforeEach(resetStores)

  it('mixed: 1 daily (5/7) + 1 weekly (1/1) = 6/8', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({
          id: 'ch1',
          name: 'Daily chore',
          frequency: 'daily',
          completions: {
            '2026-04-06': true, '2026-04-07': true, '2026-04-08': true,
            '2026-04-09': true, '2026-04-10': true,
          },
        }),
        makeChore({
          id: 'ch2',
          name: 'Weekly chore',
          frequency: 'weekly',
          completions: { week: true },
        }),
      ],
    })
    const [summary] = getResetSummary()
    // total = 7 + 1 = 8, completed = 5 + 1 = 6
    expect(summary.allowanceChoresTotal).toBe(8)
    expect(summary.allowanceChoresCompleted).toBe(6)
    expect(summary.allowanceEarned).toBe(7.5) // (6/8) × $10
  })

  it('mixed: none done', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({ id: 'ch1', name: 'A', frequency: 'daily', completions: {} }),
        makeChore({ id: 'ch2', name: 'B', frequency: 'weekly', completions: {} }),
      ],
    })
    const [summary] = getResetSummary()
    expect(summary.allowanceChoresTotal).toBe(8)
    expect(summary.allowanceChoresCompleted).toBe(0)
    expect(summary.allowanceEarned).toBe(0)
  })

  it('no allowance chores — only fixed chores exist', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({ id: 'ch1', name: 'A', scheme: 'fixed', fixedAmount: 1, frequency: 'daily', completions: { '2026-04-06': true } }),
      ],
    })
    const [summary] = getResetSummary()
    expect(summary.allowanceChoresTotal).toBe(0)
    expect(summary.allowanceEarned).toBe(0)
  })
})

describe('executeReset', () => {
  beforeEach(resetStores)

  it('posts allowance ledger entry and resets all chore completions', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({ id: 'ch1', name: 'Tidy room', completions: { week: true } }),
        makeChore({ id: 'ch2', name: 'Set table', completions: { week: true } }),
      ],
    })
    executeReset()

    const entries = useLedgerStore.getState().entries
    expect(entries).toHaveLength(1)
    expect(entries[0].amount).toBe(10)
    expect(entries[0].type).toBe('chore_allowance')
    expect(entries[0].description).toBe('Weekly allowance')

    const chores = useChoresStore.getState().chores
    expect(chores.every((c) => Object.keys(c.completions).length === 0)).toBe(true)
  })

  it('does not post a ledger entry when earned amount is 0', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({ id: 'ch1', name: 'A', completions: {} }),
      ],
    })
    executeReset()

    expect(useLedgerStore.getState().entries).toHaveLength(0)
  })

  it('resets daily chore completions back to empty', () => {
    useChildrenStore.setState({ children: [jack] })
    useChoresStore.setState({
      chores: [
        makeChore({
          id: 'ch1',
          name: 'Daily',
          frequency: 'daily',
          completions: { '2026-04-06': true, '2026-04-07': true },
        }),
      ],
    })
    executeReset()

    const chores = useChoresStore.getState().chores
    expect(chores[0].completions).toEqual({})
  })
})
