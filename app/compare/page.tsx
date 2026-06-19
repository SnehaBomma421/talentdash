import { Suspense } from 'react'
import { CompareWidget } from '@/components/features/CompareWidget'

export const metadata = {
  title: 'Compare Tech Salaries Side-by-Side | TalentDash',
  description: 'Compare salary packages across companies, levels, and locations. See the delta in base salary, bonus, stock, and total compensation.',
  alternates: { canonical: 'https://talentdash.com/compare' },
  openGraph: {
    title: 'Compare Tech Salaries Side-by-Side | TalentDash',
    description: 'Compare salary packages across companies, levels, and locations.',
    url: 'https://talentdash.com/compare',
  },
}

export default function ComparePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-td-black mb-2">Compare Salaries</h1>
        <p className="text-td-body">
          Select two salary records to compare compensation details side-by-side.
        </p>
      </div>

      <Suspense fallback={<div className="py-16 text-center text-td-muted">Loading comparison...</div>}>
        <CompareWidget />
      </Suspense>
    </div>
  )
}
