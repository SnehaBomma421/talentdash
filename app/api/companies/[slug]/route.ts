import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializeSalary, computeMedian } from '@/lib/salary-utils'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      salaries: {
        orderBy: { total_compensation: 'desc' },
      },
    },
  })

  if (!company) {
    return NextResponse.json(
      { error: true, message: 'Company not found' },
      { status: 404 }
    )
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

  const companyDetail = {
    id: company.id,
    name: company.name,
    slug: company.slug,
    industry: company.industry,
    headquarters: company.headquarters,
    founded_year: company.founded_year,
    headcount_range: company.headcount_range,
    median_total_compensation: medianTotalCompensation,
    tc_min: tcMin,
    tc_max: tcMax,
    record_count: salaries.length,
    level_distribution: levelDistribution,
    salaries: salaries.map(serializeSalary),
  }

  return NextResponse.json(companyDetail, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
