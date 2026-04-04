export type EarningScheme = 'fixed' | 'allowance'

export interface Chore {
  id: string
  childId: string
  name: string
  scheme: EarningScheme
  fixedAmount: number | null  // required when scheme === 'fixed'
  isComplete: boolean
  createdAt: string  // ISO date string
}
