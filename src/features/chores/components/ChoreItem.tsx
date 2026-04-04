import { useState } from 'react'
import { Check, CalendarDots } from '@phosphor-icons/react'
import { useChoreActions } from '../useChoreActions'
import { isChoreComplete } from '../completionHelpers'
import { getToday } from '../dateHelpers'
import type { Chore } from '../types'

interface Props {
  chore: Chore
}

// Eight particles at evenly-spaced angles, using brand colours
const PARTICLES = [
  { tx: -52, ty: -52, color: '#F5C842' },
  { tx:   0, ty: -72, color: '#E8821A' },
  { tx:  52, ty: -52, color: '#4CAF6E' },
  { tx:  72, ty:   0, color: '#1B5FA8' },
  { tx:  52, ty:  52, color: '#F5C842' },
  { tx:   0, ty:  72, color: '#E8821A' },
  { tx: -52, ty:  52, color: '#4CAF6E' },
  { tx: -72, ty:   0, color: '#1B5FA8' },
]

export function ChoreItem({ chore }: Props) {
  const { toggleChore } = useChoreActions()
  const [bursting, setBursting] = useState(false)
  const today = getToday()
  const complete = isChoreComplete(chore, today)

  function handleClick() {
    if (!complete) {
      setBursting(true)
      setTimeout(() => setBursting(false), 800)
    }
    toggleChore(chore, today)
  }

  const showBurst = bursting && complete

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 text-left ${
        complete
          ? 'border-brand-green/40 active:scale-[0.98]'
          : 'bg-white border-gray-100 shadow-sm active:scale-[0.97]'
      }`}
      style={
        showBurst
          ? { animation: 'chore-row-flash 0.5s ease-out both' }
          : undefined
      }
    >
      {/* Check circle — particles burst from here */}
      <div className="relative shrink-0">
        {/* Confetti particles */}
        {showBurst &&
          PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{
                backgroundColor: p.color,
                '--tx': `${p.tx}px`,
                '--ty': `${p.ty}px`,
                animation: `particle-burst 0.55s cubic-bezier(0.15, 0, 0.5, 1) forwards`,
                animationDelay: `${i * 18}ms`,
              } as React.CSSProperties}
            />
          ))}

        {/* The circle itself */}
        <div
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
            complete
              ? 'bg-brand-green border-brand-green'
              : 'border-gray-300 bg-white'
          }`}
          style={
            showBurst
              ? { animation: 'check-bounce 0.45s cubic-bezier(0.2, 0, 0.4, 2) both' }
              : undefined
          }
        >
          {complete && (
            <Check weight="bold" size={15} className="text-white" />
          )}
        </div>
      </div>

      {/* Chore name + frequency badge */}
      <div className="flex-1 min-w-0">
        <span
          className={`font-bold text-[15px] transition-colors duration-200 ${
            complete ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {chore.name}
        </span>
        {chore.frequency === 'daily' && (
          <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-blue/60 bg-brand-blue/10 rounded-full px-1.5 py-0.5 uppercase tracking-wide align-middle">
            <CalendarDots size={10} weight="bold" />
            daily
          </span>
        )}
      </div>

      {/* Scheme badge */}
      {chore.scheme === 'fixed' ? (
        <span
          className={`text-sm font-extrabold tabular-nums transition-colors ${
            complete ? 'text-brand-green' : 'text-brand-orange'
          }`}
        >
          ${chore.fixedAmount?.toFixed(2)}
        </span>
      ) : (
        <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded-full px-2.5 py-1 uppercase tracking-wide">
          allowance
        </span>
      )}
    </button>
  )
}
