export type EarningScheme = 'fixed' | 'allowance'
export type ChoreFrequency = 'daily' | 'weekly'

export interface Chore {
  id: string
  childId: string
  name: string
  scheme: EarningScheme
  fixedAmount: number | null  // required when scheme === 'fixed'
  frequency: ChoreFrequency  // 'daily' = completable each day, 'weekly' = once per week
  completions: Record<string, boolean>  // keys: ISO dates for daily, "week" for weekly
  createdAt: string  // ISO date string
}
