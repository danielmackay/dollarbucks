import type { Child } from '../../children/types'
import type { Chore } from '../types'
import { useAppStore } from '../../app/store'
import { getWeekDays } from '../dateHelpers'
import { getAllowanceProjection, getChoreDisplayCompletionCount, getChoreDisplayMaxCompletions } from '../completionHelpers'

interface Props {
  child: Child
  chores: Chore[]
}

export function AllowanceProgressBar({ child, chores }: Props) {
  const weekStart = useAppStore((s) => s.currentWeekStartDate)
  const today = useAppStore((s) => s.currentDate)

  if (child.weeklyAllowance == null) return null

  const allowanceChores = chores.filter((c) => c.scheme === 'allowance')
  if (allowanceChores.length === 0) return null

  const fullWeekDays = getWeekDays(weekStart)
  const partialWeekDays = fullWeekDays.filter((d) => d <= today)

  // completed uses days elapsed; total uses full week so partial days don't inflate the ratio
  const { completed, total, pct, projected } = getAllowanceProjection(
    allowanceChores,
    partialWeekDays,
    fullWeekDays,
    child.weeklyAllowance
  )
  const displayCompleted = allowanceChores.reduce((sum, c) => sum + getChoreDisplayCompletionCount(c, partialWeekDays), 0)
  const displayTotal = allowanceChores.reduce((sum, c) => sum + getChoreDisplayMaxCompletions(c), 0)
  const allDone = completed === total

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n)

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-display text-sm font-extrabold text-brand-navy">
            Weekly allowance
          </div>
          <div className="text-xs font-semibold text-gray-400 mt-0.5">
            {displayCompleted}/{displayTotal} completions · {fmt(child.weeklyAllowance)} max
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-lg font-black tabular-nums leading-none ${
              allDone ? 'text-brand-green' : 'text-brand-orange'
            }`}
          >
            {fmt(projected)}
          </div>
          <div className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">
            at reset
          </div>
        </div>
      </div>

      {/* Track */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: allDone ? '#4CAF6E' : '#E8821A',
          }}
        />
      </div>
    </div>
  )
}
