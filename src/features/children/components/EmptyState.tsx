import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'

export function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-6">
      <div className="text-6xl">🪙</div>
      <div>
        <h2 className="font-display text-xl text-brand-navy">No kids yet!</h2>
        <p className="text-gray-500 mt-2">Add a child in Settings to get started.</p>
      </div>
      <Button onClick={() => navigate('/settings')}>Add a child</Button>
    </div>
  )
}
