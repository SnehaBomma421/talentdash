/**
 * Pydantic-style validation layer for the TalentDash data pipeline.
 *
 * Every record that comes out of the LLM normalizer or rule-based normalizer
 * MUST pass through this validator before it can be stored. The LLM is not
 * reliable — the validator is the final authority.
 *
 * Rejected records are written to a JSONL rejection log with the raw input
 * and the validation error. Never silently drop a record.
 */

import * as fs from 'fs'
import * as path from 'path'
import { LEVELS, CURRENCIES } from '../constants'
import type { LevelEnum, CurrencyEnum, SourceEnum } from '../../types'
import type { NormalizedRecord, ValidatedRecord, RejectionRecord } from './types'

const VALID_LEVELS: string[] = LEVELS
const VALID_CURRENCIES: string[] = CURRENCIES
const VALID_SOURCES: string[] = ['CONTRIBUTOR', 'SCRAPED', 'AI_INFERRED']

export interface ValidationError {
  field: string | null
  message: string
}

/**
 * Validate a normalized record against the integration contract.
 * Returns the validated record on success, or a rejection on failure.
 *
 * This is the TalentDash equivalent of:
 *   record = SalaryRecord(**raw_dict)
 *   record.model_validate(record)
 */
export function validateRecord(
  normalized: NormalizedRecord,
  rawInput: Record<string, unknown>
): { ok: true; record: ValidatedRecord } | { ok: false; rejection: RejectionRecord } {
  const errors: ValidationError[] = []

  // 1. Company name must be at least 2 chars after normalization
  if (!normalized.company || normalized.company.trim().length < 2) {
    errors.push({ field: 'company', message: `Company name must be at least 2 characters after normalization. Got: "${normalized.company}"` })
  }

  // 2. Role must be present
  if (!normalized.role || normalized.role.trim().length === 0) {
    errors.push({ field: 'role', message: 'Role is required' })
  }

  // 3. Level must be a valid enum value
  if (!normalized.level || !VALID_LEVELS.includes(normalized.level)) {
    errors.push({ field: 'level', message: `Level must be one of: ${VALID_LEVELS.join(', ')}. Got: "${normalized.level}"` })
  }

  // 4. Location must be present
  if (!normalized.location || normalized.location.trim().length === 0) {
    errors.push({ field: 'location', message: 'Location is required' })
  }

  // 5. Currency must be valid
  if (!normalized.currency || !VALID_CURRENCIES.includes(normalized.currency)) {
    errors.push({ field: 'currency', message: `Currency must be one of: ${VALID_CURRENCIES.join(', ')}. Got: "${normalized.currency}"` })
  }

  // 6. experience_years must be > 0 and < 51
  if (normalized.experience_years === null || normalized.experience_years === undefined || isNaN(normalized.experience_years)) {
    errors.push({ field: 'experience_years', message: 'experience_years is required and must be a number' })
  } else if (!Number.isInteger(normalized.experience_years) || normalized.experience_years < 0 || normalized.experience_years >= 51) {
    errors.push({ field: 'experience_years', message: `experience_years must be between 0 and 50. Got: ${normalized.experience_years}` })
  }

  // 7. base_salary must be > 0
  if (normalized.base_salary === null || normalized.base_salary === undefined || isNaN(normalized.base_salary)) {
    errors.push({ field: 'base_salary', message: 'base_salary is required and must be a number' })
  } else if (normalized.base_salary <= 0) {
    errors.push({ field: 'base_salary', message: `base_salary must be a positive number. Got: ${normalized.base_salary}` })
  }

  // 8. source must be valid
  if (!normalized.source || !VALID_SOURCES.includes(normalized.source)) {
    errors.push({ field: 'source', message: `Source must be one of: ${VALID_SOURCES.join(', ')}. Got: "${normalized.source}"` })
  }

  // 9. confidence_score must be 0.0–1.0
  const cs = normalized.confidence_score
  if (cs === null || cs === undefined || isNaN(cs) || cs < 0 || cs > 1) {
    errors.push({ field: 'confidence_score', message: `confidence_score must be between 0.0 and 1.0. Got: ${cs}` })
  }

  // If there are errors, this record is rejected
  if (errors.length > 0) {
    return {
      ok: false,
      rejection: {
        raw_input: rawInput,
        stage: 'VALIDATION',
        reason: errors.map(e => `${e.field}: ${e.message}`).join('; '),
        field: errors[0].field ?? undefined,
        rejected_at: new Date().toISOString(),
      },
    }
  }

  // All checks passed — build the validated record
  const bonus = normalized.bonus ?? 0
  const stock = normalized.stock ?? 0

  return {
    ok: true,
    record: {
      company: normalized.company,
      role: normalized.role,
      level: normalized.level as LevelEnum,
      location: normalized.location,
      currency: normalized.currency as CurrencyEnum,
      experience_years: normalized.experience_years as number,
      base_salary: normalized.base_salary as number,
      bonus,
      stock,
      total_compensation: (normalized.base_salary as number) + bonus + stock,
      source: normalized.source as SourceEnum,
      confidence_score: normalized.confidence_score,
    },
  }
}

/**
 * Write a rejection record to the JSONL log.
 * Creates the directory if it doesn't exist.
 */
export function appendRejectionLog(rejection: RejectionRecord, logPath: string): void {
  const dir = path.dirname(logPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.appendFileSync(logPath, JSON.stringify(rejection) + '\n', 'utf-8')
}

/**
 * Read all rejection records from a JSONL log.
 */
export function readRejectionLog(logPath: string): RejectionRecord[] {
  if (!fs.existsSync(logPath)) return []
  const content = fs.readFileSync(logPath, 'utf-8')
  return content
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => JSON.parse(line) as RejectionRecord)
}
