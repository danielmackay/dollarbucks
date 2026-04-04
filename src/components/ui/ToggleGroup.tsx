import type { ReactNode } from 'react'

interface Option<T extends string> {
  value: T
  label: ReactNode
}

interface Props<T extends string> {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  description?: string
}

export function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  description,
}: Props<T>) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-navy block mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm font-semibold transition-colors active:scale-[0.98] min-h-[44px] ${
              value === option.value
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1.5">{description}</p>
      )}
    </div>
  )
}
