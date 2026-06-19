/**
 * TalentDash Data Pipeline Orchestrator.
 *
 * The pipeline flow:
 *   1. Read raw scraped records (from file or array)
 *   2. Normalize each record (company, salary, level, experience)
 *   3. Validate each normalized record (Pydantic-style enforcement)
 *   4. Write validated records to output JSON
 *   5. Write rejection log to JSONL
 *   6. Optionally POST to /api/ingest-salary
 *   7. Generate and print quality report
 */

import * as fs from 'fs'
import * as path from 'path'
import { normalizeRecord } from './normalizer'
import { validateRecord, appendRejectionLog } from './validator'
import { generateQualityReport, printQualityReport } from './quality-report'
import type { RawScrapedRecord, NormalizedRecord, ValidatedRecord, RejectionRecord, PipelineRunReport } from './types'

export interface PipelineConfig {
  /** Output directory for pipeline artifacts. */
  outputDir: string
  /** Whether to attempt POST to the ingest API. */
  enableIngest?: boolean
  /** Base URL of the TalentDash backend (for ingest POST). */
  backendUrl?: string
  /** Filename for the rejection JSONL log. */
  rejectionLogName?: string
  /** Filename for the raw records output. */
  rawOutputName?: string
  /** Filename for the normalized/validated records output. */
  normalizedOutputName?: string
}

const DEFAULT_CONFIG: PipelineConfig = {
  outputDir: path.resolve(process.cwd(), 'pipeline-output'),
  enableIngest: false,
  backendUrl: 'http://localhost:3000',
  rejectionLogName: 'rejections.jsonl',
  rawOutputName: 'raw-records.json',
  normalizedOutputName: 'normalized-records.json',
}

/**
 * Run the full data pipeline on a set of raw records.
 *
 * @param rawRecords - Array of raw scraped records
 * @param config - Pipeline configuration
 * @returns A quality report with all results
 */
