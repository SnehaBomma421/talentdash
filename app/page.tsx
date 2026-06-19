import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { prisma } from '@/lib/db'

export const revalidate = 3600

export const metadata = {
  title: 'TalentDash — Software Engineer Salaries & Compensation Intelligence',
  description: 'Discover verified salary data for software engineers, product managers, and tech roles across Google, Amazon, Flipkart, and 100+ companies in India. Make informed career decisions with real compensation data.',
  alternates: { canonical: 'https://talentdash.com' },
  openGraph: {
    title: 'TalentDash — Compensation Intelligence Platform',
    description: 'Discover verified salary data for tech roles across top companies in India.',
    url: 'https://talentdash.com',
  },
}

export default async function HomePage() {
  let companyCount = 0
  let salaryCount = 0
  let locationCount = 0

  try {
    const [cc, sc, locationResult] = await Promise.all([
      prisma.company.count(),
      prisma.salary.count(),
      prisma.salary.findMany({
        select: { location: true },
        distinct: ['location'],
      }),
    ])
    companyCount = cc
    salaryCount = sc
    locationCount = locationResult.length
  } catch {
    console.warn('Database unavailable — showing default stats')
  }

  const salaryDisplay = salaryCount >= 500 ? `${Math.round(salaryCount / 100) * 100}+` : String(salaryCount || '—')

  return (
    <div className="py-12">
      {/* Hero section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-td-black leading-tight mb-4">
          Know Your Worth in Tech
        </h1>
        <p className="text-lg text-td-body max-w-2xl mx-auto mb-8">
          TalentDash is a career intelligence platform — browse verified, comparable career data for software engineers, product managers, data scientists, and more at India&apos;s top companies.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/salaries">
            <Button variant="primary" size="lg">Browse Salaries</Button>
          </Link>
          <Link href="/companies/google">
            <Button variant="outline" size="lg">View Google India</Button>
          </Link>
        </div>
      </section>

      {/* Stats from database */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-td-surface border border-td-border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-td-coral mb-2">{salaryDisplay}</div>
          <h3 className="text-sm font-medium text-td-black mb-1">Verified Records</h3>
          <p className="text-xs text-td-muted">Salary data points from contributors and trusted sources</p>
        </div>
        <div className="bg-td-surface border border-td-border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-td-coral mb-2">{companyCount}+</div>
          <h3 className="text-sm font-medium text-td-black mb-1">Companies</h3>
          <p className="text-xs text-td-muted">From FAANG to top Indian startups and legacy firms</p>
        </div>
        <div className="bg-td-surface border border-td-border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-td-coral mb-2">{locationCount}+</div>
          <h3 className="text-sm font-medium text-td-black mb-1">Locations</h3>
          <p className="text-xs text-td-muted">Across India and international tech hubs</p>
        </div>
      </section>

      {/* Featured companies */}
      <section>
        <h2 className="text-2xl font-bold text-td-black mb-6">Featured Companies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Google', 'Amazon', 'Meta', 'Microsoft', 'Flipkart', 'NVIDIA'].map((name) => {
            const slug = name.toLowerCase()
            return (
              <Link
                key={slug}
                href={`/companies/${slug}`}
                className="bg-td-surface border border-td-border rounded-lg p-4 text-center hover:border-td-coral hover:shadow-sm transition-all"
              >
                <h3 className="text-sm font-semibold text-td-black truncate">{name}</h3>
                <p className="text-xs text-td-muted mt-1">View salaries</p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
