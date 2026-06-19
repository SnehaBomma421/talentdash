import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { SalaryTable } from '@/components/features/SalaryTable'
import { LevelDistributionBar } from '@/components/features/LevelDistributionBar'
import { Button } from '@/components/ui/Button'
import { formatCurrency, computeMedian, serializeSalary } from '@/lib/salary-utils'
import type { SalaryRecord } from '@/types'

export async function generateStaticParams() {
  const companies = await prisma.company.findMany({ select: { slug: true } })
  return companies.map(c => ({ slug: c.slug }))
}

async function getCompany(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      salaries: {
        orderBy: { total_compensation: 'desc' },
      },
    },
  })
  return company
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const company = await getCompany(slug)

  if (!company) {
    return { title: 'Company Not Found | TalentDash' }
  }

  const tcValues = company.salaries.map(s => Number(s.total_compensation))
  const median = computeMedian(tcValues)

  return {
    title: `${company.name} Salaries, Reviews & Interview Experiences | TalentDash`,
    description: `Median total compensation at ${company.name} is ${formatCurrency(median, 'INR')} based on ${company.salaries.length} salary records. Browse by level, location and role.`,
    alternates: { canonical: `https://talentdash.com/companies/${slug}` },
    openGraph: {
      title: `${company.name} Salaries | TalentDash`,
      description: `Median total compensation at ${company.name} is ${formatCurrency(median, 'INR')} based on ${company.salaries.length} salary records.`,
      url: `https://talentdash.com/companies/${slug}`,
    },
  }
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const company = await getCompany(slug)

  if (!company) {
    notFound()
  }

  const salaries = company.salaries
  const tcValues = salaries.map(s => Number(s.total_compensation))
  const medianTotalCompensation = computeMedian(tcValues)
  const tcMin = tcValues.length > 0 ? Math.min(...tcValues) : 0
  const tcMax = tcValues.length > 0 ? Math.max(...tcValues) : 0

  // Compute level distribution
  const levelDistribution: Record<string, number> = {}
  for (const salary of salaries) {
    const level = salary.level as string
    levelDistribution[level] = (levelDistribution[level] || 0) + 1
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${company.name} Salaries — TalentDash`,
    description: `Salary data for ${company.name}`,
    url: `https://talentdash.com/companies/${slug}`,
    creator: { '@type': 'Organization', name: 'TalentDash' },
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Company header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-td-black mb-2">{company.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-td-muted">
          {company.industry && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-td-bg text-td-body">
              {company.industry}
            </span>
          )}
          {company.founded_year && (
            <span>Founded {company.founded_year}</span>
          )}
          {company.headcount_range && (
            <span>{company.headcount_range}</span>
          )}
          {company.headquarters && (
            <span>{company.headquarters}</span>
          )}
        </div>
      </div>

      {/* Compensation overview */}
      <div className="bg-td-surface border border-td-border rounded-lg p-6 mb-8">
        <h2 className="text-sm font-medium text-td-muted mb-4 uppercase tracking-wider">Compensation Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center md:text-left">
            <p className="text-xs text-td-muted mb-1">Median Total Compensation</p>
            <p className="text-3xl font-bold text-td-blue">
              {formatCurrency(medianTotalCompensation, 'INR')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-td-muted mb-1">Range (Min – Max)</p>
            <p className="text-lg font-semibold text-td-body">
              {formatCurrency(tcMin, 'INR')} – {formatCurrency(tcMax, 'INR')}
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs text-td-muted mb-1">Salary Records</p>
            <p className="text-lg font-semibold text-td-body">
              Based on {salaries.length} record{salaries.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Level distribution */}
      {salaries.length > 0 && (
        <div className="bg-td-surface border border-td-border rounded-lg p-6 mb-8">
          <h2 className="text-sm font-medium text-td-muted mb-4 uppercase tracking-wider">Level Distribution</h2>
          <LevelDistributionBar distribution={levelDistribution} total={salaries.length} />
        </div>
      )}

      {/* Salary table */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-td-black">Salary Records</h2>
          <Button href={`/compare?c1=${slug}`} variant="primary" size="sm">
            Compare
          </Button>
        </div>
        <SalaryTable salaries={salaries.map(s => serializeSalary({ ...s, company: { id: company.id, name: company.name, slug: company.slug, industry: company.industry, headquarters: company.headquarters, founded_year: company.founded_year, headcount_range: company.headcount_range } })).filter(Boolean) as unknown as SalaryRecord[]} />
      </div>
    </div>
  )
}
