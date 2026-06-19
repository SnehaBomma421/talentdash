/**
 * Rule-based normalizer for the TalentDash data pipeline.
 *
 * Takes raw scraped records and applies programmatic normalization:
 *   1. Company name → alias lookup
 *   2. Salary text → structured numbers
 *   3. Job title → level enum
 *   4. Experience text → years
 *   5. Location → cleaned city name
 */

import { normalizeCompanyName } from './aliases'
import { parseSalaryText, parseExperienceText } from './salary-parser'
import { mapToLevel } from './level-mapper'
import type { RawScrapedRecord, NormalizedRecord, NormalizationResult } from './types'
import type { SourceEnum } from '../../types'

/**
 * Normalize a single raw scraped record using rule-based methods.
 *
 * This simulates what the LLM normalizer would do, but with deterministic rules.
 * In production, this would be replaced or augmented by an LLM call.
 */
export function normalizeRecord(
  raw: RawScrapedRecord
): NormalizationResult {
  try {
    // 1. Normalize company name
    const companyResult = normalizeCompanyName(raw.raw_company)

    // 2. Parse salary text
    const salaryResult = parseSalaryText(raw.raw_salary_text)

    // 3. Parse experience
    const experienceYears = parseExperienceText(raw.raw_experience)

    // 4. Map level
    const title = raw.raw_role
    const levelResult = mapToLevel(title, experienceYears)

    // 5. Clean location
    const location = cleanLocation(raw.raw_location)

    // 6. Determine currency from salary parse
    const currency = salaryResult?.currency || detectCurrencyFromLocation(location) || 'INR'

    // 7. Compute confidence score
    const confidence = computeConfidence(salaryResult, levelResult, experienceYears)

    const record: NormalizedRecord = {
      company: companyResult.normalized_name,
      role: title.trim(),
      level: levelResult.level,
      location,
      currency,
      experience_years: experienceYears,
      base_salary: salaryResult?.base_midpoint ?? null,
      bonus: null,
      stock: null,
      source: 'SCRAPED' as SourceEnum,
      confidence_score: confidence,
    }

    return { ok: true, record }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      ok: false,
      rejection: {
        raw_input: raw,
        stage: 'NORMALIZATION',
        reason: `Normalization error: ${message}`,
        rejected_at: new Date().toISOString(),
      },
    }
  }
}

/**
 * Clean a raw location string to a normalized city name.
 */
function cleanLocation(raw: string): string {
  if (!raw) return 'Unknown'

  let cleaned = raw.trim()

  // Strip country suffixes
  cleaned = cleaned.replace(/,?\s*(india|IN|India|bharat)$/i, '').trim()

  // Normalize Bengaluru variants
  cleaned = cleaned.replace(/\bbangalore\b/i, 'Bengaluru')

  // Title case
  cleaned = cleaned
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim()

  return cleaned || 'Unknown'
}

/**
 * Detect currency based on location. Simple heuristic:
 * Indian cities → INR, US cities → USD, etc.
 */
function detectCurrencyFromLocation(location: string): string | null {
  const indianCities = ['bengaluru', 'bangalore', 'mumbai', 'hyderabad', 'pune', 'delhi', 'gurgaon', 'noida', 'chennai', 'kolkata', 'ahmedabad']
  const usCities = ['san francisco', 'new york', 'seattle', 'austin', 'sunnyvale', 'palo alto', 'mountain view', 'cupertino', 'los angeles', 'chicago']
  const ukCities = ['london', 'manchester', 'edinburgh']
  const euCities = ['berlin', 'amsterdam', 'dublin', 'paris', 'stockholm']

  const loc = location.toLowerCase()
  if (indianCities.some(c => loc.includes(c))) return 'INR'
  if (usCities.some(c => loc.includes(c))) return 'USD'
  if (ukCities.some(c => loc.includes(c))) return 'GBP'
  if (euCities.some(c => loc.includes(c))) return 'EUR'

  return null
}

/**
 * Compute a confidence score for the normalization.
 * Ranges 0.0–1.0 based on how complete and reliable the data is.
 */
function computeConfidence(
  salaryResult: ReturnType<typeof parseSalaryText>,
  levelResult: ReturnType<typeof mapToLevel>,
  experienceYears: number | null
): number {
  let score = 0.5 // base

  // +0.2 if salary was parsed successfully
  if (salaryResult !== null) score += 0.2

  // +0.15 if level was confidently mapped
  if (levelResult.confidence >= 0.85) score += 0.15
  else if (levelResult.confidence >= 0.6) score += 0.1

  // +0.15 if experience was parsed
  if (experienceYears !== null) score += 0.15

  return Math.min(Math.round(score * 100) / 100, 1.0)
}
