import { useState } from 'react'
import { CurrencyDollar, CalendarDots, ArrowsClockwise, NumberOne } from '@phosphor-icons/react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { ToggleGroup } from '../../../components/ui/ToggleGroup'
import type { Chore, EarningScheme, ChoreFrequency } from '../types'

interface Props {
  childId: string
  initial?: Partial<Chore>
  onSubmit: (data: Omit<Chore, 'id' | 'completions' | 'createdAt'>) => void
  onCancel: () => void
}

const earningOptions: { value: EarningScheme; label: React.ReactNode }[] = [
  { value: 'fixed', label: <><CurrencyDollar size={18} weight="bold" /> Fixed amount</> },
  { value: 'allowance', label: <><CalendarDots size={18} weight="bold" /> Weekly allowance</> },
]

const frequencyOptions: { value: ChoreFrequency; label: React.ReactNode }[] = [
  { value: 'daily', label: <><ArrowsClockwise size={18} weight="bold" /> Daily</> },
  { value: 'weekly', label: <><NumberOne size={18} weight="bold" /> Weekly</> },
]

const earningDescriptions: Record<EarningScheme, string> = {
  fixed: 'Earns a fixed $ amount when marked complete.',
  allowance: 'Contributes to weekly allowance % when complete.',
}

const frequencyDescriptions: Record<ChoreFrequency, string> = {
  daily: 'Can be completed each day of the week.',
  weekly: 'Completed once for the whole week.',
}

export function ChoreForm({ childId, initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [scheme, setScheme] = useState<EarningScheme>(initial?.scheme ?? 'fixed')
  const [frequency, setFrequency] = useState<ChoreFrequency>(initial?.frequency ?? 'daily')
  const [amount, setAmount] = useState(initial?.fixedAmount?.toString() ?? '')
  const [nameError, setNameError] = useState('')
  const [amountError, setAmountError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit() {
    let valid = true
    if (!name.trim()) { setNameError('Name is required'); valid = false }
    if (scheme === 'fixed' && (!amount || parseFloat(amount) <= 0)) {
      setAmountError('Enter a valid amount'); valid = false
    }
    if (!valid) return

    setSubmitting(true)
    onSubmit({
      childId,
      name: name.trim(),
      scheme,
      fixedAmount: scheme === 'fixed' ? parseFloat(amount) : null,
      frequency,
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

      <ToggleGroup
        label="Earning type"
        options={earningOptions}
        value={scheme}
        onChange={setScheme}
        description={earningDescriptions[scheme]}
      />

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

      <ToggleGroup
        label="Frequency"
        options={frequencyOptions}
        value={frequency}
        onChange={setFrequency}
        description={frequencyDescriptions[frequency]}
      />

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1" disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
