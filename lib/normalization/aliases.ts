/**
 * Company alias lookup table.
 *
 * Two-layer normalization system:
 * Layer 1 — Programmatic rules: lowercase, trim, strip legal suffixes
 * Layer 2 — Alias lookup table: maps known variants to canonical normalized_name
 */

/** Canonical alias map. Every known variant maps to its canonical normalized_name. */
export const COMPANY_ALIASES: Record<string, string> = {
  // Google
  'google': 'google',
  'google india': 'google',
  'google india pvt ltd': 'google',
  'google india private limited': 'google',
  'google inc': 'google',
  'google llc': 'google',
  'google.com': 'google',

  // Amazon
  'amazon': 'amazon',
  'amazon india': 'amazon',
  'amazon india pvt ltd': 'amazon',
  'amazon dev center india': 'amazon',
  'amazon dev center': 'amazon',
  'amazon web services': 'amazon',
  'amazon.com': 'amazon',
  'aws': 'amazon',

  // Meta
  'meta': 'meta',
  'meta india': 'meta',
  'facebook': 'meta',
  'facebook india': 'meta',

  // Microsoft
  'microsoft': 'microsoft',
  'microsoft india': 'microsoft',
  'microsoft india pvt ltd': 'microsoft',
  'microsoft corporation': 'microsoft',

  // Flipkart
  'flipkart': 'flipkart',
  'flipkart india': 'flipkart',
  'flipkart internet pvt ltd': 'flipkart',
  'flipkart internet private limited': 'flipkart',

  // Meesho
  'meesho': 'meesho',
  'meesho india': 'meesho',

  // NVIDIA
  'nvidia': 'nvidia',
  'nvidia india': 'nvidia',
  'nvidia graphics': 'nvidia',
  'nvidia corporation': 'nvidia',

  // TCS (the critical edge case)
  'tcs': 'tcs',
  'tata consultancy services': 'tcs',
  'tata consultancy': 'tcs',
  'tata consulting services': 'tcs',
  'tata consultancy services ltd': 'tcs',
  'tata consultancy services limited': 'tcs',
  'tcs ltd': 'tcs',

  // Infosys
  'infosys': 'infosys',
  'infosys technologies': 'infosys',
  'infosys limited': 'infosys',
  'infosys bpo': 'infosys',

  // Wipro
  'wipro': 'wipro',
  'wipro technologies': 'wipro',
  'wipro limited': 'wipro',
  'wipro pvt ltd': 'wipro',

  // Razorpay
  'razorpay': 'razorpay',
  'razorpay india': 'razorpay',
  'razorpay software pvt ltd': 'razorpay',

  // Zepto
  'zepto': 'zepto',
  'zepto india': 'zepto',
}

/**
 * Suffixes stripped from company names by the programmatic normalizer.
 * Order matters: longer suffixes first to avoid partial matches.
 */
const LEGAL_SUFFIXES = [
  'private limited',
  'pvt ltd',
  'pvt. ltd.',
  'pvt ltd.',
  'pvt. ltd',
  'limited',
  'ltd',
  'incorporated',
  'inc',
  'llc',
  'corp',
  'corporation',
  'technologies',
  'tech',
  'software',
  'services',
  'solutions',
  'consulting',
  'consultancy',
  'labs',
  'group',
  'holdings',
  '.com',
]

/** Strip common legal/business suffixes from a company name. */
function stripSuffixes(name: string): string {
  let cleaned = name
  for (const suffix of LEGAL_SUFFIXES) {
    const regex = new RegExp(`\\b${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b\\.?$`, 'i')
    cleaned = cleaned.replace(regex, '').trim()
  }
  return cleaned
}

/**
 * Normalize a company name to its canonical form.
 *
 * Strategy:
 *   1. Lowercase and trim
 *   2. Replace all whitespace runs with single space
 *   3. Strip geographic suffixes ("india", "bengaluru")
 *   4. Look up FULL name in alias table FIRST (before stripping suffixes)
 *       → This catches "Tata Consultancy Services" → "tcs"
 *   5. If no alias match, strip legal/business suffixes and try alias table again
 *   6. Fallback: slugify the cleaned name
 *
 * @example
 * normalizeCompanyName('Tata Consultancy Services')     // 'tcs'
 * normalizeCompanyName('Google India Pvt. Ltd.')       // 'google'
 * normalizeCompanyName('GOOGLE')                        // 'google'
 * normalizeCompanyName('Amazon Web Services')           // 'amazon'
 * normalizeCompanyName('Infosys BPO')                   // 'infosys'
 * normalizeCompanyName('Flipkart Internet Pvt Ltd')     // 'flipkart'
 */
export function normalizeCompanyName(name: string): { normalized_name: string; display_name: string } {
  if (!name || name.trim().length === 0) {
    return { normalized_name: 'unknown', display_name: 'Unknown' }
  }

  // Step 1: Lowercase and trim
  let cleaned = name.toLowerCase().trim()

  // Step 2: Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ')

  // Step 3: Strip geographic suffixes (india, bengaluru, hyderabad, etc.)
  cleaned = cleaned.replace(/\bindia\b/gi, '').trim()
  cleaned = cleaned.replace(/\b(bengaluru|bangalore|hyderabad|mumbai|pune|delhi|gurgaon|noida|chennai)\b/gi, '').trim()
  cleaned = cleaned.replace(/\s+/g, ' ')

  // Step 4: Try alias lookup with the FULL name (before stripping suffixes).
  // This is critical for names like "Tata Consultancy Services" where the
  // suffixes "consultancy" and "services" are part of the company identity.
  const fullNameMatch = COMPANY_ALIASES[cleaned]
  if (fullNameMatch) {
    return {
      normalized_name: fullNameMatch,
      display_name: capitalizeName(fullNameMatch),
    }
  }

  // Step 5: Strip legal/business suffixes and try alias table again
  cleaned = stripSuffixes(cleaned)

  const strippedMatch = COMPANY_ALIASES[cleaned]
  if (strippedMatch) {
    return {
      normalized_name: strippedMatch,
      display_name: capitalizeName(strippedMatch),
    }
  }

  // Step 6: Fallback — slugify
  const slug = cleaned
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (slug.length < 1) {
    const fallback = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    return { normalized_name: fallback || 'unknown', display_name: name.trim() || 'Unknown' }
  }

  return {
    normalized_name: slug,
    display_name: capitalizeName(slug),
  }
}

/** Title-case a slug or name for display. */
function capitalizeName(name: string): string {
  return name
    .split(/[- ]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Convert a normalized_name to a URL-safe slug.
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
