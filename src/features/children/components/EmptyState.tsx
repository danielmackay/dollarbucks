import { useNavigate } from 'react-router-dom'
import { Coins, ArrowRight } from '@phosphor-icons/react'
import { Button } from '../../../components/ui/Button'

export function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-5">
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-brand-navy flex items-center justify-center shadow-xl shadow-brand-navy/20">
        <Coins size={40} weight="fill" className="text-brand-yellow" />
      </div>

      <div>
        <h2 className="font-display text-xl font-extrabold text-brand-navy">No kids yet!</h2>
        <p className="text-gray-400 font-semibold mt-1 text-sm">
          Add a child in Settings to start tracking chores.
        </p>
      </div>

      <Button onClick={() => navigate('/settings')} className="flex items-center gap-2">
        Add a child
        <ArrowRight size={16} weight="bold" />
      </Button>
    </div>
  )
}
