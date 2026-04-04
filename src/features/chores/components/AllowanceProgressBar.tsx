import type { Child } from '../../children/types'
import type { Chore } from '../types'

interface Props {
  child: Child
  chores: Chore[]
}

export function AllowanceProgressBar({ child, chores }: Props) {
  if (child.weeklyAllowance == null) return null

  const allowanceChores = chores.filter((c) => c.scheme === 'allowance')
  if (allowanceChores.length === 0) return null

  const completed = allowanceChores.filter((c) => c.isComplete).length
  const total = allowanceChores.length
  const pct = Math.round((completed / total) * 100)
  const projected = Math.round((completed / total) * child.weeklyAllowance * 100) / 100
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
            {completed}/{total} chores · {fmt(child.weeklyAllowance)} max
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

      {/* Segment ticks */}
      {total > 1 && (
        <div className="flex mt-1.5 px-0">
          {Array.from({ length: total - 1 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 flex justify-end"
              style={{ flexBasis: `${100 / total}%` }}
            >
              <div className="w-px h-1.5 bg-gray-200 -mt-0.5" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
