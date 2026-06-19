import type { CurrencyEnum } from '@/types'
import { FX_RATES } from './constants'

/**
 * Format currency in Indian lakh/crore system for INR, standard for others.
 */
export function formatCurrency(amount: number, currency: CurrencyEnum): string {
  if (currency === 'INR') {
    return formatIndian(amount)
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(amount)
}

/**
 * Format amount in Indian numbering system (lakh/crore).
 */
function formatIndian(amount: number): string {
  const absAmount = Math.abs(amount)
  if (absAmount >= 10000000) {
    // Crores: ₹1,50,00,000 → ₹1.5 Cr
    const crores = amount / 10000000
    return `₹${crores.toFixed(crores % 1 === 0 ? 0 : 1)} Cr`
  }
  if (absAmount >= 100000) {
    // Lakhs: ₹42,00,000 → ₹42.00 L
    const lakhs = amount / 100000
    return `₹${lakhs.toFixed(lakhs % 1 === 0 ? 0 : 2)} L`
  }
  if (absAmount >= 1000) {
    // Thousands: ₹85,000 → ₹85 K
    const thousands = amount / 1000
    return `₹${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)} K`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

/**
 * Format for large salary figures (e.g., ₹4,00,00,000)
 */
export function formatLargeSalary(amount: number, currency: CurrencyEnum): string {
  if (currency === 'INR') {
    const crores = amount / 10000000
    if (crores >= 1) {
      return `₹${crores.toFixed(crores % 1 === 0 ? 0 : 1)} Cr`
    }
    return formatIndian(amount)
  }
  return formatCurrency(amount, currency)
}

/**
 * Convert amount from its native currency to targetCurrency using FX_RATES.
 */
export function convertCurrency(amount: number, from: CurrencyEnum, to: CurrencyEnum): number {
  // First convert to INR, then to target
  const inrAmount = from === 'INR' ? amount : amount / FX_RATES[from]
  if (to === 'INR') return Math.round(inrAmount)
  return Math.round(inrAmount * FX_RATES[to])
}

/**
 * Compute true statistical median from an array of numbers.
 * Sorts the array (ascending) and returns the middle value.
 * For even-length arrays, returns the average of two middle values.
 */
export function computeMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) {
    return sorted[mid]
  }
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

/**
 * Debounce helper for filter inputs.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  const debounced = (...args: unknown[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fn(...(args as any[]))
      timer = null
    }, ms)
  }
  return debounced as unknown as T
}

/**
 * Serialize salary record — convert BigInt fields to Number for JSON responses.
 */
export function serializeSalary(record: Record<string, unknown> | null | undefined): Record<string, unknown> | null | undefined {
  if (!record) return record
  const cs = record.confidence_score
  return {
    ...record,
    base_salary: Number(record.base_salary),
    bonus: Number(record.bonus ?? 0),
    stock: Number(record.stock ?? 0),
    total_compensation: Number(record.total_compensation),
    confidence_score: typeof cs === 'number' ? cs : Number(String(cs)),
    submitted_at: record.submitted_at instanceof Date
      ? record.submitted_at.toISOString()
      : record.submitted_at,
  }
}
