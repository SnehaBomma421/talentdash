/**
 * Level Mapping System.
 *
 * Maps raw job titles and experience descriptions to the TalentDash level enum.
 *
 * Two-layer system:
 * Layer 1 — Rule-based: mapping dict for known titles
 * Layer 2 — Heuristic fallback: based on experience years and title keywords
 *
 * Confidence scoring:
 *   - Rule-based exact match → confidence 0.85+
 *   - Heuristic match → confidence 0.6–0.8
 *   - No match → confidence 0.4, flagged for review
 */

import type { LevelEnum } from '../../types'

export interface LevelMappingResult {
  level: LevelEnum | null
  confidence: number
  method: 'rule_exact' | 'rule_keyword' | 'experience_heuristic' | 'ambiguous' | 'no_match'
  ambiguity_note?: string
}

/** Exact title → level mapping (rule-based, highest confidence). */
const EXACT_TITLE_MAP: Record<string, LevelEnum> = {
  // Standardized level titles
  'software engineer l3': 'L3',
  'software engineer l4': 'L4',
  'software engineer l5': 'L5',
  'software engineer l6': 'L6',
  'sde l3': 'L3',
  'sde l4': 'L4',
  'sde l5': 'L5',
  'sde l6': 'L6',

  // Amazon-style
  'sde-i': 'SDE_I',
  'sde-1': 'SDE_I',
  'sde i': 'SDE_I',
  'sde 1': 'SDE_I',
  'sde-ii': 'SDE_II',
  'sde-2': 'SDE_II',
  'sde ii': 'SDE_II',
  'sde 2': 'SDE_II',
  'sde-iii': 'SDE_III',
  'sde-3': 'SDE_III',
  'sde iii': 'SDE_III',
  'sde 3': 'SDE_III',

  // Microsoft-style
  'software engineer 2': 'L4',
  'software engineer ii': 'L4',
  'software engineer 3': 'L5',
  'software engineer iii': 'L5',
  'senior software engineer': 'L5',
  'senior sde': 'L5',
  'staff engineer': 'STAFF',
  'staff software engineer': 'STAFF',
  'principal engineer': 'PRINCIPAL',
  'principal software engineer': 'PRINCIPAL',
  'senior staff engineer': 'PRINCIPAL',

  // IC (individual contributor) levels
  'ic3': 'L3',
  'ic4': 'IC4',
  'ic5': 'IC5',

  // Common roles that map directly
  'junior software engineer': 'L3',
  'associate software engineer': 'L3',
  'graduate software engineer': 'L3',
  'software development engineer i': 'SDE_I',
  'software development engineer 1': 'SDE_I',
  'software development engineer ii': 'SDE_II',
  'software development engineer 2': 'SDE_II',
  'software development engineer iii': 'SDE_III',
  'software development engineer 3': 'SDE_III',
  'lead engineer': 'L6',
  'senior staff software engineer': 'PRINCIPAL',
  'distinguished engineer': 'PRINCIPAL',
}

/** Keyword → level hints for heuristic matching. */
const KEYWORD_LEVEL_HINTS: Array<{ keywords: RegExp; level: LevelEnum; confidence: number }> = [
  { keywords: /\b(principal|distinguished|fellow|architect|director)\b/i, level: 'PRINCIPAL', confidence: 0.7 },
  { keywords: /\bstaff\b/i, level: 'STAFF', confidence: 0.7 },
  { keywords: /\b(lead|senior\s+staff)\b/i, level: 'L6', confidence: 0.6 },
  { keywords: /\bsenior\b/i, level: 'L5', confidence: 0.6 },
  { keywords: /\b(mid.level|midlevel|intermediate)\b/i, level: 'L4', confidence: 0.6 },
  { keywords: /\b(junior|associate|graduate|fresher|entry)\b/i, level: 'L3', confidence: 0.7 },
  { keywords: /\bsde[-\s]?(iii|3)\b/i, level: 'SDE_III', confidence: 0.85 },
  { keywords: /\bsde[-\s]?(ii|2)\b/i, level: 'SDE_II', confidence: 0.85 },
  { keywords: /\bsde[-\s]?(i|1)\b/i, level: 'SDE_I', confidence: 0.85 },
]

/** Experience-based heuristics for level assignment. */
function inferLevelFromExperience(years: number | null): { level: LevelEnum; confidence: number } | null {
  if (years === null) return null

  if (years <= 1) return { level: 'L3', confidence: 0.65 }
  if (years <= 3) return { level: 'L4', confidence: 0.6 }
  if (years <= 6) return { level: 'L5', confidence: 0.55 }
  if (years <= 10) return { level: 'L6', confidence: 0.5 }
  if (years <= 15) return { level: 'STAFF', confidence: 0.5 }
  return { level: 'PRINCIPAL', confidence: 0.5 }
}

/**
 * Map a raw job title to a TalentDash level enum.
 *
 * @param title - Raw job title as extracted from scrape
 * @param experienceYears - Parsed experience years (optional, for heuristic fallback)
 */
export function mapToLevel(title: string, experienceYears?: number | null): LevelMappingResult {
  if (!title || title.trim().length === 0) {
    return { level: null, confidence: 0.4, method: 'no_match', ambiguity_note: 'Empty title' }
  }

  const normalized = title.toLowerCase().trim().replace(/\s+/g, ' ')

  // Layer 1: Exact match (highest confidence)
  if (EXACT_TITLE_MAP[normalized]) {
    return { level: EXACT_TITLE_MAP[normalized], confidence: 0.9, method: 'rule_exact' }
  }

  // Try stripping common prefixes like "software engineer", "data scientist" etc.
  // and match the level suffix
  const levelSuffixMatch = normalized.match(/\b(l[3-6]|ic[3-5]|sde[-\s]?(i{1,3}|1|2|3)|staff|principal)\b/i)
  if (levelSuffixMatch) {
    const suffix = levelSuffixMatch[1].toLowerCase().replace(/\s+/g, '')
    const mapped = EXACT_TITLE_MAP[suffix]
    if (mapped) {
      return { level: mapped, confidence: 0.85, method: 'rule_exact' }
    }
  }

  // Layer 2: Keyword matching
  for (const hint of KEYWORD_LEVEL_HINTS) {
    if (hint.keywords.test(normalized)) {
      return { level: hint.level, confidence: hint.confidence, method: 'rule_keyword' }
    }
  }

  // Layer 2b: If experience is available, use it as a heuristic
  if (experienceYears !== null && experienceYears !== undefined) {
    const expInferred = inferLevelFromExperience(experienceYears)
    if (expInferred) {
      // The word "senior" combined with low experience should still map correctly
      return {
        level: expInferred.level,
        confidence: expInferred.confidence,
        method: 'experience_heuristic',
        ambiguity_note: `Mapped from ${experienceYears} years experience`,
      }
    }
  }

  // Layer 3: No match
  return {
    level: null,
    confidence: 0.4,
    method: 'no_match',
    ambiguity_note: `Could not map title: "${title}"`,
  }
}
