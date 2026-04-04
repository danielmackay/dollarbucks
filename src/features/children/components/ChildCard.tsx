import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { CaretRight } from '@phosphor-icons/react'
import { useChoresStore } from '../../chores/store'
import { useLedgerStore } from '../../ledger/store'
import type { Child } from '../types'

interface Props {
  child: Child
}

export function ChildCard({ child }: Props) {
  const navigate = useNavigate()
  const chores = useChoresStore(useShallow((s) => s.chores.filter((c) => c.childId === child.id)))
  const balance = useLedgerStore((s) => s.getBalanceForChild(child.id))

  const totalChores = chores.length
  const completedChores = chores.filter((c) => c.isComplete).length
  const progressPct = totalChores === 0 ? 0 : (completedChores / totalChores) * 100
  const allDone = totalChores > 0 && completedChores === totalChores
  const isNegative = balance < 0

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n)

  return (
    <button
      onClick={() => navigate(`/child/${child.id}`)}
      className="w-full text-left bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.97] transition-transform duration-150"
    >
      {/* Main row */}
      <div className="flex items-center gap-4 px-4 pt-4 pb-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0 shadow-md"
          style={{
            backgroundColor: child.avatarColour,
            boxShadow: `0 4px 12px ${child.avatarColour}55`,
          }}
        >
          {child.name[0].toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg font-extrabold text-brand-navy leading-tight truncate">
            {child.name}
          </div>
          <div className={`text-sm font-bold mt-0.5 ${isNegative ? 'text-red-500' : 'text-brand-green'}`}>
            {fmt(balance)}
          </div>
        </div>

        {/* Arrow */}
        <CaretRight size={18} weight="bold" className="text-gray-300 shrink-0" />
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
            {totalChores === 0
              ? 'No chores yet'
              : allDone
              ? 'All done!'
              : `${completedChores} of ${totalChores} chores`}
          </span>
          {totalChores > 0 && (
            <span className="text-[11px] font-bold" style={{ color: child.avatarColour }}>
              {Math.round(progressPct)}%
            </span>
          )}
        </div>

        {totalChores > 0 && (
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                backgroundColor: allDone ? '#4CAF6E' : child.avatarColour,
              }}
            />
          </div>
        )}
      </div>
    </button>
  )
}
