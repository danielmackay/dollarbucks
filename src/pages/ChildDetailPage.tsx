import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { ArrowLeft, Coin, ClipboardText, ArrowFatLineDown, ChartBar } from '@phosphor-icons/react'
import { useChildrenStore } from '../features/children/store'
import { useChoresStore } from '../features/chores/store'
import { useLedgerStore } from '../features/ledger/store'
import { useAppStore } from '../features/app/store'
import { getToday, getDayName } from '../features/chores/dateHelpers'
import { ChoreItem } from '../features/chores/components/ChoreItem'
import { AllowanceProgressBar } from '../features/chores/components/AllowanceProgressBar'
import { WeeklySummary } from '../features/chores/components/WeeklySummary'
import { Button } from '../components/ui/Button'
import { WithdrawalModal } from '../features/ledger/components/WithdrawalModal'

function formatAUD(n: number) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n)
}

export function ChildDetailPage() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const child = useChildrenStore((s) => s.children.find((c) => c.id === childId))
  const chores = useChoresStore(useShallow((s) => s.chores.filter((c) => c.childId === childId)))
  const balance = useLedgerStore((s) => s.getBalanceForChild(childId!))
  const selectedDate = useAppStore((s) => s.currentDate)
  const viewingToday = selectedDate === getToday()
  const choreListTitle = viewingToday ? "Today's chores" : `${getDayName(selectedDate)}'s chores`
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  if (!child) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400 font-semibold">Child not found.</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          Go home
        </Button>
      </div>
    )
  }

  const isNegative = balance < 0

  return (
    <main>
      {/* ── Hero header ── */}
      <header
        className="px-5 pt-12 pb-10 rounded-b-[2.5rem] relative overflow-hidden"
        style={{ backgroundColor: child.avatarColour }}
      >
        {/* Decorative circle */}
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

        {/* Name + balance */}
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
            <Coin size={32} weight="fill" className="text-white" />
          </div>
        </div>

        {/* Child name badge */}
        <div className="mt-4 inline-flex items-center gap-2 bg-black/10 rounded-full px-3 py-1.5">
          <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-black text-white">
            {child.name[0].toUpperCase()}
          </div>
          <span className="text-white font-bold text-sm">{child.name}</span>
        </div>
      </header>

      {/* ── Allowance progress ── */}
      <div className="px-4 mt-5">
        <AllowanceProgressBar child={child} chores={chores} />
      </div>

      {/* ── Weekly summary toggle ── */}
      {chores.some((c) => c.frequency === 'daily') && (
        <div className="px-4 mt-3">
          <button
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-brand-blue py-2 rounded-xl bg-brand-blue/5 active:bg-brand-blue/10 transition-colors"
          >
            <ChartBar size={16} weight="bold" />
            {summaryOpen ? 'Hide weekly summary' : 'View weekly summary'}
          </button>
          {summaryOpen && (
            <div className="mt-3 animate-slide-up">
              <WeeklySummary chores={chores} />
            </div>
          )}
        </div>
      )}

      {/* ── Chore list ── */}
      <div className="px-4 mt-5">
        <h2 className="font-display text-lg font-extrabold text-brand-navy mb-3">
          {choreListTitle}
        </h2>
        {chores.length === 0 ? (
          <p className="text-gray-400 font-semibold text-sm py-4 text-center">
            No chores assigned yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {chores.map((chore, i) => (
              <div
                key={chore.id}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <ChoreItem chore={chore} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="px-4 mt-6 flex flex-col gap-3 pb-8">
        <button
          onClick={() => setWithdrawOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white font-extrabold text-base py-4 rounded-2xl shadow-lg shadow-brand-orange/30 active:scale-[0.97] transition-transform"
        >
          <ArrowFatLineDown size={18} weight="fill" />
          Withdraw cash
        </button>
        <button
          onClick={() => navigate(`/child/${childId}/ledger`)}
          className="w-full flex items-center justify-center gap-2 bg-white text-brand-blue font-extrabold text-base py-4 rounded-2xl border-2 border-brand-blue/20 active:scale-[0.97] transition-transform"
        >
          <ClipboardText size={18} weight="bold" />
          View history
        </button>
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
