import { useChoreActions } from '../useChoreActions'
import type { Chore } from '../types'

interface Props {
  chore: Chore
}

export function ChoreItem({ chore }: Props) {
  const { toggleChore } = useChoreActions()

  return (
    <button
      onClick={() => toggleChore(chore)}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
        chore.isComplete
          ? 'bg-brand-green/10 border-brand-green'
          : 'bg-white border-gray-200'
      }`}
    >
      {/* Checkbox circle */}
      <div
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${
          chore.isComplete
            ? 'bg-brand-green border-brand-green text-white'
            : 'border-gray-300'
        }`}
      >
        {chore.isComplete && <span className="text-sm">✓</span>}
      </div>

      {/* Name */}
      <span
        className={`flex-1 text-left text-base font-ui ${
          chore.isComplete ? 'line-through text-gray-400' : 'text-gray-800'
        }`}
      >
        {chore.name}
      </span>

      {/* Badge */}
      {chore.scheme === 'fixed' ? (
        <span className="text-sm font-semibold text-brand-orange">
          ${chore.fixedAmount?.toFixed(2)}
        </span>
      ) : (
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
          allowance
        </span>
      )}
    </button>
  )
}
