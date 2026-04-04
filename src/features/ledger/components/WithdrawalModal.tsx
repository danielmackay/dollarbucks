import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { useLedgerStore } from '../store'
import type { Child } from '../../children/types'

interface Props {
  child: Child
  balance: number
  open: boolean
  onClose: () => void
}

export function WithdrawalModal({ child, balance, open, onClose }: Props) {
  const { addEntry } = useLedgerStore()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [amountError, setAmountError] = useState('')

  function reset() {
    setAmount('')
    setNote('')
    setAmountError('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleConfirm() {
    const value = parseFloat(amount)
    if (!amount || isNaN(value) || value <= 0) {
      setAmountError('Enter a valid amount')
      return
    }
    addEntry({
      childId: child.id,
      description: note.trim() || 'Cash withdrawal',
      amount: -value,
      type: 'withdrawal',
    })
    reset()
    onClose()
  }

  const withdrawAmount = parseFloat(amount) || 0
  const wouldOverdraft = withdrawAmount > 0 && withdrawAmount > balance

  return (
    <Modal open={open} onClose={handleClose} title={`Withdraw for ${child.name}`}>
      <div className="flex flex-col gap-4">
        <Input
          label="Amount ($)"
          type="number"
          min="0.01"
          step="0.50"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setAmountError('') }}
          placeholder="e.g. 5.00"
          error={amountError}
          autoFocus
        />

        <Input
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Bought LEGO set"
        />

        {wouldOverdraft && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-amber-800">
            ⚠️ This withdrawal exceeds {child.name}'s balance of{' '}
            {new Intl.NumberFormat('en-AU', {
              style: 'currency',
              currency: 'AUD',
            }).format(balance)}
            . Their balance will go negative.
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant={wouldOverdraft ? 'danger' : 'primary'}
            onClick={handleConfirm}
            className="flex-1"
          >
            {wouldOverdraft ? 'Withdraw anyway' : 'Withdraw'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
