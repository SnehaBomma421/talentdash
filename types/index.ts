export type LevelEnum = 'L3'|'L4'|'L5'|'L6'|'SDE_I'|'SDE_II'|'SDE_III'|'STAFF'|'PRINCIPAL'|'IC4'|'IC5'
export type CurrencyEnum = 'INR'|'USD'|'GBP'|'EUR'
export type SourceEnum = 'CONTRIBUTOR'|'SCRAPED'|'AI_INFERRED'

export interface SalaryRecord {
  id: string
  company: { id: string; name: string; slug: string; industry?: string|null; headquarters?: string|null; founded_year?: number|null; headcount_range?: string|null }
  role: string
  level: LevelEnum
  location: string
  currency: CurrencyEnum
  experience_years: number
  base_salary: number
  bonus: number
  stock: number
  total_compensation: number
  source: SourceEnum
  confidence_score: number
  is_verified: boolean
  submitted_at: string
}

export interface CompanyDetail {
  id: string
  name: string
  slug: string
  industry?: string|null
  headquarters?: string|null
  founded_year?: number|null
  headcount_range?: string|null
  median_total_compensation: number
  tc_min: number
  tc_max: number
  record_count: number
  level_distribution: Record<LevelEnum, number>
  salaries: SalaryRecord[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface CompareDelta {
  base_delta: number
  bonus_delta: number
  stock_delta: number
  tc_delta: number
  experience_delta: number
}

export interface CompareResponse {
  record1: SalaryRecord
  record2: SalaryRecord
  delta: CompareDelta
}

export interface IngestPayload {
  company: string
  role: string
  level: LevelEnum
  location: string
  currency: CurrencyEnum
  experience_years: number
  base_salary: number
  bonus?: number
  stock?: number
  source: SourceEnum
  confidence_score: number
}
