import { useAppStore } from '../../app/store'
import { getWeekDays, getDayLabel } from '../dateHelpers'
import { getDailyProgress, getAllowanceProjection } from '../completionHelpers'
import type { Chore } from '../types'

interface Props {
  chores: Chore[]
}

export function WeeklySummary({ chores }: Props) {
  const weekStart = useAppStore((s) => s.currentWeekStartDate)
  const today = useAppStore((s) => s.currentDate)
  const weekDays = getWeekDays(weekStart)
  const daysUpToToday = weekDays.filter((d) => d <= today)
  const allowanceChores = chores.filter((c) => c.scheme === 'allowance')
  // pct uses full weekDays as denominator so partial-week completion doesn't show 100%
  const { pct: weeklyPct } = getAllowanceProjection(allowanceChores, daysUpToToday, weekDays, 1)

  const hasDailyChores = chores.some((c) => c.frequency === 'daily')

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-sm font-extrabold text-brand-navy">
          Weekly summary
        </div>
        <span className="text-sm font-extrabold text-brand-blue tabular-nums">
          {weeklyPct}%
        </span>
      </div>

      {/* Day-by-day breakdown */}
      <div className="flex gap-1">
        {weekDays.map((day) => {
          const isPast = day < today
          const isCurrent = day === today
          const isFuture = day > today
          const { completed, total, pct } = getDailyProgress(chores, day)
          const hasData = hasDailyChores && (isPast || isCurrent)

          return (
            <div
              key={day}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl transition-colors ${
                isCurrent
                  ? 'bg-brand-blue/10 ring-2 ring-brand-blue/20'
                  : ''
              }`}
            >
              {/* Day label */}
              <span
                className={`text-[10px] font-bold uppercase tracking-wide ${
                  isCurrent
                    ? 'text-brand-blue'
                    : isFuture
                    ? 'text-gray-300'
                    : 'text-gray-400'
                }`}
              >
                {getDayLabel(day)}
              </span>

              {/* Progress circle / indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold tabular-nums ${
                  isFuture || !hasDailyChores
                    ? 'bg-gray-100 text-gray-300'
                    : pct === 100
                    ? 'bg-brand-green text-white'
                    : pct > 0
                    ? 'bg-brand-orange/20 text-brand-orange'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {hasData ? `${pct}` : '—'}
              </div>

              {/* Completion count */}
              {hasData && total > 0 && (
                <span className="text-[9px] font-semibold text-gray-400">
                  {completed}/{total}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
