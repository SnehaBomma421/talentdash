import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializeSalary } from '@/lib/salary-utils'
import { revalidatePath } from 'next/cache'

const VALID_LEVELS = ['L3','L4','L5','L6','SDE_I','SDE_II','SDE_III','STAFF','PRINCIPAL','IC4','IC5'] as const
const VALID_CURRENCIES = ['INR','USD','GBP','EUR'] as const
const VALID_SOURCES = ['CONTRIBUTOR','SCRAPED','AI_INFERRED'] as const

interface ValidationError {
  error: true
  field: string
  message: string
}

function validatePayload(body: Record<string, unknown>): ValidationError | null {
  // Required fields
  const required = ['company', 'role', 'level', 'location', 'currency', 'experience_years', 'base_salary', 'source', 'confidence_score']
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return { error: true, field, message: `${field} is required` }
    }
  }

  // Level validation
  const level = body.level as string
  if (!(VALID_LEVELS as readonly string[]).includes(level)) {
    return { error: true, field: 'level', message: `Invalid level "${level}". Must be one of: ${VALID_LEVELS.join(', ')}` }
  }

  // Currency validation
  const currency = body.currency as string
  if (!(VALID_CURRENCIES as readonly string[]).includes(currency)) {
    return { error: true, field: 'currency', message: `Invalid currency "${currency}". Must be one of: ${VALID_CURRENCIES.join(', ')}` }
  }

  // Source validation
  const source = body.source as string
  if (!(VALID_SOURCES as readonly string[]).includes(source)) {
    return { error: true, field: 'source', message: `Invalid source "${source}". Must be one of: ${VALID_SOURCES.join(', ')}` }
  }

  // experience_years > 0 AND < 51
  const expYears = Number(body.experience_years)
  if (!Number.isInteger(expYears) || expYears <= 0 || expYears >= 51) {
    return { error: true, field: 'experience_years', message: 'experience_years must be between 1 and 50' }
  }

  // base_salary > 0
  const baseSalary = Number(body.base_salary)
  if (isNaN(baseSalary) || baseSalary <= 0) {
    return { error: true, field: 'base_salary', message: 'base_salary must be a positive number' }
  }

  // confidence_score between 0.0 and 1.0
  const confidenceScore = Number(body.confidence_score)
  if (isNaN(confidenceScore) || confidenceScore < 0 || confidenceScore > 1) {
    return { error: true, field: 'confidence_score', message: 'confidence_score must be between 0.0 and 1.0' }
  }

  return null
}

function normaliseCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(pvt|ltd|inc|llc|india|technologies|web services|\.com)\b\.?/gi, '')
    .trim()
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate payload
  const validationError = validatePayload(body)
  if (validationError) {
    return NextResponse.json(validationError, {
      status: 400,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  // Normalise company name
  const normalized_name = normaliseCompanyName(body.company)

  // Upsert Company
  const company = await prisma.company.upsert({
    where: { normalized_name },
    update: {},
    create: {
      name: body.company.trim(),
      slug: toSlug(normalized_name),
      normalized_name,
    },
  })

  // Compute total_compensation server-side — strip any client-submitted value
  const total_compensation = Number(body.base_salary) + (Number(body.bonus ?? 0)) + (Number(body.stock ?? 0))

  // Duplicate check: same company_id + role + level + location within 48 hours,
  // base_salary within 10%
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
  const existing = await prisma.salary.findFirst({
    where: {
      company_id: company.id,
      role: body.role,
      level: body.level,
      location: body.location,
      base_salary: {
        gte: Math.round(Number(body.base_salary) * 0.9),
        lte: Math.round(Number(body.base_salary) * 1.1),
      },
      submitted_at: { gte: fortyEightHoursAgo },
    },
  })

  if (existing) {
    return NextResponse.json(
      { error: true, message: 'Duplicate record found. A similar salary record already exists for this role at this company.' },
      { status: 409, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // Create salary record
  const salary = await prisma.salary.create({
    data: {
      company_id: company.id,
      role: body.role,
      level: body.level,
      location: body.location,
      currency: body.currency,
      experience_years: Number(body.experience_years),
      base_salary: Number(body.base_salary),
      bonus: Number(body.bonus ?? 0),
      stock: Number(body.stock ?? 0),
      total_compensation,
      source: body.source,
      confidence_score: Number(body.confidence_score),
      is_verified: false,
    },
    include: { company: true },
  })

  // Trigger ISR revalidation
  revalidatePath('/salaries')
  revalidatePath(`/companies/${company.slug}`)

  return NextResponse.json(
    { ...serializeSalary(salary) },
    { status: 201, headers: { 'Cache-Control': 'no-store' } }
  )
}
