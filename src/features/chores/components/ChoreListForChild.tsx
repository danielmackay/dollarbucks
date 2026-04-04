import { useState } from 'react'
import { useChoresStore } from '../store'
import { useLedgerStore } from '../../ledger/store'
import { isChoreComplete } from '../completionHelpers'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { ChoreForm } from './ChoreForm'
import type { Child } from '../../children/types'
import type { Chore } from '../types'

interface Props {
  child: Child
}

export function ChoreListForChild({ child }: Props) {
  const { chores, addChore, updateChore, removeChore } = useChoresStore()
  const { reverseChoreEntry } = useLedgerStore()
  const childChores = chores.filter((c) => c.childId === child.id)

  const [addOpen, setAddOpen] = useState(false)
  const [editChore, setEditChore] = useState<Chore | null>(null)
  const [deleteChore, setDeleteChore] = useState<Chore | null>(null)

  function handleDelete(chore: Chore) {
    // If chore was completed and fixed, reverse its ledger entry
    if (isChoreComplete(chore) && chore.scheme === 'fixed') {
      reverseChoreEntry(chore.childId, chore.name)
    }
    removeChore(chore.id)
    setDeleteChore(null)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
          {childChores.length === 0 ? 'No chores yet' : `${childChores.length} chore${childChores.length !== 1 ? 's' : ''}`}
        </span>
        <Button size="sm" onClick={() => setAddOpen(true)}>+ Add</Button>
      </div>

      {childChores.length === 0 && (
        <p className="text-gray-400 text-sm">No chores yet.</p>
      )}

      {childChores.map((chore) => (
        <div
          key={chore.id}
          className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100"
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 truncate">{chore.name}</div>
            <div className="text-xs text-gray-400">
              {chore.scheme === 'fixed'
                ? `$${chore.fixedAmount?.toFixed(2)} fixed`
                : 'Weekly allowance'}
              {' · '}
              {chore.frequency === 'daily' ? 'Daily' : 'Weekly'}
            </div>
          </div>
          <button
            onClick={() => setEditChore(chore)}
            className="text-brand-blue text-sm min-h-[44px] px-2"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteChore(chore)}
            className="text-red-500 text-sm min-h-[44px] px-2"
          >
            Remove
          </button>
        </div>
      ))}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add chore">
        <ChoreForm
          childId={child.id}
          onSubmit={(data) => { addChore(data); setAddOpen(false) }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      <Modal open={!!editChore} onClose={() => setEditChore(null)} title="Edit chore">
        {editChore && (
          <ChoreForm
            childId={child.id}
            initial={editChore}
            onSubmit={(data) => { updateChore(editChore.id, data); setEditChore(null) }}
            onCancel={() => setEditChore(null)}
          />
        )}
      </Modal>

      <Modal open={!!deleteChore} onClose={() => setDeleteChore(null)} title="Remove chore?">
        {deleteChore && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-700">
              Remove <strong>{deleteChore.name}</strong>?
              {isChoreComplete(deleteChore) && deleteChore.scheme === 'fixed' && (
                <span className="block text-sm text-amber-600 mt-1">
                  The earned amount will be reversed from the ledger.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDeleteChore(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteChore)}
                className="flex-1"
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
