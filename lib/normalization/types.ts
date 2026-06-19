/**
 * Types for the TalentDash data normalization pipeline.
 *
 * These represent raw, semi-structured, and validated states of a salary record
 * as it flows through the pipeline: scraped → normalized → validated → stored.
 */

import type { LevelEnum, CurrencyEnum, SourceEnum } from '@/types'

/** A raw record as extracted from a web scrape — messy, unnormalized. */
export interface RawScrapedRecord {
  raw_company: string
  raw_role: string
  raw_salary_text: string
  raw_location: string
  raw_experience: string
}

/**
 * A partially-normalized record after the LLM or rule-based normalizer has
 * attempted to map raw fields to structured values. May still be invalid.
 */
export interface NormalizedRecord {
  company: string
  role: string
  level: string | null       // may be free-text or an invalid enum — validator catches this
  location: string
  currency: string | null
  experience_years: number | null
  base_salary: number | null
  bonus: number | null
  stock: number | null
  source: SourceEnum
  confidence_score: number
}

/** A record that passed all validation and is ready for storage. */
export interface ValidatedRecord {
  company: string
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
}

/** A rejection record stored in the JSONL log. */
export interface RejectionRecord {
  raw_input: RawScrapedRecord | Record<string, unknown>
  stage: 'NORMALIZATION' | 'VALIDATION'
  reason: string
  field?: string
  rejected_at: string
}

/** Normalization result — either a normalized record or a rejection. */
export type NormalizationResult =
  | { ok: true; record: NormalizedRecord }
  | { ok: false; rejection: RejectionRecord }

/** Validation result — either a validated record or a rejection. */
export type ValidationResult =
  | { ok: true; record: ValidatedRecord }
  | { ok: false; rejection: RejectionRecord }

/** Pipeline run result — full trace of what happened. */
export interface PipelineRunReport {
  started_at: string
  total_raw: number
  normalization_passed: number
  normalization_rejected: number
  validation_passed: number
  validation_rejected: number
  stored_successfully: number
  rejection_breakdown: Record<string, number>
  null_rate_per_field: Record<string, { total: number; null_count: number; null_rate: string }>
  samples: Array<{ raw: RawScrapedRecord | Record<string, unknown>; normalized: ValidatedRecord | null }>
  raw_output_path: string
  normalized_output_path: string
  rejection_log_path: string
}
