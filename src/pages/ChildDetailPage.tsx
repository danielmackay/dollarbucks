import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChildrenStore } from '../features/children/store'
import { useChoresStore } from '../features/chores/store'
import { useLedgerStore } from '../features/ledger/store'
import { ChoreItem } from '../features/chores/components/ChoreItem'
import { AllowanceProgressBar } from '../features/chores/components/AllowanceProgressBar'
import { BalanceBadge } from '../components/ui/BalanceBadge'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { WithdrawalModal } from '../features/ledger/components/WithdrawalModal'

export function ChildDetailPage() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const child = useChildrenStore((s) => s.children.find((c) => c.id === childId))
  const chores = useChoresStore((s) => s.chores.filter((c) => c.childId === childId))
  const balance = useLedgerStore((s) => s.getBalanceForChild(childId!))
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  if (!child) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Child not found.</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          Go home
        </Button>
      </div>
    )
  }

  return (
    <main>
      <PageHeader title={child.name} back />

      {/* Balance card */}
      <div className="bg-brand-navy mx-4 mt-4 rounded-2xl p-5 text-center">
        <p className="text-brand-yellow text-sm mb-1">Current balance</p>
        <BalanceBadge balance={balance} size="lg" />
      </div>

      {/* Allowance progress */}
      <div className="px-4 mt-4">
        <AllowanceProgressBar child={child} chores={chores} />
      </div>

      {/* Chore list */}
      <div className="px-4 mt-4 flex flex-col gap-2">
        <h2 className="font-display text-lg text-brand-navy">This week's chores</h2>
        {chores.length === 0 && (
          <p className="text-gray-400 text-sm py-4">No chores assigned yet.</p>
        )}
        {chores.map((chore) => (
          <ChoreItem key={chore.id} chore={chore} />
        ))}
      </div>

      {/* Actions */}
      <div className="px-4 mt-6 flex flex-col gap-3 pb-6">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setWithdrawOpen(true)}
        >
          💸 Withdraw cash
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => navigate(`/child/${childId}/ledger`)}
        >
          📋 View history
        </Button>
      </div>

      <WithdrawalModal
        child={child}
        balance={balance}
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
      />
    </main>
  )
}
