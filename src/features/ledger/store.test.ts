import { describe, it, expect, beforeEach } from 'vitest'
import { useLedgerStore } from './store'

function reset() {
  useLedgerStore.setState({ entries: [] })
}

describe('useLedgerStore.addEntry', () => {
  beforeEach(reset)

  it('uses the current time when no date is provided', () => {
    const before = Date.now()
    useLedgerStore.getState().addEntry({
      childId: 'kid1',
      description: 'Make bed',
      amount: 0.5,
      type: 'chore_fixed',
    })
    const after = Date.now()

    const entry = useLedgerStore.getState().entries[0]
    const ts = new Date(entry.date).getTime()
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })

  it('back-dates the entry when an ISO date string is provided', () => {
    useLedgerStore.getState().addEntry({
      childId: 'kid1',
      description: 'Make bed',
      amount: 0.5,
      type: 'chore_fixed',
      date: '2026-04-06',
    })

    const entry = useLedgerStore.getState().entries[0]
    expect(entry.date.startsWith('2026-04-06')).toBe(true)
  })
})

describe('useLedgerStore.reverseChoreEntry', () => {
  beforeEach(reset)

  it('removes only the entry matching the given date', () => {
    useLedgerStore.setState({
      entries: [
        { id: 'e1', childId: 'kid1', date: '2026-04-06T12:00:00.000Z', description: 'Make bed', amount: 0.5, type: 'chore_fixed' },
        { id: 'e2', childId: 'kid1', date: '2026-04-07T12:00:00.000Z', description: 'Make bed', amount: 0.5, type: 'chore_fixed' },
        { id: 'e3', childId: 'kid1', date: '2026-04-08T12:00:00.000Z', description: 'Make bed', amount: 0.5, type: 'chore_fixed' },
      ],
    })

    useLedgerStore.getState().reverseChoreEntry('kid1', 'Make bed', '2026-04-07')

    const remaining = useLedgerStore.getState().entries.map((e) => e.id)
    expect(remaining).toEqual(['e1', 'e3'])
  })

  it('is a no-op when no entry matches the date', () => {
    useLedgerStore.setState({
      entries: [
        { id: 'e1', childId: 'kid1', date: '2026-04-06T12:00:00.000Z', description: 'Make bed', amount: 0.5, type: 'chore_fixed' },
      ],
    })

    useLedgerStore.getState().reverseChoreEntry('kid1', 'Make bed', '2026-04-07')

    expect(useLedgerStore.getState().entries).toHaveLength(1)
  })
})
