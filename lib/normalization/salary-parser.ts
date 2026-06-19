/**
 * Parse raw salary text (e.g. "18–22 LPA", "₹42,00,000", "$150k") into structured numbers.
 *
 * Handles:
 *   - Indian format: "18–22 LPA", "₹18 LPA", "₹1.5 Cr"
 *   - Mixed-unit ranges: "₹80 L – 1 Cr" (80 Lakh to 1 Crore)
 *   - US format: "$150,000", "$150k", "150k"
 *   - Ranges → midpoint
 *   - Annual vs monthly → annual
 */

/** Result of parsing a salary text. */
export interface SalaryParseResult {
  base_midpoint: number
  base_min: number | null
  base_max: number | null
  currency: string
  is_range: boolean
}

/** Known currency indicators and their ISO codes. */
const CURRENCY_INDICATORS: Record<string, string> = {
  '₹': 'INR',
  'rs': 'INR',
  'rs.': 'INR',
  'inr': 'INR',
  '$': 'USD',
  'usd': 'USD',
  '€': 'EUR',
  'eur': 'EUR',
  '£': 'GBP',
  'gbp': 'GBP',
}

/** Resolve unit abbreviations to their multiplier (annualised rupees). */
function resolveUnit(unit: string): number | null {
  switch (unit.toLowerCase()) {
    case 'k': return 1000
    case 'lpa':
    case 'lakh':
    case 'l': return 100000
    case 'crore':
    case 'cr': return 10000000
    default: return null
  }
}

/**
 * Detect currency from a salary text string.
 */
function detectCurrency(text: string): string {
  const lower = text.toLowerCase().trim()
  for (const [indicator, currency] of Object.entries(CURRENCY_INDICATORS)) {
    if (lower.startsWith(indicator) || lower.includes(` ${indicator}`) || lower.endsWith(indicator)) {
      return currency
    }
  }
  return 'INR' // default for India-focused data
}

/**
 * Parse a single "value [unit]" token (e.g. "80 L", "1 Cr", "150k", "42,00,000").
 * Returns the amount in rupees (annualised).
 */
function parseSingleToken(token: string): number | null {
  token = token.trim()
  if (!token) return null

  // Try "value unit" pattern: "80 L", "1.5 Cr", "150k"
  const unitMatch = token.match(/^([\d,.]+)\s*(lpa|lakh|crore|cr|k|l|pa|per\s+annum|annually)?$/i)
  if (unitMatch) {
    const value = parseIndianNumber(unitMatch[1])
    const unit = (unitMatch[2] || '').trim()
    if (value === null) return null
    const multiplier = unit ? (resolveUnit(unit) || 1) : 1
    return value * multiplier
  }

  // Plain number with Indian/US formatting
  const num = parseIndianNumber(token)
  if (num !== null) return num

  return null
}

/**
 * Parse an Indian-format salary amount string to a number (in rupees, annualised).
 *
 * Examples:
 *   "18 LPA" → 1800000
 *   "18–22 LPA" → midpoint: 2000000
 *   "₹42,00,000" → 4200000
 *   "₹1.5 Cr" → 15000000
 *   "₹80 L – 1 Cr" → midpoint: 9000000
 *   "₹85 K" → 85000
 *   "$150,000" → 150000
 *   "$150k" → 150000
 */
