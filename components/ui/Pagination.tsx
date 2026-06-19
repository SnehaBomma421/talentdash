'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
}

export function Pagination({ page, totalPages, total, limit }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPage > 1) {
      params.set('page', String(newPage))
    } else {
      params.delete('page')
    }
    router.push(`/salaries?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center justify-between py-4">
      <p className="text-sm text-td-muted">
        Showing {start}–{end} of {total} records
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-td-muted px-2">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
