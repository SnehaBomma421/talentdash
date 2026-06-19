import { PrismaClient, $Enums } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import mockData from '../lib/mock-data'

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? ''
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

/**
 * Normalise company name: lowercase + trim, strip common suffixes.
 */
function normaliseCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(pvt|ltd|inc|llc|india|technologies|web services|\.com)\b\.?/gi, '')
    .trim()
}

/**
 * Convert a name to a URL-safe slug.
 */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Company metadata: industry, headquarters, founded_year, headcount_range
const COMPANY_META: Record<string, { industry: string; headquarters: string; founded_year: number; headcount_range: string }> = {
  google: { industry: 'Internet & Technology', headquarters: 'Bengaluru, India', founded_year: 2004, headcount_range: '10,000+' },
  amazon: { industry: 'E-Commerce & Technology', headquarters: 'Bengaluru, India', founded_year: 2004, headcount_range: '10,000+' },
  meta: { industry: 'Social Media & Technology', headquarters: 'Bengaluru, India', founded_year: 2010, headcount_range: '1,000–10,000' },
  microsoft: { industry: 'Software & Technology', headquarters: 'Hyderabad, India', founded_year: 1998, headcount_range: '10,000+' },
  flipkart: { industry: 'E-Commerce', headquarters: 'Bengaluru, India', founded_year: 2007, headcount_range: '10,000+' },
  meesho: { industry: 'E-Commerce', headquarters: 'Bengaluru, India', founded_year: 2015, headcount_range: '1,000–10,000' },
  nvidia: { industry: 'Semiconductors & AI', headquarters: 'Bengaluru, India', founded_year: 1999, headcount_range: '1,000–10,000' },
  tcs: { industry: 'IT Services & Consulting', headquarters: 'Mumbai, India', founded_year: 1968, headcount_range: '100,000+' },
  infosys: { industry: 'IT Services & Consulting', headquarters: 'Bengaluru, India', founded_year: 1981, headcount_range: '100,000+' },
  wipro: { industry: 'IT Services & Consulting', headquarters: 'Bengaluru, India', founded_year: 1945, headcount_range: '100,000+' },
  razorpay: { industry: 'Fintech', headquarters: 'Bengaluru, India', founded_year: 2014, headcount_range: '1,000–10,000' },
  zepto: { industry: 'Quick Commerce', headquarters: 'Mumbai, India', founded_year: 2021, headcount_range: '1,000–10,000' },
}

async function main() {
  console.log('Seeding database...')

  let companyCount = 0
  let salaryCount = 0

  for (const record of mockData) {
    const normalized_name = normaliseCompanyName(record.company)

    // Derive display name (title case the original)
    const displayName = record.company.trim()

    // Derive slug from normalized_name
    const slug = toSlug(normalized_name)

    // Look up company metadata
    const meta = COMPANY_META[slug]

    // Upsert company by normalized_name
    const company = await prisma.company.upsert({
      where: { normalized_name },
      update: {
        ...(meta ? { industry: meta.industry, headquarters: meta.headquarters, founded_year: meta.founded_year, headcount_range: meta.headcount_range } : {}),
      },
      create: {
        name: displayName,
        slug,
        normalized_name,
        ...(meta ? { industry: meta.industry, headquarters: meta.headquarters, founded_year: meta.founded_year, headcount_range: meta.headcount_range } : {}),
      },
    })

    // Compute total_compensation server-side — strip any client value
    const total_compensation = record.base_salary + (record.bonus ?? 0) + (record.stock ?? 0)

    // Check for duplicates within 48 hours (loose check — within 10% base salary)
    const existing = await prisma.salary.findFirst({
      where: {
        company_id: company.id,
        role: record.role,
        level: record.level as $Enums.Level,
        location: record.location,
        base_salary: {
          gte: Math.round(record.base_salary * 0.9),
          lte: Math.round(record.base_salary * 1.1),
        },
      },
    })

    if (existing) {
      // Skip duplicate
      continue
    }

    await prisma.salary.create({
      data: {
        company_id: company.id,
        role: record.role,
        level: record.level as $Enums.Level,
        location: record.location,
        currency: record.currency as $Enums.Currency,
        experience_years: record.experience_years,
        base_salary: record.base_salary,
        bonus: record.bonus ?? 0,
        stock: record.stock ?? 0,
        total_compensation,
        source: record.source as $Enums.Source,
        confidence_score: record.confidence_score,
      },
    })

    salaryCount++
  }

  // Count unique companies
  const companies = await prisma.company.findMany()
  companyCount = companies.length

  console.log(`Seeded ${companyCount} companies, ${salaryCount} salary records`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
