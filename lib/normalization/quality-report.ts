/**
 * Quality report generation for the TalentDash data pipeline.
 *
 * Produces a structured report at the end of each pipeline run with:
 *   - Total records processed
 *   - Pass/fail counts at each stage
 *   - Rejection breakdown by reason
 *   - Null rate per field
 *   - Sample records (raw → normalized side-by-side)
 */

import type { ValidatedRecord, PipelineRunReport, RejectionRecord, RawScrapedRecord } from './types'

export interface QualityReportOptions {
  totalRaw: number
  normalizationPassed: number
  normalizationRejected: number
  validationPassed: number
  validationRejected: number
  storedSuccessfully: number
  rejections: RejectionRecord[]
  validatedRecords: ValidatedRecord[]
  rawRecords: RawScrapedRecord[] | Record<string, unknown>[]
  /** Pre-aligned raw→normalized samples (built by pipeline). */
  samples: Array<{ raw: Record<string, unknown>; normalized: ValidatedRecord | null }>
  rawOutputPath: string
  normalizedOutputPath: string
  rejectionLogPath: string
}

/**
 * Compute the null rate per field across all raw records.
 */
function computeNullRates(rawRecords: Record<string, unknown>[]): Record<string, { total: number; null_count: number; null_rate: string }> {
  if (rawRecords.length === 0) return {}

  const fieldCounts: Record<string, number> = {}
  const nullCounts: Record<string, number> = {}

  for (const record of rawRecords) {
    for (const [key, value] of Object.entries(record)) {
      fieldCounts[key] = (fieldCounts[key] || 0) + 1
      if (value === null || value === undefined || value === '' || value === 'N/A') {
        nullCounts[key] = (nullCounts[key] || 0) + 1
      }
    }
  }

  const result: Record<string, { total: number; null_count: number; null_rate: string }> = {}
  for (const key of Object.keys(fieldCounts)) {
    const total = fieldCounts[key]
    const nullCount = nullCounts[key] || 0
    result[key] = {
      total,
      null_count: nullCount,
      null_rate: `${(nullCount / total * 100).toFixed(1)}%`,
    }
  }

  return result
}

/**
 * Compute rejection breakdown by reason category.
 */
function computeRejectionBreakdown(rejections: RejectionRecord[]): Record<string, number> {
  const breakdown: Record<string, number> = {}

  for (const rejection of rejections) {
    // Categorize by primary error pattern
    let category = 'other'
    const reason = rejection.reason.toLowerCase()
    if (reason.includes('level') || reason.includes('enum')) category = 'invalid_level'
    else if (reason.includes('company') || reason.includes('name')) category = 'invalid_company'
    else if (reason.includes('salary') || reason.includes('base')) category = 'invalid_salary'
    else if (reason.includes('currency')) category = 'invalid_currency'
    else if (reason.includes('experience') || reason.includes('years')) category = 'invalid_experience'
    else if (reason.includes('confidence')) category = 'invalid_confidence'
    else if (reason.includes('source')) category = 'invalid_source'
    else if (reason.includes('role') || reason.includes('location')) category = 'missing_required_field'

    breakdown[category] = (breakdown[category] || 0) + 1
  }

  return breakdown
}

/**
 * Generate a structured quality report for a pipeline run.
 */
export function generateQualityReport(options: QualityReportOptions): PipelineRunReport {
  const rejectionBreakdown = computeRejectionBreakdown(options.rejections)
  const nullRates = computeNullRates(options.rawRecords as Record<string, unknown>[])

  // Use pre-aligned samples passed from the pipeline
  const samples = options.samples

  return {
    started_at: new Date().toISOString(),
    total_raw: options.totalRaw,
    normalization_passed: options.normalizationPassed,
    normalization_rejected: options.normalizationRejected,
    validation_passed: options.validationPassed,
    validation_rejected: options.validationRejected,
    stored_successfully: options.storedSuccessfully,
    rejection_breakdown: rejectionBreakdown,
    null_rate_per_field: nullRates,
    samples,
    raw_output_path: options.rawOutputPath,
    normalized_output_path: options.normalizedOutputPath,
    rejection_log_path: options.rejectionLogPath,
  }
}

/**
 * Print a human-readable quality report to the console.
 */
export function printQualityReport(report: PipelineRunReport): void {
  const border = '='.repeat(60)
  const divider = '-'.repeat(60)

  console.log(`\n${border}`)
  console.log('  TALENTDASH DATA PIPELINE — QUALITY REPORT')
  console.log(`  ${report.started_at}`)
  console.log(border)

  console.log(`\n📊 Pipeline Summary:`)
  console.log(divider)
  console.log(`  Total records scraped:          ${report.total_raw}`)
  console.log(`  Records passed normalization:   ${report.normalization_passed}`)
  console.log(`  Records rejected (norm):        ${report.normalization_rejected}`)
  console.log(`  Records passed validation:      ${report.validation_passed}`)
  console.log(`  Records rejected (validation):  ${report.validation_rejected}`)
  console.log(`  Records stored successfully:    ${report.stored_successfully}`)

  console.log(`\n❌ Rejection Breakdown:`)
  console.log(divider)
  if (Object.keys(report.rejection_breakdown).length === 0) {
    console.log('  No rejections — all records passed.')
  } else {
    for (const [reason, count] of Object.entries(report.rejection_breakdown)) {
      console.log(`  ${reason}: ${count}`)
    }
  }

  console.log(`\n📉 Null Rate Per Field:`)
  console.log(divider)
  if (Object.keys(report.null_rate_per_field).length === 0) {
    console.log('  No data available.')
  } else {
    for (const [field, stats] of Object.entries(report.null_rate_per_field)) {
      console.log(`  ${field.padEnd(20)} ${stats.null_count}/${stats.total} (${stats.null_rate})`)
    }
  }

  if (report.samples.length > 0) {
    console.log(`\n📋 Sample Records (Raw → Normalized):`)
    console.log(divider)
    for (let i = 0; i < report.samples.length; i++) {
      const sample = report.samples[i]
      console.log(`\n  Sample #${i + 1}:`)
      console.log(`  RAW:        ${JSON.stringify(sample.raw).slice(0, 200)}`)
      if (sample.normalized) {
        console.log(`  NORMALIZED: ${JSON.stringify(sample.normalized).slice(0, 200)}`)
      } else {
        console.log(`  NORMALIZED: ❌ Rejected (see rejection log)`)
      }
    }
  }

  console.log(`\n📁 Output Files:`)
  console.log(divider)
  console.log(`  Raw records:        ${report.raw_output_path}`)
  console.log(`  Normalized records: ${report.normalized_output_path}`)
  console.log(`  Rejection log:      ${report.rejection_log_path}`)
  console.log(`\n${border}\n`)
}
