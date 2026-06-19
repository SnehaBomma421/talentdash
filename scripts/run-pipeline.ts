#!/usr/bin/env ts-node
/**
 * TalentDash Data Pipeline — CLI Entry Point.
 *
 * Usage:
 *   npx ts-node scripts/run-pipeline.ts                    # Run with sample data (default)
 *   npx ts-node scripts/run-pipeline.ts --ingest            # Also POST to /api/ingest-salary
 *   npx ts-node scripts/run-pipeline.ts --ingest --url http://localhost:3000
 *   npx ts-node scripts/run-pipeline.ts --help              # Show help
 *
 * Output:
 *   pipeline-output/
 *     raw-records.json          # Raw scraped records (passthrough)
 *     normalized-records.json   # Validated + normalized records ready for storage
 *     rejections.jsonl          # Rejected records with reasons (JSONL)
 */

import * as fs from 'fs'
import * as path from 'path'
import { runPipeline } from '../lib/normalization/pipeline'
import { SAMPLE_RAW_RECORDS, SAMPLE_COUNT } from '../lib/normalization/sample-raw-data'

function showHelp(): void {
  console.log(`
TalentDash Data Pipeline — CLI

Usage:
  npx ts-node scripts/run-pipeline.ts [options]

Options:
  --ingest              Enable POST to /api/ingest-salary after validation
  --url <url>           Backend URL (default: http://localhost:3000)
  --input <path>        Path to a JSON file with raw records (overrides sample data)
  --output <dir>        Output directory (default: ./pipeline-output)
  --help                Show this help message

Examples:
  npx ts-node scripts/run-pipeline.ts
  npx ts-node scripts/run-pipeline.ts --ingest
  npx ts-node scripts/run-pipeline.ts --ingest --url https://talentdash.com
  npx ts-node scripts/run-pipeline.ts --input ./my-scraped-data.json
`)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    showHelp()
    process.exit(0)
  }

  const enableIngest = args.includes('--ingest')
  const urlIndex = args.indexOf('--url')
  const backendUrl = urlIndex >= 0 ? args[urlIndex + 1] : 'http://localhost:3000'
  const inputIndex = args.indexOf('--input')
  const inputPath = inputIndex >= 0 ? args[inputIndex + 1] : null
  const outputIndex = args.indexOf('--output')
  const outputDir = outputIndex >= 0 ? args[outputIndex + 1] : path.resolve(process.cwd(), 'pipeline-output')

  console.log('╔══════════════════════════════════════════════╗')
  console.log('║     TALENTDASH DATA PIPELINE                 ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log(`  Ingest API:   ${enableIngest ? backendUrl : 'DISABLED'}`)
  console.log(`  Output dir:   ${outputDir}`)

  // Load raw records
  let rawRecords: Record<string, unknown>[]

  if (inputPath) {
    console.log(`  Input file:   ${inputPath}`)
    if (!fs.existsSync(inputPath)) {
      console.error(`\n❌ Input file not found: ${inputPath}`)
      process.exit(1)
    }
    const content = fs.readFileSync(inputPath, 'utf-8')
    rawRecords = JSON.parse(content)
    if (!Array.isArray(rawRecords)) {
      console.error('\n❌ Input file must contain a JSON array of records')
      process.exit(1)
    }
    console.log(`  Records:      ${rawRecords.length} (from file)`)
  } else {
    rawRecords = SAMPLE_RAW_RECORDS as unknown as Record<string, unknown>[]
    console.log(`  Records:      ${SAMPLE_COUNT} (from sample data)`)
  }

  console.log('')

  // Run the pipeline
  try {
    await runPipeline(rawRecords, {
      outputDir,
      enableIngest,
      backendUrl,
    })
    console.log('\n✅ Pipeline completed successfully.\n')
  } catch (error) {
    console.error('\n❌ Pipeline failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
