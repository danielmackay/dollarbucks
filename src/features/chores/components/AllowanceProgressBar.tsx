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
  const pct = Math.round((completed / allowanceChores.length) * 100)
  const projected =
    Math.round((completed / allowanceChores.length) * child.weeklyAllowance * 100) / 100

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-semibold text-brand-navy">Weekly allowance</span>
        <span className="text-sm text-brand-orange font-bold">${projected.toFixed(2)} earned</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-orange rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {completed}/{allowanceChores.length} allowance chores · ${child.weeklyAllowance.toFixed(2)} max
      </div>
    </div>
  )
}
