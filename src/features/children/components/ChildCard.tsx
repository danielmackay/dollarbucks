import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useChoresStore } from '../../chores/store'
import { useLedgerStore } from '../../ledger/store'
import { BalanceBadge } from '../../../components/ui/BalanceBadge'
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

  return (
    <button
      onClick={() => navigate(`/child/${child.id}`)}
      className="w-full text-left bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform"
    >
      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
        style={{ backgroundColor: child.avatarColour }}
      >
        {child.name[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-display text-lg text-brand-navy truncate">{child.name}</div>
        <div className="text-sm text-gray-500">
          {totalChores === 0
            ? 'No chores yet'
            : `${completedChores}/${totalChores} chores done`}
        </div>
      </div>

      {/* Balance */}
      <BalanceBadge balance={balance} size="sm" />
    </button>
  )
}
