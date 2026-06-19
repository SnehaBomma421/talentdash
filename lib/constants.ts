import type { LevelEnum, CurrencyEnum } from '@/types'

export const LEVELS: LevelEnum[] = ['L3','L4','L5','L6','SDE_I','SDE_II','SDE_III','STAFF','PRINCIPAL','IC4','IC5']
export const CURRENCIES: CurrencyEnum[] = ['INR','USD','GBP','EUR']

// FX rates relative to INR (1 INR = X foreign currency)
// Update as needed — sourced from current market rates
export const FX_RATES: Record<CurrencyEnum, number> = {
  INR: 1,
  USD: 0.012,    // 1 INR = 0.012 USD (approx ₹83/USD)
  GBP: 0.0095,
  EUR: 0.011,
}
