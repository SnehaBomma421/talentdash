import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializeSalary } from '@/lib/salary-utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const s1 = searchParams.get('s1')
  const s2 = searchParams.get('s2')

  // Validate both IDs provided
  if (!s1 || !s2) {
    return NextResponse.json(
      { error: true, message: 'Both s1 and s2 query parameters are required' },
      { status: 400 }
    )
  }

  // Same ID check
  if (s1 === s2) {
    return NextResponse.json(
      { error: true, message: 'Cannot compare a record with itself. Provide two different salary record IDs.' },
      { status: 400 }
    )
  }

  // Fetch both records
  const [record1, record2] = await Promise.all([
    prisma.salary.findUnique({ where: { id: s1 }, include: { company: true } }),
    prisma.salary.findUnique({ where: { id: s2 }, include: { company: true } }),
  ])

  if (!record1) {
    return NextResponse.json(
      { error: true, message: `Record with id "${s1}" not found` },
      { status: 404 }
    )
  }

  if (!record2) {
    return NextResponse.json(
      { error: true, message: `Record with id "${s2}" not found` },
      { status: 404 }
    )
  }

  // Compute deltas (Record1 - Record2)
  const delta = {
    base_delta: Number(record1.base_salary) - Number(record2.base_salary),
    bonus_delta: Number(record1.bonus) - Number(record2.bonus),
    stock_delta: Number(record1.stock) - Number(record2.stock),
    tc_delta: Number(record1.total_compensation) - Number(record2.total_compensation),
    experience_delta: record1.experience_years - record2.experience_years,
  }

  const response = {
    record1: serializeSalary(record1),
    record2: serializeSalary(record2),
    delta,
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
