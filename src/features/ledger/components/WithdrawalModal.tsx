// Stub — will be fully implemented in Task 11
import type { Child } from '../../children/types'

interface Props {
  child: Child
  balance: number
  open: boolean
  onClose: () => void
}

export function WithdrawalModal({ open }: Props) {
  if (!open) return null
  return null
}
