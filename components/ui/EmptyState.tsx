import Link from 'next/link'

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'No records found for these filters. Try removing a filter.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-4 rounded-full bg-td-border flex items-center justify-center">
        <svg className="w-8 h-8 text-td-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-td-body text-center mb-4">{message}</p>
      <Link
        href="/salaries"
        className="text-sm text-td-coral hover:text-[#e04e52] font-medium transition-colors"
      >
        Clear all filters
      </Link>
    </div>
  )
}
