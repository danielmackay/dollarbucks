import { useParams } from 'react-router-dom'
import { useChildrenStore } from '../features/children/store'
import { useLedgerStore } from '../features/ledger/store'
import { LedgerEntryRow } from '../features/ledger/components/LedgerEntryRow'
import { BalanceBadge } from '../components/ui/BalanceBadge'
import { PageHeader } from '../components/ui/PageHeader'

export function LedgerPage() {
  const { childId } = useParams<{ childId: string }>()
  const child = useChildrenStore((s) => s.children.find((c) => c.id === childId))
  const entries = useLedgerStore((s) => s.getEntriesForChild(childId!))
  const balance = useLedgerStore((s) => s.getBalanceForChild(childId!))

  if (!child) {
    return <div className="p-4 text-gray-500">Child not found.</div>
  }

  // entries is newest-first; to compute running balance, work oldest-first then reverse
  const entriesOldestFirst = [...entries].reverse()
  const withBalances = entriesOldestFirst.reduce<
    { entry: (typeof entries)[0]; running: number }[]
  >((acc, entry) => {
    const prev = acc[acc.length - 1]?.running ?? 0
    acc.push({ entry, running: prev + entry.amount })
    return acc
  }, [])
  // display newest-first
  const displayEntries = [...withBalances].reverse()

  return (
    <main>
      <PageHeader title={`${child.name}'s history`} back />

      {/* Balance summary */}
      <div className="bg-brand-navy mx-4 mt-4 rounded-2xl p-5 text-center">
        <p className="text-brand-yellow text-sm mb-1">Current balance</p>
        <BalanceBadge balance={balance} size="lg" />
      </div>

      {/* Transaction list */}
      <div className="mx-4 mt-4 bg-white rounded-2xl px-4 pb-2">
        {displayEntries.length === 0 ? (
          <p className="text-gray-400 text-sm py-6 text-center">No transactions yet.</p>
        ) : (
          displayEntries.map(({ entry, running }) => (
            <LedgerEntryRow key={entry.id} entry={entry} runningBalance={running} />
          ))
        )}
      </div>
    </main>
  )
}
