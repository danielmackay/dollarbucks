import { useParams, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { ArrowLeft, Receipt, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import { useChildrenStore } from '../features/children/store'
import { useLedgerStore } from '../features/ledger/store'
import { LedgerEntryRow } from '../features/ledger/components/LedgerEntryRow'

function formatAUD(n: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n)
}

export function LedgerPage() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const child = useChildrenStore((s) => s.children.find((c) => c.id === childId))
  const entries = useLedgerStore(useShallow((s) => s.getEntriesForChild(childId!)))
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
  const displayEntries = [...withBalances].reverse()

  const isNegative = balance < 0

  // Summary counts
  const credits = entries.filter((e) => e.amount > 0).length
  const debits = entries.filter((e) => e.amount < 0).length

  return (
    <main>
      {/* ── Hero header ── */}
      <header
        className="px-5 pt-12 pb-10 rounded-b-[2.5rem] relative overflow-hidden"
        style={{ backgroundColor: child.avatarColour }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-20"
          style={{ backgroundColor: '#ffffff' }}
        />
        <div
          className="absolute -right-4 top-12 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: '#ffffff' }}
        />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center mb-6 active:bg-black/20 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} weight="bold" className="text-white" />
        </button>

        {/* Balance */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
              Current balance
            </p>
            <div
              className={`font-display font-black tabular-nums leading-none ${
                isNegative ? 'text-red-200' : 'text-white'
              }`}
              style={{ fontSize: 'clamp(2.5rem, 10vw, 3.5rem)' }}
            >
              {formatAUD(balance)}
            </div>
          </div>

          <div className="bg-white/20 rounded-2xl p-3 mb-1">
            <Receipt size={32} weight="fill" className="text-white" />
          </div>
        </div>

        {/* Child name badge + summary */}
        <div className="mt-4 flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-black/10 rounded-full px-3 py-1.5">
            <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-black text-white">
              {child.name[0].toUpperCase()}
            </div>
            <span className="text-white font-bold text-sm">{child.name}</span>
          </div>

          {entries.length > 0 && (
            <div className="flex items-center gap-2">
              {credits > 0 && (
                <div className="flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-1">
                  <ArrowUp size={11} weight="bold" className="text-white/80" />
                  <span className="text-white/80 text-xs font-bold">{credits}</span>
                </div>
              )}
              {debits > 0 && (
                <div className="flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-1">
                  <ArrowDown size={11} weight="bold" className="text-white/80" />
                  <span className="text-white/80 text-xs font-bold">{debits}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Transaction list ── */}
      <div className="px-4 mt-5 pb-8">
        <h2 className="font-display text-lg font-extrabold text-brand-navy mb-3">
          Transaction history
        </h2>

        {displayEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Receipt size={28} weight="duotone" className="text-gray-300" />
            </div>
            <p className="font-bold text-gray-400 text-sm">No transactions yet</p>
            <p className="text-gray-300 text-xs mt-1">
              Completed chores and withdrawals will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl px-4 border border-gray-100 shadow-sm">
            {displayEntries.map(({ entry, running }, i) => (
              <div
                key={entry.id}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <LedgerEntryRow entry={entry} runningBalance={running} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
