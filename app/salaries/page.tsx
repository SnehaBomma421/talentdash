import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { SalaryTable } from '@/components/features/SalaryTable'
import { FilterBar } from '@/components/features/FilterBar'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { serializeSalary } from '@/lib/salary-utils'
import type { CurrencyEnum, SalaryRecord } from '@/types'
import type { Prisma } from '@prisma/client'

export const metadata = {
  title: 'Software Engineer & Tech Salaries in India | TalentDash',
  description: 'Browse verified salary data for Software Engineers, Product Managers, Data Analysts and more across Google, Amazon, Flipkart and 100+ companies in India.',
  alternates: { canonical: 'https://talentdash.com/salaries' },
  openGraph: {
    title: 'Software Engineer & Tech Salaries in India | TalentDash',
    description: 'Browse verified salary data for tech roles across top companies in India.',
    url: 'https://talentdash.com/salaries',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Software Engineer Salaries — TalentDash',
  description: 'Verified salary data for software engineers in India',
  url: 'https://talentdash.com/salaries',
  creator: { '@type': 'Organization', name: 'TalentDash' },
  temporalCoverage: '2024/2025',
  spatialCoverage: 'India',
}

interface SalariesPageProps {
  searchParams: Promise<{
    company?: string
    role?: string
    level?: string
    location?: string
    currency?: string
    sort?: string
    page?: string
    limit?: string
  }>
}

async function SalariesContent({ searchParams }: SalariesPageProps) {
  const params = await searchParams

  const company = params.company || ''
  const role = params.role || ''
  const levelParam = params.level || ''
  const location = params.location || ''
  const currency = (params.currency || 'INR') as CurrencyEnum
  const sort = params.sort || 'total_comp_desc'
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(params.limit || '25', 10) || 25))

  // Build where clause (mirrors /api/salaries logic)
  const where: Prisma.SalaryWhereInput = {}

  if (company) {
    where.company = { normalized_name: { contains: company.toLowerCase(), mode: 'insensitive' } }
  }
  if (role) {
    where.role = { contains: role, mode: 'insensitive' }
  }
  if (levelParam) {
    const levels = levelParam.split(',').map(l => l.trim()).filter(Boolean)
    if (levels.length > 0) {
      where.level = { in: levels as Prisma.EnumLevelFilter['in'] }
    }
  }
  if (location) {
    where.location = { equals: location, mode: 'insensitive' }
  }
  if (currency) {
    where.currency = currency as Prisma.EnumCurrencyFilter['equals']
  }

  // Build orderBy
  let orderBy: Prisma.SalaryOrderByWithRelationInput | undefined
  switch (sort) {
    case 'total_comp_asc':
      orderBy = { total_compensation: 'asc' }
      break
    case 'company_asc':
      orderBy = { company: { name: 'asc' } }
      break
    case 'company_desc':
      orderBy = { company: { name: 'desc' } }
      break
    case 'role_asc':
      orderBy = { role: 'asc' }
      break
    case 'role_desc':
      orderBy = { role: 'desc' }
      break
    case 'level_asc':
      orderBy = { level: 'asc' }
      break
    case 'level_desc':
      orderBy = { level: 'desc' }
      break
    case 'location_asc':
      orderBy = { location: 'asc' }
      break
    case 'location_desc':
      orderBy = { location: 'desc' }
      break
    case 'base_asc':
      orderBy = { base_salary: 'asc' }
      break
    case 'base_desc':
      orderBy = { base_salary: 'desc' }
      break
    case 'stock_asc':
      orderBy = { stock: 'asc' }
      break
    case 'stock_desc':
      orderBy = { stock: 'desc' }
      break
    case 'experience_asc':
      orderBy = { experience_years: 'asc' }
      break
    case 'experience_desc':
      orderBy = { experience_years: 'desc' }
      break
    case 'date_desc':
      orderBy = { submitted_at: 'desc' }
      break
    default:
      orderBy = { total_compensation: 'desc' }
  }

  // Fetch data directly from Prisma (no fetch to self)
  const [total, salaries] = await Promise.all([
    prisma.salary.count({ where }),
    prisma.salary.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { company: true },
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  // Serialize BigInt/Decimal fields for the component
  const data = salaries.map(s => serializeSalary(s as unknown as Record<string, unknown>)) as unknown as SalaryRecord[]

  // Fetch available roles and locations for filter dropdowns
  const [allRoles, allLocations] = await Promise.all([
    prisma.salary.findMany({
      select: { role: true },
      distinct: ['role'],
      orderBy: { role: 'asc' },
    }),
    prisma.salary.findMany({
      select: { location: true },
      distinct: ['location'],
      orderBy: { location: 'asc' },
    }),
  ])

  const availableRoles = allRoles.map(r => r.role)
  const availableLocations = allLocations.map(l => l.location)

  // Build sort URLs for sortable table headers (preserve all existing filters)
  const sortColumns = ['total_comp', 'company', 'role', 'level', 'location', 'experience', 'base', 'stock']
  const sortableColumns = sortColumns.map(key => {
    const sp = new URLSearchParams()
    if (company) sp.set('company', company)
    if (role) sp.set('role', role)
    if (levelParam) sp.set('level', levelParam)
    if (location) sp.set('location', location)
    if (currency !== 'INR') sp.set('currency', currency)
    // Toggle sort: if current sort is desc for this key, switch to asc
    if (sort === `${key}_desc`) {
      sp.set('sort', `${key}_asc`)
    } else {
      sp.set('sort', `${key}_desc`)
    }
    sp.delete('page')
    return { key, label: key.replace(/_/g, ' '), sortUrl: `/salaries?${sp.toString()}` }
  })

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-td-black mb-2">Tech Salaries in India</h1>
        <p className="text-td-body">
          Browse verified compensation data across 12+ companies and 7+ locations.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <FilterBar
        availableRoles={availableRoles}
        availableLocations={availableLocations}
      />

      {data.length > 0 ? (
        <>
          <SalaryTable salaries={data} currentSort={sort} sortableColumns={sortableColumns} />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
          />
        </>
      ) : (
        <EmptyState />
      )}
    </>
  )
}

export default function SalariesPage(props: SalariesPageProps) {
  return (
    <Suspense fallback={<div className="py-16 text-center text-td-muted">Loading salaries...</div>}>
      <SalariesContent searchParams={props.searchParams} />
    </Suspense>
  )
}
