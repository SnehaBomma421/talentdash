import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { SalaryTable } from '@/components/features/SalaryTable'
import { FilterBar } from '@/components/features/FilterBar'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import type { CurrencyEnum } from '@/types'

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

  // Build query string for API call
  const queryParams = new URLSearchParams()
  if (company) queryParams.set('company', company)
  if (role) queryParams.set('role', role)
  if (levelParam) queryParams.set('level', levelParam)
  if (location) queryParams.set('location', location)
  if (currency !== 'INR') queryParams.set('currency', currency)
  queryParams.set('sort', sort)
  queryParams.set('page', String(page))
  queryParams.set('limit', String(limit))

  // Fetch from internal API with ISR (300s revalidation)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/salaries?${queryParams.toString()}`, {
    next: { revalidate: 300 },
  })

  if (!res.ok) {
    return <EmptyState message="Failed to load salary data. Please try again." />
  }

  const { data, meta } = await res.json()

  // Fetch available roles and locations for filter dropdowns
  const allRoles = await prisma.salary.findMany({
    select: { role: true },
    distinct: ['role'],
    orderBy: { role: 'asc' },
  })
  const allLocations = await prisma.salary.findMany({
    select: { location: true },
    distinct: ['location'],
    orderBy: { location: 'asc' },
  })

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
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={meta.limit}
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
