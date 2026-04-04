interface Props {
  balance: number
  size?: 'sm' | 'lg'
}

export function BalanceBadge({ balance, size = 'lg' }: Props) {
  const isNegative = balance < 0
  const formatted = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(balance)

  return (
    <span
      className={`font-display font-bold tabular-nums ${
        isNegative ? 'text-red-500' : 'text-brand-green'
      } ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}
    >
      {formatted}
    </span>
  )
}
