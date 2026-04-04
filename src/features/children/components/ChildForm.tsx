import { useState } from 'react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { AVATAR_COLOURS } from '../avatarColours'
import type { Child } from '../types'

interface Props {
  initial?: Partial<Child>
  onSubmit: (data: Omit<Child, 'id'>) => void
  onCancel: () => void
}

export function ChildForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [colour, setColour] = useState(initial?.avatarColour ?? AVATAR_COLOURS[0])
  const [allowance, setAllowance] = useState(initial?.weeklyAllowance?.toString() ?? '')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    const parsedAllowance = allowance ? parseFloat(allowance) : null
    onSubmit({
      name: name.trim(),
      avatarColour: colour,
      weeklyAllowance: parsedAllowance != null && !isNaN(parsedAllowance) ? parsedAllowance : null,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Child's name"
        value={name}
        onChange={(e) => { setName(e.target.value); setError('') }}
        placeholder="e.g. Jack"
        error={error}
        autoFocus
      />

      <div>
        <label className="text-sm font-semibold text-brand-navy block mb-2">
          Avatar colour
        </label>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLOURS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColour(c)}
              className={`w-10 h-10 rounded-full border-4 transition-transform ${
                colour === c ? 'border-brand-navy scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select colour ${c}`}
              aria-pressed={colour === c}
            />
          ))}
        </div>
      </div>

      <Input
        label="Weekly allowance (optional)"
        type="number"
        min="0"
        step="0.50"
        value={allowance}
        onChange={(e) => setAllowance(e.target.value)}
        placeholder="e.g. 10.00"
      />

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1">Save</Button>
      </div>
    </div>
  )
}