export async function runPipeline(
  rawRecords: RawScrapedRecord[] | Record<string, unknown>[],
  config: Partial<PipelineConfig> = {}
): Promise<PipelineRunReport> {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  // Ensure output dir exists
  if (!fs.existsSync(cfg.outputDir)) {
    fs.mkdirSync(cfg.outputDir, { recursive: true })
  }

  const rawOutputPath = path.join(cfg.outputDir, cfg.rawOutputName!)
  const normalizedOutputPath = path.join(cfg.outputDir, cfg.normalizedOutputName!)
  const rejectionLogPath = path.join(cfg.outputDir, cfg.rejectionLogName!)

  const validatedRecords: ValidatedRecord[] = []
  const normalizedRecords: NormalizedRecord[] = []
  const rejections: RejectionRecord[] = []
  /** Tracks which raw record index maps to which validated record index. */
  const rawToValidated: Map<number, number> = new Map()

  // Ensure raw records have the expected shape
  const typedRecords = (rawRecords as Record<string, unknown>[]).map(r => ({
    raw_company: String(r.raw_company || r.company || ''),
    raw_role: String(r.raw_role || r.role || ''),
    raw_salary_text: String(r.raw_salary_text || r.salary_text || ''),
    raw_location: String(r.raw_location || r.location || ''),
    raw_experience: String(r.raw_experience || r.experience || ''),
  }))

  console.log(`\n🚀 Pipeline started — ${typedRecords.length} raw records to process\n`)

  // ── Stage 1: Normalize ──
  console.log('Stage 1: Normalizing records...')
  const normalizedAtRawIndex: Map<number, number> = new Map() // rawIdx → normalizedIdx
  for (let i = 0; i < typedRecords.length; i++) {
    const raw = typedRecords[i]
    const result = normalizeRecord(raw)

    if (result.ok) {
      normalizedAtRawIndex.set(i, normalizedRecords.length)
      normalizedRecords.push(result.record)
    } else {
      rejections.push(result.rejection)
      appendRejectionLog(result.rejection, rejectionLogPath)
      console.log(`  ⚠️  Record ${i + 1}: Normalization rejected — ${result.rejection.reason.slice(0, 120)}`)
    }
  }

  const normalizationPassed = normalizedRecords.length
  const normalizationRejected = typedRecords.length - normalizationPassed
  console.log(`  ✓ ${normalizationPassed} passed, ${normalizationRejected} rejected\n`)

  // ── Stage 2: Validate ──
  console.log('Stage 2: Validating normalized records...')
  for (const [rawIdx, normIdx] of normalizedAtRawIndex) {
    const normalized = normalizedRecords[normIdx]
    const raw = typedRecords[rawIdx]
    const result = validateRecord(normalized, raw as unknown as Record<string, unknown>)

    if (result.ok) {
      rawToValidated.set(rawIdx, validatedRecords.length)
      validatedRecords.push(result.record)
    } else {
      rejections.push(result.rejection)
      appendRejectionLog(result.rejection, rejectionLogPath)
      console.log(`  ⚠️  Record ${rawIdx + 1}: Validation rejected — ${result.rejection.reason.slice(0, 120)}`)
    }
  }

  const validationPassed = validatedRecords.length
  const validationRejected = normalizationPassed - validationPassed
  console.log(`  ✓ ${validationPassed} passed, ${validationRejected} rejected\n`)

  // ── Stage 3: Output ──
  console.log('Stage 3: Writing output files...')

  // Write raw records
  fs.writeFileSync(rawOutputPath, JSON.stringify(typedRecords, null, 2), 'utf-8')
  console.log(`  ✓ Raw records written to ${rawOutputPath}`)

  // Write normalized records
  fs.writeFileSync(normalizedOutputPath, JSON.stringify(validatedRecords, null, 2), 'utf-8')
  console.log(`  ✓ Validated records written to ${normalizedOutputPath}`)

  // ── Stage 4: Ingest (optional) ──
  let storedSuccessfully = 0
  if (cfg.enableIngest && cfg.backendUrl) {
    console.log('\nStage 4: Ingesting to API...')
    for (let i = 0; i < validatedRecords.length; i++) {
      const record = validatedRecords[i]
      try {
        const res = await fetch(`${cfg.backendUrl}/api/ingest-salary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        })

        if (res.ok) {
          storedSuccessfully++
        } else {
          const err = await res.json().catch(() => ({}))
          console.log(`  ⚠️  Ingest failed for record ${i + 1}: ${err.message || res.statusText}`)
        }
      } catch (err) {
        console.log(`  ⚠️  Ingest error for record ${i + 1}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    console.log(`  ✓ ${storedSuccessfully}/${validatedRecords.length} records ingested`)
  } else {
    console.log('\nStage 4: Skipped (ingest disabled). Set enableIngest: true to POST to the API.')
    storedSuccessfully = validationPassed // count as stored since files were written
  }

  // Build aligned samples: first 5 raw records with their validated counterpart (or null)
  const sampleCount = Math.min(5, typedRecords.length)
  const alignedSamples: Array<{ raw: Record<string, unknown>; normalized: ValidatedRecord | null }> = []
  for (let i = 0; i < sampleCount; i++) {
    const raw = typedRecords[i] as unknown as Record<string, unknown>
    const validatedIdx = rawToValidated.has(i) ? rawToValidated.get(i)! : -1
    const normalized = validatedIdx >= 0 && validatedIdx < validatedRecords.length ? validatedRecords[validatedIdx] : null
    alignedSamples.push({ raw, normalized })
  }

  // ── Stage 5: Quality Report ──
  const report = generateQualityReport({
    totalRaw: typedRecords.length,
    normalizationPassed,
    normalizationRejected,
    validationPassed,
    validationRejected,
    storedSuccessfully,
    rejections,
    validatedRecords,
    rawRecords: typedRecords,
    samples: alignedSamples,
    rawOutputPath,
    normalizedOutputPath,
    rejectionLogPath,
  })

  printQualityReport(report)

  return report
}
