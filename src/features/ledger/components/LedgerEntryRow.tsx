import { ArrowUp, ArrowDown } from '@phosphor-icons/react'
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
    <div className="flex items-center gap-3 py-3.5 border-b border-gray-100 last:border-0">
      {/* Direction indicator */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isCredit ? 'bg-brand-green/10' : 'bg-red-50'
        }`}
      >
        {isCredit
          ? <ArrowUp size={16} weight="bold" className="text-brand-green" />
          : <ArrowDown size={16} weight="bold" className="text-red-500" />
        }
      </div>

      {/* Description + date */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-gray-800 truncate">{entry.description}</div>
        <div className="text-xs font-semibold text-gray-400 mt-0.5">{dateStr}</div>
      </div>

      {/* Amounts */}
      <div className="text-right shrink-0">
        <div className={`text-sm font-extrabold tabular-nums ${isCredit ? 'text-brand-green' : 'text-red-500'}`}>
          {isCredit ? '+' : ''}{fmt(entry.amount)}
        </div>
        <div className="text-xs font-semibold text-gray-400 tabular-nums mt-0.5">
          {fmt(runningBalance)}
        </div>
      </div>
    </div>
  )
}
