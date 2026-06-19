import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializeSalary } from '@/lib/salary-utils'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Extract query params
  const company = searchParams.get('company') || undefined
  const role = searchParams.get('role') || undefined
  const level = searchParams.get('level') || undefined
  const location = searchParams.get('location') || undefined
  const currency = searchParams.get('currency') || undefined
  const sort = searchParams.get('sort') || 'total_comp_desc'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10) || 25))

  // Build where clause
  const where: Prisma.SalaryWhereInput = {}

  if (company) {
    where.company = { normalized_name: { contains: company.toLowerCase(), mode: 'insensitive' } }
  }
  if (role) {
    where.role = { contains: role, mode: 'insensitive' }
  }
  if (level) {
    const levels = level.split(',').map(l => l.trim()).filter(Boolean)
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

  // Count total records
  const total = await prisma.salary.count({ where })

  // Fetch paginated results
  const salaries = await prisma.salary.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    include: { company: true },
  })

  const totalPages = Math.ceil(total / limit)

  const response = {
    data: salaries.map(serializeSalary),
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 's-maxage=300, stale-while-revalidate=3600',
    },
  })
}
