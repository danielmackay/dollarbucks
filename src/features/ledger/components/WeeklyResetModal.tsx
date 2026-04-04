import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { useWeeklyReset } from '../useWeeklyReset'

interface Props {
  open: boolean
  onClose: () => void
}

export function WeeklyResetModal({ open, onClose }: Props) {
  const { getResetSummary, executeReset } = useWeeklyReset()
  const [done, setDone] = useState(false)

  // Compute summary only when modal is open
  const summary = open ? getResetSummary() : []

  function handleConfirm() {
    executeReset()
    setDone(true)
  }

  function handleClose() {
    setDone(false)
    onClose()
  }

  if (done) {
    return (
      <Modal open={open} onClose={handleClose} title="Week complete! 🎉">
        <div className="flex flex-col gap-4">
          <p className="text-gray-700">All chores have been reset for the new week.</p>
          <Button onClick={handleClose} className="w-full">Done</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={handleClose} title="Reset week">
      <div className="flex flex-col gap-4">
        <p className="text-gray-600 text-sm">
          This will post weekly allowance earnings and reset all chore completion statuses.
        </p>

        {summary.length === 0 ? (
          <p className="text-gray-400 text-sm">No weekly allowance children to summarise.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {summary.map((s) => (
              <div
                key={s.childId}
                className="bg-brand-cream rounded-xl p-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-brand-navy">{s.childName}</div>
                  <div className="text-xs text-gray-500">
                    {s.allowanceChoresCompleted}/{s.allowanceChoresTotal} allowance chores done
                  </div>
                </div>
                <div className="text-brand-green font-bold text-lg">
                  ${s.allowanceEarned.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button onClick={handleConfirm} className="flex-1">Confirm reset</Button>
        </div>
      </div>
    </Modal>
  )
}
