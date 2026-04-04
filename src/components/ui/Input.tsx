import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-brand-navy">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`border rounded-lg px-3 py-2.5 text-base bg-white transition-colors focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue min-h-[44px] ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500" role="alert">{error}</span>}
    </div>
  )
}
