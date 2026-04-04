import type { LedgerEntry } from '../types'

interface Props {
  entry: LedgerEntry
  runningBalance: number
}

export function LedgerEntryRow({ entry, runningBalance }: Props) {
  const isCredit = entry.amount > 0
  const dateStr = new Date(entry.date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n)

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div
        className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
          isCredit ? 'bg-brand-green/10 text-brand-green' : 'bg-red-50 text-red-500'
        }`}
      >
        {isCredit ? '↑' : '↓'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{entry.description}</div>
        <div className="text-xs text-gray-400">{dateStr}</div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-sm font-bold ${isCredit ? 'text-brand-green' : 'text-red-500'}`}>
          {isCredit ? '+' : ''}{fmt(entry.amount)}
        </div>
        <div className="text-xs text-gray-400">{fmt(runningBalance)}</div>
      </div>
    </div>
  )
}
