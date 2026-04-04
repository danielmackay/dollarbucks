import { useState } from 'react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import type { Chore, EarningScheme } from '../types'

interface Props {
  childId: string
  initial?: Partial<Chore>
  onSubmit: (data: Omit<Chore, 'id' | 'isComplete' | 'createdAt'>) => void
  onCancel: () => void
}

export function ChoreForm({ childId, initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [scheme, setScheme] = useState<EarningScheme>(initial?.scheme ?? 'fixed')
  const [amount, setAmount] = useState(initial?.fixedAmount?.toString() ?? '')
  const [nameError, setNameError] = useState('')
  const [amountError, setAmountError] = useState('')

  function handleSubmit() {
    let valid = true
    if (!name.trim()) { setNameError('Name is required'); valid = false }
    if (scheme === 'fixed' && (!amount || parseFloat(amount) <= 0)) {
      setAmountError('Enter a valid amount'); valid = false
    }
    if (!valid) return

    onSubmit({
      childId,
      name: name.trim(),
      scheme,
      fixedAmount: scheme === 'fixed' ? parseFloat(amount) : null,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Chore name"
        value={name}
        onChange={(e) => { setName(e.target.value); setNameError('') }}
        placeholder="e.g. Make bed"
        error={nameError}
        autoFocus
      />

      <div>
        <label className="text-sm font-semibold text-brand-navy block mb-2">
          Earning type
        </label>
        <div className="flex gap-2">
          {(['fixed', 'allowance'] as EarningScheme[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScheme(s)}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors min-h-[44px] ${
                scheme === s
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {s === 'fixed' ? '💰 Fixed amount' : '📅 Weekly allowance'}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1.5">
          {scheme === 'fixed'
            ? 'Earns a fixed $ amount when marked complete.'
            : 'Contributes to weekly allowance % when complete.'}
        </p>
      </div>

      {scheme === 'fixed' && (
        <Input
          label="Amount ($)"
          type="number"
          min="0.01"
          step="0.25"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setAmountError('') }}
          placeholder="e.g. 0.50"
          error={amountError}
        />
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1">Save</Button>
      </div>
    </div>
  )
}
