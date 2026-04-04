import { useState } from 'react'
import { useChildrenStore } from '../store'
import { useChoresStore } from '../../chores/store'
import { useLedgerStore } from '../../ledger/store'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { ChildForm } from './ChildForm'
import type { Child } from '../types'

export function ChildList() {
  const { children, addChild, updateChild, removeChild } = useChildrenStore()
  const { removeChoresForChild } = useChoresStore()
  const { removeEntriesForChild } = useLedgerStore()

  const [addOpen, setAddOpen] = useState(false)
  const [editChild, setEditChild] = useState<Child | null>(null)
  const [deleteChild, setDeleteChild] = useState<Child | null>(null)

  function handleDelete(child: Child) {
    removeChild(child.id)
    removeChoresForChild(child.id)
    removeEntriesForChild(child.id)
    setDeleteChild(null)
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-brand-navy">Children</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}>+ Add</Button>
      </div>

      {children.length === 0 && (
        <p className="text-gray-500 text-sm">No children yet.</p>
      )}

      {children.map((child) => (
        <div
          key={child.id}
          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
            style={{ backgroundColor: child.avatarColour }}
          >
            {child.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-brand-navy truncate">{child.name}</div>
            {child.weeklyAllowance != null && (
              <div className="text-xs text-gray-500">
                ${child.weeklyAllowance.toFixed(2)}/week allowance
              </div>
            )}
          </div>
          <button
            onClick={() => setEditChild(child)}
            className="text-brand-blue text-sm min-h-[44px] px-2"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteChild(child)}
            className="text-red-500 text-sm min-h-[44px] px-2"
          >
            Remove
          </button>
        </div>
      ))}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add child">
        <ChildForm
          onSubmit={(data) => { addChild(data); setAddOpen(false) }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      <Modal open={!!editChild} onClose={() => setEditChild(null)} title="Edit child">
        {editChild && (
          <ChildForm
            initial={editChild}
            onSubmit={(data) => { updateChild(editChild.id, data); setEditChild(null) }}
            onCancel={() => setEditChild(null)}
          />
        )}
      </Modal>

      <Modal open={!!deleteChild} onClose={() => setDeleteChild(null)} title="Remove child?">
        {deleteChild && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-700">
              This will permanently delete <strong>{deleteChild.name}</strong> and all their chores and ledger history.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDeleteChild(null)} className="flex-1">Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteChild)} className="flex-1">Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
