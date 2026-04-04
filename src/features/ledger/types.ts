export type LedgerEntryType =
  | 'chore_fixed'
  | 'chore_allowance'
  | 'withdrawal'
  | 'allowance_reversal'

export interface LedgerEntry {
  id: string
  childId: string
  date: string         // ISO datetime string
  description: string
  amount: number       // positive = credit, negative = debit
  type: LedgerEntryType
}