export function parseSalaryText(text: string): SalaryParseResult | null {
  if (!text || text.trim().length === 0) return null

  const cleaned = text.trim()
  const currency = detectCurrency(cleaned)

  // Strip currency symbols and common prefixes for numeric parsing
  const numeric = cleaned
    .replace(/[₹$€£]/g, '')
    .replace(/^rs\.?\s*/i, '')
    .replace(/^(inr|usd|eur|gbp)\s*/i, '')
    .trim()

  // ── Pattern 1a: Explicit unit range: "18–25 LPA", "1–1.5 Cr" ──
  // Must be checked BEFORE the generic dash split so the unit applies to both sides.
  const unitRangeMatch = numeric.match(/^([\d,.]+)\s*(?:–|-|to)\s*([\d,.]+)\s+(lpa|lakh|crore|cr|k|l|pa|per\s+annum|annually)$/i)
  if (unitRangeMatch) {
    const min = parseIndianNumber(unitRangeMatch[1])
    const max = parseIndianNumber(unitRangeMatch[2])
    const unit = unitRangeMatch[3].toLowerCase()
    if (min !== null && max !== null) {
      const multiplier = resolveUnit(unit) || 1
      return {
        base_min: min * multiplier,
        base_max: max * multiplier,
        base_midpoint: Math.round((min + max) / 2 * multiplier),
        currency,
        is_range: true,
      }
    }
  }

  // ── Pattern 1b: Mixed-unit range "80 L – 1 Cr", "18 L – 25 L" ──
  // Split on en-dash/hyphen, parse each side independently
  const dashSplit = numeric.split(/\s*(?:–|-|to)\s*/).filter(Boolean)
  if (dashSplit.length === 2) {
    const left = parseSingleToken(dashSplit[0])
    const right = parseSingleToken(dashSplit[1])
    if (left !== null && right !== null) {
      const min = Math.min(left, right)
      const max = Math.max(left, right)
      return {
        base_min: min,
        base_max: max,
        base_midpoint: Math.round((min + max) / 2),
        currency,
        is_range: true,
      }
    }
  }

  // ── Pattern 2: Single value with unit ──
  const singleValueMatch = numeric.match(/^([\d,.]+)\s*(lpa|lakh|crore|cr|k|l|pa|per\s+annum|annually)?\s*$/i)
  if (singleValueMatch) {
    const value = parseIndianNumber(singleValueMatch[1])
    const unit = (singleValueMatch[2] || '').trim().toLowerCase()
    if (value !== null) {
      const multiplier = unit ? (resolveUnit(unit) || 1) : 1
      const annualized = value * multiplier
      return {
        base_min: annualized,
        base_max: annualized,
        base_midpoint: annualized,
        currency,
        is_range: false,
      }
    }
  }

  // ── Pattern 3: Standard number (with commas) ──
  const standardMatch = numeric.match(/^([\d,]+\.?\d*)\s*(?:per\s+month|pm|monthly)?\s*$/i)
  if (standardMatch) {
    let value = parseIndianNumber(standardMatch[1])
    if (value !== null) {
      const isMonthly = /per\s+month|pm|monthly/i.test(numeric)
      if (isMonthly) value = value * 12
      return {
        base_min: value,
        base_max: value,
        base_midpoint: value,
        currency,
        is_range: false,
      }
    }
  }

  // ── Pattern 4: USD "k" format: "150k" → 150000 ──
  const usdKMatch = numeric.match(/^([\d,.]+)k$/i)
  if (usdKMatch) {
    const value = parseIndianNumber(usdKMatch[1])
    if (value !== null) {
      const annualized = value * 1000
      return {
        base_min: annualized,
        base_max: annualized,
        base_midpoint: annualized,
        currency,
        is_range: false,
      }
    }
  }

  // ── Pattern 5: Range without unit, "18–25" → assumed LPA in India ──
  const rangeMatch = numeric.match(/^([\d,.]+)\s*(?:–|-|to)\s*([\d,.]+)$/)
  if (rangeMatch) {
    const min = parseIndianNumber(rangeMatch[1])
    const max = parseIndianNumber(rangeMatch[2])
    if (min !== null && max !== null) {
      // If both < 1000, likely lakhs; otherwise already in rupees
      const multiplier = (max < 1000) ? 100000 : 1
      return {
        base_min: min * multiplier,
        base_max: max * multiplier,
        base_midpoint: Math.round((min + max) / 2 * multiplier),
        currency,
        is_range: true,
      }
    }
  }

  return null
}

/**
 * Parse an Indian- or US-formatted number string.
 * "42,00,000" → 4200000
 * "150,000" → 150000
 * "18.5" → 18.5
 * "1,50,00,000" → 15000000
 */
function parseIndianNumber(str: string): number | null {
  if (!str) return null

  // Remove all commas first
  const cleaned = str.replace(/,/g, '').trim()

  const num = parseFloat(cleaned)
  if (isNaN(num)) return null

  return num
}

/**
 * Parse experience text like "5+ years", "3-5 years", "fresher" to years.
 */
export function parseExperienceText(text: string): number | null {
  if (!text || text.trim().length === 0) return null

  const cleaned = text.toLowerCase().trim()

  // Fresher / entry level
  if (/^(fresher|entry\s*level|graduate|trainee|0\s*years?)$/i.test(cleaned)) {
    return 0
  }

  // Range: "3-5 years", "3 – 5 yrs"
  const rangeMatch = cleaned.match(/(\d+)\s*(?:–|-|to)\s*(\d+)\s*(?:yrs?|years?)/i)
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10)
    const max = parseInt(rangeMatch[2], 10)
    if (!isNaN(min) && !isNaN(max)) {
      return Math.round((min + max) / 2)
    }
  }

  // X+ years: "5+ years"
  const plusMatch = cleaned.match(/(\d+)\s*\+\s*(?:yrs?|years?)/i)
  if (plusMatch) {
    const val = parseInt(plusMatch[1], 10)
    if (!isNaN(val)) return val + 2 // conservative bump for "+"
  }

  // Plain number: "5 years", "5 yrs"
  const plainMatch = cleaned.match(/(\d+)\s*(?:yrs?|years?)/i)
  if (plainMatch) {
    const val = parseInt(plainMatch[1], 10)
    if (!isNaN(val)) return val
  }

  // Just a number (assumed years)
  const justNumber = cleaned.match(/^(\d+)$/)
  if (justNumber) {
    const val = parseInt(justNumber[1], 10)
    if (!isNaN(val)) return val
  }

  return null
}
